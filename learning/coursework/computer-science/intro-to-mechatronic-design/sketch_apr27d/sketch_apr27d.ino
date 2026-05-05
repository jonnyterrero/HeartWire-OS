// =====================================================================
// Robotic Arm V4 -- color-sorted pick & place (no ultrasonic)
//
// Joint naming (proximal -> distal):
//   elbow    horizontal swing (was "shoulder")
//   forearm  vertical lift   (was "upperArm")
//   wrist    vertical reach  (was "forearm")
//   hand     gripper open/close (was "wrist"/"claw")
//
// Cycle:
//   1. HOME           park
//   2. DISPENSER      hand lowers into dispenser, closes on ball
//   3. COLOR STATION  arm carries ball to fixed color-sense pad
//                     hand opens -> ball rests on photoresistor pad
//                     RGB LED + photoresistor read with stability check
//   4. RE-PICK        hand closes on the same ball at the color pad
//   5. HOLDER         arm carries ball to color-specific slot (4 slots)
//                     hand opens, ball drops into slot
//   6. CONFIRM        contact switch in the slot closes when ball seated
//                     digitalRead pulls LOW -> slot marked filled
//   7. Loop steps 1-6 until all 4 slots confirmed -> halt at HOME.
//
// Hardware (V4 pin map):
//   Servos      : hand=D4, wrist=D7, forearm=D10, elbow=D12
//   RGB LEDs    : R=D5, G=D8, B=D6
//   74HC595 disp: DATA=D9, CLK=D11, LATCH=D13
//   Photores.   : A3
//   Holder sw.  : Yellow=D2, Green=D3, Red=A0, Blue=A1  (INPUT_PULLUP)
// =====================================================================

#include <Servo.h>

// ============== SERVOS ==============
Servo hand, wrist, forearm, elbow;

const int HAND_PIN    = 1;
const int WRIST_PIN   = 5;
const int FOREARM_PIN = 6;
const int ELBOW_PIN   = 12;

// ============== COLOR SENSOR ==============
const int PIN_LED_R = 5;
const int PIN_LED_G = 8;
const int PIN_LED_B = 6;
const int PIN_PHOTO = A3;

// 74HC595 driven 7-segment status display
const int SR_DATA  = 9;
const int SR_CLK   = 11;
const int SR_LATCH = 13;

// ============== HOLDER CONFIRM SWITCHES ==============
// One per color slot. INPUT_PULLUP: ball seated -> circuit closes to GND -> reads LOW.
// Index = color id (0=Yellow, 1=Green, 2=Red, 3=Blue)
const int HOLDER_SW[4] = { 2, 3, A0, A1 };

// ============== HAND (GRIPPER) ==============
const int HAND_OPEN   = 170;
const int HAND_CLOSED = 115;

// ============== STATIONS (CALIBRATE PHYSICALLY) ==============
//
// Each station has:
//   elbow   = horizontal swing angle
//   forearm = vertical lift at that station
//   wrist   = vertical reach at that station
// Transit between stations always lifts to CARRY pose first.

// HOME / CARRY (transit pose, arm raised)
const int HOME_ELBOW    = 0;
const int CARRY_FOREARM = 170;
const int CARRY_WRIST   = 170;

// Dispenser station
const int DISP_ELBOW   = 30;
const int DISP_FOREARM = 45;
const int DISP_WRIST   = 98;

// Color sensor pad station
const int COLOR_ELBOW   = 70;
const int COLOR_FOREARM = 50;
const int COLOR_WRIST   = 95;

// Holder slot stations -- one row of {elbow, forearm, wrist} per color
//   0 Yellow, 1 Green, 2 Red, 3 Blue
const int HOLDER_ELBOW[4]   = { 110, 130, 150, 175 };
const int HOLDER_FOREARM[4] = {  55,  55,  55,  55 };
const int HOLDER_WRIST[4]   = {  95,  95,  95,  95 };

// ============== TIMING ==============
const int SERVO_SPEED_MS    = 15;
const int POSE_SETTLE_MS    = 150;
const int GRIP_HOLD_MS      = 300;
const int RELEASE_HOLD_MS   = 400;
const int CONFIRM_SETTLE_MS = 250;

// ============== COLOR MATCH ==============
const int NUM_COLORS = 5;
String names[NUM_COLORS] = { "Yellow", "Green", "Red", "Blue", "No Ball" };
int  saved[NUM_COLORS][3];
bool calibrated = false;

const int REQUIRED_STABLE    = 3;
const int MAX_COLOR_ATTEMPTS = 12;

int lastMatch     = -1;
int matchCount    = 0;
int detectedColor = -1;

// ============== HOLDER STATE ==============
bool slotConfirmed[4] = { false, false, false, false };
int  emptyCycles      = 0;
const int MAX_EMPTY_CYCLES = 5;   // bail out if dispenser keeps coming back empty

// ============== FSM ==============
enum State {
  STATE_HOME,
  STATE_GO_DISP,
  STATE_PICK_DISP,
  STATE_GO_COLOR,
  STATE_PLACE_COLOR,
  STATE_READ_COLOR,
  STATE_PICK_COLOR,
  STATE_GO_HOLDER,
  STATE_PLACE_HOLDER,
  STATE_CONFIRM_HOLDER,
  STATE_RETURN_DISP,
  STATE_DONE
};

State currentState = STATE_HOME;

int posElbow   = 0;
int posForearm = 0;
int posWrist   = 0;
int posHand    = HAND_OPEN;

// ===================== SERVO MOTION =====================

void moveServoSmooth(Servo &s, int &currentPos, int target) {
  int step = (target > currentPos) ? 1 : -1;
  while (currentPos != target) {
    currentPos += step;
    s.write(currentPos);
    delay(SERVO_SPEED_MS);
  }
}

void moveToPose(int tForearm, int tWrist) {
  bool moving = true;
  while (moving) {
    moving = false;
    if (posForearm != tForearm) {
      posForearm += (tForearm > posForearm) ? 1 : -1;
      forearm.write(posForearm);
      moving = true;
    }
    if (posWrist != tWrist) {
      posWrist += (tWrist > posWrist) ? 1 : -1;
      wrist.write(posWrist);
      moving = true;
    }
    if (moving) delay(SERVO_SPEED_MS);
  }
  delay(POSE_SETTLE_MS);
}

// Lift -> rotate elbow -> lower into station pose
void approachStation(int eAngle, int forearmEngage, int wristEngage) {
  moveToPose(CARRY_FOREARM, CARRY_WRIST);
  moveServoSmooth(elbow, posElbow, eAngle);
  moveToPose(forearmEngage, wristEngage);
}

void openHand() {
  moveServoSmooth(hand, posHand, HAND_OPEN);
  delay(RELEASE_HOLD_MS);
}

void closeHand() {
  moveServoSmooth(hand, posHand, HAND_CLOSED);
  delay(GRIP_HOLD_MS);
}

// ===================== COLOR SENSOR =====================

void off() {
  digitalWrite(PIN_LED_G, LOW);
  digitalWrite(PIN_LED_R, LOW);
  digitalWrite(PIN_LED_B, LOW);
}

void sendToDisplay(byte pattern) {
  digitalWrite(SR_LATCH, LOW);
  shiftOut(SR_DATA, SR_CLK, LSBFIRST, pattern);
  digitalWrite(SR_LATCH, HIGH);
}

void clearDisplay() { sendToDisplay(0); }

void showColorLetter(int colorIndex) {
  byte pattern = 0;
  if (colorIndex == 0) pattern = (1 << 2) | (1 << 1) | (1 << 6) | (1 << 5) | (1 << 4);
  if (colorIndex == 1) pattern = (1 << 2) | (1 << 7) | (1 << 1) | (1 << 6) | (1 << 5) | (1 << 4);
  if (colorIndex == 2) pattern = (1 << 3) | (1 << 1);
  if (colorIndex == 3) pattern = (1 << 2) | (1 << 1) | (1 << 5) | (1 << 3) | (1 << 4);
  if (colorIndex == 4) pattern = (1 << 7) | (1 << 1) | (1 << 4);
  sendToDisplay(pattern);
}

int avgRead() {
  long total = 0;
  for (int i = 0; i < 10; i++) {
    total += analogRead(PIN_PHOTO);
    delay(5);
  }
  return total / 10;
}

int readOne(int ledPin) {
  off();
  digitalWrite(ledPin, HIGH);
  delay(300);
  int value = avgRead();
  off();
  delay(100);
  return value;
}

void getColor(int x[3]) {
  x[0] = readOne(PIN_LED_G);
  x[1] = readOne(PIN_LED_R);
  x[2] = readOne(PIN_LED_B);
}

void waitEnter() {
  Serial.println("Press Enter");
  while (!Serial.available()) {}
  while (Serial.available()) Serial.read();
}

long colorDist(int a[3], int b[3]) {
  long x = a[0] - b[0];
  long y = a[1] - b[1];
  long z = a[2] - b[2];
  return x * x + y * y + z * z;     // squared Euclidean -- monotonic, no sqrt
}

int bestMatch(int x[3]) {
  int  best  = 0;
  long bestD = colorDist(x, saved[0]);
  for (int i = 1; i < NUM_COLORS; i++) {
    long d = colorDist(x, saved[i]);
    if (d < bestD) { bestD = d; best = i; }
  }
  return best;
}

void printColors() {
  for (int i = 0; i < NUM_COLORS; i++) {
    Serial.print(names[i]);
    Serial.print(": ");
    Serial.print(saved[i][0]);
    Serial.print(", ");
    Serial.print(saved[i][1]);
    Serial.print(", ");
    Serial.println(saved[i][2]);
  }
}

void calibrate() {
  Serial.println("CALIBRATION START");
  Serial.println("Place each ball directly on the color sensor pad when prompted.");
  calibrated = false;
  for (int i = 0; i < NUM_COLORS; i++) {
    Serial.print("Place ");
    Serial.print(names[i]);
    Serial.println(i == 4 ? " state (empty pad)" : " ball");
    waitEnter();
    int temp[3];
    getColor(temp);
    saved[i][0] = temp[0];
    saved[i][1] = temp[1];
    saved[i][2] = temp[2];
    Serial.print(names[i]);
    Serial.println(" saved");
  }
  Serial.println("CALIBRATION DONE");
  printColors();
  Serial.println("Press Enter to begin sorting...");
  waitEnter();
  calibrated = true;
}

// Run color-stability loop. Sets detectedColor to 0..3 on success, 4 on fallback.
void readColorStable() {
  lastMatch     = -1;
  matchCount    = 0;
  detectedColor = -1;

  int attempt = 0;
  while (attempt < MAX_COLOR_ATTEMPTS) {
    int now[3];
    getColor(now);
    int match = bestMatch(now);

    Serial.print("  try "); Serial.print(attempt + 1);
    Serial.print(" -> "); Serial.print(names[match]);
    Serial.print(" [G,R,B]=");
    Serial.print(now[0]); Serial.print(",");
    Serial.print(now[1]); Serial.print(",");
    Serial.println(now[2]);

    if (match == lastMatch) { matchCount++; } else { matchCount = 0; }
    lastMatch = match;

    if (matchCount >= REQUIRED_STABLE) {
      detectedColor = match;
      break;
    }
    attempt++;
    delay(50);
  }

  if (detectedColor < 0) {
    Serial.println("  unstable -> No Ball");
    detectedColor = 4;
  }
  showColorLetter(detectedColor);
}

// ===================== HOLDER CONFIRM =====================

bool isSlotFilled(int slotIdx) {
  // INPUT_PULLUP, ball completes circuit to GND -> LOW
  return digitalRead(HOLDER_SW[slotIdx]) == LOW;
}

bool allSlotsConfirmed() {
  for (int i = 0; i < 4; i++) if (!slotConfirmed[i]) return false;
  return true;
}

void printSlotStatus() {
  Serial.print("Slots [Y G R B] = ");
  for (int i = 0; i < 4; i++) {
    Serial.print(slotConfirmed[i] ? "1" : "0");
    Serial.print(" ");
  }
  Serial.println();
}

// ===================== SETUP =====================

void setup() {
  Serial.begin(115200);

  // Color sensor pins
  pinMode(PIN_LED_R, OUTPUT);
  pinMode(PIN_LED_G, OUTPUT);
  pinMode(PIN_LED_B, OUTPUT);
  pinMode(SR_DATA,   OUTPUT);
  pinMode(SR_CLK,    OUTPUT);
  pinMode(SR_LATCH,  OUTPUT);
  off();
  clearDisplay();

  // Holder switches
  for (int i = 0; i < 4; i++) pinMode(HOLDER_SW[i], INPUT_PULLUP);

  // Servos
  hand.attach(HAND_PIN);
  wrist.attach(WRIST_PIN);
  forearm.attach(FOREARM_PIN);
  elbow.attach(ELBOW_PIN);

  hand.write(HAND_OPEN);     posHand    = HAND_OPEN;
  elbow.write(HOME_ELBOW);   posElbow   = HOME_ELBOW;
  forearm.write(0);          posForearm = 0;
  wrist.write(0);            posWrist   = 0;
  delay(1000);

  // Park at carry
  moveToPose(CARRY_FOREARM, CARRY_WRIST);

  // Pre-mark any slot whose switch already reads filled at boot
  Serial.println("Robot V4 (color sort) ready.");
  for (int i = 0; i < 4; i++) {
    if (isSlotFilled(i)) {
      slotConfirmed[i] = true;
      Serial.print("Slot pre-filled: ");
      Serial.println(names[i]);
    }
  }
  printSlotStatus();

  Serial.println("Type any character then Enter to begin color calibration.");
  while (!Serial.available()) {}
  while (Serial.available()) Serial.read();
  calibrate();

  Serial.println("Sorting cycle starting.");
  currentState = STATE_HOME;
}

// ===================== FSM =====================

void loop() {
  switch (currentState) {

    case STATE_HOME: {
      if (allSlotsConfirmed()) {
        currentState = STATE_DONE;
        return;
      }
      moveToPose(CARRY_FOREARM, CARRY_WRIST);
      moveServoSmooth(elbow, posElbow, HOME_ELBOW);
      currentState = STATE_GO_DISP;
      break;
    }

    case STATE_GO_DISP: {
      Serial.println("-> dispenser");
      moveServoSmooth(hand, posHand, HAND_OPEN);
      approachStation(DISP_ELBOW, DISP_FOREARM, DISP_WRIST);
      currentState = STATE_PICK_DISP;
      break;
    }

    case STATE_PICK_DISP: {
      closeHand();
      currentState = STATE_GO_COLOR;
      break;
    }

    case STATE_GO_COLOR: {
      Serial.println("-> color station");
      approachStation(COLOR_ELBOW, COLOR_FOREARM, COLOR_WRIST);
      currentState = STATE_PLACE_COLOR;
      break;
    }

    case STATE_PLACE_COLOR: {
      openHand();
      // Slight retract so hand doesn't shadow the LED path during read
      moveToPose(CARRY_FOREARM, CARRY_WRIST);
      currentState = STATE_READ_COLOR;
      break;
    }

    case STATE_READ_COLOR: {
      Serial.println("Color sense...");
      readColorStable();
      Serial.print("Detected: ");
      Serial.println(names[detectedColor]);

      if (detectedColor == 4) {
        emptyCycles++;
        if (emptyCycles >= MAX_EMPTY_CYCLES) {
          Serial.println("Too many empty cycles. Halting.");
          currentState = STATE_DONE;
          return;
        }
        currentState = STATE_HOME;
        return;
      }
      emptyCycles = 0;
      currentState = STATE_PICK_COLOR;
      break;
    }

    case STATE_PICK_COLOR: {
      approachStation(COLOR_ELBOW, COLOR_FOREARM, COLOR_WRIST);
      closeHand();
      currentState = STATE_GO_HOLDER;
      break;
    }

    case STATE_GO_HOLDER: {
      int c = detectedColor;
      if (slotConfirmed[c]) {
        Serial.print("Slot already filled for ");
        Serial.print(names[c]);
        Serial.println(" -- returning ball to dispenser.");
        currentState = STATE_RETURN_DISP;
        return;
      }
      Serial.print("-> holder slot ");
      Serial.println(names[c]);
      approachStation(HOLDER_ELBOW[c], HOLDER_FOREARM[c], HOLDER_WRIST[c]);
      currentState = STATE_PLACE_HOLDER;
      break;
    }

    case STATE_PLACE_HOLDER: {
      openHand();
      moveToPose(CARRY_FOREARM, CARRY_WRIST);
      currentState = STATE_CONFIRM_HOLDER;
      break;
    }

    case STATE_CONFIRM_HOLDER: {
      delay(CONFIRM_SETTLE_MS);
      int c = detectedColor;
      bool seated = isSlotFilled(c);
      if (seated) {
        slotConfirmed[c] = true;
        Serial.print("Confirmed: ");
        Serial.print(names[c]);
        Serial.println(" seated.");
      } else {
        Serial.print("WARNING: ");
        Serial.print(names[c]);
        Serial.println(" placement NOT confirmed by switch.");
      }
      printSlotStatus();
      currentState = STATE_HOME;
      break;
    }

    case STATE_RETURN_DISP: {
      Serial.println("-> dispenser (reject)");
      approachStation(DISP_ELBOW, DISP_FOREARM, DISP_WRIST);
      openHand();
      moveToPose(CARRY_FOREARM, CARRY_WRIST);
      currentState = STATE_HOME;
      break;
    }

    case STATE_DONE: {
      Serial.println("All slots filled. Cycle complete.");
      moveToPose(CARRY_FOREARM, CARRY_WRIST);
      moveServoSmooth(elbow, posElbow, HOME_ELBOW);
      moveServoSmooth(hand, posHand, HAND_OPEN);
      while (true) { delay(1000); }
    }
  }
}