/*
 * ================================================================
 *  4-Axis Robotic Arm — Autonomous Ball Pickup (FSM v2)
 *  Board  : Arduino Uno
 *  Power  : 9V into Arduino barrel jack
 *           Sensor  → Arduino 5V pin
 *           Servos  → separate 6V supply (shared GND!)
 * ================================================================
 *
 *  SERVO PINS:
 *    Hand (gripper) → pin 7   ↔ servo_hand
 *    Wrist          → pin 3   ↔ servo_wrist   (NOT pin 9!)
 *    Forearm        → pin 11  ↔ servo_forearm
 *    Elbow          → pin 5   ↔ servo_elbow
 *
 *  SENSOR PINS (HC-SR04):
 *    VCC  → 5V
 *    TRIG → pin 2
 *    ECHO → pin 4   *** NOT pin 1 — pin 1 is UART TX ***
 *    GND  → GND
 *
 *  LED DEBUG (pin 13 — onboard):
 *    Blink count = state number:
 *      1=SELF_TEST  2=SCAN  3=CONFIRM  4=OPEN_GRIP
 *      5=LOWER_WRIST  6=CLOSE_GRIP  7=LIFT_WRIST
 *      8=TRANSFER  9=DROP  rapid=RESET
 *
 *  STARTUP SELF-TEST:
 *    On power-up, each servo moves back and forth once,
 *    one at a time. Watch the arm — if a joint doesn't
 *    move during its test, that servo/wire is the problem.
 *    Order: hand → wrist → forearm → elbow (2 sec each)
 * ================================================================
 */

#include <Servo.h>

// ══════════════════════════════════════════════════════════════
//  PINS
// ══════════════════════════════════════════════════════════════
#define PIN_HAND      7
#define PIN_WRIST     3
#define PIN_FOREARM   11
#define PIN_ELBOW     5

#define PIN_TRIG      2
#define PIN_ECHO      4    // *** MOVED FROM PIN 1 ***

#define PIN_LED       13

// ══════════════════════════════════════════════════════════════
//  SERVO OBJECTS
// ══════════════════════════════════════════════════════════════
Servo servo_hand;
Servo servo_wrist;
Servo servo_forearm;
Servo servo_elbow;

// ══════════════════════════════════════════════════════════════
//  TUNING — ADJUST THESE TO MATCH YOUR ARM
// ══════════════════════════════════════════════════════════════

// ── Gripper (hand) ────────────────────────────────────────
const int HAND_OPEN   = 0;
const int HAND_CLOSED = 90;

// ── Wrist angles ──────────────────────────────────────────
const int WRIST_UP    = 60;
const int WRIST_DOWN  = 150;
const int WRIST_DROP  = 120;

// ── Forearm (fixed position) ──────────────────────────────
const int FOREARM_POS = 45;

// ── Elbow angles ──────────────────────────────────────────
const int SCAN_START  = 0;
const int SCAN_END    = 135;
const int DROP_POS    = 180;

// ── Sensor ────────────────────────────────────────────────
const float DETECT_CM       = 15.0;
const int   CONFIRM_NEEDED  = 3;
const int   MEDIAN_SAMPLES  = 5;

// ── Motion speed ──────────────────────────────────────────
const unsigned long STEP_MS = 20;

// ── Pauses ────────────────────────────────────────────────
const unsigned long GRIP_SETTLE_MS  = 600;
const unsigned long STATE_TIMEOUT   = 6000;

// ══════════════════════════════════════════════════════════════
//  FSM STATES
// ══════════════════════════════════════════════════════════════
enum State {
  STATE_SELF_TEST,
  STATE_SCAN,
  STATE_CONFIRM,
  STATE_OPEN_GRIP,
  STATE_LOWER_WRIST,
  STATE_CLOSE_GRIP,
  STATE_LIFT_WRIST,
  STATE_TRANSFER,
  STATE_DROP,
  STATE_RESET
};

State currentState = STATE_SELF_TEST;

// ══════════════════════════════════════════════════════════════
//  SMOOTH SERVO DRIVER
// ══════════════════════════════════════════════════════════════

struct Joint {
  Servo*  servo;
  int     current;
  int     target;
  bool    moving;
  int     pin;
};

Joint hand    = { &servo_hand,    HAND_OPEN,  HAND_OPEN,  false, PIN_HAND };
Joint wrist   = { &servo_wrist,   WRIST_UP,   WRIST_UP,   false, PIN_WRIST };
Joint forearm = { &servo_forearm, FOREARM_POS, FOREARM_POS, false, PIN_FOREARM };
Joint elbow   = { &servo_elbow,  SCAN_START,  SCAN_START,  false, PIN_ELBOW };

unsigned long lastStepTime = 0;

void moveTo(Joint &j, int target) {
  j.target = constrain(target, 0, 180);
  if (j.target != j.current) {
    j.moving = true;
  }
}

bool stepJoint(Joint &j) {
  if (!j.moving) return true;

  if (j.current < j.target) {
    j.current++;
  } else if (j.current > j.target) {
    j.current--;
  }

  j.servo->write(j.current);

  if (j.current == j.target) {
    j.moving = false;
    return true;
  }
  return false;
}

bool arrived(Joint &j) {
  return !j.moving;
}

void stepAllJoints() {
  stepJoint(hand);
  stepJoint(wrist);
  stepJoint(forearm);
  stepJoint(elbow);
}

// ══════════════════════════════════════════════════════════════
//  ULTRASONIC SENSOR — median filtered
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
  float r[MEDIAN_SAMPLES];

  for (int i = 0; i < MEDIAN_SAMPLES; i++) {
    r[i] = singlePing();
    delayMicroseconds(250);
  }

  // Insertion sort for median
  for (int i = 1; i < MEDIAN_SAMPLES; i++) {
    float key = r[i];
    int j = i - 1;
    while (j >= 0 && r[j] > key) {
      r[j + 1] = r[j];
      j--;
    }
    r[j + 1] = key;
  }

  return r[MEDIAN_SAMPLES / 2];
}

bool objectDetected() {
  float d = getDistance();
  return (d > 0.5 && d < DETECT_CM);
}

// ══════════════════════════════════════════════════════════════
//  LED DEBUG — blinks = state number
// ══════════════════════════════════════════════════════════════
unsigned long lastBlink    = 0;
int           blinksDone   = 0;
bool          ledState     = false;

void updateLED() {
  unsigned long now = millis();
  int target = (int)currentState + 1;

  if (blinksDone < target) {
    if (!ledState && now - lastBlink >= 150) {
      digitalWrite(PIN_LED, HIGH);
      ledState = true;
      lastBlink = now;
    } else if (ledState && now - lastBlink >= 100) {
      digitalWrite(PIN_LED, LOW);
      ledState = false;
      lastBlink = now;
      blinksDone++;
    }
  } else {
    if (now - lastBlink >= 800) {
      blinksDone = 0;
    }
  }
}

// ══════════════════════════════════════════════════════════════
//  STATE MANAGEMENT
// ══════════════════════════════════════════════════════════════
unsigned long stateStart   = 0;
unsigned long pauseStart   = 0;
bool          pausing      = false;
int           confirmCount = 0;
int           testPhase    = 0;

void enterState(State s) {
  currentState = s;
  stateStart   = millis();
  pausing      = false;
  blinksDone   = 0;
}

bool stateTimedOut() {
  return (millis() - stateStart > STATE_TIMEOUT);
}

void startPause(unsigned long duration) {
  pausing    = true;
  pauseStart = millis();
}

bool checkPause(unsigned long duration) {
  return (millis() - pauseStart >= duration);
}

// ══════════════════════════════════════════════════════════════
//  SELF-TEST — cycles each servo on startup
// ══════════════════════════════════════════════════════════════

void runSelfTest() {
  switch (testPhase) {

    case 0:
      if (!pausing) {
        moveTo(hand, HAND_CLOSED);
        pausing = true;
      }
      if (arrived(hand) && !pausing) {
        testPhase = 1;
        pausing = false;
      }
      if (arrived(hand) && pausing) {
        moveTo(hand, HAND_OPEN);
        pausing = false;
      }
      break;

    case 1:
      if (!pausing) {
        moveTo(wrist, WRIST_DOWN);
        pausing = true;
      }
      if (arrived(wrist) && !pausing) {
        testPhase = 2;
        pausing = false;
      }
      if (arrived(wrist) && pausing) {
        moveTo(wrist, WRIST_UP);
        pausing = false;
      }
      break;

    case 2:
      if (!pausing) {
        moveTo(forearm, 90);
        pausing = true;
      }
      if (arrived(forearm) && !pausing) {
        testPhase = 3;
        pausing = false;
      }
      if (arrived(forearm) && pausing) {
        moveTo(forearm, FOREARM_POS);
        pausing = false;
      }
      break;

    case 3:
      if (!pausing) {
        moveTo(elbow, 90);
        pausing = true;
      }
      if (arrived(elbow) && !pausing) {
        testPhase = 4;
        pausing = false;
      }
      if (arrived(elbow) && pausing) {
        moveTo(elbow, SCAN_START);
        pausing = false;
      }
      break;

    case 4:
      enterState(STATE_SCAN);
      break;
  }
}

// ══════════════════════════════════════════════════════════════
//  SETUP
// ══════════════════════════════════════════════════════════════
void setup() {
  Serial.begin(9600);    // Serial works now that Echo is on pin 4

  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  pinMode(PIN_LED,  OUTPUT);

  servo_hand.attach(PIN_HAND);
  servo_wrist.attach(PIN_WRIST);
  servo_forearm.attach(PIN_FOREARM);
  servo_elbow.attach(PIN_ELBOW);

  servo_hand.write(HAND_OPEN);
  servo_wrist.write(WRIST_UP);
  servo_forearm.write(FOREARM_POS);
  servo_elbow.write(SCAN_START);

  Serial.println("=== Robotic Arm FSM v2 ===");
  Serial.println("Echo on pin 4, Serial active.");
  Serial.println("Running self-test...");

  delay(1000);

  stateStart = millis();
}

// ══════════════════════════════════════════════════════════════
//  MAIN LOOP
// ══════════════════════════════════════════════════════════════
void loop() {
  unsigned long now = millis();

  updateLED();

  // ── Step servos at fixed rate ────────────────────────────
  if (now - lastStepTime >= STEP_MS) {
    lastStepTime = now;
    stepAllJoints();
  }

  // ── FSM ──────────────────────────────────────────────────
  switch (currentState) {

    case STATE_SELF_TEST:
      runSelfTest();
      break;

    case STATE_SCAN:
      if (arrived(elbow)) {
        if (elbow.current <= SCAN_START) {
          moveTo(elbow, SCAN_END);
        } else {
          moveTo(elbow, SCAN_START);
        }
      }

      if (objectDetected()) {
        confirmCount = 1;
        Serial.println("Object seen — confirming...");
        enterState(STATE_CONFIRM);
      }
      break;

    case STATE_CONFIRM:
      if (objectDetected()) {
        confirmCount++;
        if (confirmCount >= CONFIRM_NEEDED) {
          moveTo(elbow, elbow.current);
          Serial.println("Confirmed! Starting pickup.");
          enterState(STATE_OPEN_GRIP);
        }
      } else {
        confirmCount = 0;
        Serial.println("False alarm — back to scan.");
        enterState(STATE_SCAN);
      }

      if (stateTimedOut()) enterState(STATE_SCAN);
      break;

    case STATE_OPEN_GRIP:
      moveTo(hand, HAND_OPEN);

      if (arrived(hand)) {
        if (!pausing) {
          startPause(GRIP_SETTLE_MS);
        } else if (checkPause(GRIP_SETTLE_MS)) {
          Serial.println("Gripper open — lowering wrist.");
          enterState(STATE_LOWER_WRIST);
        }
      }

      if (stateTimedOut()) enterState(STATE_RESET);
      break;

    case STATE_LOWER_WRIST:
      moveTo(wrist, WRIST_DOWN);

      if (arrived(wrist)) {
        Serial.println("Wrist down — closing gripper.");
        enterState(STATE_CLOSE_GRIP);
      }

      if (stateTimedOut()) enterState(STATE_RESET);
      break;

    case STATE_CLOSE_GRIP:
      moveTo(hand, HAND_CLOSED);

      if (arrived(hand)) {
        if (!pausing) {
          startPause(GRIP_SETTLE_MS);
        } else if (checkPause(GRIP_SETTLE_MS)) {
          Serial.println("Gripped — lifting.");
          enterState(STATE_LIFT_WRIST);
        }
      }

      if (stateTimedOut()) enterState(STATE_RESET);
      break;

    case STATE_LIFT_WRIST:
      moveTo(wrist, WRIST_UP);

      if (arrived(wrist)) {
        Serial.println("Lifted — transferring.");
        enterState(STATE_TRANSFER);
      }

      if (stateTimedOut()) enterState(STATE_RESET);
      break;

    case STATE_TRANSFER:
      moveTo(elbow, DROP_POS);

      if (arrived(elbow)) {
        moveTo(wrist, WRIST_DROP);
      }

      if (arrived(elbow) && arrived(wrist)) {
        Serial.println("In position — dropping.");
        enterState(STATE_DROP);
      }

      if (stateTimedOut()) enterState(STATE_RESET);
      break;

    case STATE_DROP:
      moveTo(hand, HAND_OPEN);

      if (arrived(hand)) {
        if (!pausing) {
          startPause(GRIP_SETTLE_MS);
        } else if (checkPause(GRIP_SETTLE_MS)) {
          Serial.println("Dropped! Resetting.");
          enterState(STATE_RESET);
        }
      }

      if (stateTimedOut()) enterState(STATE_RESET);
      break;

    case STATE_RESET:
      moveTo(wrist, WRIST_UP);

      if (arrived(wrist)) {
        moveTo(elbow, SCAN_START);
      }

      if (arrived(wrist) && arrived(elbow)) {
        moveTo(hand, HAND_OPEN);
      }

      if (arrived(wrist) && arrived(elbow) && arrived(hand)) {
        confirmCount = 0;
        Serial.println("Reset complete — scanning.");
        enterState(STATE_SCAN);
      }

      if (stateTimedOut()) {
        hand.current    = HAND_OPEN;
        wrist.current   = WRIST_UP;
        elbow.current   = SCAN_START;
        servo_hand.write(HAND_OPEN);
        servo_wrist.write(WRIST_UP);
        servo_elbow.write(SCAN_START);
        confirmCount = 0;
        Serial.println("Reset timeout — forcing scan.");
        enterState(STATE_SCAN);
      }
      break;
  }
}