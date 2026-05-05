// Robotic Arm V5 -- dispenser -> color sensor -> 4-slot holder (no mesh verify)
//
// Servo pinout is selectable (must match how SIGNAL wires are wired):
//   SERVO_LAYOUT 1 = V5 default: hand=D1*, wrist=D5, forearm=D6, shoulder=D10 | RGB R,G,B = 7,8,9
//   SERVO_LAYOUT 2 = same servos as working_arm_code_final: hand=4, wrist=7, forearm=10, shoulder=12
//                    (R LED must use D11 — not D7 — because wrist is on 7; rewire red LED to D11)
// 74HC595: latch=2, data=3, clk=4  |  photo A3  |  *D1 is UART TX — minimal Serial during grip
//
// This sketch does NOT ultrasonic sweep — it moves shoulder between stored waypoints only.
// If upload fails (COM "not in sync"): close Serial Monitor, unplug/replug USB, retry port/tools.
//
// Pick ONE: 1 = V5 arm build (D1,5,6,10 + RGB 7,8,9)   2 = servos like working_arm_code_final (4,7,10,12) + move red LED to D11
#define SERVO_LAYOUT 1

#include <Servo.h>

// ===================== SERVOS + RGB (layout-dependent) =====================
Servo hand, wrist, forearm, shoulder;


const int HAND_PIN     = 1;
const int WRIST_PIN    = 5;
const int FOREARM_PIN  = 6;
const int SHOULDER_PIN = 10;
const int PIN_LED_R = 7;
const int PIN_LED_G = 8;
const int PIN_LED_B = 9;


const int SR_LATCH = 2;
const int SR_DATA  = 3;
const int SR_CLK   = 4;

const int CLAW_OPEN   = 170;
const int CLAW_CLOSED = 115;

// Poses: shoulder, forearm, wrist (hand set separately)
const int CARRY_FOREARM = 170;
const int CARRY_WRIST   = 170;

const int IDLE_FOREARM  = 80;
const int IDLE_WRIST    = 55;

const int DISP_SHOULDER = 20;
const int DISP_FOREARM  = 45;
const int DISP_WRIST    = 98;

const int SENSE_SHOULDER = 70;
const int SENSE_FOREARM  = 45;
const int SENSE_WRIST    = 98;

const int HOLDER_SHOULDER[4] = { 110, 130, 150, 170 };
const int HOLDER_FOREARM     = 45;
const int HOLDER_WRIST       = 98;

const int REJECT_SHOULDER = 0;
const int REJECT_FOREARM  = 60;
const int REJECT_WRIST    = 80;

// Retract claw for color read (same deltas as original)
const int SENSE_READ_FOREARM_DELTA = 10;
const int SENSE_READ_WRIST_DELTA  = 10;

const int SERVO_SPEED_MS    = 15;
const int POSE_SETTLE_MS    = 150;
const int GRIP_HOLD_MS      = 300;
const int DROP_HOLD_MS      = 500;
const int SENSE_SETTLE_MS   = 250;

const uint8_t NUM_COLORS = 5;
const uint8_t COLOR_NO_BALL = 4;
const uint8_t NUM_SLOTS   = 4;

int saved[NUM_COLORS][3];

const uint8_t REQUIRED_STABLE    = 3;
const uint8_t MAX_COLOR_ATTEMPTS = 10;
const uint8_t MAX_EMPTY_CYCLES   = 5;

int8_t  detectedColor = -1;
uint8_t emptyStreak   = 0;

bool slotFilled[NUM_SLOTS] = { false, false, false, false };

// STATE_DONE is reached from normal completion OR empty-dispenser halt; message must differ.
bool doneBecauseDispenserEmpty = false;

enum State : uint8_t {
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
  STATE_LIFT_HOLDER,
  STATE_GO_REJECT,
  STATE_RELEASE_REJECT,
  STATE_CHECK_DONE,
  STATE_DONE
};

State currentState = STATE_GO_DISPENSER;

int posShoulder = 0;
int posForearm  = 0;
int posWrist    = 0;
int posHand     = CLAW_OPEN;

// 7-seg segment patterns per color index (same bit combos as original)
const uint8_t SEG_PATTERN[NUM_COLORS] = {
  (uint8_t)((1 << 2) | (1 << 1) | (1 << 6) | (1 << 5) | (1 << 4)),
  (uint8_t)((1 << 2) | (1 << 7) | (1 << 1) | (1 << 6) | (1 << 5) | (1 << 4)),
  (uint8_t)((1 << 3) | (1 << 1)),
  (uint8_t)((1 << 2) | (1 << 1) | (1 << 5) | (1 << 3) | (1 << 4)),
  (uint8_t)((1 << 7) | (1 << 1) | (1 << 4)),
};

static uint8_t countFilledSlots() {
  uint8_t n = 0;
  for (uint8_t i = 0; i < NUM_SLOTS; ++i)
    if (slotFilled[i]) ++n;
  return n;
}

// AVR-safe color labels for Serial (F() keeps strings in flash; const char* tables often mis-print)
static const __FlashStringHelper* colorLabel(uint8_t i) {
  switch (i) {
    case 0: return F("Yellow");
    case 1: return F("Green");
    case 2: return F("Red");
    case 3: return F("Blue");
    default: return F("No Ball");
  }
}

// ----- servos -----
void moveServoSmooth(Servo &s, int &currentPos, int target) {
  if (currentPos == target) return;
  int step = (target > currentPos) ? 1 : -1;
  while (currentPos != target) {
    currentPos += step;
    s.write(currentPos);
    delay(SERVO_SPEED_MS);
  }
}

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

void gotoStation(int shoulderAngle, int forearmAngle, int wristAngle) {
  moveArm(CARRY_FOREARM, CARRY_WRIST);
  moveServoSmooth(shoulder, posShoulder, shoulderAngle);
  moveArm(forearmAngle, wristAngle);
}

void openHand()  { moveServoSmooth(hand, posHand, CLAW_OPEN);   }
void closeHand() { moveServoSmooth(hand, posHand, CLAW_CLOSED); }

void openHandAndDelay(int ms) {
  openHand();
  delay(ms);
}

// ----- color + display -----
void ledsOff() {
  digitalWrite(PIN_LED_G, LOW);
  digitalWrite(PIN_LED_R, LOW);
  digitalWrite(PIN_LED_B, LOW);
}

void sendToDisplay(uint8_t pattern) {
  digitalWrite(SR_LATCH, LOW);
  shiftOut(SR_DATA, SR_CLK, LSBFIRST, pattern);
  digitalWrite(SR_LATCH, HIGH);
}

void clearDisplay() { sendToDisplay(0); }

void showColorLetter(uint8_t colorIndex) {
  if (colorIndex < NUM_COLORS)
    sendToDisplay(SEG_PATTERN[colorIndex]);
}

int avgRead() {
  long total = 0;
  for (uint8_t i = 0; i < 10; i++) {
    
    delay(5);
  }
  return (int)(total / 10);
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
  const uint8_t order[3] = { PIN_LED_G, PIN_LED_R, PIN_LED_B };
  for (uint8_t i = 0; i < 3; ++i)
    x[i] = readOne(order[i]);
}

void waitEnter() {
  Serial.println(F("Press Enter"));
  while (!Serial.available()) {}
  while (Serial.available()) Serial.read();
}

static long colorDistSquared(const int a[3], const int b[3]) {
  long dx = (long)a[0] - b[0];
  long dy = (long)a[1] - b[1];
  long dz = (long)a[2] - b[2];
  return dx * dx + dy * dy + dz * dz;
}

uint8_t bestMatch(const int x[3]) {
  uint8_t best  = 0;
  long bestD = colorDistSquared(x, saved[0]);
  for (uint8_t i = 1; i < NUM_COLORS; i++) {
    long d = colorDistSquared(x, saved[i]);
    if (d < bestD) { bestD = d; best = i; }
  }
  return best;
}

void printColors() {
  for (uint8_t i = 0; i < NUM_COLORS; i++) {
    Serial.print(colorLabel(i));
    Serial.print(F(": "));
    Serial.print(saved[i][0]); Serial.print(F(", "));
    Serial.print(saved[i][1]); Serial.print(F(", "));
    Serial.println(saved[i][2]);
  }
}

void calibrate() {
  Serial.println(F("CALIBRATION START"));
  for (uint8_t i = 0; i < NUM_COLORS; i++) {
    Serial.print(F("Place "));
    Serial.print(colorLabel(i));
    Serial.println(i == COLOR_NO_BALL ? F(" state (sensor empty)") : F(" ball at sensor"));
    waitEnter();
    int temp[3];
    getColor(temp);
    saved[i][0] = temp[0];
    saved[i][1] = temp[1];
    saved[i][2] = temp[2];
    Serial.print(colorLabel(i));
    Serial.println(F(" saved"));
  }
  Serial.println(F("CALIBRATION DONE"));
  printColors();
  Serial.println(F("Press Enter to begin sorting..."));
  waitEnter();
}

uint8_t readStableColor() {
  int last = -1;
  uint8_t count = 0;
  for (uint8_t attempt = 0; attempt < MAX_COLOR_ATTEMPTS; attempt++) {
    int now[3];
    getColor(now);
    uint8_t match = bestMatch(now);

    Serial.print(F("  try ")); Serial.print(attempt + 1);
    Serial.print(F(" -> ")); Serial.print(colorLabel(match));
    Serial.print(F(" [G,R,B]="));
    Serial.print(now[0]); Serial.print(F(","));
    Serial.print(now[1]); Serial.print(F(","));
    Serial.println(now[2]);

    if (match == last) ++count;
    else count = 0;
    last = (int)match;
    if (count >= REQUIRED_STABLE) return match;
    delay(50);
  }
  return COLOR_NO_BALL;
}

void setup() {
  Serial.begin(115200);

  pinMode(PIN_LED_R, OUTPUT);
  pinMode(PIN_LED_G, OUTPUT);
  pinMode(PIN_LED_B, OUTPUT);
  pinMode(SR_DATA,  OUTPUT);
  pinMode(SR_CLK,   OUTPUT);
  pinMode(SR_LATCH, OUTPUT);
  ledsOff();
  clearDisplay();

  hand.attach(HAND_PIN);
  wrist.attach(WRIST_PIN);
  forearm.attach(FOREARM_PIN);
  shoulder.attach(SHOULDER_PIN);

  hand.write(CLAW_OPEN);     posHand     = CLAW_OPEN;
  shoulder.write(0);         posShoulder = 0;
  forearm.write(0);          posForearm  = 0;
  wrist.write(0);            posWrist    = 0;
  delay(1000);

  moveArm(IDLE_FOREARM, IDLE_WRIST);

  Serial.println(F("Robot V5 (arm-only, no mesh) ready."));
  Serial.println(F("Type any character + Enter to begin color calibration."));
  while (!Serial.available()) {}
  while (Serial.available()) Serial.read();
  calibrate();

  currentState = STATE_GO_DISPENSER;
}

void loop() {
  switch (currentState) {

    case STATE_GO_DISPENSER: {
      Serial.println(F("[GO_DISPENSER]"));
      openHand();
      gotoStation(DISP_SHOULDER, DISP_FOREARM, DISP_WRIST);
      currentState = STATE_GRAB_DISPENSER;
      break;
    }

    case STATE_GRAB_DISPENSER: {
      Serial.println(F("[GRAB_DISPENSER]"));
      closeHand();
      delay(GRIP_HOLD_MS);
      currentState = STATE_LIFT_DISPENSER;
      break;
    }

    case STATE_LIFT_DISPENSER: {
      Serial.println(F("[LIFT_DISPENSER]"));
      moveArm(CARRY_FOREARM, CARRY_WRIST);
      currentState = STATE_GO_SENSOR;
      break;
    }

    case STATE_GO_SENSOR: {
      Serial.println(F("[GO_SENSOR]"));
      gotoStation(SENSE_SHOULDER, SENSE_FOREARM, SENSE_WRIST);
      currentState = STATE_RELEASE_AT_SENSOR;
      break;
    }

    case STATE_RELEASE_AT_SENSOR: {
      Serial.println(F("[RELEASE_AT_SENSOR]"));
      openHand();
      moveArm(SENSE_FOREARM + SENSE_READ_FOREARM_DELTA, SENSE_WRIST - SENSE_READ_WRIST_DELTA);
      delay(SENSE_SETTLE_MS);
      currentState = STATE_READ_COLOR;
      break;
    }

    case STATE_READ_COLOR: {
      Serial.println(F("[READ_COLOR]"));
      detectedColor = (int8_t)readStableColor();
      Serial.print(F("Detected: "));
      Serial.println(colorLabel((uint8_t)detectedColor));
      showColorLetter((uint8_t)detectedColor);

      if (detectedColor == (int8_t)COLOR_NO_BALL) {
        ++emptyStreak;
        Serial.print(F("Empty streak = "));
        Serial.println(emptyStreak);
        if (emptyStreak >= MAX_EMPTY_CYCLES) {
          Serial.println(F("Dispenser appears empty. Halting."));
          doneBecauseDispenserEmpty = true;
          currentState = STATE_DONE;
        } else {
          currentState = STATE_GO_DISPENSER;
        }
      } else {
        emptyStreak = 0;
        currentState = STATE_REGRAB_SENSOR;
      }
      break;
    }

    case STATE_REGRAB_SENSOR: {
      Serial.println(F("[REGRAB_SENSOR]"));
      moveArm(SENSE_FOREARM, SENSE_WRIST);
      closeHand();
      delay(GRIP_HOLD_MS);
      currentState = STATE_LIFT_SENSOR;
      break;
    }

    case STATE_LIFT_SENSOR: {
      Serial.println(F("[LIFT_SENSOR]"));
      moveArm(CARRY_FOREARM, CARRY_WRIST);
      if (slotFilled[(uint8_t)detectedColor]) {
        Serial.print(F("Slot for "));
        Serial.print(colorLabel((uint8_t)detectedColor));
        Serial.println(F(" already filled -- rejecting."));
        currentState = STATE_GO_REJECT;
      } else {
        currentState = STATE_GO_HOLDER;
      }
      break;
    }

    case STATE_GO_HOLDER: {
      Serial.print(F("[GO_HOLDER] slot "));
      Serial.println((int)detectedColor);
      gotoStation(HOLDER_SHOULDER[(uint8_t)detectedColor], HOLDER_FOREARM, HOLDER_WRIST);
      currentState = STATE_RELEASE_HOLDER;
      break;
    }

    case STATE_RELEASE_HOLDER: {
      Serial.println(F("[RELEASE_HOLDER]"));
      openHandAndDelay(DROP_HOLD_MS);
      slotFilled[(uint8_t)detectedColor] = true;
      Serial.print(F("Marked seated (software): "));
      Serial.println(colorLabel((uint8_t)detectedColor));
      currentState = STATE_LIFT_HOLDER;
      break;
    }

    case STATE_LIFT_HOLDER: {
      Serial.println(F("[LIFT_HOLDER]"));
      moveArm(CARRY_FOREARM, CARRY_WRIST);
      currentState = STATE_CHECK_DONE;
      break;
    }

    case STATE_GO_REJECT: {
      Serial.println(F("[GO_REJECT]"));
      gotoStation(REJECT_SHOULDER, REJECT_FOREARM, REJECT_WRIST);
      currentState = STATE_RELEASE_REJECT;
      break;
    }

    case STATE_RELEASE_REJECT: {
      Serial.println(F("[RELEASE_REJECT]"));
      openHandAndDelay(DROP_HOLD_MS);
      moveArm(CARRY_FOREARM, CARRY_WRIST);
      currentState = STATE_CHECK_DONE;
      break;
    }

    case STATE_CHECK_DONE: {
      uint8_t n = countFilledSlots();
      Serial.print(F("Holder: "));
      for (uint8_t i = 0; i < NUM_SLOTS; i++)
        Serial.print(slotFilled[i] ? 'X' : '.');
      Serial.print(F("  ("));
      Serial.print(n);
      Serial.println(F("/4)"));

      currentState = (n >= NUM_SLOTS) ? STATE_DONE : STATE_GO_DISPENSER;
      if (currentState == STATE_DONE)
        doneBecauseDispenserEmpty = false;
      break;
    }

    case STATE_DONE: {
      if (doneBecauseDispenserEmpty)
        Serial.println(F("[DONE] Halt: empty dispenser (no-ball streak). Parking arm."));
      else
        Serial.println(F("[DONE] All 4 slots full. Parking arm."));
      moveArm(CARRY_FOREARM, CARRY_WRIST);
      moveServoSmooth(shoulder, posShoulder, 0);
      moveArm(IDLE_FOREARM, IDLE_WRIST);
      openHand();
      while (true) { delay(1000); }
      break;
    }

    default: {
      Serial.print(F("[FSM] bad st="));
      Serial.println((int)currentState);
      currentState = STATE_GO_DISPENSER;
      break;
    }
  }
}
