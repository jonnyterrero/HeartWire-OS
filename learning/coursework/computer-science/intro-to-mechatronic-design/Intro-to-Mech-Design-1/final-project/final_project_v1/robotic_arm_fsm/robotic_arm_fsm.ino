/*
 * =======================================================================
 * Autonomous 4-Axis Robotic Arm — Finite State Machine (Arduino Uno)
 * =======================================================================
 *  Features
 *  --------
 *   - 4 servo joints: Hand / Wrist / Forearm / Elbow
 *   - HC-SR04 ultrasonic range sensor with median + exponential filter
 *   - External LED command input (digital signal from LED driver/sequencer)
 *   - 4-digit 7-segment display driven by a 74HC595 shift register
 *     (displays current FSM state code + distance in cm, multiplexed)
 *   - Non-blocking control loop using millis()
 *   - Incremental servo stepping for smooth motion
 *   - Safety override: STOP_HAND state when something is too close
 *   - GRAB retry if the ball slips during LIFT
 *
 *  Wiring summary (Arduino Uno)
 *  ----------------------------
 *   Servos (signal pins; power from EXTERNAL 5–6 V supply, share GND):
 *     HAND     -> D7
 *     WRIST    -> D3
 *     FOREARM  -> D11
 *     ELBOW    -> D5
 *
 *   HC-SR04 ultrasonic:
 *     TRIG -> D2
 *     ECHO -> D4   (use a voltage divider on ECHO if the module is 5 V only)
 *
 *   External LED command input (e.g. tap off the LED the external sequencer
 *   drives; HIGH means "run pickup sequence"):
 *     LED_CMD -> D6   (INPUT_PULLUP friendly; HIGH = command active)
 *
 *   74HC595 -> 4-digit 7-segment (common cathode assumed; digit selects
 *   drive the common cathodes LOW through NPN transistors or directly):
 *     SER   (DS, pin 14) -> D12
 *     RCLK  (ST_CP, 12)  -> D8
 *     SRCLK (SH_CP, 11)  -> D13
 *     /OE   (13)         -> GND
 *     /SRCLR(10)         -> 5V
 *     Q0..Q7 -> segments a,b,c,d,e,f,g,dp (through 220–330 Ω resistors)
 *     Digit common cathodes -> D-A0, D-A1, D-A2, D-A3 (active LOW)
 *
 *   Power:
 *     Servos on a dedicated 5–6 V / 2 A+ supply.
 *     Tie servo supply GND to Arduino GND.
 *     100 µF electrolytic across servo Vcc/GND near the servos.
 * =======================================================================
 */

#include <Servo.h>

// ---------------- Pins ----------------
#define PIN_HAND       7
#define PIN_WRIST      3
#define PIN_FOREARM   11
#define PIN_ELBOW      5

#define PIN_TRIG       2
#define PIN_ECHO       4

#define PIN_LED_CMD    6     // external LED / command input (HIGH = go)

// 74HC595 + 4-digit 7-seg
#define PIN_595_DATA  12
#define PIN_595_LATCH  8
#define PIN_595_CLOCK 13
#define PIN_DIGIT_1   A0
#define PIN_DIGIT_2   A1
#define PIN_DIGIT_3   A2
#define PIN_DIGIT_4   A3

// ---------------- Servos ----------------
Servo sHand, sWrist, sForearm, sElbow;

// ---------------- Calibrated Angles ----------------
const int HAND_OPEN     = 0;
const int HAND_CLOSED   = 90;
const int WRIST_UP      = 150;
const int WRIST_DOWN    = 60;
const int WRIST_DROP    = 90;
const int FOREARM_POS   = 45;
const int FOREARM_GRAB  = 105;
const int SCAN_MIN      = 20;
const int SCAN_MAX      = 130;
const int DROP_POS      = 170;

// ---------------- Detection thresholds ----------------
const float HAND_STOP_CM  = 8.0;
const float OBJECT_MIN_CM = 8.0;
const float OBJECT_MAX_CM = 15.0;

// ---------------- FSM ----------------
enum State {
  IDLE,
  SCAN,
  APPROACH,
  GRAB,
  LIFT,
  MOVE_TO_DROP,
  RELEASE,
  RETURN_HOME,
  STOP_HAND
};
State state = SCAN;

const char* stateName(State s) {
  switch (s) {
    case IDLE:         return "IDLE";
    case SCAN:         return "SCAN";
    case APPROACH:     return "APPR";
    case GRAB:         return "GRAB";
    case LIFT:         return "LIFT";
    case MOVE_TO_DROP: return "MOVE";
    case RELEASE:      return "RELS";
    case RETURN_HOME:  return "HOME";
    case STOP_HAND:    return "STOP";
  }
  return "????";
}

// ---------------- Current positions ----------------
int  handPos    = HAND_OPEN;
int  wristPos   = WRIST_UP;
int  forearmPos = FOREARM_POS;
int  elbowPos   = SCAN_MIN;
bool scanToMax  = true;

// ---------------- Timing ----------------
unsigned long lastStepMs        = 0;
const unsigned long STEP_MS     = 15;     // servo step cadence
unsigned long lastSensorMs      = 0;
const unsigned long SENSOR_MS   = 40;     // sensor poll cadence
unsigned long lastDisplayMs     = 0;
const unsigned long DISPLAY_MS  = 3;      // per-digit multiplex cadence (~250 Hz refresh)
unsigned long lastCmdPollMs     = 0;
const unsigned long CMD_MS      = 20;     // LED input debounce poll

// ---------------- LED command debounce ----------------
bool     cmdActive       = false;   // debounced logical state
bool     cmdRaw          = false;
uint8_t  cmdStable       = 0;
const uint8_t CMD_STABLE_N = 3;     // consecutive reads needed

// ---------------- Grab retry ----------------
uint8_t grabRetries = 0;
const uint8_t MAX_GRAB_RETRIES = 2;

// ---------------- Distance filter (median-of-5 + EMA) ----------------
float distBuf[5] = {100, 100, 100, 100, 100};
uint8_t distIdx = 0;
float filteredCm = 100.0;

// =======================================================================
// Sensor
// =======================================================================
float pingOnceCm() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);

  unsigned long duration = pulseIn(PIN_ECHO, HIGH, 12000UL); // ~2 m max
  if (duration == 0) return 400.0;   // timeout -> far
  float cm = duration * 0.0343f / 2.0f;
  if (cm < 2.0f || cm > 300.0f) cm = filteredCm;
  return cm;
}

float readDistanceCm() {
  // Push newest raw reading into ring buffer, take median of 5, then EMA.
  distBuf[distIdx] = pingOnceCm();
  distIdx = (distIdx + 1) % 5;

  // copy & sort 5 values
  float tmp[5];
  for (uint8_t i = 0; i < 5; i++) tmp[i] = distBuf[i];
  for (uint8_t i = 0; i < 4; i++) {
    for (uint8_t j = i + 1; j < 5; j++) {
      if (tmp[j] < tmp[i]) { float t = tmp[i]; tmp[i] = tmp[j]; tmp[j] = t; }
    }
  }
  float med = tmp[2];
  filteredCm = 0.4f * med + 0.6f * filteredCm;
  return filteredCm;
}

// =======================================================================
// LED command input (debounced)
// =======================================================================
void pollCommand() {
  // HIGH = pickup requested. Works with an external driver; if you tie a
  // pushbutton with pullup instead, invert the read.
  bool raw = (digitalRead(PIN_LED_CMD) == HIGH);
  if (raw == cmdRaw) {
    if (cmdStable < 255) cmdStable++;
  } else {
    cmdRaw = raw;
    cmdStable = 0;
  }
  if (cmdStable >= CMD_STABLE_N) cmdActive = cmdRaw;
}

// =======================================================================
// Motion helpers
// =======================================================================
void moveSmooth(Servo &servo, int &current, int target, int stepSize = 1) {
  if (current < target) {
    current += stepSize; if (current > target) current = target;
  } else if (current > target) {
    current -= stepSize; if (current < target) current = target;
  }
  servo.write(current);
}

bool nearTarget(int current, int target, int tol = 2) {
  return abs(current - target) <= tol;
}

// =======================================================================
// 4-digit 7-segment via 74HC595 (common cathode, active-LOW digit select)
// Segment map:  bit 0=a 1=b 2=c 3=d 4=e 5=f 6=g 7=dp
// =======================================================================
const uint8_t SEG_DIGITS[10] = {
  0b00111111, // 0
  0b00000110, // 1
  0b01011011, // 2
  0b01001111, // 3
  0b01100110, // 4
  0b01101101, // 5
  0b01111101, // 6
  0b00000111, // 7
  0b01111111, // 8
  0b01101111  // 9
};
// Letters we need for state codes
const uint8_t SEG_BLANK = 0b00000000;
const uint8_t SEG_DASH  = 0b01000000;
const uint8_t SEG_S = 0b01101101; // same as 5
const uint8_t SEG_C = 0b00111001;
const uint8_t SEG_A = 0b01110111;
const uint8_t SEG_N = 0b01010100;
const uint8_t SEG_P = 0b01110011;
const uint8_t SEG_R = 0b01010000;
const uint8_t SEG_H = 0b01110110;
const uint8_t SEG_O = 0b00111111; // 0
const uint8_t SEG_E = 0b01111001;
const uint8_t SEG_L = 0b00111000;
const uint8_t SEG_I = 0b00110000;
const uint8_t SEG_F = 0b01110001;
const uint8_t SEG_t = 0b01111000;
const uint8_t SEG_d = 0b01011110;
const uint8_t SEG_M = 0b01010101; // approximation
const uint8_t SEG_G = 0b00111101;
const uint8_t SEG_b = 0b01111100;

// Frame buffer: 4 characters, left->right
uint8_t frame[4] = {SEG_BLANK, SEG_BLANK, SEG_BLANK, SEG_BLANK};
uint8_t curDigit = 0;
const uint8_t digitPins[4] = {PIN_DIGIT_1, PIN_DIGIT_2, PIN_DIGIT_3, PIN_DIGIT_4};

void pushSegments(uint8_t segByte) {
  digitalWrite(PIN_595_LATCH, LOW);
  shiftOut(PIN_595_DATA, PIN_595_CLOCK, MSBFIRST, segByte);
  digitalWrite(PIN_595_LATCH, HIGH);
}

void multiplexDisplay() {
  // turn all digits off first
  for (uint8_t i = 0; i < 4; i++) digitalWrite(digitPins[i], HIGH);
  // shift out current digit's segments
  pushSegments(frame[curDigit]);
  // enable current digit (active LOW common cathode through transistor)
  digitalWrite(digitPins[curDigit], LOW);
  curDigit = (curDigit + 1) % 4;
}

// Show 4-letter state code on left or distance on right.
// Layout: [S][T][A][T] for IDLE/SCAN/..., then every ~1 s swap to distance.
uint8_t letterToSeg(char c) {
  switch (c) {
    case 'S': return SEG_S;
    case 'C': return SEG_C;
    case 'A': return SEG_A;
    case 'N': return SEG_N;
    case 'P': return SEG_P;
    case 'R': return SEG_R;
    case 'H': return SEG_H;
    case 'O': return SEG_O;
    case 'E': return SEG_E;
    case 'L': return SEG_L;
    case 'I': return SEG_I;
    case 'F': return SEG_F;
    case 'T': return SEG_t;
    case 'D': return SEG_d;
    case 'M': return SEG_M;
    case 'G': return SEG_G;
    case 'B': return SEG_b;
    case '-': return SEG_DASH;
    case ' ': return SEG_BLANK;
    default:
      if (c >= '0' && c <= '9') return SEG_DIGITS[c - '0'];
      return SEG_BLANK;
  }
}

void setFrameFromText(const char* txt) {
  for (uint8_t i = 0; i < 4; i++) {
    char c = txt[i];
    if (c == '\0') { for (uint8_t j = i; j < 4; j++) frame[j] = SEG_BLANK; return; }
    frame[i] = letterToSeg(c);
  }
}

void setFrameFromDistance(int cm) {
  if (cm < 0) cm = 0;
  if (cm > 999) cm = 999;
  // right-aligned "_NNN"
  frame[0] = SEG_BLANK;
  frame[1] = SEG_DIGITS[(cm / 100) % 10];
  frame[2] = SEG_DIGITS[(cm / 10)  % 10];
  frame[3] = SEG_DIGITS[ cm        % 10];
}

unsigned long lastSwapMs = 0;
bool showDist = false;

void updateFrame() {
  if (millis() - lastSwapMs > 1000) {
    lastSwapMs = millis();
    showDist = !showDist;
  }
  if (showDist) {
    setFrameFromDistance((int)filteredCm);
  } else {
    setFrameFromText(stateName(state));
  }
}

// =======================================================================
// setup / loop
// =======================================================================
void setup() {
  Serial.begin(115200);

  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  pinMode(PIN_LED_CMD, INPUT);

  pinMode(PIN_595_DATA,  OUTPUT);
  pinMode(PIN_595_LATCH, OUTPUT);
  pinMode(PIN_595_CLOCK, OUTPUT);
  for (uint8_t i = 0; i < 4; i++) {
    pinMode(digitPins[i], OUTPUT);
    digitalWrite(digitPins[i], HIGH); // off
  }
  pushSegments(0x00);

  sHand.attach(PIN_HAND);
  sWrist.attach(PIN_WRIST);
  sForearm.attach(PIN_FOREARM);
  sElbow.attach(PIN_ELBOW);

  sHand.write(handPos);
  sWrist.write(wristPos);
  sForearm.write(forearmPos);
  sElbow.write(elbowPos);

  state = IDLE;
}

void loop() {
  unsigned long now = millis();

  // ---- 1. Display multiplexing (highest cadence, non-blocking) ----
  if (now - lastDisplayMs >= DISPLAY_MS) {
    lastDisplayMs = now;
    multiplexDisplay();
  }

  // ---- 2. Sensor poll (filtered distance) ----
  if (now - lastSensorMs >= SENSOR_MS) {
    lastSensorMs = now;
    readDistanceCm();
  }

  // ---- 3. Command poll ----
  if (now - lastCmdPollMs >= CMD_MS) {
    lastCmdPollMs = now;
    pollCommand();
  }

  // ---- 4. Frame update ----
  updateFrame();

  // ---- 5. Safety override ----
  // Only trigger STOP_HAND on sustained close reading (avoid false positives
  // from the object we just grabbed). Skip while already holding the ball.
  if (filteredCm < HAND_STOP_CM &&
      state != STOP_HAND &&
      state != GRAB && state != LIFT &&
      state != MOVE_TO_DROP && state != RELEASE) {
    state = STOP_HAND;
  }

  // ---- 6. FSM stepping at STEP_MS cadence ----
  if (now - lastStepMs < STEP_MS) return;
  lastStepMs = now;

  switch (state) {

    case IDLE:
      // Hold a neutral pose, wait for LED command.
      moveSmooth(sHand,    handPos,    HAND_OPEN);
      moveSmooth(sWrist,   wristPos,   WRIST_UP);
      moveSmooth(sForearm, forearmPos, FOREARM_POS);
      moveSmooth(sElbow,   elbowPos,   SCAN_MIN);
      if (cmdActive) {
        grabRetries = 0;
        state = SCAN;
      }
      break;

    case SCAN:
      moveSmooth(sHand,    handPos,    HAND_OPEN);
      moveSmooth(sWrist,   wristPos,   WRIST_UP);
      moveSmooth(sForearm, forearmPos, FOREARM_POS);

      if (scanToMax) {
        moveSmooth(sElbow, elbowPos, SCAN_MAX);
        if (nearTarget(elbowPos, SCAN_MAX)) scanToMax = false;
      } else {
        moveSmooth(sElbow, elbowPos, SCAN_MIN);
        if (nearTarget(elbowPos, SCAN_MIN)) scanToMax = true;
      }

      if (filteredCm > OBJECT_MIN_CM && filteredCm < OBJECT_MAX_CM) {
        state = APPROACH;
      }
      // If external command drops, go back to idle.
      if (!cmdActive) state = IDLE;
      break;

    case APPROACH:
      moveSmooth(sForearm, forearmPos, FOREARM_GRAB);
      moveSmooth(sWrist,   wristPos,   WRIST_UP);
      if (nearTarget(forearmPos, FOREARM_GRAB)) state = GRAB;
      break;

    case GRAB:
      moveSmooth(sWrist,   wristPos,   WRIST_DOWN);
      moveSmooth(sForearm, forearmPos, FOREARM_GRAB);
      if (nearTarget(wristPos, WRIST_DOWN)) {
        moveSmooth(sHand, handPos, HAND_CLOSED, 2);
        if (nearTarget(handPos, HAND_CLOSED)) state = LIFT;
      }
      break;

    case LIFT:
      moveSmooth(sWrist,   wristPos,   WRIST_UP);
      moveSmooth(sForearm, forearmPos, FOREARM_POS);
      if (nearTarget(wristPos, WRIST_UP) && nearTarget(forearmPos, FOREARM_POS)) {
        // If the gripper drifted open (ball slipped) -> retry GRAB.
        if (handPos < HAND_CLOSED - 10 && grabRetries < MAX_GRAB_RETRIES) {
          grabRetries++;
          state = APPROACH;
        } else {
          state = MOVE_TO_DROP;
        }
      }
      break;

    case MOVE_TO_DROP:
      moveSmooth(sHand,  handPos,  HAND_CLOSED, 2);
      moveSmooth(sElbow, elbowPos, DROP_POS);
      if (nearTarget(elbowPos, DROP_POS)) state = RELEASE;
      break;

    case RELEASE:
      moveSmooth(sWrist, wristPos, WRIST_DROP);
      if (nearTarget(wristPos, WRIST_DROP)) {
        moveSmooth(sHand, handPos, HAND_OPEN, 2);
        if (nearTarget(handPos, HAND_OPEN)) state = RETURN_HOME;
      }
      break;

    case RETURN_HOME:
      moveSmooth(sHand,    handPos,    HAND_OPEN);
      moveSmooth(sWrist,   wristPos,   WRIST_UP);
      moveSmooth(sForearm, forearmPos, FOREARM_POS);
      moveSmooth(sElbow,   elbowPos,   SCAN_MIN);
      if (nearTarget(elbowPos, SCAN_MIN)) {
        grabRetries = 0;
        state = cmdActive ? SCAN : IDLE;
      }
      break;

    case STOP_HAND:
      // Open gripper, retreat to safe pose, hold until path is clear.
      moveSmooth(sHand,    handPos,    HAND_OPEN, 2);
      moveSmooth(sWrist,   wristPos,   WRIST_UP);
      moveSmooth(sForearm, forearmPos, FOREARM_POS);
      moveSmooth(sElbow,   elbowPos,   SCAN_MIN);
      if (filteredCm > OBJECT_MAX_CM) state = IDLE;
      break;
  }
}
