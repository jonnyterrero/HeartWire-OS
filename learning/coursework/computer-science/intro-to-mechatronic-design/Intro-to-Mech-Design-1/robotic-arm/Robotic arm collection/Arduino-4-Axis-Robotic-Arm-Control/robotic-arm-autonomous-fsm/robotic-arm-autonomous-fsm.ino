/*
 * ================================================================
 *  4-Axis Robotic Arm — Autonomous pick & place (FSM)
 *  Board  : Arduino Uno
 *  Power  : 9V into Arduino barrel jack
 *           HC-SR04 → Arduino 5V / GND
 *           Servos  → separate 6V supply (shared GND with Uno!)
 * ================================================================
 *
 *  SERVO PINS:
 *    Hand (gripper) → 7
 *    Wrist          → 3
 *    Forearm        → 11
 *    Elbow          → 5
 *
 *  HC-SR04:
 *    TRIG → 2    ECHO → 4   (pin 1 is UART TX — do not use for ECHO)
 *
 *  Tuning: see D_MIN_CM, D_MAX_CM, SCAN_DWELL_MS, DEBOUNCE_HITS,
 *          and drop/pick angles below.
 * ================================================================
 */

#include <Servo.h>

// ----------------------------------------------------------------
//  Debug (Serial @ 9600 baud)
// ----------------------------------------------------------------
#define DEBUG_SENSOR false   // print raw ping / filtered cm
#define DEBUG_FSM    false   // print state transitions

// ----------------------------------------------------------------
//  Pins
// ----------------------------------------------------------------
#define PIN_HAND    7
#define PIN_WRIST   3
#define PIN_FOREARM 11
#define PIN_ELBOW   5

#define PIN_TRIG    2
#define PIN_ECHO    4

// ----------------------------------------------------------------
//  Servo objects
// ----------------------------------------------------------------
Servo servo_hand;
Servo servo_wrist;
Servo servo_forearm;
Servo servo_elbow;

// ----------------------------------------------------------------
//  Joint angles (tune to your arm)
// ----------------------------------------------------------------
const int HAND_OPEN   = 0;
const int HAND_CLOSED = 90;

const int WRIST_UP    = 60;
const int WRIST_DOWN  = 150;
const int WRIST_DROP  = 120;

const int FOREARM_POS = 45;

const int SCAN_START  = 0;
const int SCAN_END    = 135;
const int DROP_POS    = 180;

// Elbow angle saved when object is confirmed (keeps approach consistent)
int elbowDetectAngle = SCAN_START;

// ----------------------------------------------------------------
//  Ultrasonic — timing & thresholds
// ----------------------------------------------------------------
// TRIG pulse: per HC-SR04 datasheet — 10 µs HIGH after 2 µs LOW.
// Echo width is round-trip time; one-way distance in cm:
//   cm = (echo_us * speed_of_sound_cm_per_us) / 2
//   speed ≈ 0.0343 cm/µs at ~20 °C.
const float  SOS_CM_PER_US_HALF = 0.0343f / 2.0f;

// Space raw pings so the transducer and multipath can settle (non-blocking
// schedule: one pulseIn per updateSensor() call, not five in one loop).
const unsigned long PING_SPACING_MS = 25;

// Rolling median over N raw samples (each sample spaced by PING_SPACING_MS).
#define MEDIAN_N 5

// Reject impossible readings before filtering (glitch / noise).
const float VALID_MIN_CM = 2.0f;
const float VALID_MAX_CM = 400.0f;

// Detection band: object/hand must be closer than D_MAX_CM but farther
// than D_MIN_CM (avoids false triggers from electrical noise at 0 cm).
const float D_MIN_CM = 2.0f;
const float D_MAX_CM = 15.0f;

// EWMA on valid medians — higher alpha = faster response, more noise.
const float FILTER_ALPHA = 0.35f;

// Debounce: require this many consecutive in-range filtered readings
// while scanning at dwell (only checked during SCAN_DWELL).
const uint8_t DEBOUNCE_HITS = 3;

// Scan: pause at each elbow endpoint this long; sensor debounce runs here only.
const unsigned long SCAN_DWELL_MS = 350;

// Motion & settle
const unsigned long STEP_MS        = 20;
const unsigned long SETTLE_MS      = 500;
const unsigned long STATE_TIMEOUT_MS = 12000;

// Optional startup self-test: each joint wiggles once (set to 0 to skip).
const unsigned long SELFTEST_PHASE_MS = 1800;

// ----------------------------------------------------------------
//  FSM states (names per spec)
// ----------------------------------------------------------------
enum State : uint8_t {
  STATE_SCANNING,
  STATE_DETECTED,
  STATE_APPROACH,
  STATE_GRAB,
  STATE_LIFT,
  STATE_MOVE_TO_DROP,
  STATE_RELEASE,
  STATE_RETURN
};

State state = STATE_SCANNING;
unsigned long stateEnteredMs = 0;

// ----------------------------------------------------------------
//  Sensor globals
// ----------------------------------------------------------------
float rawBuf[MEDIAN_N];
uint8_t rawIdx = 0;
bool    rawFilled = false;
unsigned long lastPingScheduleMs = 0;

float filteredCm = 400.0f;
uint8_t debounceCount = 0;

// ----------------------------------------------------------------
//  Scanning sub-behavior
// ----------------------------------------------------------------
bool scanningToEnd = true;      // true: moving toward SCAN_END
bool scanDwellActive = false;
unsigned long scanDwellStartMs = 0;

// ----------------------------------------------------------------
//  Per-state sub-phase & millis settle (avoids shared global pausing bugs)
// ----------------------------------------------------------------
uint8_t phase = 0;
unsigned long phaseDeadlineMs = 0;

// ----------------------------------------------------------------
//  Self-test
// ----------------------------------------------------------------
uint8_t selfTestPhase = 0;
bool selfTestDone = false;

// ----------------------------------------------------------------
//  Joint + smooth motion (write only when angle changes)
// ----------------------------------------------------------------
struct Joint {
  Servo* servo;
  int    pin;
  int    current;
  int    target;
  bool   moving;
};

Joint jHand    = { &servo_hand,    PIN_HAND,    HAND_OPEN,   HAND_OPEN,   false };
Joint jWrist   = { &servo_wrist,   PIN_WRIST,   WRIST_UP,    WRIST_UP,    false };
Joint jForearm = { &servo_forearm, PIN_FOREARM, FOREARM_POS, FOREARM_POS, false };
Joint jElbow   = { &servo_elbow,   PIN_ELBOW,   SCAN_START,  SCAN_START,  false };

unsigned long lastStepMs = 0;

void jointMoveTo(Joint& j, int angle) {
  j.target = constrain(angle, 0, 180);
  j.moving = (j.target != j.current);
}

bool jointArrived(const Joint& j) {
  return !j.moving;
}

void jointStep(Joint& j) {
  if (!j.moving) return;

  if (j.current < j.target) {
    j.current++;
  } else if (j.current > j.target) {
    j.current--;
  }

  j.servo->write(j.current);

  if (j.current == j.target) {
    j.moving = false;
  }
}

void tickServos() {
  jointStep(jHand);
  jointStep(jWrist);
  jointStep(jForearm);
  jointStep(jElbow);
}

// ----------------------------------------------------------------
//  HC-SR04 — one ping, returns cm (invalid → large sentinel)
// ----------------------------------------------------------------
float singlePingCm() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);

  // Max ~30 ms wait; 0 = no pulse seen within timeout
  unsigned long echoUs = pulseIn(PIN_ECHO, HIGH, 30000);
  if (echoUs == 0) {
    return 999.0f;
  }
  return (float)echoUs * SOS_CM_PER_US_HALF;
}

// Insertion sort 5 floats — small N, simple median
static float median5(float* a) {
  float t[MEDIAN_N];
  for (uint8_t i = 0; i < MEDIAN_N; i++) t[i] = a[i];
  for (uint8_t i = 1; i < MEDIAN_N; i++) {
    float key = t[i];
    int j = (int)i - 1;
    while (j >= 0 && t[j] > key) {
      t[j + 1] = t[j];
      j--;
    }
    t[j + 1] = key;
  }
  return t[MEDIAN_N / 2];
}

// Called every loop: at most one ping per PING_SPACING_MS; builds median,
// then EWMA filter on valid medians only. When applyDebounce is true, each
// new median updates debounce streak (in-range) or clears it (out of range).
void updateSensor(bool applyDebounce) {
  unsigned long now = millis();
  if (now - lastPingScheduleMs < PING_SPACING_MS) {
    return;
  }
  lastPingScheduleMs = now;

  float d = singlePingCm();

#if DEBUG_SENSOR
  Serial.print(F("raw_cm="));
  Serial.print(d);
#endif

  rawBuf[rawIdx++] = d;
  if (rawIdx < MEDIAN_N) {
#if DEBUG_SENSOR
    Serial.println();
#endif
    return;
  }
  rawIdx = 0;
  rawFilled = true;

  float med = median5(rawBuf);

  if (med >= VALID_MIN_CM && med <= VALID_MAX_CM) {
    filteredCm = (FILTER_ALPHA * med) + ((1.0f - FILTER_ALPHA) * filteredCm);
  }

#if DEBUG_SENSOR
  Serial.print(F("  med="));
  Serial.print(med);
  Serial.print(F("  filt="));
  Serial.println(filteredCm);
#endif

  if (applyDebounce) {
    if (filteredCm > D_MIN_CM && filteredCm < D_MAX_CM) {
      if (debounceCount < 250) {
        debounceCount++;
      }
    } else {
      debounceCount = 0;
    }
  }
}

// Debounce counts advance only when updateSensor() finishes a median batch
// while scan dwell is active (see loop()).
void resetDebounce() {
  debounceCount = 0;
}

// ----------------------------------------------------------------
//  State machine helpers
// ----------------------------------------------------------------
void enterState(State s) {
#if DEBUG_FSM
  Serial.print(F("-> "));
  Serial.println(s);
#endif
  state = s;
  stateEnteredMs = millis();
  phase = 0;
  phaseDeadlineMs = 0;
}

bool stateTimedOut() {
  return (millis() - stateEnteredMs > STATE_TIMEOUT_MS);
}

void beginSettle(unsigned long ms) {
  phaseDeadlineMs = millis() + ms;
}

bool settleDone() {
  return (long)(millis() - phaseDeadlineMs) >= 0;
}

// Safe pose: open gripper, wrist up (used on timeout recovery)
void requestSafePose() {
  jointMoveTo(jHand, HAND_OPEN);
  jointMoveTo(jWrist, WRIST_UP);
}

// ----------------------------------------------------------------
//  Self-test: move hand → wrist → forearm → elbow one segment at a time
// ----------------------------------------------------------------
void runSelfTest() {
  switch (selfTestPhase) {
    case 0:
      jointMoveTo(jHand, HAND_CLOSED);
      if (jointArrived(jHand)) {
        selfTestPhase++;
      }
      break;
    case 1:
      jointMoveTo(jHand, HAND_OPEN);
      if (jointArrived(jHand)) {
        selfTestPhase++;
      }
      break;
    case 2:
      jointMoveTo(jWrist, WRIST_DOWN);
      if (jointArrived(jWrist)) {
        selfTestPhase++;
      }
      break;
    case 3:
      jointMoveTo(jWrist, WRIST_UP);
      if (jointArrived(jWrist)) {
        selfTestPhase++;
      }
      break;
    case 4:
      jointMoveTo(jForearm, 90);
      if (jointArrived(jForearm)) {
        selfTestPhase++;
      }
      break;
    case 5:
      jointMoveTo(jForearm, FOREARM_POS);
      if (jointArrived(jForearm)) {
        selfTestPhase++;
      }
      break;
    case 6:
      jointMoveTo(jElbow, 90);
      if (jointArrived(jElbow)) {
        selfTestPhase++;
      }
      break;
    case 7:
      jointMoveTo(jElbow, SCAN_START);
      if (jointArrived(jElbow)) {
        selfTestPhase++;
      }
      break;
    default:
      selfTestDone = true;
      scanningToEnd = true;
      scanDwellActive = false;
      jointMoveTo(jElbow, SCAN_END);
      enterState(STATE_SCANNING);
      break;
  }
}

// ----------------------------------------------------------------
//  setup
// ----------------------------------------------------------------
void setup() {
  Serial.begin(9600);

  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  digitalWrite(PIN_TRIG, LOW);

  servo_hand.attach(PIN_HAND);
  servo_wrist.attach(PIN_WRIST);
  servo_forearm.attach(PIN_FOREARM);
  servo_elbow.attach(PIN_ELBOW);

  jHand.current = HAND_OPEN;
  jWrist.current = WRIST_UP;
  jForearm.current = FOREARM_POS;
  jElbow.current = SCAN_START;

  servo_hand.write(HAND_OPEN);
  servo_wrist.write(WRIST_UP);
  servo_forearm.write(FOREARM_POS);
  servo_elbow.write(SCAN_START);

  Serial.println(F("=== Robotic arm autonomous FSM ==="));

  if (SELFTEST_PHASE_MS > 0) {
    Serial.println(F("Self-test..."));
    selfTestPhase = 0;
    enterState(STATE_SCANNING);
  } else {
    selfTestDone = true;
    scanningToEnd = true;
    scanDwellActive = false;
    jointMoveTo(jElbow, SCAN_END);
    enterState(STATE_SCANNING);
  }

  lastPingScheduleMs = 0;
  lastStepMs = millis();
}

// ----------------------------------------------------------------
//  loop — sensor, servos, FSM
// ----------------------------------------------------------------
void loop() {
  unsigned long now = millis();

  const bool scanDwellForSensor =
      (state == STATE_SCANNING && scanDwellActive);
  if (!scanDwellForSensor) {
    debounceCount = 0;
  }
  updateSensor(selfTestDone && scanDwellForSensor);

  if (now - lastStepMs >= STEP_MS) {
    lastStepMs = now;
    if (!selfTestDone && SELFTEST_PHASE_MS > 0) {
      runSelfTest();
    } else {
      tickServos();
    }
  }

  if (!selfTestDone && SELFTEST_PHASE_MS > 0) {
    return;
  }

  switch (state) {

    case STATE_SCANNING: {
      // Elbow sweeps SCAN_START <-> SCAN_END; distance checks only during
      // dwell at endpoints so the ultrasonic sees a stable field of view.
      if (!scanDwellActive) {
        if (jointArrived(jElbow)) {
          scanDwellActive = true;
          scanDwellStartMs = now;
          resetDebounce();
        }
      } else {
        if (now - scanDwellStartMs >= SCAN_DWELL_MS) {
          scanDwellActive = false;
          if (scanningToEnd) {
            jointMoveTo(jElbow, SCAN_START);
            scanningToEnd = false;
          } else {
            jointMoveTo(jElbow, SCAN_END);
            scanningToEnd = true;
          }
        } else {
          if (rawFilled && debounceCount >= DEBOUNCE_HITS) {
            elbowDetectAngle = jElbow.current;
#if DEBUG_FSM
            Serial.print(F("Detect filt_cm="));
            Serial.println(filteredCm);
#endif
            enterState(STATE_DETECTED);
          }
        }
      }

      if (stateTimedOut()) {
        requestSafePose();
        enterState(STATE_RETURN);
      }
      break;
    }

    case STATE_DETECTED: {
      // Freeze elbow at detection angle; next frame go approach
      jointMoveTo(jElbow, elbowDetectAngle);
      enterState(STATE_APPROACH);
      break;
    }

    case STATE_APPROACH: {
      // Open gripper, home wrist/forearm for pickup at detected elbow angle
      jointMoveTo(jHand, HAND_OPEN);
      jointMoveTo(jWrist, WRIST_UP);
      jointMoveTo(jForearm, FOREARM_POS);
      jointMoveTo(jElbow, elbowDetectAngle);

      if (jointArrived(jHand) && jointArrived(jWrist) &&
          jointArrived(jForearm) && jointArrived(jElbow)) {
        enterState(STATE_GRAB);
      }

      if (stateTimedOut()) {
        requestSafePose();
        enterState(STATE_RETURN);
      }
      break;
    }

    case STATE_GRAB: {
      // phase 0: lower wrist; phase 1: close gripper; phase 2: settle
      if (phase == 0) {
        jointMoveTo(jWrist, WRIST_DOWN);
        if (jointArrived(jWrist)) {
          phase = 1;
        }
      } else if (phase == 1) {
        jointMoveTo(jHand, HAND_CLOSED);
        if (jointArrived(jHand)) {
          phase = 2;
          beginSettle(SETTLE_MS);
        }
      } else if (phase == 2) {
        if (settleDone()) {
          enterState(STATE_LIFT);
        }
      }

      if (stateTimedOut()) {
        requestSafePose();
        enterState(STATE_RETURN);
      }
      break;
    }

    case STATE_LIFT: {
      jointMoveTo(jWrist, WRIST_UP);
      if (jointArrived(jWrist)) {
        enterState(STATE_MOVE_TO_DROP);
      }
      if (stateTimedOut()) {
        requestSafePose();
        enterState(STATE_RETURN);
      }
      break;
    }

    case STATE_MOVE_TO_DROP: {
      jointMoveTo(jElbow, DROP_POS);
      if (jointArrived(jElbow)) {
        jointMoveTo(jWrist, WRIST_DROP);
      }
      if (jointArrived(jElbow) && jointArrived(jWrist)) {
        enterState(STATE_RELEASE);
      }
      if (stateTimedOut()) {
        requestSafePose();
        enterState(STATE_RETURN);
      }
      break;
    }

    case STATE_RELEASE: {
      if (phase == 0) {
        jointMoveTo(jHand, HAND_OPEN);
        if (jointArrived(jHand)) {
          phase = 1;
          beginSettle(SETTLE_MS);
        }
      } else if (phase == 1) {
        if (settleDone()) {
          enterState(STATE_RETURN);
        }
      }

      if (stateTimedOut()) {
        enterState(STATE_RETURN);
      }
      break;
    }

    case STATE_RETURN: {
      jointMoveTo(jWrist, WRIST_UP);
      if (jointArrived(jWrist)) {
        jointMoveTo(jElbow, SCAN_START);
      }
      if (jointArrived(jWrist) && jointArrived(jElbow)) {
        jointMoveTo(jHand, HAND_OPEN);
      }
      if (jointArrived(jWrist) && jointArrived(jElbow) && jointArrived(jHand)) {
        resetDebounce();
        filteredCm = 400.0f;
        rawIdx = 0;
        rawFilled = false;
        scanningToEnd = true;
        scanDwellActive = false;
        jointMoveTo(jElbow, SCAN_END);
        enterState(STATE_SCANNING);
      }

      if (stateTimedOut()) {
        jHand.current = HAND_OPEN;
        jWrist.current = WRIST_UP;
        jElbow.current = SCAN_START;
        servo_hand.write(HAND_OPEN);
        servo_wrist.write(WRIST_UP);
        servo_elbow.write(SCAN_START);
        resetDebounce();
        scanningToEnd = true;
        scanDwellActive = false;
        jointMoveTo(jElbow, SCAN_END);
        enterState(STATE_SCANNING);
      }
      break;
    }
  }
}
