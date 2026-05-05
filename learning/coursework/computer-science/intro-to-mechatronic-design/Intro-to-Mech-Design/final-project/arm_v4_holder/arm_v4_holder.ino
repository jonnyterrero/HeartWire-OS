// =====================================================================
// Robotic Arm V4 -- dispenser -> color sensor -> 4-slot holder
//
// Flow:
//   1. Pick ball from fixed DISPENSER pose.
//   2. Carry to fixed COLOR-SENSOR pose, release, photoresistor reads color.
//   3. Re-grab ball from sensor pose.
//   4. Place into HOLDER slot for that color.
//   5. Closed-circuit switch in slot confirms ball seated.
//   6. Repeat until all 4 holder slots filled.
//
// No HC-SR04. All target angles are fixed servo positions.
//
// Hardware (V4 pin map):
//   Servos       wrist=D4, forearm=D7, upperArm=D10, shoulder=D12
//   RGB LEDs     R=D5, G=D8, B=D6
//   74HC595      DATA=D9, CLK=D11, LATCH=D13
//   Photores.    A3
//   Slot switch  slot0=D2, slot1=D3, slot2=A0, slot3=A1   (INPUT_PULLUP, LOW = ball seated)
//
// Architecture: fully blocking. Serial 115200.
// =====================================================================

#include <Servo.h>

// ===================== SERVOS =====================
Servo wrist, forearm, upperArm, shoulder;

const int WRIST_PIN     = 4;
const int FOREARM_PIN   = 7;
const int UPPER_ARM_PIN = 10;
const int SHOULDER_PIN  = 12;

// ===================== COLOR SENSOR =====================
const int PIN_LED_R = 5;
const int PIN_LED_G = 8;
const int PIN_LED_B = 6;
const int PIN_PHOTO = A3;

// 74HC595 7-seg
const int SR_DATA  = 9;
const int SR_CLK   = 11;
const int SR_LATCH = 13;

// ===================== HOLDER CONFIRM SWITCHES =====================
// One contact pad per slot. Ball seated -> contact closes pin to GND.
const int SLOT_PIN[4] = { 2, 3, A0, A1 };
//   slot 0 = Yellow, slot 1 = Green, slot 2 = Red, slot 3 = Blue

// ===================== CLAW =====================
const int CLAW_OPEN   = 170;
const int CLAW_CLOSED = 115;

// ===================== POSE TABLE =====================
// All angles are PLACEHOLDERS -- calibrate against the physical rig.
// Each pose is { shoulder, upperArm, forearm }.

// Carry / travel pose -- arm lifted, free of obstacles.
const int CARRY_UPPER_ARM = 170;
const int CARRY_FOREARM   = 170;

// Idle / parked pose between cycles.
const int IDLE_UPPER_ARM  = 80;
const int IDLE_FOREARM    = 55;

// Dispenser station (where balls feed in).
const int DISP_SHOULDER   = 20;
const int DISP_UPPER_ARM  = 45;
const int DISP_FOREARM    = 98;

// Color sensor station (ball rests here while photoresistor reads).
const int SENSE_SHOULDER  = 70;
const int SENSE_UPPER_ARM = 45;
const int SENSE_FOREARM   = 98;
// Wrist is parked back during read so LEDs are not occluded.
const int SENSE_WRIST_RETRACT = CLAW_OPEN;   // claw open, parked

// Holder slot shoulder angles (per color). upperArm/forearm shared.
//   index = color = slot
const int HOLDER_SHOULDER[4] = { 110, 130, 150, 170 };
const int HOLDER_UPPER_ARM   = 45;
const int HOLDER_FOREARM     = 98;

// Reject zone for duplicate / unreadable balls.
const int REJECT_SHOULDER  = 0;
const int REJECT_UPPER_ARM = 60;
const int REJECT_FOREARM   = 80;

// ===================== TIMING =====================
const int SERVO_SPEED_MS = 15;
const int POSE_SETTLE_MS = 150;
const int GRIP_HOLD_MS   = 300;
const int DROP_HOLD_MS   = 500;
const int SENSE_SETTLE_MS = 250;   // wait after release before reading
const int CONFIRM_DEBOUNCE_MS = 30;

// ===================== COLOR MATCH =====================
const int NUM_COLORS = 5;
String colorName[NUM_COLORS] = {"Yellow", "Green", "Red", "Blue", "No Ball"};
int  saved[NUM_COLORS][3];
bool calibrated = false;

const int REQUIRED_STABLE    = 3;
const int MAX_COLOR_ATTEMPTS = 10;
const int MAX_EMPTY_CYCLES   = 5;   // bail out if dispenser keeps yielding No Ball

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
int posUpperArm = 0;
int posForearm  = 0;
int posClaw     = CLAW_OPEN;

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

void moveArm(int tUpperArm, int tForearm) {
  bool moving = true;
  while (moving) {
    moving = false;
    if (posUpperArm != tUpperArm) {
      posUpperArm += (tUpperArm > posUpperArm) ? 1 : -1;
      upperArm.write(posUpperArm);
      moving = true;
    }
    if (posForearm != tForearm) {
      posForearm += (tForearm > posForearm) ? 1 : -1;
      forearm.write(posForearm);
      moving = true;
    }
    if (moving) delay(SERVO_SPEED_MS);
  }
  delay(POSE_SETTLE_MS);
}

// Move shoulder + arm into a 3-axis pose. Lifts to carry first to avoid
// dragging the wrist through the table during long shoulder sweeps.
void gotoPoseSafe(int shoulderAngle, int upperArmAngle, int forearmAngle) {
  moveArm(CARRY_UPPER_ARM, CARRY_FOREARM);
  moveServoSmooth(shoulder, posShoulder, shoulderAngle);
  moveArm(upperArmAngle, forearmAngle);
}

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
    Serial.print("Place "); Serial.print(colorName[i]);
    Serial.println(i == 4 ? " state (empty sensor)" : " ball at sensor");
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

// Loop getColor + bestMatch until REQUIRED_STABLE consecutive matches or attempts exhausted.
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
  return 4;   // unstable -> treat as No Ball
}

// ===================== HOLDER SWITCH =====================

bool slotOccupied(int slot) {
  // Debounced read. INPUT_PULLUP -> LOW = closed = ball seated.
  int closedReads = 0;
  for (int i = 0; i < 5; i++) {
    if (digitalRead(SLOT_PIN[slot]) == LOW) closedReads++;
    delay(CONFIRM_DEBOUNCE_MS / 5);
  }
  return closedReads >= 3;
}

// ===================== CLAW HELPERS =====================

void openClaw()  { moveServoSmooth(wrist, posClaw, CLAW_OPEN);   }
void closeClaw() { moveServoSmooth(wrist, posClaw, CLAW_CLOSED); }

// ===================== SETUP =====================

void setup() {
  Serial.begin(115200);

  // Color sensor + display
  pinMode(PIN_LED_R, OUTPUT);
  pinMode(PIN_LED_G, OUTPUT);
  pinMode(PIN_LED_B, OUTPUT);
  pinMode(SR_DATA,  OUTPUT);
  pinMode(SR_CLK,   OUTPUT);
  pinMode(SR_LATCH, OUTPUT);
  ledsOff();
  clearDisplay();

  // Holder confirm switches
  for (int i = 0; i < 4; i++) pinMode(SLOT_PIN[i], INPUT_PULLUP);

  // Servos
  wrist.attach(WRIST_PIN);
  forearm.attach(FOREARM_PIN);
  upperArm.attach(UPPER_ARM_PIN);
  shoulder.attach(SHOULDER_PIN);

  wrist.write(CLAW_OPEN);     posClaw     = CLAW_OPEN;
  shoulder.write(0);          posShoulder = 0;
  upperArm.write(0);          posUpperArm = 0;
  forearm.write(0);           posForearm  = 0;
  delay(1000);

  moveArm(IDLE_UPPER_ARM, IDLE_FOREARM);

  Serial.println("Robot V4 ready.");
  Serial.println("Type any character + Enter to begin color calibration.");
  while (!Serial.available()) {}
  while (Serial.available()) Serial.read();
  calibrate();

  // Pre-mark any slot that already has a ball seated.
  for (int i = 0; i < 4; i++) {
    if (slotOccupied(i)) {
      slotFilled[i] = true;
      filledCount++;
      Serial.print("Slot "); Serial.print(i);
      Serial.print(" ("); Serial.print(colorName[i]);
      Serial.println(") pre-seated.");
    }
  }

  Serial.println("Beginning sort cycle.");
  currentState = STATE_GO_DISPENSER;
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
      openClaw();
      gotoPoseSafe(DISP_SHOULDER, DISP_UPPER_ARM, DISP_FOREARM);
      currentState = STATE_GRAB_DISPENSER;
      break;
    }

    case STATE_GRAB_DISPENSER: {
      Serial.println("[GRAB_DISPENSER]");
      closeClaw();
      delay(GRIP_HOLD_MS);
      currentState = STATE_LIFT_DISPENSER;
      break;
    }

    case STATE_LIFT_DISPENSER: {
      Serial.println("[LIFT_DISPENSER]");
      moveArm(CARRY_UPPER_ARM, CARRY_FOREARM);
      currentState = STATE_GO_SENSOR;
      break;
    }

    case STATE_GO_SENSOR: {
      Serial.println("[GO_SENSOR]");
      gotoPoseSafe(SENSE_SHOULDER, SENSE_UPPER_ARM, SENSE_FOREARM);
      currentState = STATE_RELEASE_AT_SENSOR;
      break;
    }

    case STATE_RELEASE_AT_SENSOR: {
      Serial.println("[RELEASE_AT_SENSOR]");
      openClaw();
      // back the arm up slightly so wrist does not block the LEDs
      moveArm(SENSE_UPPER_ARM + 10, SENSE_FOREARM - 10);
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
        // No ball under sensor. Skip regrab, abort cycle.
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
      moveArm(SENSE_UPPER_ARM, SENSE_FOREARM);
      closeClaw();
      delay(GRIP_HOLD_MS);
      currentState = STATE_LIFT_SENSOR;
      break;
    }

    case STATE_LIFT_SENSOR: {
      Serial.println("[LIFT_SENSOR]");
      moveArm(CARRY_UPPER_ARM, CARRY_FOREARM);
      // If this color's slot is already filled, send to reject zone.
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
      Serial.print("[GO_HOLDER] slot ");
      Serial.println(detectedColor);
      gotoPoseSafe(HOLDER_SHOULDER[detectedColor], HOLDER_UPPER_ARM, HOLDER_FOREARM);
      currentState = STATE_RELEASE_HOLDER;
      break;
    }

    case STATE_RELEASE_HOLDER: {
      Serial.println("[RELEASE_HOLDER]");
      openClaw();
      delay(DROP_HOLD_MS);
      currentState = STATE_CONFIRM_HOLDER;
      break;
    }

    case STATE_CONFIRM_HOLDER: {
      Serial.println("[CONFIRM_HOLDER]");
      bool seated = slotOccupied(detectedColor);
      if (seated) {
        slotFilled[detectedColor] = true;
        filledCount++;
        Serial.print("Confirmed: "); Serial.print(colorName[detectedColor]);
        Serial.print(" seated. Filled "); Serial.print(filledCount);
        Serial.println("/4.");
      } else {
        Serial.println("Switch did not close. Ball may have missed slot.");
        // Leave slotFilled as is; next cycle will retry this color.
      }
      currentState = STATE_LIFT_HOLDER;
      break;
    }

    case STATE_LIFT_HOLDER: {
      Serial.println("[LIFT_HOLDER]");
      moveArm(CARRY_UPPER_ARM, CARRY_FOREARM);
      currentState = STATE_CHECK_DONE;
      break;
    }

    case STATE_GO_REJECT: {
      Serial.println("[GO_REJECT]");
      gotoPoseSafe(REJECT_SHOULDER, REJECT_UPPER_ARM, REJECT_FOREARM);
      currentState = STATE_RELEASE_REJECT;
      break;
    }

    case STATE_RELEASE_REJECT: {
      Serial.println("[RELEASE_REJECT]");
      openClaw();
      delay(DROP_HOLD_MS);
      moveArm(CARRY_UPPER_ARM, CARRY_FOREARM);
      currentState = STATE_CHECK_DONE;
      break;
    }

    case STATE_CHECK_DONE: {
      // Re-poll all switches in case a ball settled or a previously-seated
      // ball got knocked out.
      filledCount = 0;
      for (int i = 0; i < 4; i++) {
        slotFilled[i] = slotOccupied(i);
        if (slotFilled[i]) filledCount++;
      }
      Serial.print("Holder status: ");
      for (int i = 0; i < 4; i++) {
        Serial.print(slotFilled[i] ? "X" : ".");
      }
      Serial.print("  ("); Serial.print(filledCount); Serial.println("/4)");

      if (filledCount >= 4) {
        currentState = STATE_DONE;
      } else {
        currentState = STATE_GO_DISPENSER;
      }
      break;
    }

    case STATE_DONE: {
      Serial.println("[DONE] All slots filled. Parking.");
      moveArm(CARRY_UPPER_ARM, CARRY_FOREARM);
      moveServoSmooth(shoulder, posShoulder, 0);
      moveArm(IDLE_UPPER_ARM, IDLE_FOREARM);
      openClaw();
      // Halt: spin here until reset.
      while (true) { delay(1000); }
      break;
    }
  }
}
