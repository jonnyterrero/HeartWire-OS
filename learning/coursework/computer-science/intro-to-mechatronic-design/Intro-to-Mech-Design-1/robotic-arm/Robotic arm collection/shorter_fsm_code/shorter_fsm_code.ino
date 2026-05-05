#include <Servo.h>

// -------------------- PINS --------------------
#define PIN_HAND    7
#define PIN_WRIST   3
#define PIN_FOREARM 11
#define PIN_ELBOW   5

#define PIN_TRIG    2
#define PIN_ECHO    4

// -------------------- SERVOS --------------------
Servo sHand, sWrist, sForearm, sElbow;

// -------------------- CALIBRATION --------------------
// ⚠️ YOU MUST TUNE THESE
const int HAND_OPEN   = 30;
const int HAND_CLOSED = 100;

const int WRIST_UP    = 90;
const int WRIST_DOWN  = 110;
const int WRIST_DROP  = 140;

const int FOREARM_PICK   = 40;
const int FOREARM_TRAVEL = 60;

const int SCAN_MIN = 20;
const int SCAN_MAX = 130;
const int DROP_POS = 170;

// -------------------- SENSOR --------------------
float readDistance() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);

  // Reduced timeout (IMPORTANT FIX)
  long duration = pulseIn(PIN_ECHO, HIGH, 6000);

  if (duration == 0) return 999;

  return duration * 0.0343 / 2;
}

// simple smoothing
float filteredDist = 100;
float getDistance() {
  float d = readDistance();
  filteredDist = 0.4 * d + 0.6 * filteredDist;
  return filteredDist;
}

// -------------------- FSM --------------------
enum State {
  SCAN,
  APPROACH,
  GRAB,
  LIFT,
  MOVE,
  RELEASE,
  RETURN_HOME,
  STOP_HAND
};

State state = SCAN;

// -------------------- MOTION --------------------
int elbow = SCAN_MIN;
bool dir = true;

void moveServoSmooth(Servo &s, int &current, int target) {
  if (current < target) current++;
  else if (current > target) current--;
  s.write(current);
}

// -------------------- GLOBAL POSITIONS --------------------
int posHand = HAND_OPEN;
int posWrist = WRIST_UP;
int posForearm = FOREARM_TRAVEL;
int posElbow = SCAN_MIN;

// -------------------- SETUP --------------------
void setup() {
  Serial.begin(9600);

  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);

  sHand.attach(PIN_HAND);
  sWrist.attach(PIN_WRIST);
  sForearm.attach(PIN_FOREARM);
  sElbow.attach(PIN_ELBOW);

  sHand.write(posHand);
  sWrist.write(posWrist);
  sForearm.write(posForearm);
  sElbow.write(posElbow);
}

// -------------------- LOOP --------------------
void loop() {

  float dist = getDistance();

  // 🔴 HAND STOP (NEW)
  if (dist < 8) {
    state = STOP_HAND;
  }

  switch (state) {

    // ---------------- SCAN ----------------
    case SCAN:
      moveServoSmooth(sElbow, posElbow, dir ? SCAN_MAX : SCAN_MIN);

      if (posElbow == SCAN_MAX || posElbow == SCAN_MIN) {
        dir = !dir;
      }

      if (dist > 8 && dist < 15) {
        state = APPROACH;
      }
      break;

    // ---------------- APPROACH ----------------
    case APPROACH:
      moveServoSmooth(sForearm, posForearm, FOREARM_PICK);
      moveServoSmooth(sWrist, posWrist, WRIST_UP);

      if (abs(posForearm - FOREARM_PICK) < 2) {
        state = GRAB;
      }
      break;

    // ---------------- GRAB ----------------
    case GRAB:
      moveServoSmooth(sWrist, posWrist, WRIST_DOWN);

      if (abs(posWrist - WRIST_DOWN) < 2) {
        sHand.write(HAND_CLOSED);
        delay(300);
        state = LIFT;
      }
      break;

    // ---------------- LIFT ----------------
    case LIFT:
      moveServoSmooth(sWrist, posWrist, WRIST_UP);

      if (abs(posWrist - WRIST_UP) < 2) {
        state = MOVE;
      }
      break;

    // ---------------- MOVE ----------------
    case MOVE:
      moveServoSmooth(sElbow, posElbow, DROP_POS);

      if (abs(posElbow - DROP_POS) < 2) {
        moveServoSmooth(sWrist, posWrist, WRIST_DROP);
        state = RELEASE;
      }
      break;

    // ---------------- RELEASE ----------------
    case RELEASE:
      sHand.write(HAND_OPEN);
      delay(300);
      state = RETURN_HOME;
      break;

    // ---------------- RETURN ----------------
    case RETURN_HOME:
      moveServoSmooth(sElbow, posElbow, SCAN_MIN);
      moveServoSmooth(sForearm, posForearm, FOREARM_TRAVEL);
      moveServoSmooth(sWrist, posWrist, WRIST_UP);

      if (abs(posElbow - SCAN_MIN) < 2) {
        state = SCAN;
      }
      break;

    // ---------------- HAND STOP ----------------
    case STOP_HAND:
      sHand.write(HAND_OPEN);
      sWrist.write(WRIST_UP);
      sForearm.write(FOREARM_TRAVEL);

      // Wait until hand is removed
      if (dist > 15) {
        state = SCAN;
      }
      break;
  }

  delay(15);
}