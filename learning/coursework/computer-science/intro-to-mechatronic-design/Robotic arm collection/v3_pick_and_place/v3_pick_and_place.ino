/*
 * 4-Axis Robotic Arm — Autonomous Pick & Place (v3)
 * Board: Arduino Uno
 * Power: 9V barrel jack (Arduino), 6V separate supply (servos, shared GND)
 *
 * Wiring:
 *   Hand servo → pin 7     Sensor TRIG → pin 2
 *   Wrist servo → pin 3    Sensor ECHO → pin 4
 *   Forearm servo → pin 11
 *   Elbow servo → pin 5
 *
 * Sensor mounted on gripper — wrist must be horizontal during scan.
 * Grip fix: hand servo holds torque from CLOSE_GRIP through DROP.
 */

#include <Servo.h>

enum State : uint8_t;

#define PIN_HAND    7
#define PIN_WRIST   3
#define PIN_FOREARM 11
#define PIN_ELBOW   5
#define PIN_TRIG    2
#define PIN_ECHO    4

Servo servo_hand;
Servo servo_wrist;
Servo servo_forearm;
Servo servo_elbow;

// ── TUNING ───────────────────────────────────────────────
const int HAND_OPEN   = 0;
const int HAND_CLOSED = 90;

const int WRIST_SCAN  = 90;   // horizontal for scanning
const int WRIST_UP    = 40;   // carry position after grab
const int WRIST_DOWN  = 170;  // reach down to ball
const int WRIST_DROP  = 130;  // over cup

const int FOREARM_POS = 45;

const int SCAN_START  = 0;
const int SCAN_END    = 135;
const int DROP_POS    = 180;

const float DETECT_MIN_CM = 2.0;
const float DETECT_MAX_CM = 15.0;
const int   CONFIRM_NEEDED = 3;
const unsigned long PING_DELAY_MS = 80;

const unsigned long STEP_MS    = 20;
const unsigned long SETTLE_MS  = 500;
const unsigned long TIMEOUT_MS = 12000;

// ── JOINT ────────────────────────────────────────────────

struct Joint {
  Servo*  servo;
  int     pin;
  int     current;
  int     target;
  bool    attached;
  bool    moving;
  bool    holdAttached;
};

Joint jHand    = { &servo_hand,    PIN_HAND,    HAND_OPEN,   HAND_OPEN,   false, false, false };
Joint jWrist   = { &servo_wrist,   PIN_WRIST,   WRIST_SCAN,  WRIST_SCAN,  false, false, false };
Joint jForearm = { &servo_forearm, PIN_FOREARM, FOREARM_POS, FOREARM_POS, false, false, false };
Joint jElbow   = { &servo_elbow,   PIN_ELBOW,   SCAN_START,  SCAN_START,  false, false, false };

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

// ── SENSOR ───────────────────────────────────────────────

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

// ── FSM ──────────────────────────────────────────────────

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

// ── SETUP ────────────────────────────────────────────────

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

  Serial.println("=== Robotic Arm — Autonomous v3 ===");
  Serial.println("Sensor on hand — wrist horizontal for scan.");
  Serial.println("Scanning...");
  Serial.println();

  jointMoveTo(jElbow, SCAN_END);
  scanToEnd = true;
  enterState(STATE_SCAN);
}

// ── LOOP ─────────────────────────────────────────────────

void loop() {
  unsigned long now = millis();

  if (now - lastStepMs >= STEP_MS) {
    lastStepMs = now;
    tickAllJoints();
  }

  switch (state) {

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
            Serial.print("*** CONFIRMED at ");
            Serial.print(d);
            Serial.println(" cm ***");
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

    case STATE_LOWER_WRIST:
      jointMoveTo(jWrist, WRIST_DOWN);
      if (jointDone(jWrist)) {
        enterState(STATE_CLOSE_GRIP);
      }
      if (timedOut()) enterState(STATE_RESET);
      break;

    case STATE_CLOSE_GRIP:
      jointMoveTo(jHand, HAND_CLOSED);
      if (jointDone(jHand)) {
        jointHold(jHand);
        if (!settling) {
          settling = true;
          settleStart = now;
        } else if (now - settleStart >= SETTLE_MS) {
          Serial.println("  (grip holding — servo stays powered)");
          enterState(STATE_LIFT);
        }
      }
      if (timedOut()) enterState(STATE_RESET);
      break;

    case STATE_LIFT:
      jointMoveTo(jWrist, WRIST_UP);
      if (jointDone(jWrist)) {
        enterState(STATE_TRANSFER);
      }
      if (timedOut()) enterState(STATE_RESET);
      break;

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

    case STATE_RESET:
      jointRelease(jHand);
      jointMoveTo(jWrist, WRIST_SCAN);
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
        servo_elbow.attach(PIN_ELBOW);
        servo_elbow.write(SCAN_START);
        delay(500);
        servo_hand.detach();
        servo_wrist.detach();
        servo_elbow.detach();

        jHand.current  = HAND_OPEN;    jHand.moving  = false; jHand.attached  = false; jHand.holdAttached = false;
        jWrist.current = WRIST_SCAN;   jWrist.moving = false; jWrist.attached = false;
        jElbow.current = SCAN_START;   jElbow.moving = false; jElbow.attached = false;

        confirmCount = 0;
        scanToEnd = true;
        jointMoveTo(jElbow, SCAN_END);
        enterState(STATE_SCAN);
      }
      break;
  }
}
