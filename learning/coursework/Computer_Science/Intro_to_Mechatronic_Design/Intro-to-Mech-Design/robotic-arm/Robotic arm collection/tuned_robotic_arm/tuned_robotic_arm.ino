/*
 * ================================================================
 *  4-Axis Robotic Arm — Autonomous Pick & Place (WORKING)
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
 *  SENSOR FIX:
 *    Previous versions called getDistance() twice back-to-back
 *    (once in DWELL, once in CONFIRM). The HC-SR04 needs ~60ms
 *    between measurement bursts or the transducer doesn't settle
 *    and returns 0 (999cm). Now detection counting happens inside
 *    DWELL with built-in spacing via PING_DELAY_MS.
 *
 *  MOTION SEQUENCE:
 *    1. SCAN:  elbow sweeps 0°→135°→0° (repeat)
 *    2. DWELL: pause at each endpoint, take sensor readings
 *             if 3 consecutive in-range → pickup
 *    3. OPEN:  open gripper
 *    4. LOWER: wrist goes down to ball
 *    5. GRAB:  close gripper
 *    6. LIFT:  wrist goes up with ball
 *    7. TRANSFER: elbow moves to drop position
 *    8. DROP:  open gripper over cup
 *    9. RESET: return all joints home, restart scan
 * ================================================================
 */

#include <Servo.h>

enum State : uint8_t;

// ── PINS ──────────────────────────────────────────────────────
#define PIN_HAND    7
#define PIN_WRIST   3
#define PIN_FOREARM 11
#define PIN_ELBOW   5
#define PIN_TRIG    2
#define PIN_ECHO    4

// ── SERVO OBJECTS ─────────────────────────────────────────────
Servo servo_hand;
Servo servo_wrist;
Servo servo_forearm;
Servo servo_elbow;

// ══════════════════════════════════════════════════════════════
//  TUNING — ADJUST THESE TO YOUR ARM
// ══════════════════════════════════════════════════════════════

// ── Gripper (hand) ────────────────────────────────────────
//    Test: upload hardware test, watch pin 7 servo.
//    HAND_OPEN  = fingers fully spread / jaws apart
//    HAND_CLOSED = tight enough to grip a ball without crushing
const int HAND_OPEN   = 0;
const int HAND_CLOSED = 90;

// ── Wrist ─────────────────────────────────────────────────
//    WRIST_UP   = carry position (ball lifted, clear of ground)
//    WRIST_DOWN = as low as possible to reach ball on surface
//    WRIST_DROP = angled over the cup to release cleanly
//    ** If the arm can't reach the ball, increase WRIST_DOWN **
//    ** If ball misses the cup, adjust WRIST_DROP **
const int WRIST_UP    = 40;     // was 60 — lower number = higher lift
const int WRIST_DOWN  = 160;    // was 150 — go as low as mechanically safe
const int WRIST_DROP  = 130;    // angle over cup

// ── Forearm (fixed — adjust if arm can't reach) ───────────
const int FOREARM_POS = 45;

// ── Elbow ─────────────────────────────────────────────────
//    SCAN_START / SCAN_END = sweep range during scanning
//    DROP_POS = elbow angle that positions hand over the cup
//    ** Adjust DROP_POS so the gripper is directly above cup **
const int SCAN_START  = 0;
const int SCAN_END    = 135;
const int DROP_POS    = 180;

// ── Sensor ────────────────────────────────────────────────
const float DETECT_MIN_CM = 2.0;     // closer than this = noise
const float DETECT_MAX_CM = 15.0;    // farther than this = no object
const int   CONFIRM_NEEDED = 3;      // consecutive in-range readings
const unsigned long PING_DELAY_MS = 80;  // gap between sensor checks (HC-SR04 needs 60ms+)

// ── Timing ────────────────────────────────────────────────
const unsigned long STEP_MS    = 20;     // ms per 1° of servo travel
const unsigned long SETTLE_MS  = 500;    // pause after grip action
const unsigned long TIMEOUT_MS = 12000;  // max time in any state

// ══════════════════════════════════════════════════════════════
//  JOINT — smooth motion + auto-detach (prevents overheating)
// ══════════════════════════════════════════════════════════════

struct Joint {
  Servo*  servo;
  int     pin;
  int     current;
  int     target;
  bool    attached;
  bool    moving;
};

Joint jHand    = { &servo_hand,    PIN_HAND,    HAND_OPEN,   HAND_OPEN,   false, false };
Joint jWrist   = { &servo_wrist,   PIN_WRIST,   WRIST_UP,    WRIST_UP,    false, false };
Joint jForearm = { &servo_forearm, PIN_FOREARM, FOREARM_POS, FOREARM_POS, false, false };
Joint jElbow   = { &servo_elbow,   PIN_ELBOW,   SCAN_START,  SCAN_START,  false, false };

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

void jointStep(Joint &j) {
  if (!j.moving) return;
  if (j.current < j.target)      j.current++;
  else if (j.current > j.target) j.current--;
  j.servo->write(j.current);
  if (j.current == j.target) {
    j.moving = false;
    j.servo->detach();
    j.attached = false;
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
//  SENSOR — single filtered reading (no back-to-back bursts)
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

// Take 3 quick pings, return the median (not 5 — faster, still filtered)
float getDistance() {
  float a = singlePing();
  delayMicroseconds(500);
  float b = singlePing();
  delayMicroseconds(500);
  float c = singlePing();

  // Sort three values, return middle
  if (a > b) { float t = a; a = b; b = t; }
  if (b > c) { float t = b; b = c; c = t; }
  if (a > b) { float t = a; a = b; b = t; }
  return b;
}

// ══════════════════════════════════════════════════════════════
//  FSM STATES
// ══════════════════════════════════════════════════════════════

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

State state = STATE_SCAN;
unsigned long stateStart   = 0;
unsigned long settleStart  = 0;
unsigned long lastPingMs   = 0;
bool          settling     = false;
int           confirmCount = 0;
bool          scanToEnd    = true;

void enterState(State s) {
  state      = s;
  stateStart = millis();
  settling   = false;
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
//  SETUP
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
  servo_wrist.write(WRIST_UP);
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

  Serial.println("=== Robotic Arm — Autonomous ===");
  Serial.println("Scanning...");
  Serial.println();

  jointMoveTo(jElbow, SCAN_END);
  scanToEnd = true;
  enterState(STATE_SCAN);
}

// ══════════════════════════════════════════════════════════════
//  LOOP
// ══════════════════════════════════════════════════════════════
void loop() {
  unsigned long now = millis();

  if (now - lastStepMs >= STEP_MS) {
    lastStepMs = now;
    tickAllJoints();
  }

  switch (state) {

    // ── SCAN: sweep elbow ────────────────────────────────────
    case STATE_SCAN:
      if (jointDone(jElbow)) {
        confirmCount = 0;
        lastPingMs = 0;    // allow immediate first reading
        enterState(STATE_DWELL);
      }
      break;

    // ── DWELL: pause at endpoint, take spaced readings ───────
    //    Sensor checks are spaced by PING_DELAY_MS (80ms)
    //    so the HC-SR04 transducer fully settles between reads.
    //    3 consecutive in-range = confirmed detection.
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
          if (confirmCount >= CONFIRM_NEEDED) {
            Serial.print("*** OBJECT CONFIRMED at ");
            Serial.print(d);
            Serial.println(" cm ***");
            enterState(STATE_OPEN_GRIP);
          }
        } else {
          // Out of range — reset count but stay in DWELL
          confirmCount = 0;
        }
      }

      // Dwell timeout — no consistent detection, resume sweep
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

    // ── LOWER WRIST to ball ──────────────────────────────────
    case STATE_LOWER_WRIST:
      jointMoveTo(jWrist, WRIST_DOWN);

      if (jointDone(jWrist)) {
        enterState(STATE_CLOSE_GRIP);
      }

      if (timedOut()) enterState(STATE_RESET);
      break;

    // ── CLOSE GRIP on ball ───────────────────────────────────
    case STATE_CLOSE_GRIP:
      jointMoveTo(jHand, HAND_CLOSED);

      if (jointDone(jHand)) {
        if (!settling) {
          settling = true;
          settleStart = now;
        } else if (now - settleStart >= SETTLE_MS) {
          enterState(STATE_LIFT);
        }
      }

      if (timedOut()) enterState(STATE_RESET);
      break;

    // ── LIFT wrist with ball ─────────────────────────────────
    case STATE_LIFT:
      jointMoveTo(jWrist, WRIST_UP);

      if (jointDone(jWrist)) {
        enterState(STATE_TRANSFER);
      }

      if (timedOut()) enterState(STATE_RESET);
      break;

    // ── TRANSFER: move elbow to cup, position wrist ──────────
    case STATE_TRANSFER:
      jointMoveTo(jElbow, DROP_POS);

      if (jointDone(jElbow)) {
        jointMoveTo(jWrist, WRIST_DROP);
      }

      if (jointDone(jElbow) && jointDone(jWrist)) {
        enterState(STATE_DROP);
      }

      if (timedOut()) enterState(STATE_RESET);
      break;

    // ── DROP: open grip over cup ─────────────────────────────
    case STATE_DROP:
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

    // ── RESET: return home, restart ──────────────────────────
    case STATE_RESET:
      jointMoveTo(jWrist, WRIST_UP);

      if (jointDone(jWrist)) {
        jointMoveTo(jElbow, SCAN_START);
      }

      if (jointDone(jWrist) && jointDone(jElbow)) {
        jointMoveTo(jHand, HAND_OPEN);
      }

      if (jointDone(jWrist) && jointDone(jElbow) && jointDone(jHand)) {
        confirmCount = 0;
        scanToEnd = true;
        jointMoveTo(jElbow, SCAN_END);
        Serial.println("Reset complete — scanning.");
        Serial.println();
        enterState(STATE_SCAN);
      }

      if (timedOut()) {
        servo_hand.attach(PIN_HAND);
        servo_hand.write(HAND_OPEN);
        servo_wrist.attach(PIN_WRIST);
        servo_wrist.write(WRIST_UP);
        servo_elbow.attach(PIN_ELBOW);
        servo_elbow.write(SCAN_START);
        delay(500);
        servo_hand.detach();
        servo_wrist.detach();
        servo_elbow.detach();

        jHand.current  = HAND_OPEN;   jHand.moving  = false; jHand.attached  = false;
        jWrist.current = WRIST_UP;    jWrist.moving = false; jWrist.attached = false;
        jElbow.current = SCAN_START;  jElbow.moving = false; jElbow.attached = false;

        confirmCount = 0;
        scanToEnd = true;
        jointMoveTo(jElbow, SCAN_END);
        enterState(STATE_SCAN);
      }
      break;
  }
}