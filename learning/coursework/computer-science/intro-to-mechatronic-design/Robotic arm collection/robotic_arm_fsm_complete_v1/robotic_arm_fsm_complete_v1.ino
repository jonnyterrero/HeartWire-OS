#include <Servo.h>

// ================================================================
//  TYPE DEFINITIONS
// ================================================================

struct Joint {
  Servo* servo;
  int current;
  int target;
  bool moving;
};

enum State : uint8_t {
  ST_SCAN, ST_DETECTED, ST_APPROACH, ST_GRAB,
  ST_LIFT, ST_MOVE_DROP, ST_RELEASE, ST_RETURN, ST_HALT
};

void jointMoveTo(Joint& j, int angle);
bool jointArrived(const Joint& j);
void jointStep(Joint& j);
void enterState(State s);

// ----------------------------------------------------------------
//  Debug
// ----------------------------------------------------------------
#define DEBUG true

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
Servo servo_hand, servo_wrist, servo_forearm, servo_elbow;

// ----------------------------------------------------------------
//  Calibration
// ----------------------------------------------------------------
const int HAND_OPEN   = 0;
const int HAND_CLOSED = 110;    // was 90 — tighter grip survives lift forces

const int WRIST_UP    = 150;
const int WRIST_DOWN  = 60;
const int WRIST_DROP  = 90;

const int FOREARM_POS  = 45;
const int FOREARM_GRAB = 105;

const int SCAN_START = 0;
const int SCAN_END   = 135;
const int DROP_POS   = 180;

int elbowDetectAngle = SCAN_START;

// ----------------------------------------------------------------
//  Sensor thresholds
// ----------------------------------------------------------------
const float D_MIN_CM = 2.0f;
const float D_MAX_CM = 15.0f;

// ----------------------------------------------------------------
//  Timing
// ----------------------------------------------------------------
const unsigned long STEP_MS          = 20;
const unsigned long SETTLE_MS        = 300;
const unsigned long CONFIRM_MS       = 800;
const unsigned long HALT_PAUSE_MS    = 2000;
const unsigned long SCAN_DWELL_MS    = 350;
const unsigned long STATE_TIMEOUT_MS = 12000;
const unsigned long CARRY_TIMEOUT_MS = 20000;

// ----------------------------------------------------------------
//  Sensor filter
// ----------------------------------------------------------------
float pingBuf[3];
uint8_t pingIdx    = 0;
bool    pingFull   = false;
float   filteredCm = 400.0f;
uint8_t debounceCount = 0;
unsigned long lastPingMs = 0;

float pingCm() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  unsigned long us = pulseIn(PIN_ECHO, HIGH, 3500);
  if (us == 0) return 999.0f;
  return us * 0.01715f;
}

float median3(float a, float b, float c) {
  if (a > b) { float t = a; a = b; b = t; }
  if (b > c) { float t = b; b = c; c = t; }
  if (a > b) { float t = a; a = b; b = t; }
  return b;
}

void updateSensor(bool doDebounce) {
  if (millis() - lastPingMs < 25) return;
  lastPingMs = millis();

  pingBuf[pingIdx++] = pingCm();
  if (pingIdx < 3) return;
  pingIdx = 0;
  pingFull = true;

  float med = median3(pingBuf[0], pingBuf[1], pingBuf[2]);
  if (med > 1.0f && med < 400.0f) {
    filteredCm = 0.35f * med + 0.65f * filteredCm;
  }

  if (doDebounce) {
    if (filteredCm > D_MIN_CM && filteredCm < D_MAX_CM)
      debounceCount = min(debounceCount + 1, 250);
    else
      debounceCount = 0;
  }
}

void resetSensor() {
  debounceCount = 0;
  filteredCm    = 400.0f;
  pingIdx       = 0;
  pingFull      = false;
}

// ----------------------------------------------------------------
//  Joint functions
// ----------------------------------------------------------------
Joint jHand    = { &servo_hand,    HAND_OPEN,   HAND_OPEN,   false };
Joint jWrist   = { &servo_wrist,   WRIST_UP,    WRIST_UP,    false };
Joint jForearm = { &servo_forearm, FOREARM_POS, FOREARM_POS, false };
Joint jElbow   = { &servo_elbow,   SCAN_START,  SCAN_START,  false };

void jointMoveTo(Joint& j, int angle) {
  j.target = constrain(angle, 0, 180);
  j.moving = (j.target != j.current);
}

bool jointArrived(const Joint& j) { return !j.moving; }

void jointStep(Joint& j) {
  if (!j.moving) return;
  if (j.current < j.target) j.current++;
  else                       j.current--;
  j.servo->write(j.current);
  if (j.current == j.target) j.moving = false;
}

void tickServos() {
  jointStep(jHand);
  jointStep(jWrist);
  jointStep(jForearm);
  jointStep(jElbow);
}

// ----------------------------------------------------------------
//  FSM globals + helpers
// ----------------------------------------------------------------
State state = ST_SCAN;
unsigned long stateStartMs = 0;
uint8_t phase = 0;
unsigned long phaseTimerMs = 0;

bool scanToEnd     = true;
bool scanDwelling  = false;
unsigned long dwellStartMs = 0;

unsigned long lastStepMs = 0;

void enterState(State s) {
  state = s;  stateStartMs = millis();
  phase = 0;  phaseTimerMs = 0;
#if DEBUG
  const char* n[] = {"SCAN","DETECT","APPROACH","GRAB",
                     "LIFT","MOVE","RELEASE","RETURN","HALT"};
  Serial.println(n[s]);
#endif
}

bool timeout()      { return millis() - stateStartMs > STATE_TIMEOUT_MS; }
bool carryTimeout() { return millis() - stateStartMs > CARRY_TIMEOUT_MS; }
void startTimer(unsigned long ms) { phaseTimerMs = millis() + ms; }
bool timerDone() { return (long)(millis() - phaseTimerMs) >= 0; }

void safePose() {
  jointMoveTo(jHand, HAND_OPEN);
  jointMoveTo(jWrist, WRIST_UP);
}

// ----------------------------------------------------------------
//  setup
// ----------------------------------------------------------------
void setup() {
  Serial.begin(9600);
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);

  servo_hand.attach(PIN_HAND);
  servo_wrist.attach(PIN_WRIST);
  servo_forearm.attach(PIN_FOREARM);
  servo_elbow.attach(PIN_ELBOW);

  servo_hand.write(HAND_OPEN);
  servo_wrist.write(WRIST_UP);
  servo_forearm.write(FOREARM_POS);
  servo_elbow.write(SCAN_START);

  Serial.println(F("=== Arm Ready ==="));
  jointMoveTo(jElbow, SCAN_END);
  enterState(ST_SCAN);
  lastStepMs = millis();
}

// ----------------------------------------------------------------
//  loop
// ----------------------------------------------------------------
void loop() {
  unsigned long now = millis();

  bool scanning = (state == ST_SCAN);
  if (!scanning) debounceCount = 0;
  updateSensor(scanning);

  if (now - lastStepMs >= STEP_MS) {
    lastStepMs = now;
    tickServos();
  }

  switch (state) {

    case ST_SCAN: {
      if (pingFull && debounceCount >= 3) {
        elbowDetectAngle = jElbow.current;
        enterState(ST_DETECTED);
        break;
      }
      if (!scanDwelling) {
        if (jointArrived(jElbow)) {
          scanDwelling = true;
          dwellStartMs = now;
          debounceCount = 0;
        }
      } else {
        if (now - dwellStartMs >= SCAN_DWELL_MS) {
          scanDwelling = false;
          debounceCount = 0;
          if (scanToEnd) { jointMoveTo(jElbow, SCAN_START); scanToEnd = false; }
          else           { jointMoveTo(jElbow, SCAN_END);   scanToEnd = true;  }
        }
      }
      if (timeout()) stateStartMs = now;
      break;
    }

    case ST_DETECTED: {
      jointMoveTo(jElbow, elbowDetectAngle);
      bool inRange = (filteredCm > D_MIN_CM && filteredCm < D_MAX_CM);
      if (!inRange) { enterState(ST_HALT); break; }
      if (now - stateStartMs >= CONFIRM_MS) enterState(ST_APPROACH);
      if (timeout()) { safePose(); enterState(ST_RETURN); }
      break;
    }

    case ST_APPROACH: {
      jointMoveTo(jHand, HAND_OPEN);
      jointMoveTo(jForearm, FOREARM_POS);
      jointMoveTo(jElbow, elbowDetectAngle);
      if (jointArrived(jHand) &&
          jointArrived(jForearm) && jointArrived(jElbow))
        enterState(ST_GRAB);
      if (timeout()) { safePose(); enterState(ST_RETURN); }
      break;
    }

    case ST_GRAB: {
      if (phase == 0) {
        jointMoveTo(jWrist, WRIST_DOWN);
        jointMoveTo(jForearm, FOREARM_GRAB);
        if (jointArrived(jWrist) && jointArrived(jForearm)) phase = 1;
      } else if (phase == 1) {
        jointMoveTo(jHand, HAND_CLOSED);
        if (jointArrived(jHand)) { phase = 2; startTimer(SETTLE_MS); }
      } else if (phase == 2) {
        servo_hand.write(HAND_CLOSED);   // active hold during settle
        if (timerDone()) enterState(ST_LIFT);
      }
      if (carryTimeout()) {
        jointMoveTo(jWrist, WRIST_UP);
        enterState(ST_RETURN);
      }
      break;
    }

    case ST_LIFT: {
      servo_hand.write(HAND_CLOSED);     // direct pulse every tick
      jointMoveTo(jHand, HAND_CLOSED);
      jointMoveTo(jWrist, WRIST_UP);
      jointMoveTo(jForearm, FOREARM_POS);
      if (jointArrived(jWrist) && jointArrived(jForearm))
        enterState(ST_MOVE_DROP);
      if (carryTimeout()) enterState(ST_RELEASE);
      break;
    }

    case ST_MOVE_DROP: {
      servo_hand.write(HAND_CLOSED);     // direct pulse every tick
      jointMoveTo(jHand, HAND_CLOSED);
      if (phase == 0) {
        jointMoveTo(jElbow, DROP_POS);
        if (jointArrived(jElbow)) phase = 1;
      } else if (phase == 1) {
        jointMoveTo(jWrist, WRIST_DROP);
        if (jointArrived(jWrist)) enterState(ST_RELEASE);
      }
      if (carryTimeout()) enterState(ST_RELEASE);
      break;
    }

    case ST_RELEASE: {
      if (phase == 0) {
        jointMoveTo(jHand, HAND_OPEN);
        if (jointArrived(jHand)) { phase = 1; startTimer(SETTLE_MS); }
      } else if (phase == 1) {
        if (timerDone()) enterState(ST_RETURN);
      }
      if (timeout()) { jointMoveTo(jHand, HAND_OPEN); enterState(ST_RETURN); }
      break;
    }

    case ST_RETURN: {
      if (phase == 0) {
        jointMoveTo(jForearm, FOREARM_POS);
        jointMoveTo(jElbow, SCAN_START);
        jointMoveTo(jHand, HAND_OPEN);
        jointMoveTo(jWrist, WRIST_UP);
        if (jointArrived(jForearm) && jointArrived(jElbow) &&
            jointArrived(jHand) && jointArrived(jWrist))
          phase = 1;
      } else if (phase == 1) {
        resetSensor();
        scanToEnd = true;
        scanDwelling = false;
        jointMoveTo(jElbow, SCAN_END);
        enterState(ST_SCAN);
      }
      if (timeout()) {
        jHand.current = HAND_OPEN;       servo_hand.write(HAND_OPEN);
        jWrist.current = WRIST_UP;       servo_wrist.write(WRIST_UP);
        jForearm.current = FOREARM_POS;  servo_forearm.write(FOREARM_POS);
        jElbow.current = SCAN_START;     servo_elbow.write(SCAN_START);
        resetSensor();
        scanToEnd = true; scanDwelling = false;
        jointMoveTo(jElbow, SCAN_END);
        enterState(ST_SCAN);
      }
      break;
    }

    case ST_HALT: {
      jointMoveTo(jHand, HAND_OPEN);
      jointMoveTo(jWrist, WRIST_UP);
      if (phase == 0) {
        if (jointArrived(jHand) && jointArrived(jWrist)) {
          phase = 1; startTimer(HALT_PAUSE_MS);
        }
      } else if (phase == 1) {
        if (timerDone()) {
          resetSensor();
          scanToEnd = true; scanDwelling = false;
          jointMoveTo(jElbow, SCAN_END);
          enterState(ST_SCAN);
        }
      }
      if (timeout()) { safePose(); enterState(ST_RETURN); }
      break;
    }
  }
}