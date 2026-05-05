// =====================================================================
// Robotic Arm V3 -- merged sketch
// Pick + photoresistor color sense + per-color drop bin
// Hardware (V3 pin map):
//   Servos      : wrist=D4, forearm=D7, upperArm=D10, shoulder=D12
//   HC-SR04     : TRIG=D2, ECHO=D3
//   RGB LEDs    : R=D5, G=D8, B=D6
//   74HC595     : DATA=D9, CLK=D11, LATCH=D13
//   Photores.   : A3
// Architecture  : fully blocking. Serial baud unified to 115200.
// =====================================================================

#include <Servo.h>

// ======= SERVOS =======
Servo wrist, forearm, upperArm, shoulder;

const int WRIST_PIN     = 4;
const int FOREARM_PIN   = 7;
const int UPPER_ARM_PIN = 10;
const int SHOULDER_PIN  = 12;

// ======= HC-SR04 =======
const int TRIG_PIN = 2;
const int ECHO_PIN = 3;

// ======= COLOR SENSOR (V3 pin map) =======
const int PIN_LED_R = 5;    // was 7  (FOREARM conflict)
const int PIN_LED_G = 8;    // unchanged
const int PIN_LED_B = 6;    // was 12 (SHOULDER conflict)
const int PIN_PHOTO = A3;   // unchanged

// 74HC595 driving the 7-segment display
const int SR_DATA  = 9;     // was 3 (ECHO conflict)
const int SR_CLK   = 11;    // was 4 (WRIST conflict)
const int SR_LATCH = 13;    // was 2 (TRIG conflict)

// ======= CLAW =======
const int CLAW_OPEN   = 170;
const int CLAW_CLOSED = 115;

// ======= SHOULDER =======
const int SCAN_START = 0;
const int SCAN_END   = 135;

// V3: per-color drop-bin shoulder angles -- ISS-03 calibrate to physical bins
//   0=Yellow  1=Green  2=Red  3=Blue  4=No Ball (unused, RESET)
const int DROP_SHOULDER[5] = {180, 150, 120, 90, 180};

// ======= POSE ANGLES (calibrated) =======
int SCAN_UPPER_ARM   = 80;
int SCAN_FOREARM     = 55;

int PICKUP_UPPER_ARM = 45;
int PICKUP_FOREARM   = 98;

int CARRY_UPPER_ARM  = 170;
int CARRY_FOREARM    = 170;

int DROP_UPPER_ARM   = 170;
int DROP_FOREARM     = 170;

// ======= DETECTION RANGES =======
const float DETECT_MIN_CM       = 3.0;
const float DETECT_MAX_CM       = 14.1;
const float MIN_VALID_SENSOR_CM = 2.5;

// ======= SCAN STREAK =======
const int   MIN_STREAK_STEPS    = 3;
const int   MAX_STREAK_STEPS    = 6;
const int   ANGLE_STEP          = 1;

const int   SENSOR_SAMPLES      = 2;
const float MAX_SAMPLE_SPREAD   = 0.5;

// ======= TIMING =======
const int SERVO_SPEED_MS = 15;
const int SCAN_SETTLE_MS = 10;
const int POSE_SETTLE_MS = 150;
const int GRIP_HOLD_MS   = 300;
const int DROP_HOLD_MS   = 500;

// ======= COLOR MATCH =======
const int NUM_COLORS = 5;
String names[NUM_COLORS] = {"Yellow", "Green", "Red", "Blue", "No Ball"};
int  saved[NUM_COLORS][3];
bool calibrated = false;

const int REQUIRED_STABLE    = 3;
const int MAX_COLOR_ATTEMPTS = 10;   // ISS-01 fallback bound

int lastMatch     = -1;
int stableMatch   = -1;
int matchCount    = 0;
int detectedColor = -1;

// ======= FSM =======
enum State {
  STATE_SCAN,         // 0
  STATE_DETECT,       // 1
  STATE_PICKUP,       // 2
  STATE_COLOR_SENSE,  // 3  V3 NEW
  STATE_GRAB,         // 4
  STATE_CARRY,        // 5
  STATE_DELIVER,      // 6
  STATE_DROP,         // 7
  STATE_RESET         // 8
};

State currentState = STATE_SCAN;

int posShoulder = 0;
int posUpperArm = 0;
int posForearm  = 0;
int posClaw     = CLAW_OPEN;

// ===================== HC-SR04 =====================

float readDistanceCM() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(4);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long duration = pulseIn(ECHO_PIN, HIGH, 30000);
  if (duration == 0) return -1.0;
  float d = (duration * 0.0343) / 2.0;
  if (d < 0 || d > 300) return -1.0;
  return d;
}

bool getStableDistance(float &avgDist) {
  float vals[SENSOR_SAMPLES];
  int valid = 0;
  for (int i = 0; i < SENSOR_SAMPLES; i++) {
    float d = readDistanceCM();
    if (d > 0) { vals[valid] = d; valid++; }
    delay(10);
  }
  if (valid < 2) return false;
  float minVal = vals[0], maxVal = vals[0], sum = 0.0;
  for (int i = 0; i < valid; i++) {
    if (vals[i] < minVal) minVal = vals[i];
    if (vals[i] > maxVal) maxVal = vals[i];
    sum += vals[i];
  }
  avgDist = sum / valid;
  if ((maxVal - minVal) > MAX_SAMPLE_SPREAD) return false;
  return true;
}

bool ballDetected(float &distOut) {
  if (!getStableDistance(distOut)) return false;
  if (distOut < MIN_VALID_SENSOR_CM) return false;
  bool inRange = (distOut >= DETECT_MIN_CM && distOut <= DETECT_MAX_CM);
  if (inRange) {
    Serial.print("Candidate dist: ");
    Serial.print(distOut);
    Serial.println(" cm");
  }
  return inRange;
}

// ===================== SERVO MOTION =====================

void moveServoSmooth(Servo &s, int &currentPos, int target) {
  int step = (target > currentPos) ? 1 : -1;
  while (currentPos != target) {
    currentPos += step;
    s.write(currentPos);
    delay(SERVO_SPEED_MS);
  }
}

void moveToPose(int tUpperArm, int tForearm) {
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
  return x * x + y * y + z * z;   // squared Euclidean -- do NOT add sqrt
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
  calibrated = false;
  for (int i = 0; i < NUM_COLORS; i++) {
    Serial.print("Place ");
    Serial.print(names[i]);
    Serial.println(i == 4 ? " state" : " ball");
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
  Serial.println("Press Enter to begin scanning...");
  waitEnter();
  calibrated = true;
  Serial.println("Continuous scanning started...");
}

// ===================== SETUP =====================

void setup() {
  Serial.begin(115200);

  // HC-SR04
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  digitalWrite(TRIG_PIN, LOW);

  // Color sensor: LEDs and shift register
  pinMode(PIN_LED_R, OUTPUT);
  pinMode(PIN_LED_G, OUTPUT);
  pinMode(PIN_LED_B, OUTPUT);
  pinMode(SR_DATA,   OUTPUT);
  pinMode(SR_CLK,    OUTPUT);
  pinMode(SR_LATCH,  OUTPUT);
  off();
  clearDisplay();

  // Servos
  wrist.attach(WRIST_PIN);
  forearm.attach(FOREARM_PIN);
  upperArm.attach(UPPER_ARM_PIN);
  shoulder.attach(SHOULDER_PIN);

  wrist.write(CLAW_OPEN);     posClaw     = CLAW_OPEN;
  shoulder.write(SCAN_START); posShoulder = SCAN_START;
  upperArm.write(0);          posUpperArm = 0;
  forearm.write(0);           posForearm  = 0;
  delay(1000);

  moveToPose(SCAN_UPPER_ARM, SCAN_FOREARM);
  wrist.write(CLAW_OPEN); posClaw = CLAW_OPEN;

  // Color calibration before FSM begins
  Serial.println("Robot V3 ready.");
  Serial.println("Type any character then Enter to start color calibration.");
  while (!Serial.available()) {}
  while (Serial.available()) Serial.read();
  calibrate();

  Serial.println("Scanning for ball...");
}

// ===================== FSM =====================

void loop() {
  switch (currentState) {

    case STATE_SCAN: {
      int   streak    = 0;
      int   bestAngle = -1;
      float bestDist  = 999.0;
      bool  foundBall = false;

      for (int angle = SCAN_START; angle <= SCAN_END; angle += ANGLE_STEP) {
        posShoulder = angle;
        shoulder.write(posShoulder);
        delay(SCAN_SETTLE_MS);

        float d;
        bool hit = ballDetected(d);
        if (hit) {
          streak++;
          if (d < bestDist) { bestDist = d; bestAngle = angle; }
        } else {
          if (streak >= MIN_STREAK_STEPS && streak <= MAX_STREAK_STEPS) {
            foundBall = true; break;
          }
          streak = 0; bestAngle = -1; bestDist = 999.0;
        }
      }
      if (!foundBall && streak >= MIN_STREAK_STEPS && streak <= MAX_STREAK_STEPS)
        foundBall = true;

      if (foundBall && bestAngle >= 0) {
        Serial.print("Ball accepted at angle "); Serial.print(bestAngle);
        Serial.print(" dist "); Serial.println(bestDist);
        moveServoSmooth(shoulder, posShoulder, bestAngle);
        currentState = STATE_DETECT; return;
      }

      Serial.println("No valid ball found. Rescanning...");
      moveServoSmooth(shoulder, posShoulder, SCAN_START);
      delay(150);
      break;
    }

    case STATE_DETECT: {
      moveServoSmooth(wrist, posClaw, CLAW_OPEN);
      delay(POSE_SETTLE_MS);
      currentState = STATE_PICKUP;
      break;
    }

    case STATE_PICKUP: {
      moveToPose(PICKUP_UPPER_ARM, PICKUP_FOREARM);
      currentState = STATE_COLOR_SENSE;   // V3 transition
      break;
    }

    case STATE_COLOR_SENSE: {
      Serial.println("Color sense...");
      lastMatch     = -1;
      stableMatch   = -1;
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
          stableMatch   = match;
          break;
        }
        attempt++;
        delay(50);
      }

      if (detectedColor < 0) {
        // ISS-01: no stable read in 10 attempts -> treat as No Ball
        Serial.println("Color unstable; aborting cycle.");
        detectedColor = 4;
      }

      Serial.print("Detected: ");
      Serial.println(names[detectedColor]);
      showColorLetter(detectedColor);

      if (detectedColor == 4) {
        currentState = STATE_RESET;
      } else {
        currentState = STATE_GRAB;
      }
      break;
    }

    case STATE_GRAB: {
      moveServoSmooth(wrist, posClaw, CLAW_CLOSED);
      delay(GRIP_HOLD_MS);
      currentState = STATE_CARRY;
      break;
    }

    case STATE_CARRY: {
      moveToPose(CARRY_UPPER_ARM, CARRY_FOREARM);
      currentState = STATE_DELIVER;
      break;
    }

    case STATE_DELIVER: {
      int dropAngle = DROP_SHOULDER[detectedColor];   // V3 per-color bin
      Serial.print("Deliver to bin angle ");
      Serial.println(dropAngle);
      moveServoSmooth(shoulder, posShoulder, dropAngle);
      moveToPose(DROP_UPPER_ARM, DROP_FOREARM);
      currentState = STATE_DROP;
      break;
    }

    case STATE_DROP: {
      moveServoSmooth(wrist, posClaw, CLAW_OPEN);
      delay(DROP_HOLD_MS);
      currentState = STATE_RESET;
      break;
    }

    case STATE_RESET: {
      clearDisplay();
      moveToPose(CARRY_UPPER_ARM, CARRY_FOREARM);
      moveServoSmooth(shoulder, posShoulder, SCAN_START);
      moveToPose(SCAN_UPPER_ARM, SCAN_FOREARM);
      wrist.write(CLAW_OPEN); posClaw = CLAW_OPEN;
      delay(150);
      currentState = STATE_SCAN;
      break;
    }
  }
}
