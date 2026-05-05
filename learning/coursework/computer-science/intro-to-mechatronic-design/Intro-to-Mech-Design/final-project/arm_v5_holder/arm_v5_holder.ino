// =====================================================================
// Robotic Arm V5 -- dispenser -> color sensor -> 4-slot holder
// Servo naming and pin layout match working_arm_code_partial_integration.
//
// Flow:
//   1. Pick from DISPENSER (fixed pose).
//   2. Carry to COLOR-SENSOR pose, release, photoresistor reads color.
//   3. Re-grab ball, lift.
//   4. Place into HOLDER slot for that color.
//   5. Copper-mesh contact (analog read) confirms ball seated.
//   6. Repeat until all 4 slots confirmed full.
//
// No HC-SR04. Ball detection = color sensor only.
//
// Hardware (V5 pin map):
//   Servos       hand=D11, wrist=D5, forearm=D6, shoulder=D10
//   RGB LEDs     R=D7, G=D8, B=D9
//   74HC595      LATCH=D2, DATA=D3, CLK=D4
//   Photores.    A3
//   Copper mesh  slot0=A0, slot1=A1, slot2=A2, slot3=A4 (analog, pulled up)
//
//   D1 (TX) MUST NOT be used for servos -- the hardware UART and the
//   Servo timer both drive D1 simultaneously, which corrupts the PPM
//   signal for every servo on Timer1. Hand moved to D11.
//
// Architecture: fully blocking. Serial 115200.
// =====================================================================

#include <Servo.h>

// ===================== SERVOS =====================
Servo hand, wrist, forearm, shoulder;

const int HAND_PIN     = 11;    // claw  (NOT D1=TX -- that kills all servos)
const int WRIST_PIN    = 5;     // joint nearest the claw
const int FOREARM_PIN  = 6;     // mid joint
const int SHOULDER_PIN = 10;    // base rotation

// ===================== COLOR SENSOR =====================
const int PIN_LED_R = 7;
const int PIN_LED_G = 8;
const int PIN_LED_B = 9;
const int PIN_PHOTO = A3;

// 74HC595 7-seg display
const int SR_LATCH = 2;   // freed from old TRIG
const int SR_DATA  = 3;   // freed from old ECHO
const int SR_CLK   = 4;

// ===================== HOLDER COPPER MESH =====================
// Each slot has two copper pads. Ball sits on them and bridges the gap.
// One pad to GND, one pad to the named analog pin (with internal pullup).
//   open contact -> reads ~1023
//   closed       -> reads near 0
const int MESH_PIN[4] = { A0, A1, A2, A4 };
//   slot 0 = Yellow, slot 1 = Green, slot 2 = Red, slot 3 = Blue
const int MESH_THRESHOLD = 300;   // below = closed = ball seated

// ===================== CLAW =====================
const int CLAW_OPEN   = 170;
const int CLAW_CLOSED = 115;

// ===================== POSE TABLE =====================
// All numbers are PLACEHOLDERS -- jog the arm to each station and
// record the actual servo positions, then drop them in here.
//
// Pose = { shoulder, forearm, wrist }. hand is set separately.

// Carry / travel pose (lifted, clear of obstacles)
const int CARRY_FOREARM = 170;
const int CARRY_WRIST   = 170;

// Idle / parked pose between cycles
const int IDLE_FOREARM  = 80;
const int IDLE_WRIST    = 55;

// Dispenser station (where balls feed in, one at a time)
const int DISP_SHOULDER = 20;
const int DISP_FOREARM  = 45;
const int DISP_WRIST    = 98;

// Color sensor station (ball rests on photoresistor pad while reading)
const int SENSE_SHOULDER = 70;
const int SENSE_FOREARM  = 45;
const int SENSE_WRIST    = 98;

// Holder slot shoulder angles (per color/slot). forearm/wrist shared.
const int HOLDER_SHOULDER[4] = { 110, 130, 150, 170 };
const int HOLDER_FOREARM     = 45;
const int HOLDER_WRIST       = 98;

// Reject zone for duplicate or unreadable balls
const int REJECT_SHOULDER = 0;
const int REJECT_FOREARM  = 60;
const int REJECT_WRIST    = 80;

// ===================== TIMING =====================
const int SERVO_SPEED_MS    = 15;
const int POSE_SETTLE_MS    = 150;
const int GRIP_HOLD_MS      = 300;
const int DROP_HOLD_MS      = 500;
const int SENSE_SETTLE_MS   = 250;
const int CONFIRM_DEBOUNCE  = 30;

// ===================== COLOR MATCH =====================
const int NUM_COLORS = 5;
String colorName[NUM_COLORS] = { "Yellow", "Green", "Red", "Blue", "No Ball" };
int  saved[NUM_COLORS][3];
bool calibrated = false;

const int REQUIRED_STABLE    = 3;
const int MAX_COLOR_ATTEMPTS = 10;
const int MAX_EMPTY_CYCLES   = 5;

int detectedColor = -1;
int emptyStreak   = 0;

// ===================== HOLDER STATE =====================
bool slotFilled[4] = { false, false, false, false };
int  filledCount   = 0;

// ===================== FSM =====================
enum State {
  STATE_INIT,
  STATE_GO_DISPENSER,
  STATE_GRAB_DISPENSER,
  STATE_LIFT_DISPENSER,
  STATE_GO_SENSOR,
  STATE_RELEASE_AT_SENSOR,
  STATE_READ_COLOR,
  STATE_REGRAB_SENSOR,
  STATE_LIFT_SENSOR,
  STATE_GO_HOLDER,
  STATE_RELEASE_HOLDER,
  STATE_CONFIRM_HOLDER,
  STATE_LIFT_HOLDER,
  STATE_GO_REJECT,
  STATE_RELEASE_REJECT,
  STATE_CHECK_DONE,
  STATE_DONE
};

State currentState = STATE_INIT;

int posShoulder = 0;
int posForearm  = 0;
int posWrist    = 0;
int posHand     = CLAW_OPEN;

// ===================== SERVO HELPERS =====================

void moveServoSmooth(Servo &s, int &currentPos, int target) {
  if (currentPos == target) return;
  int step = (target > currentPos) ? 1 : -1;
  while (currentPos != target) {
    currentPos += step;
    s.write(currentPos);
    delay(SERVO_SPEED_MS);
  }
}

// Move forearm + wrist together (both arm joints) to target.
void moveArm(int tForearm, int tWrist) {
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

// Lift to carry, rotate shoulder, then lower into final pose.
// Avoids dragging the claw through the table during long sweeps.
void gotoStation(int shoulderAngle, int forearmAngle, int wristAngle) {
  moveArm(CARRY_FOREARM, CARRY_WRIST);
  moveServoSmooth(shoulder, posShoulder, shoulderAngle);
  moveArm(forearmAngle, wristAngle);
}

void openHand()  { moveServoSmooth(hand, posHand, CLAW_OPEN);   }
void closeHand() { moveServoSmooth(hand, posHand, CLAW_CLOSED); }

// ===================== COLOR SENSOR =====================

void ledsOff() {
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
  ledsOff();
  digitalWrite(ledPin, HIGH);
  delay(300);
  int value = avgRead();
  ledsOff();
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
  return x * x + y * y + z * z;
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
    Serial.print(colorName[i]);
    Serial.print(": ");
    Serial.print(saved[i][0]); Serial.print(", ");
    Serial.print(saved[i][1]); Serial.print(", ");
    Serial.println(saved[i][2]);
  }
}

void calibrate() {
  Serial.println("CALIBRATION START");
  calibrated = false;
  for (int i = 0; i < NUM_COLORS; i++) {
    Serial.print("Place ");
    Serial.print(colorName[i]);
    Serial.println(i == 4 ? " state (sensor empty)" : " ball at sensor");
    waitEnter();
    int temp[3];
    getColor(temp);
    saved[i][0] = temp[0];
    saved[i][1] = temp[1];
    saved[i][2] = temp[2];
    Serial.print(colorName[i]); Serial.println(" saved");
  }
  Serial.println("CALIBRATION DONE");
  printColors();
  Serial.println("Press Enter to begin sorting...");
  waitEnter();
  calibrated = true;
}

int readStableColor() {
  int last = -1, count = 0;
  for (int attempt = 0; attempt < MAX_COLOR_ATTEMPTS; attempt++) {
    int now[3];
    getColor(now);
    int match = bestMatch(now);

    Serial.print("  try "); Serial.print(attempt + 1);
    Serial.print(" -> "); Serial.print(colorName[match]);
    Serial.print(" [G,R,B]=");
    Serial.print(now[0]); Serial.print(",");
    Serial.print(now[1]); Serial.print(",");
    Serial.println(now[2]);

    if (match == last) count++; else count = 0;
    last = match;
    if (count >= REQUIRED_STABLE) return match;
    delay(50);
  }
  return 4;   // unstable -> No Ball
}

// ===================== COPPER MESH CONFIRM =====================

bool slotOccupied(int slot) {
  // Average a few reads. Internal pullup pulls high; ball-bridged pads
  // pull line low. Below threshold = closed = seated.
  long total = 0;
  const int N = 5;
  for (int i = 0; i < N; i++) {
    total += analogRead(MESH_PIN[slot]);
    delay(CONFIRM_DEBOUNCE / N);
  }
  int avg = total / N;
  return avg < MESH_THRESHOLD;
}

// ===================== SETUP =====================

void setup() {
  Serial.begin(115200);

  // Color sensor LEDs + display
  pinMode(PIN_LED_R, OUTPUT);
  pinMode(PIN_LED_G, OUTPUT);
  pinMode(PIN_LED_B, OUTPUT);
  pinMode(SR_DATA,  OUTPUT);
  pinMode(SR_CLK,   OUTPUT);
  pinMode(SR_LATCH, OUTPUT);
  ledsOff();
  clearDisplay();

  // Copper mesh inputs (analog pins, internal pullups enabled)
  for (int i = 0; i < 4; i++) pinMode(MESH_PIN[i], INPUT_PULLUP);

  // Servos
  hand.attach(HAND_PIN);
  wrist.attach(WRIST_PIN);
  forearm.attach(FOREARM_PIN);
  shoulder.attach(SHOULDER_PIN);

  // Start at 90 (midpoint) for joints that might hit a physical hard stop
  // at 0 degrees. Do NOT start shoulder/forearm at 0 -- they will stall
  // and overheat immediately. Tune these to wherever the arm sits naturally.
  hand.write(CLAW_OPEN);     posHand     = CLAW_OPEN;
  shoulder.write(90);        posShoulder = 90;
  forearm.write(90);         posForearm  = 90;
  wrist.write(90);           posWrist    = 90;
  delay(1000);

  moveArm(IDLE_FOREARM, IDLE_WRIST);

  Serial.println("Robot V5 ready.");
  Serial.println("Type any character + Enter to begin color calibration.");
  while (!Serial.available()) {}
  while (Serial.available()) Serial.read();
  calibrate();

  // Pre-mark any holder slot already occupied
  for (int i = 0; i < 4; i++) {
    if (slotOccupied(i)) {
      slotFilled[i] = true;
      filledCount++;
      Serial.print("Slot "); Serial.print(i);
      Serial.print(" ("); Serial.print(colorName[i]);
      Serial.println(") pre-seated.");
    }
  }

  Serial.print("Starting with "); Serial.print(filledCount);
  Serial.println("/4 slots filled.");
  currentState = (filledCount >= 4) ? STATE_DONE : STATE_GO_DISPENSER;
}

// ===================== FSM =====================

void loop() {
  switch (currentState) {

    case STATE_INIT: {
      currentState = STATE_GO_DISPENSER;
      break;
    }

    case STATE_GO_DISPENSER: {
      Serial.println("[GO_DISPENSER]");
      openHand();
      gotoStation(DISP_SHOULDER, DISP_FOREARM, DISP_WRIST);
      currentState = STATE_GRAB_DISPENSER;
      break;
    }

    case STATE_GRAB_DISPENSER: {
      Serial.println("[GRAB_DISPENSER]");
      closeHand();
      delay(GRIP_HOLD_MS);
      currentState = STATE_LIFT_DISPENSER;
      break;
    }

    case STATE_LIFT_DISPENSER: {
      Serial.println("[LIFT_DISPENSER]");
      moveArm(CARRY_FOREARM, CARRY_WRIST);
      currentState = STATE_GO_SENSOR;
      break;
    }

    case STATE_GO_SENSOR: {
      Serial.println("[GO_SENSOR]");
      gotoStation(SENSE_SHOULDER, SENSE_FOREARM, SENSE_WRIST);
      currentState = STATE_RELEASE_AT_SENSOR;
      break;
    }

    case STATE_RELEASE_AT_SENSOR: {
      Serial.println("[RELEASE_AT_SENSOR]");
      openHand();
      // back claw off so it does not block LED light onto the ball
      moveArm(SENSE_FOREARM + 10, SENSE_WRIST - 10);
      delay(SENSE_SETTLE_MS);
      currentState = STATE_READ_COLOR;
      break;
    }

    case STATE_READ_COLOR: {
      Serial.println("[READ_COLOR]");
      detectedColor = readStableColor();
      Serial.print("Detected: "); Serial.println(colorName[detectedColor]);
      showColorLetter(detectedColor);

      if (detectedColor == 4) {
        emptyStreak++;
        Serial.print("Empty streak = "); Serial.println(emptyStreak);
        if (emptyStreak >= MAX_EMPTY_CYCLES) {
          Serial.println("Dispenser appears empty. Halting.");
          currentState = STATE_DONE;
        } else {
          currentState = STATE_GO_DISPENSER;
        }
        break;
      }
      emptyStreak = 0;
      currentState = STATE_REGRAB_SENSOR;
      break;
    }

    case STATE_REGRAB_SENSOR: {
      Serial.println("[REGRAB_SENSOR]");
      moveArm(SENSE_FOREARM, SENSE_WRIST);
      closeHand();
      delay(GRIP_HOLD_MS);
      currentState = STATE_LIFT_SENSOR;
      break;
    }

    case STATE_LIFT_SENSOR: {
      Serial.println("[LIFT_SENSOR]");
      moveArm(CARRY_FOREARM, CARRY_WRIST);
      if (slotFilled[detectedColor]) {
        Serial.print("Slot for "); Serial.print(colorName[detectedColor]);
        Serial.println(" already filled -- rejecting.");
        currentState = STATE_GO_REJECT;
      } else {
        currentState = STATE_GO_HOLDER;
      }
      break;
    }

    case STATE_GO_HOLDER: {
      Serial.print("[GO_HOLDER] slot "); Serial.println(detectedColor);
      gotoStation(HOLDER_SHOULDER[detectedColor], HOLDER_FOREARM, HOLDER_WRIST);
      currentState = STATE_RELEASE_HOLDER;
      break;
    }

    case STATE_RELEASE_HOLDER: {
      Serial.println("[RELEASE_HOLDER]");
      openHand();
      delay(DROP_HOLD_MS);
      currentState = STATE_CONFIRM_HOLDER;
      break;
    }

    case STATE_CONFIRM_HOLDER: {
      Serial.println("[CONFIRM_HOLDER]");
      bool seated = slotOccupied(detectedColor);
      int raw = analogRead(MESH_PIN[detectedColor]);
      Serial.print("  mesh raw = "); Serial.print(raw);
      Serial.print("  threshold = "); Serial.println(MESH_THRESHOLD);
      if (seated) {
        slotFilled[detectedColor] = true;
        Serial.print("Confirmed: "); Serial.print(colorName[detectedColor]);
        Serial.println(" seated.");
      } else {
        Serial.println("Mesh not closed. Ball missed slot -- will retry.");
      }
      currentState = STATE_LIFT_HOLDER;
      break;
    }

    case STATE_LIFT_HOLDER: {
      Serial.println("[LIFT_HOLDER]");
      moveArm(CARRY_FOREARM, CARRY_WRIST);
      currentState = STATE_CHECK_DONE;
      break;
    }

    case STATE_GO_REJECT: {
      Serial.println("[GO_REJECT]");
      gotoStation(REJECT_SHOULDER, REJECT_FOREARM, REJECT_WRIST);
      currentState = STATE_RELEASE_REJECT;
      break;
    }

    case STATE_RELEASE_REJECT: {
      Serial.println("[RELEASE_REJECT]");
      openHand();
      delay(DROP_HOLD_MS);
      moveArm(CARRY_FOREARM, CARRY_WRIST);
      currentState = STATE_CHECK_DONE;
      break;
    }

    case STATE_CHECK_DONE: {
      // Refresh the truth table from the meshes (a ball might have
      // settled, or one previously seated might have been dislodged).
      filledCount = 0;
      for (int i = 0; i < 4; i++) {
        slotFilled[i] = slotOccupied(i);
        if (slotFilled[i]) filledCount++;
      }
      Serial.print("Holder: ");
      for (int i = 0; i < 4; i++) Serial.print(slotFilled[i] ? "X" : ".");
      Serial.print("  ("); Serial.print(filledCount); Serial.println("/4)");

      currentState = (filledCount >= 4) ? STATE_DONE : STATE_GO_DISPENSER;
      break;
    }

    case STATE_DONE: {
      Serial.println("[DONE] All 4 slots confirmed full. Parking arm.");
      moveArm(CARRY_FOREARM, CARRY_WRIST);
      moveServoSmooth(shoulder, posShoulder, 0);
      moveArm(IDLE_FOREARM, IDLE_WRIST);
      openHand();
      while (true) { delay(1000); }
      break;
    }
  }
}
