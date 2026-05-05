/*
 * 4-Axis Robotic Arm — Autonomous pick & place (FSM v3)
 * Board: Arduino Uno
 *
 * Patches: dwell-only scan debounce, pulseIn 30000 us, DETECTED HALT guard,
 *          optional self-test with abort timeout, forearm grab/drop sequencing.
 *
 * Modes:
 *   USE_MINIMAL_CLASSMATE_LOOP — blocking scan + grab/return (class demo style).
 *   USE_CLASSMATE_TUNED_ANGLES_IN_FSM — use classmate-tuned angles in the FSM below.
 */
#include <Servo.h>

#define SERIAL_BAUD 9600

#define DEBUG_SENSOR false
#define DEBUG_FSM    true

// 0 = non-blocking FSM (default). 1 = classmate-style blocking loop() only.
#define USE_MINIMAL_CLASSMATE_LOOP 0
// When FSM is enabled: 0 = original v3 angles, 1 = classmate sequence tuning (our wiring).
#define USE_CLASSMATE_TUNED_ANGLES_IN_FSM 0

#define PIN_HAND    7
#define PIN_WRIST   3
#define PIN_FOREARM 11
#define PIN_ELBOW   5
#define PIN_TRIG    2
#define PIN_ECHO    3

Servo servo_hand;
Servo servo_wrist;
Servo servo_forearm;
Servo servo_elbow;

// --- Classmate sequence (mapped: waist→elbow, shoulder→forearm, wrist, claw→hand) ---
// Pins stay ours: ELBOW 5, FOREARM 11, WRIST 3, HAND 7; TRIG 2, ECHO 4.
static const int CM_HOME_ELBOW    = 70;
static const int CM_HOME_FOREARM  = 15;
static const int CM_HOME_WRIST    = 30;
static const int CM_HOME_HAND     = 101;

static const int CM_GRAB_HAND_1   = 170;
static const int CM_GRAB_WRIST_1  = 140;
static const int CM_GRAB_HAND_2   = 130;
static const int CM_GRAB_FOREARM  = 100;
static const int CM_GRAB_ELBOW    = 170;
static const int CM_GRAB_HAND_3   = 160;

static const int CM_MINIMAL_MOTION_DELAY_MS = 800;
static const int CM_DETECT_MAX_CM           = 7;
static const int CM_DETECT_MIN_CM           = 3;
static const float CM_SWEEP_SPEED           = 0.35f;
static const float CM_SCAN_RESUME_CM        = 7.6f;

#if !USE_CLASSMATE_TUNED_ANGLES_IN_FSM
const int HAND_OPEN   = 0;
const int HAND_CLOSED = 90;
const int WRIST_UP   = 60;
const int WRIST_DOWN = 150;
const int WRIST_DROP = 120;
const int FOREARM_POS  = 45;
const int FOREARM_GRAB = 65;
const int SCAN_START = 0;
const int SCAN_END   = 135;
const int DROP_POS   = 180;
#else
const int HAND_OPEN   = CM_HOME_HAND;
const int HAND_CLOSED = CM_GRAB_HAND_3;
const int WRIST_UP   = CM_HOME_WRIST;
const int WRIST_DOWN = CM_GRAB_WRIST_1;
const int WRIST_DROP = CM_GRAB_WRIST_1;
const int FOREARM_POS  = CM_HOME_FOREARM;
const int FOREARM_GRAB = CM_GRAB_FOREARM;
const int SCAN_START = 0;
const int SCAN_END   = 135;
const int DROP_POS   = CM_GRAB_ELBOW;
#endif

// Safe elbow angle before resuming scan (classmate centers near 70°; original uses 0°).
#if USE_CLASSMATE_TUNED_ANGLES_IN_FSM
const int ELBOW_HOME_IDLE = CM_HOME_ELBOW;
#else
const int ELBOW_HOME_IDLE = SCAN_START;
#endif

int elbowDetectAngle = SCAN_START;

const float SOS_CM_PER_US_HALF = 0.0343f / 2.0f;
const unsigned long PING_SPACING_MS = 25;
#define MEDIAN_N 5
const float VALID_MIN_CM = 2.0f;
const float VALID_MAX_CM = 400.0f;
const float D_MIN_CM = 2.0f;
const float D_MAX_CM = 15.0f;
const float FILTER_ALPHA = 0.35f;
const uint8_t DEBOUNCE_HITS = 3;
const unsigned long SCAN_DWELL_MS = 350;

const unsigned long STEP_MS        = 20;
const unsigned long SETTLE_MS      = 500;
const unsigned long CONFIRM_MS     = 800;
const unsigned long HALT_PAUSE_MS  = 2000;
const unsigned long STATE_TIMEOUT_MS = 12000;
const unsigned long CARRY_TIMEOUT_MS = 20000;
// 0 = skip startup self-test (FSM runs immediately). Set 1800 to exercise each joint once.
const unsigned long SELFTEST_PHASE_MS = 0;
const unsigned long SELFTEST_ABORT_MS = 30000;
const unsigned long DETECTED_HALT_GUARD_MS = 400;

enum State : uint8_t {
  STATE_SCANNING,
  STATE_DETECTED,
  STATE_APPROACH,
  STATE_GRAB,
  STATE_LIFT,
  STATE_MOVE_TO_DROP,
  STATE_RELEASE,
  STATE_RETURN,
  STATE_HALT
};

State state = STATE_SCANNING;
unsigned long stateEnteredMs = 0;

float rawBuf[MEDIAN_N];
uint8_t rawIdx   = 0;
bool    rawFilled = false;
unsigned long lastPingScheduleMs = 0;

float   filteredCm     = 400.0f;
uint8_t debounceCount  = 0;

bool scanningToEnd     = true;
bool scanDwellActive   = false;
unsigned long scanDwellStartMs = 0;

uint8_t phase = 0;
unsigned long phaseDeadlineMs = 0;

uint8_t selfTestPhase = 0;
bool    selfTestDone  = false;
unsigned long selfTestStartedMs = 0;

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
  if (j.current < j.target)      j.current++;
  else if (j.current > j.target) j.current--;
  j.servo->write(j.current);
  if (j.current == j.target) j.moving = false;
}

void tickServos() {
  jointStep(jHand);
  jointStep(jWrist);
  jointStep(jForearm);
  jointStep(jElbow);
}

#if USE_MINIMAL_CLASSMATE_LOOP
int    curW = CM_HOME_ELBOW, curS = CM_HOME_FOREARM, curWr = CM_HOME_WRIST, curC = CM_HOME_HAND;
float  ang1 = (float)CM_HOME_ELBOW;
int    seekDirection = 1;
float  distanceCm = 0.0f;

static void softMoveBlock(Servo &s, int &currentPos, int targetPos, int speedMs) {
  while (currentPos != targetPos) {
    if (currentPos < targetPos) currentPos++;
    else currentPos--;
    s.write(currentPos);
    delay((unsigned long)speedMs);
  }
}

static void grabSequenceMinimal() {
  softMoveBlock(servo_hand, curC, CM_GRAB_HAND_1, 10);
  delay((unsigned long)CM_MINIMAL_MOTION_DELAY_MS);
  softMoveBlock(servo_wrist, curWr, CM_GRAB_WRIST_1, 15);
  delay((unsigned long)CM_MINIMAL_MOTION_DELAY_MS);
  softMoveBlock(servo_hand, curC, CM_GRAB_HAND_2, 20);
  delay((unsigned long)CM_MINIMAL_MOTION_DELAY_MS);
  softMoveBlock(servo_forearm, curS, CM_GRAB_FOREARM, 20);
  delay((unsigned long)CM_MINIMAL_MOTION_DELAY_MS);
  softMoveBlock(servo_elbow, curW, CM_GRAB_ELBOW, 15);
  delay((unsigned long)CM_MINIMAL_MOTION_DELAY_MS);
  softMoveBlock(servo_hand, curC, CM_GRAB_HAND_3, 15);
  delay((unsigned long)CM_MINIMAL_MOTION_DELAY_MS);
}

static void returnSequenceMinimal() {
  Serial.println(F(">>> RETURN (minimal)"));
  softMoveBlock(servo_elbow, curW, CM_HOME_ELBOW, 15);
  delay((unsigned long)CM_MINIMAL_MOTION_DELAY_MS);
  softMoveBlock(servo_forearm, curS, CM_HOME_FOREARM, 20);
  delay((unsigned long)CM_MINIMAL_MOTION_DELAY_MS);
  softMoveBlock(servo_wrist, curWr, CM_HOME_WRIST, 15);
  delay((unsigned long)CM_MINIMAL_MOTION_DELAY_MS);
  softMoveBlock(servo_hand, curC, CM_HOME_HAND, 10);
  ang1 = (float)CM_HOME_ELBOW;
  delay(1000);
}

void loopMinimalClassmate() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  unsigned long duration = pulseIn(PIN_ECHO, HIGH, 30000);
  distanceCm = (duration == 0) ? 999.0f : (float)duration * SOS_CM_PER_US_HALF;

  if (distanceCm <= (float)CM_DETECT_MAX_CM && distanceCm > (float)CM_DETECT_MIN_CM) {
    delay(100);
    grabSequenceMinimal();
    returnSequenceMinimal();
    distanceCm = 99.0f;
  }

  if (distanceCm > CM_SCAN_RESUME_CM || duration == 0) {
    ang1 += (CM_SWEEP_SPEED * (float)seekDirection);
    if (ang1 >= 135.0f) {
      ang1 = 135.0f;
      seekDirection = -1;
    }
    if (ang1 <= 0.0f) {
      ang1 = 0.0f;
      seekDirection = 1;
    }
    long angMap = (long)(ang1 + 0.5f);
    servo_elbow.writeMicroseconds((int)map(angMap, 0L, 180L, 544L, 2400L));
    curW = (int)angMap;
  }
  delay(10);
}
#endif

float singlePingCm() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  unsigned long echoUs = pulseIn(PIN_ECHO, HIGH, 30000);
  if (echoUs == 0) return 999.0f;
  return (float)echoUs * SOS_CM_PER_US_HALF;
}

static float medianN(float* a) {
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

void updateSensor(bool applyDebounce) {
  unsigned long now = millis();
  if (now - lastPingScheduleMs < PING_SPACING_MS) return;
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

  float med = medianN(rawBuf);

  if (med >= VALID_MIN_CM && med <= VALID_MAX_CM) {
    filteredCm = (FILTER_ALPHA * med) + ((1.0f - FILTER_ALPHA) * filteredCm);
  }

#if DEBUG_SENSOR
  Serial.print(F("  med="));  Serial.print(med);
  Serial.print(F("  filt=")); Serial.println(filteredCm);
#endif

  if (applyDebounce) {
    if (filteredCm > D_MIN_CM && filteredCm < D_MAX_CM) {
      if (debounceCount < 250) debounceCount++;
    } else {
      debounceCount = 0;
    }
  }
}

void resetDebounce() {
  debounceCount = 0;
}

void resetSensorFull() {
  resetDebounce();
  filteredCm = 400.0f;
  rawIdx     = 0;
  rawFilled  = false;
}

void enterState(State s) {
#if DEBUG_FSM
  const char* names[] = {
    "SCANNING","DETECTED","APPROACH","GRAB","LIFT",
    "MOVE_TO_DROP","RELEASE","RETURN","HALT"
  };
  Serial.print(F("-> "));
  Serial.println(names[s]);
#endif
  state = s;
  stateEnteredMs = millis();
  phase = 0;
  phaseDeadlineMs = 0;
}

bool stateTimedOut() {
  return (millis() - stateEnteredMs > STATE_TIMEOUT_MS);
}

bool carryTimedOut() {
  return (millis() - stateEnteredMs > CARRY_TIMEOUT_MS);
}

void beginSettle(unsigned long ms) {
  phaseDeadlineMs = millis() + ms;
}

bool settleDone() {
  return (long)(millis() - phaseDeadlineMs) >= 0;
}

void requestSafePose() {
  jointMoveTo(jHand, HAND_OPEN);
  jointMoveTo(jWrist, WRIST_UP);
}

void runSelfTest() {
  switch (selfTestPhase) {
    case 0:
      jointMoveTo(jHand, HAND_CLOSED);
      if (jointArrived(jHand)) selfTestPhase++;
      break;
    case 1:
      jointMoveTo(jHand, HAND_OPEN);
      if (jointArrived(jHand)) selfTestPhase++;
      break;
    case 2:
      jointMoveTo(jWrist, WRIST_DOWN);
      if (jointArrived(jWrist)) selfTestPhase++;
      break;
    case 3:
      jointMoveTo(jWrist, WRIST_UP);
      if (jointArrived(jWrist)) selfTestPhase++;
      break;
    case 4:
      jointMoveTo(jForearm, 90);
      if (jointArrived(jForearm)) selfTestPhase++;
      break;
    case 5:
      jointMoveTo(jForearm, FOREARM_POS);
      if (jointArrived(jForearm)) selfTestPhase++;
      break;
    case 6:
      jointMoveTo(jElbow, 90);
      if (jointArrived(jElbow)) selfTestPhase++;
      break;
    case 7:
      jointMoveTo(jElbow, SCAN_START);
      if (jointArrived(jElbow)) selfTestPhase++;
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

void setup() {
  Serial.begin(SERIAL_BAUD);

  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  digitalWrite(PIN_TRIG, LOW);

  servo_hand.attach(PIN_HAND);
  servo_wrist.attach(PIN_WRIST);
  servo_forearm.attach(PIN_FOREARM);
  servo_elbow.attach(PIN_ELBOW);

#if USE_MINIMAL_CLASSMATE_LOOP
  curW = CM_HOME_ELBOW;
  curS = CM_HOME_FOREARM;
  curWr = CM_HOME_WRIST;
  curC = CM_HOME_HAND;
  ang1 = (float)CM_HOME_ELBOW;
  seekDirection = 1;
  servo_hand.write(CM_HOME_HAND);
  servo_wrist.write(CM_HOME_WRIST);
  servo_forearm.write(CM_HOME_FOREARM);
  servo_elbow.write(CM_HOME_ELBOW);
  delay(2000);
  Serial.println(F("=== Minimal classmate loop | TRIG=2 ECHO=4 ==="));
#else
  jHand.current    = HAND_OPEN;
  jWrist.current   = WRIST_UP;
  jForearm.current = FOREARM_POS;
  jElbow.current   = SCAN_START;

  servo_hand.write(HAND_OPEN);
  servo_wrist.write(WRIST_UP);
  servo_forearm.write(FOREARM_POS);
  servo_elbow.write(SCAN_START);

  Serial.println(F("=== Robotic arm FSM v3 ==="));

  if (SELFTEST_PHASE_MS > 0) {
    Serial.println(F("Self-test..."));
    selfTestPhase = 0;
    selfTestStartedMs = millis();
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
#endif
}

void loop() {
#if USE_MINIMAL_CLASSMATE_LOOP
  loopMinimalClassmate();
  return;
#endif

  unsigned long now = millis();

  const bool isScanningState = (state == STATE_SCANNING);
  const bool dwellDebounce   = (isScanningState && scanDwellActive);
  if (!dwellDebounce) {
    debounceCount = 0;
  }
  updateSensor(selfTestDone && dwellDebounce);

  if (!selfTestDone && SELFTEST_PHASE_MS > 0) {
    if ((unsigned long)(millis() - selfTestStartedMs) > SELFTEST_ABORT_MS) {
      selfTestDone = true;
      scanningToEnd = true;
      scanDwellActive = false;
      jointMoveTo(jElbow, SCAN_END);
      enterState(STATE_SCANNING);
    }
  }

  if (now - lastStepMs >= STEP_MS) {
    lastStepMs = now;
    if (!selfTestDone && SELFTEST_PHASE_MS > 0) {
      runSelfTest();
    } else {
      tickServos();
    }
  }

  if (!selfTestDone && SELFTEST_PHASE_MS > 0) return;

  switch (state) {

    case STATE_SCANNING: {
      if (rawFilled && debounceCount >= DEBOUNCE_HITS) {
        elbowDetectAngle = jElbow.current;
#if DEBUG_FSM
        Serial.print(F("Detect filt_cm="));
        Serial.println(filteredCm);
#endif
        enterState(STATE_DETECTED);
        break;
      }

      if (!scanDwellActive) {
        if (jointArrived(jElbow)) {
          scanDwellActive = true;
          scanDwellStartMs = now;
          resetDebounce();
        }
      } else {
        if (now - scanDwellStartMs >= SCAN_DWELL_MS) {
          scanDwellActive = false;
          resetDebounce();
          if (scanningToEnd) {
            jointMoveTo(jElbow, SCAN_START);
            scanningToEnd = false;
          } else {
            jointMoveTo(jElbow, SCAN_END);
            scanningToEnd = true;
          }
        }
      }

      if (stateTimedOut()) stateEnteredMs = now;
      break;
    }

    case STATE_DETECTED: {
      jointMoveTo(jElbow, elbowDetectAngle);

      bool inRange = (filteredCm > D_MIN_CM && filteredCm < D_MAX_CM);

      if (phase == 0) {
        if (!inRange && (millis() - stateEnteredMs >= DETECTED_HALT_GUARD_MS)) {
#if DEBUG_FSM
          Serial.println(F("Classification: HAND (transient) -> HALT"));
#endif
          enterState(STATE_HALT);
          break;
        }
        if (millis() - stateEnteredMs >= CONFIRM_MS) {
#if DEBUG_FSM
          Serial.println(F("Classification: BALL (persistent) -> APPROACH"));
#endif
          enterState(STATE_APPROACH);
        }
      }

      if (stateTimedOut()) {
        requestSafePose();
        enterState(STATE_RETURN);
      }
      break;
    }

    case STATE_APPROACH: {
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
      if (phase == 0) {
        jointMoveTo(jWrist, WRIST_DOWN);
        jointMoveTo(jForearm, FOREARM_GRAB);
        if (jointArrived(jWrist) && jointArrived(jForearm)) {
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

      if (carryTimedOut()) {
        jointMoveTo(jWrist, WRIST_UP);
        enterState(STATE_RETURN);
      }
      break;
    }

    case STATE_LIFT: {
      jointMoveTo(jWrist, WRIST_UP);
      jointMoveTo(jForearm, FOREARM_POS);

      if (jointArrived(jWrist) && jointArrived(jForearm)) {
        enterState(STATE_MOVE_TO_DROP);
      }

      if (carryTimedOut()) {
        enterState(STATE_RELEASE);
      }
      break;
    }

    case STATE_MOVE_TO_DROP: {
      if (phase == 0) {
        jointMoveTo(jElbow, DROP_POS);
        if (jointArrived(jElbow)) {
          phase = 1;
        }
      } else if (phase == 1) {
        jointMoveTo(jWrist, WRIST_DROP);
        if (jointArrived(jWrist)) {
          enterState(STATE_RELEASE);
        }
      }

      if (carryTimedOut()) {
        enterState(STATE_RELEASE);
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
          phase = 2;
        }
      } else if (phase == 2) {
        jointMoveTo(jWrist, WRIST_UP);
        if (jointArrived(jWrist)) {
          enterState(STATE_RETURN);
        }
      }

      if (stateTimedOut()) {
        jointMoveTo(jHand, HAND_OPEN);
        jointMoveTo(jWrist, WRIST_UP);
        enterState(STATE_RETURN);
      }
      break;
    }

    case STATE_RETURN: {
      if (phase == 0) {
        jointMoveTo(jForearm, FOREARM_POS);
        jointMoveTo(jElbow, ELBOW_HOME_IDLE);
        jointMoveTo(jHand, HAND_OPEN);
        jointMoveTo(jWrist, WRIST_UP);

        if (jointArrived(jForearm) && jointArrived(jElbow) &&
            jointArrived(jHand) && jointArrived(jWrist)) {
          phase = 1;
        }
      } else if (phase == 1) {
        resetSensorFull();
        scanningToEnd  = true;
        scanDwellActive = false;
        jointMoveTo(jElbow, SCAN_END);
        enterState(STATE_SCANNING);
      }

      if (stateTimedOut()) {
        jHand.current    = HAND_OPEN;
        jWrist.current   = WRIST_UP;
        jForearm.current = FOREARM_POS;
        jElbow.current   = ELBOW_HOME_IDLE;
        servo_hand.write(HAND_OPEN);
        servo_wrist.write(WRIST_UP);
        servo_forearm.write(FOREARM_POS);
        servo_elbow.write(ELBOW_HOME_IDLE);

        resetSensorFull();
        scanningToEnd  = true;
        scanDwellActive = false;
        jointMoveTo(jElbow, SCAN_END);
        enterState(STATE_SCANNING);
      }
      break;
    }

    case STATE_HALT: {
      jointMoveTo(jHand, HAND_OPEN);
      jointMoveTo(jWrist, WRIST_UP);

      if (phase == 0) {
        if (jointArrived(jHand) && jointArrived(jWrist)) {
          phase = 1;
          beginSettle(HALT_PAUSE_MS);
#if DEBUG_FSM
          Serial.println(F("HALT: pausing before return to scan"));
#endif
        }
      } else if (phase == 1) {
        if (settleDone()) {
          resetSensorFull();
          scanningToEnd  = true;
          scanDwellActive = false;
          jointMoveTo(jElbow, SCAN_END);
          enterState(STATE_SCANNING);
        }
      }

      if (stateTimedOut()) {
        requestSafePose();
        enterState(STATE_RETURN);
      }
      break;
    }
  }
}
