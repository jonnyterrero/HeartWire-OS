/*
 * ================================================================
 *  4-Axis Robotic Arm — Autonomous Pick & Place (v4 — IK Upgrade)
 *  Board  : Arduino Uno
 *  Power  : 9V into barrel jack
 *           Sensor → Arduino 5V
 *           Servos → separate 6V supply (shared GND!)
 * ================================================================
 *
 *  WIRING:
 *    Hand servo    → pin 7
 *    Wrist servo   → pin 3
 *    Forearm servo → pin 11
 *    Elbow servo   → pin 5
 *    Sensor TRIG   → pin 2
 *    Sensor ECHO   → pin 4
 *
 *  SENSOR: mounted on the gripper/hand — moves with the arm.
 *          Wrist must be horizontal during scan so sensor
 *          points forward, not at the ground.
 *
 *  GRIP FIX: hand servo stays attached (holds torque) from
 *            CLOSE_GRIP through DROP. Only detaches after release.
 *
 *  v4 CHANGES vs v3:
 *    - Added inverse kinematics (IK) solver
 *    - FSM targets can use polar coordinates (r, theta, z, phi)
 *    - IK converts polar targets to servo angles
 *    - Scan-to-detect maps sensor distance → workspace position
 *    - ALL v3 Joint / sensor / FSM architecture preserved exactly
 *    - useIK flag: set false to revert to pure v3 behavior
 * ================================================================
 */

#include <Servo.h>
#include <math.h>

/* ================================================================
 *  FORWARD DECLARATIONS
 *  Arduino IDE auto-prototype fails on forward-referenced structs.
 *  All structs and enums defined here before any function.
 * ================================================================ */

// ── IK data structures (new in v4) ──────────────────────────

// Sentinel: set phi to this value to let solver pick approach angle
#define IK_PHI_FREE  (-999.0f)

struct PolarTarget {
  float r;       // radial reach from base (mm)
  float theta;   // sweep angle in horizontal plane (deg)
  float z;       // height above table (mm)
  float phi;     // gripper tilt from horizontal (deg), or IK_PHI_FREE
};

struct IKSolution {
  int   elbow_deg;
  int   forearm_deg;
  int   wrist_deg;
  float phi_actual;   // resulting approach angle (when phi was free)
  bool  valid;
};

// ── FSM enum (same as v3) ───────────────────────────────────
enum State : uint8_t {
  STATE_SCAN,
  STATE_DWELL,
  STATE_OPEN_GRIP,
  STATE_LOWER_WRIST,
  STATE_CLOSE_GRIP,
  STATE_LIFT,
  STATE_TRANSFER,
  STATE_DROP,
  STATE_RESET
};

// ── PINS (same as v3) ───────────────────────────────────────
#define PIN_HAND    7
#define PIN_WRIST   3
#define PIN_FOREARM 11
#define PIN_ELBOW   5
#define PIN_TRIG    2
#define PIN_ECHO    4

// ── SERVO OBJECTS (same as v3) ──────────────────────────────
Servo servo_hand;
Servo servo_wrist;
Servo servo_forearm;
Servo servo_elbow;

// ══════════════════════════════════════════════════════════════
//  ARM GEOMETRY — MEASURE YOUR ARM AND FILL THESE IN
// ══════════════════════════════════════════════════════════════
//
//  L1      : forearm pivot → wrist pivot (mm)
//  L2_EFF  : wrist pivot → gripper fingertip (mm)
//            (if you measured two pieces, add them: L2 + L3)
//  BASE_Z  : height of forearm pivot above the table (mm)
//
//  Use the calibration sketch to measure these.

#define ARM_L1_MM           100.0f   // <<<< MEASURE AND REPLACE
#define ARM_L2_EFF_MM        80.0f   // <<<< MEASURE AND REPLACE
#define ARM_BASE_Z_MM        50.0f   // <<<< MEASURE AND REPLACE

// ══════════════════════════════════════════════════════════════
//  SERVO CALIBRATION — MAP GEOMETRIC ANGLES TO SERVO ANGLES
// ══════════════════════════════════════════════════════════════
//
//  For each servo:
//    OFFSET = servo reading (deg) when link is at 0° geometric
//    DIR    = +1 or -1 (does servo increase = link angle increase?)
//
//  Geometric conventions:
//    Forearm q1: 0° = horizontal, positive = link goes UP
//    Wrist  q2: 0° = aligned with forearm, positive = opens angle
//    Elbow  θ : 0° = arm points at reference direction

#define ELBOW_OFFSET_DEG     0.0f    // <<<< CALIBRATE
#define ELBOW_DIR            1.0f    // <<<< CALIBRATE (+1 or -1)

#define FOREARM_OFFSET_DEG 105.0f    // <<<< CALIBRATE
#define FOREARM_DIR         -1.0f    // <<<< CALIBRATE

#define WRIST_OFFSET_DEG   105.0f    // <<<< CALIBRATE
#define WRIST_DIR           -1.0f    // <<<< CALIBRATE

// ── IK workspace limits ─────────────────────────────────────
#define WS_OUTER_MARGIN     0.95f
#define WS_INNER_MARGIN     1.10f
#define WS_R_MIN_MM         10.0f
#define WS_Z_MIN_MM          0.0f
#define IK_PHI_TOL_MM        8.0f

// ══════════════════════════════════════════════════════════════
//  v3 TUNING CONSTANTS — KEPT FOR FALLBACK + SCAN + GRIP
// ══════════════════════════════════════════════════════════════

// ── Gripper ───────────────────────────────────────────────
const int HAND_OPEN   = 0;
const int HAND_CLOSED = 90;

// ── Wrist ─────────────────────────────────────────────────
const int WRIST_SCAN  = 90;
const int WRIST_UP    = 40;
const int WRIST_DOWN  = 170;
const int WRIST_DROP  = 130;

// ── Forearm ───────────────────────────────────────────────
const int FOREARM_POS = 45;

// ── Elbow ─────────────────────────────────────────────────
const int SCAN_START  = 0;
const int SCAN_END    = 135;
const int DROP_POS    = 180;

// ── Sensor ────────────────────────────────────────────────
const float DETECT_MIN_CM = 2.0;
const float DETECT_MAX_CM = 15.0;
const int   CONFIRM_NEEDED = 3;
const unsigned long PING_DELAY_MS = 80;

// ── Timing ────────────────────────────────────────────────
const unsigned long STEP_MS    = 20;
const unsigned long SETTLE_MS  = 500;
const unsigned long TIMEOUT_MS = 12000;

// ══════════════════════════════════════════════════════════════
//  v4 POLAR DROP TARGET
// ══════════════════════════════════════════════════════════════

#define DROP_R_MM             80.0f    // <<<< MEASURE: horiz distance to cup
#define DROP_THETA_DEG       170.0f    // <<<< MEASURE: sweep angle to cup
#define DROP_Z_MM            100.0f    // <<<< MEASURE: height for drop
#define DROP_PHI_DEG         -45.0f    // gripper tilt at drop

#define PICKUP_PHI_DEG       -90.0f    // gripper straight down for pickup

// ══════════════════════════════════════════════════════════════
//  IK MODE SWITCH
// ══════════════════════════════════════════════════════════════
//  true  = use IK for pickup/lift/transfer
//  false = pure v3 hardcoded angles (safe fallback)
//
//  Flip this to false at any time to revert to v3 behavior.

bool useIK = true;   // <<<< SET false TO REVERT TO v3

// ══════════════════════════════════════════════════════════════
//  JOINT — smooth motion + auto-detach (IDENTICAL TO v3)
// ══════════════════════════════════════════════════════════════

struct Joint {
  Servo*  servo;
  int     pin;
  int     current;
  int     target;
  bool    attached;
  bool    moving;
  bool    holdAttached;
};

Joint jHand    = { &servo_hand,    PIN_HAND,    HAND_OPEN,    HAND_OPEN,    false, false, false };
Joint jWrist   = { &servo_wrist,   PIN_WRIST,   WRIST_SCAN,   WRIST_SCAN,   false, false, false };
Joint jForearm = { &servo_forearm, PIN_FOREARM, FOREARM_POS,  FOREARM_POS,  false, false, false };
Joint jElbow   = { &servo_elbow,   PIN_ELBOW,   SCAN_START,   SCAN_START,   false, false, false };

void jointMoveTo(Joint &j, int angle) {
  j.target = constrain(angle, 0, 180);
  if (j.target == j.current) return;
  if (!j.attached) {
    j.servo->attach(j.pin);
    j.attached = true;
  }
  j.servo->write(j.current);
  j.moving = true;
}

void jointHold(Joint &j) {
  if (!j.attached) {
    j.servo->attach(j.pin);
    j.attached = true;
  }
  j.servo->write(j.current);
  j.holdAttached = true;
}

void jointRelease(Joint &j) {
  j.holdAttached = false;
}

void jointStep(Joint &j) {
  if (!j.moving) return;
  if (j.current < j.target)      j.current++;
  else if (j.current > j.target) j.current--;
  j.servo->write(j.current);
  if (j.current == j.target) {
    j.moving = false;
    if (!j.holdAttached) {
      j.servo->detach();
      j.attached = false;
    }
  }
}

bool jointDone(const Joint &j) {
  return !j.moving;
}

unsigned long lastStepMs = 0;

void tickAllJoints() {
  jointStep(jHand);
  jointStep(jWrist);
  jointStep(jForearm);
  jointStep(jElbow);
}

// ══════════════════════════════════════════════════════════════
//  SENSOR — median of 3 (IDENTICAL TO v3)
// ══════════════════════════════════════════════════════════════

float singlePing() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);

  unsigned long dur = pulseIn(PIN_ECHO, HIGH, 30000);
  if (dur == 0) return 999.0;
  return (dur * 0.0343) / 2.0;
}

float getDistance() {
  float a = singlePing();
  delayMicroseconds(500);
  float b = singlePing();
  delayMicroseconds(500);
  float c = singlePing();

  if (a > b) { float t = a; a = b; b = t; }
  if (b > c) { float t = b; b = c; c = t; }
  if (a > b) { float t = a; a = b; b = t; }
  return b;
}

// ══════════════════════════════════════════════════════════════
//  INVERSE KINEMATICS SOLVER (NEW IN v4)
// ══════════════════════════════════════════════════════════════

/*
 * geoToServo_elbow()
 * Convert geometric sweep angle θ (degrees) → elbow servo angle.
 */
int geoToServo_elbow(float theta_deg) {
  float s = ELBOW_OFFSET_DEG + ELBOW_DIR * theta_deg;
  return constrain((int)(s + 0.5f), 0, 180);
}

/*
 * geoToServo_forearm()
 * Convert geometric forearm angle (0°=horizontal, +=up) → servo angle.
 */
int geoToServo_forearm(float geo_deg) {
  float s = FOREARM_OFFSET_DEG + FOREARM_DIR * geo_deg;
  return constrain((int)(s + 0.5f), 0, 180);
}

/*
 * geoToServo_wrist()
 * Convert geometric wrist angle (0°=aligned with forearm) → servo angle.
 */
int geoToServo_wrist(float geo_deg) {
  float s = WRIST_OFFSET_DEG + WRIST_DIR * geo_deg;
  return constrain((int)(s + 0.5f), 0, 180);
}

/*
 * solveIK()
 * ---------
 * Given a polar target, compute servo angles.
 *
 *   Case A (phi specified): wrist-point subtraction method
 *   Case B (phi free):      2-link Law of Cosines
 *
 * Returns true on success. On failure, sol.valid remains false.
 */
bool solveIK(PolarTarget t, IKSolution &sol) {
  sol.valid = false;

  float L1   = ARM_L1_MM;
  float Leff = ARM_L2_EFF_MM;

  // ── Workspace boundary checks ──
  if (t.r < WS_R_MIN_MM) {
    Serial.println(F("IK: r too small"));
    return false;
  }
  if (t.z < WS_Z_MIN_MM) {
    Serial.println(F("IK: z below table"));
    return false;
  }

  float D_max = (L1 + Leff) * WS_OUTER_MARGIN;
  float D_min = fabsf(L1 - Leff) * WS_INNER_MARGIN;

  // Height relative to forearm pivot
  float zp = t.z - ARM_BASE_Z_MM;

  // Elbow is direct mapping
  sol.elbow_deg = geoToServo_elbow(t.theta);

  float q1_rad, q2_rad;
  bool  solved = false;

  // ── Case A: approach angle phi specified ──
  if (t.phi > IK_PHI_FREE + 1.0f) {
    float phi_rad = t.phi * (PI / 180.0f);
    float rw = t.r - Leff * cosf(phi_rad);
    float zw = zp  - Leff * sinf(phi_rad);
    float Dw = sqrtf(rw * rw + zw * zw);

    if (fabsf(Dw - L1) < IK_PHI_TOL_MM) {
      q1_rad = atan2f(zw, rw);
      q2_rad = phi_rad - q1_rad;
      sol.phi_actual = t.phi;
      solved = true;
    } else {
      Serial.print(F("IK CaseA miss Dw="));
      Serial.print(Dw, 1);
      Serial.println(F(" fallback CaseB"));
    }
  }

  // ── Case B: position-only (Law of Cosines) ──
  if (!solved) {
    float D = sqrtf(t.r * t.r + zp * zp);

    if (D > D_max) {
      Serial.print(F("IK: too far D="));
      Serial.println(D, 1);
      return false;
    }
    if (D < D_min) {
      Serial.print(F("IK: too close D="));
      Serial.println(D, 1);
      return false;
    }

    float cosQ2 = (D * D - L1 * L1 - Leff * Leff) / (2.0f * L1 * Leff);
    cosQ2 = constrain(cosQ2, -1.0f, 1.0f);

    // Elbow-down first (positive q2)
    q2_rad = acosf(cosQ2);
    float sinQ2 = sinf(q2_rad);
    float alpha  = atan2f(zp, t.r);
    float beta   = atan2f(Leff * sinQ2, L1 + Leff * cosQ2);
    q1_rad = alpha - beta;
    sol.phi_actual = (q1_rad + q2_rad) * (180.0f / PI);
    solved = true;

    // Check servo limits — try elbow-up if out of bounds
    int fa = geoToServo_forearm(q1_rad * (180.0f / PI));
    int wr = geoToServo_wrist(q2_rad * (180.0f / PI));

    if (fa <= 0 || fa >= 180 || wr <= 0 || wr >= 180) {
      q2_rad = -acosf(cosQ2);
      sinQ2  = sinf(q2_rad);
      beta   = atan2f(Leff * sinQ2, L1 + Leff * cosQ2);
      q1_rad = alpha - beta;
      sol.phi_actual = (q1_rad + q2_rad) * (180.0f / PI);

      fa = geoToServo_forearm(q1_rad * (180.0f / PI));
      wr = geoToServo_wrist(q2_rad * (180.0f / PI));

      if (fa <= 0 || fa >= 180 || wr <= 0 || wr >= 180) {
        Serial.println(F("IK: both configs OOB"));
        return false;
      }
    }
  }

  // ── Convert to servo angles ──
  sol.forearm_deg = geoToServo_forearm(q1_rad * (180.0f / PI));
  sol.wrist_deg   = geoToServo_wrist(q2_rad * (180.0f / PI));
  sol.valid       = true;

  Serial.print(F("IK: r="));
  Serial.print(t.r, 0);
  Serial.print(F(" th="));
  Serial.print(t.theta, 0);
  Serial.print(F(" z="));
  Serial.print(t.z, 0);
  Serial.print(F(" -> E="));
  Serial.print(sol.elbow_deg);
  Serial.print(F(" F="));
  Serial.print(sol.forearm_deg);
  Serial.print(F(" W="));
  Serial.println(sol.wrist_deg);

  return true;
}

// ══════════════════════════════════════════════════════════════
//  IK HELPERS (NEW IN v4)
// ══════════════════════════════════════════════════════════════

// Detected ball workspace position (filled by computeDetectedPosition)
float det_r     = 0.0f;
float det_theta = 0.0f;
float det_z     = 0.0f;

/*
 * computeDetectedPosition()
 * -------------------------
 * Converts sensor reading (cm) + current elbow angle → polar workspace.
 *
 * During scan: arm roughly horizontal, sensor points radially outward.
 *   r_sensor ≈ L1 + Leff   (distance from base to sensor tip)
 *   r_ball   = r_sensor + d_mm
 *   theta    = current elbow angle (geometric)
 *   z_ball   ≈ 0 (ball on table surface)
 */
void computeDetectedPosition(float dist_cm) {
  float d_mm     = dist_cm * 10.0f;
  float r_sensor = ARM_L1_MM + ARM_L2_EFF_MM;

  det_theta = ((float)jElbow.current - ELBOW_OFFSET_DEG) / ELBOW_DIR;
  det_r     = r_sensor + d_mm;
  det_z     = 0.0f;

  Serial.print(F("DET: d="));
  Serial.print(dist_cm, 1);
  Serial.print(F("cm -> r="));
  Serial.print(det_r, 0);
  Serial.print(F(" th="));
  Serial.print(det_theta, 0);
  Serial.println(F("mm"));
}

/*
 * ikLowerWrist()
 * Solve IK for pickup: at ball, gripper pointing down.
 * Only commands forearm+wrist. Elbow stays at detection angle.
 * Returns true if IK succeeded.
 */
bool ikLowerWrist() {
  PolarTarget t;
  t.r     = det_r;
  t.theta = det_theta;
  t.z     = det_z;
  t.phi   = PICKUP_PHI_DEG;

  IKSolution sol;
  if (!solveIK(t, sol)) return false;

  jointMoveTo(jForearm, sol.forearm_deg);
  jointMoveTo(jWrist,   sol.wrist_deg);
  return true;
}

/*
 * ikLift()
 * Solve IK for lift: above ball, phi free.
 * Commands forearm+wrist.
 */
bool ikLift() {
  PolarTarget t;
  t.r     = det_r;
  t.theta = det_theta;
  t.z     = det_z + 60.0f;
  t.phi   = IK_PHI_FREE;

  IKSolution sol;
  if (!solveIK(t, sol)) return false;

  jointMoveTo(jForearm, sol.forearm_deg);
  jointMoveTo(jWrist,   sol.wrist_deg);
  return true;
}

/*
 * ikTransfer()
 * Solve IK for drop position (over cup).
 * Commands all three positioning joints.
 */
bool ikTransfer() {
  PolarTarget t;
  t.r     = DROP_R_MM;
  t.theta = DROP_THETA_DEG;
  t.z     = DROP_Z_MM;
  t.phi   = DROP_PHI_DEG;

  IKSolution sol;
  if (!solveIK(t, sol)) return false;

  jointMoveTo(jElbow,   sol.elbow_deg);
  jointMoveTo(jForearm, sol.forearm_deg);
  jointMoveTo(jWrist,   sol.wrist_deg);
  return true;
}

// ══════════════════════════════════════════════════════════════
//  FSM GLOBALS + enterState (IDENTICAL TO v3)
// ══════════════════════════════════════════════════════════════

State state = STATE_SCAN;
unsigned long stateStart   = 0;
unsigned long settleStart  = 0;
unsigned long lastPingMs   = 0;
bool          settling     = false;
int           confirmCount = 0;
bool          scanToEnd    = true;
float         lastConfirmDist = 0.0f;  // v4: remember confirmed distance
bool          ikCommanded     = false; // v4: tracks if IK was already called this state

void enterState(State s) {
  state      = s;
  stateStart = millis();
  settling   = false;
  ikCommanded = false;    // v4: reset IK flag on state entry
  Serial.print(">> ");
  switch (s) {
    case STATE_SCAN:        Serial.println("SCAN");        break;
    case STATE_DWELL:       Serial.println("DWELL");       break;
    case STATE_OPEN_GRIP:   Serial.println("OPEN GRIP");   break;
    case STATE_LOWER_WRIST: Serial.println("LOWER WRIST"); break;
    case STATE_CLOSE_GRIP:  Serial.println("CLOSE GRIP");  break;
    case STATE_LIFT:        Serial.println("LIFT");        break;
    case STATE_TRANSFER:    Serial.println("TRANSFER");    break;
    case STATE_DROP:        Serial.println("DROP");        break;
    case STATE_RESET:       Serial.println("RESET");       break;
  }
}

bool timedOut() {
  return (millis() - stateStart > TIMEOUT_MS);
}

// ══════════════════════════════════════════════════════════════
//  SETUP (IDENTICAL TO v3 + IK banner)
// ══════════════════════════════════════════════════════════════
void setup() {
  Serial.begin(9600);
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);

  servo_hand.attach(PIN_HAND);
  servo_hand.write(HAND_OPEN);
  delay(300);
  servo_hand.detach();

  servo_wrist.attach(PIN_WRIST);
  servo_wrist.write(WRIST_SCAN);
  delay(300);
  servo_wrist.detach();

  servo_forearm.attach(PIN_FOREARM);
  servo_forearm.write(FOREARM_POS);
  delay(300);
  servo_forearm.detach();

  servo_elbow.attach(PIN_ELBOW);
  servo_elbow.write(SCAN_START);
  delay(300);
  servo_elbow.detach();

  Serial.println("=== Robotic Arm — v4 IK ===");
  if (useIK) {
    Serial.println("IK mode ON");
    Serial.print("L1=");
    Serial.print(ARM_L1_MM, 0);
    Serial.print(" Leff=");
    Serial.print(ARM_L2_EFF_MM, 0);
    Serial.print(" baseZ=");
    Serial.println(ARM_BASE_Z_MM, 0);
  } else {
    Serial.println("IK OFF (v3 fallback)");
  }
  Serial.println("Scanning...");
  Serial.println();

  jointMoveTo(jElbow, SCAN_END);
  scanToEnd = true;
  enterState(STATE_SCAN);
}

// ══════════════════════════════════════════════════════════════
//  LOOP — IDENTICAL STRUCTURE TO v3
//  IK is inserted only at the 3 states that set motion targets:
//    STATE_LOWER_WRIST, STATE_LIFT, STATE_TRANSFER
//  Every IK call has a v3 fallback on failure.
// ══════════════════════════════════════════════════════════════
void loop() {
  unsigned long now = millis();

  if (now - lastStepMs >= STEP_MS) {
    lastStepMs = now;
    tickAllJoints();
  }

  switch (state) {

    // ── SCAN: sweep elbow, wrist horizontal ──────────────────
    //    IDENTICAL to v3
    case STATE_SCAN:
      if (jWrist.current != WRIST_SCAN) {
        jointMoveTo(jWrist, WRIST_SCAN);
      }

      if (jointDone(jElbow)) {
        confirmCount = 0;
        lastPingMs = 0;
        enterState(STATE_DWELL);
      }
      break;

    // ── DWELL: read sensor, confirm detection ────────────────
    //    IDENTICAL to v3 + stores distance for IK
    case STATE_DWELL: {
      if (now - lastPingMs >= PING_DELAY_MS) {
        lastPingMs = now;

        float d = getDistance();
        Serial.print("  dist: ");
        Serial.print(d);
        Serial.print(" cm  [");
        Serial.print(confirmCount);
        Serial.print("/");
        Serial.print(CONFIRM_NEEDED);
        Serial.println("]");

        if (d > DETECT_MIN_CM && d < DETECT_MAX_CM) {
          confirmCount++;
          lastConfirmDist = d;

          if (confirmCount >= CONFIRM_NEEDED) {
            Serial.print("*** CONFIRMED at ");
            Serial.print(d);
            Serial.println(" cm ***");

            if (useIK) {
              computeDetectedPosition(lastConfirmDist);
            }

            enterState(STATE_OPEN_GRIP);
          }
        } else {
          confirmCount = 0;
        }
      }

      if (timedOut()) {
        if (scanToEnd) {
          jointMoveTo(jElbow, SCAN_START);
          scanToEnd = false;
        } else {
          jointMoveTo(jElbow, SCAN_END);
          scanToEnd = true;
        }
        enterState(STATE_SCAN);
      }
      break;
    }

    // ── OPEN GRIP ────────────────────────────────────────────
    //    IDENTICAL to v3
    case STATE_OPEN_GRIP:
      jointMoveTo(jHand, HAND_OPEN);

      if (jointDone(jHand)) {
        if (!settling) {
          settling = true;
          settleStart = now;
        } else if (now - settleStart >= SETTLE_MS) {
          enterState(STATE_LOWER_WRIST);
        }
      }

      if (timedOut()) enterState(STATE_RESET);
      break;

    // ── LOWER WRIST: reach down to ball ──────────────────────
    //    v4+IK: solveIK for forearm+wrist angles
    //    v3/fallback: just lower wrist to WRIST_DOWN
    case STATE_LOWER_WRIST:
      if (useIK && !ikCommanded) {
        // First tick in this state: solve IK once
        bool ok = ikLowerWrist();
        if (!ok) {
          Serial.println(F("IK fail -> v3 fallback"));
          jointMoveTo(jWrist, WRIST_DOWN);
        }
        ikCommanded = true;
      } else if (!useIK && !ikCommanded) {
        jointMoveTo(jWrist, WRIST_DOWN);
        ikCommanded = true;
      }

      // Wait for motion to finish
      if (jointDone(jWrist) && jointDone(jForearm)) {
        enterState(STATE_CLOSE_GRIP);
      }

      if (timedOut()) enterState(STATE_RESET);
      break;

    // ── CLOSE GRIP — hold torque ─────────────────────────────
    //    IDENTICAL to v3
    case STATE_CLOSE_GRIP:
      jointMoveTo(jHand, HAND_CLOSED);

      if (jointDone(jHand)) {
        jointHold(jHand);

        if (!settling) {
          settling = true;
          settleStart = now;
        } else if (now - settleStart >= SETTLE_MS) {
          Serial.println("  (grip holding)");
          enterState(STATE_LIFT);
        }
      }

      if (timedOut()) enterState(STATE_RESET);
      break;

    // ── LIFT: raise with ball ────────────────────────────────
    //    v4+IK: solveIK for lift height
    //    v3/fallback: raise wrist to WRIST_UP
    case STATE_LIFT:
      if (useIK && !ikCommanded) {
        bool ok = ikLift();
        if (!ok) {
          Serial.println(F("IK lift fail -> v3 fallback"));
          jointMoveTo(jWrist, WRIST_UP);
        }
        ikCommanded = true;
      } else if (!useIK && !ikCommanded) {
        jointMoveTo(jWrist, WRIST_UP);
        ikCommanded = true;
      }

      if (jointDone(jWrist) && jointDone(jForearm)) {
        enterState(STATE_TRANSFER);
      }

      if (timedOut()) enterState(STATE_RESET);
      break;

    // ── TRANSFER: move to drop zone ──────────────────────────
    //    v4+IK: solveIK for all 3 joints to cup position
    //    v3/fallback: sweep elbow, then tilt wrist
    case STATE_TRANSFER:
      if (useIK) {
        if (!ikCommanded) {
          bool ok = ikTransfer();
          if (!ok) {
            Serial.println(F("IK transfer fail -> v3 fallback"));
            // Fall back to v3 sequenced motion
            jointMoveTo(jElbow, DROP_POS);
          }
          ikCommanded = true;
        }

        // v3 fallback: sequence wrist after elbow (only if IK failed)
        // If IK succeeded, all 3 joints were commanded simultaneously
        if (jointDone(jElbow) && jointDone(jWrist) && jointDone(jForearm)) {
          enterState(STATE_DROP);
        }
      } else {
        // Pure v3 path: sweep elbow first, then tilt wrist
        jointMoveTo(jElbow, DROP_POS);

        if (jointDone(jElbow)) {
          jointMoveTo(jWrist, WRIST_DROP);
        }

        if (jointDone(jElbow) && jointDone(jWrist)) {
          enterState(STATE_DROP);
        }
      }

      if (timedOut()) enterState(STATE_RESET);
      break;

    // ── DROP: release grip ───────────────────────────────────
    //    IDENTICAL to v3
    case STATE_DROP:
      jointRelease(jHand);
      jointMoveTo(jHand, HAND_OPEN);

      if (jointDone(jHand)) {
        if (!settling) {
          settling = true;
          settleStart = now;
        } else if (now - settleStart >= SETTLE_MS) {
          enterState(STATE_RESET);
        }
      }

      if (timedOut()) enterState(STATE_RESET);
      break;

    // ── RESET: return home ───────────────────────────────────
    //    v3 logic + forearm return (v4 may have moved it)
    case STATE_RESET:
      jointRelease(jHand);

      // v4: return forearm to scan position (IK may have moved it)
      jointMoveTo(jForearm, FOREARM_POS);
      jointMoveTo(jWrist, WRIST_SCAN);

      if (jointDone(jWrist) && jointDone(jForearm)) {
        jointMoveTo(jElbow, SCAN_START);
      }

      if (jointDone(jWrist) && jointDone(jForearm) && jointDone(jElbow)) {
        jointMoveTo(jHand, HAND_OPEN);
      }

      if (jointDone(jWrist) && jointDone(jForearm) && jointDone(jElbow) && jointDone(jHand)) {
        confirmCount = 0;
        scanToEnd = true;
        jointMoveTo(jElbow, SCAN_END);
        Serial.println("Reset — scanning.");
        Serial.println();
        enterState(STATE_SCAN);
      }

      if (timedOut()) {
        jointRelease(jHand);

        servo_hand.attach(PIN_HAND);
        servo_hand.write(HAND_OPEN);
        servo_wrist.attach(PIN_WRIST);
        servo_wrist.write(WRIST_SCAN);
        servo_forearm.attach(PIN_FOREARM);
        servo_forearm.write(FOREARM_POS);
        servo_elbow.attach(PIN_ELBOW);
        servo_elbow.write(SCAN_START);
        delay(500);
        servo_hand.detach();
        servo_wrist.detach();
        servo_forearm.detach();
        servo_elbow.detach();

        jHand.current    = HAND_OPEN;    jHand.moving    = false; jHand.attached    = false; jHand.holdAttached = false;
        jWrist.current   = WRIST_SCAN;   jWrist.moving   = false; jWrist.attached   = false;
        jForearm.current = FOREARM_POS;  jForearm.moving = false; jForearm.attached = false;
        jElbow.current   = SCAN_START;   jElbow.moving   = false; jElbow.attached   = false;

        confirmCount = 0;
        scanToEnd = true;
        jointMoveTo(jElbow, SCAN_END);
        enterState(STATE_SCAN);
      }
      break;
  }
}
