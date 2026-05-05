#include <Servo.h>

Servo hand, wrist, forearm, elbow;

const int HAND_PIN    = 4;
const int WRIST_PIN   = 7;
const int FOREARM_PIN = 10;
const int ELBOW_PIN   = 12;

const int TRIG_PIN = 2;
const int ECHO_PIN = 3;

const int PIN_LED_R = 5;
const int PIN_LED_G = 8;
const int PIN_LED_B = 6;
const int PIN_PHOTO = A3;

const int SR_DATA  = 9;
const int SR_CLK   = 11;
const int SR_LATCH = 13;

const int HAND_OPEN   = 170;
const int HAND_CLOSED = 115;

const int ELBOW_SCAN_START = 0;
const int ELBOW_SCAN_END   = 135;
const int ELBOW_DROP_POS   = 180;

int SCAN_FOREARM = 80;
int SCAN_WRIST   = 55;

int PICKUP_FOREARM = 45;
int PICKUP_WRIST   = 98;

int CARRY_FOREARM = 170;
int CARRY_WRIST   = 170;

int DROP_FOREARM = 170;
int DROP_WRIST   = 170;

const float DETECT_MIN_CM       = 3.0;
const float DETECT_MAX_CM       = 14.1;
const float MIN_VALID_SENSOR_CM = 2.5;

const int   MIN_STREAK_STEPS  = 3;
const int   MAX_STREAK_STEPS  = 6;
const int   ANGLE_STEP        = 1;
const int   SENSOR_SAMPLES    = 2;
const float MAX_SAMPLE_SPREAD = 0.5;

const int SERVO_SPEED_MS = 15;
const int SCAN_SETTLE_MS = 10;
const int POSE_SETTLE_MS = 150;
const int GRIP_HOLD_MS   = 300;
const int DROP_HOLD_MS   = 500;

const int REQUIRED_STABLE           = 3;
const int COLOR_SENSE_ATTEMPTS      = 10;
const int COLOR_SENSE_RETRY_MS      = 50;
const int NUM_COLORS                = 5;
const int NO_BALL_INDEX             = 4;
const int DROP_ELBOW[NUM_COLORS] = {
  ELBOW_DROP_POS,
  150,
  120,
  90,
  ELBOW_DROP_POS
};

const char * const COLOR_NAMES[NUM_COLORS] = {
  "Yellow",
  "Green",
  "Red",
  "Blue",
  "No Ball"
};

const char * const COLOR_TOKENS[NUM_COLORS] = {
  "yellow",
  "green",
  "red",
  "blue",
  "no_ball"
};

enum State {
  STATE_SCAN,
  STATE_DETECT,
  STATE_PICKUP,
  STATE_COLOR_SENSE,
  STATE_GRAB,
  STATE_CARRY,
  STATE_DELIVER,
  STATE_DROP,
  STATE_RESET
};

State currentState = STATE_SCAN;

int posElbow    = 0;
int posForearm  = 0;
int posWrist    = 0;
int posHand     = HAND_OPEN;

int detectedColor = -1;
int lastMatch = -1;
int stableMatch = -1;
int matchCount = 0;
int saved[NUM_COLORS][3];
bool calibrated = false;

float readDistanceCM() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(4);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000);
  if (duration == 0) {
    return -1.0;
  }

  float dist = (duration * 0.0343) / 2.0;
  if (dist < 0 || dist > 300) {
    return -1.0;
  }
  return dist;
}

bool getStableDistance(float &avgDist) {
  float vals[SENSOR_SAMPLES];
  int valid = 0;

  for (int i = 0; i < SENSOR_SAMPLES; i++) {
    float d = readDistanceCM();
    if (d > 0) {
      vals[valid] = d;
      valid++;
    }
    delay(10);
  }

  if (valid < 2) {
    return false;
  }

  float minVal = vals[0];
  float maxVal = vals[0];
  float sum = 0.0;

  for (int i = 0; i < valid; i++) {
    if (vals[i] < minVal) {
      minVal = vals[i];
    }
    if (vals[i] > maxVal) {
      maxVal = vals[i];
    }
    sum += vals[i];
  }

  avgDist = sum / valid;
  if ((maxVal - minVal) > MAX_SAMPLE_SPREAD) {
    return false;
  }

  return true;
}

bool ballDetected(float &distOut) {
  if (!getStableDistance(distOut)) {
    return false;
  }

  if (distOut < MIN_VALID_SENSOR_CM) {
    return false;
  }

  bool inRange = (distOut >= DETECT_MIN_CM && distOut <= DETECT_MAX_CM);
  if (inRange) {
    Serial.print("Candidate dist: ");
    Serial.print(distOut);
    Serial.println(" cm");
  }

  return inRange;
}

void moveServoSmooth(Servo &s, int &currentPos, int target) {
  int step = (target > currentPos) ? 1 : -1;

  while (currentPos != target) {
    currentPos += step;
    s.write(currentPos);
    delay(SERVO_SPEED_MS);
  }
}

void moveToPose(int targetForearm, int targetWrist) {
  bool moving = true;

  while (moving) {
    moving = false;

    if (posForearm != targetForearm) {
      posForearm += (targetForearm > posForearm) ? 1 : -1;
      forearm.write(posForearm);
      moving = true;
    }

    if (posWrist != targetWrist) {
      posWrist += (targetWrist > posWrist) ? 1 : -1;
      wrist.write(posWrist);
      moving = true;
    }

    if (moving) {
      delay(SERVO_SPEED_MS);
    }
  }

  delay(POSE_SETTLE_MS);
}

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

void clearDisplay() {
  sendToDisplay(0);
}

void showColorLetter(int colorIndex) {
  byte pattern = 0;

  if (colorIndex == 0) {
    pattern = (1 << 2) | (1 << 1) | (1 << 6) | (1 << 5) | (1 << 4);
  }
  if (colorIndex == 1) {
    pattern = (1 << 2) | (1 << 7) | (1 << 1) | (1 << 6) | (1 << 5) | (1 << 4);
  }
  if (colorIndex == 2) {
    pattern = (1 << 3) | (1 << 1);
  }
  if (colorIndex == 3) {
    pattern = (1 << 2) | (1 << 1) | (1 << 5) | (1 << 3) | (1 << 4);
  }
  if (colorIndex == 4) {
    pattern = (1 << 7) | (1 << 1) | (1 << 4);
  }

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
  while (!Serial.available()) {
  }
  while (Serial.available()) {
    Serial.read();
  }
}

void printColors() {
  for (int i = 0; i < NUM_COLORS; i++) {
    Serial.print(COLOR_NAMES[i]);
    Serial.print(": ");
    Serial.print(saved[i][0]);
    Serial.print(", ");
    Serial.print(saved[i][1]);
    Serial.print(", ");
    Serial.println(saved[i][2]);
  }
}

void resetColorTracking() {
  lastMatch = -1;
  stableMatch = -1;
  matchCount = 0;
}

void calibrate() {
  Serial.println("CALIBRATION START");
  calibrated = false;
  detectedColor = -1;
  resetColorTracking();

  for (int i = 0; i < NUM_COLORS; i++) {
    Serial.print("Place ");
    Serial.print(COLOR_NAMES[i]);
    Serial.println(i == NO_BALL_INDEX ? " state" : " ball");
    waitEnter();

    int temp[3];
    getColor(temp);

    saved[i][0] = temp[0];
    saved[i][1] = temp[1];
    saved[i][2] = temp[2];

    Serial.print(COLOR_NAMES[i]);
    Serial.println(" saved");
  }

  Serial.println("CALIBRATION DONE");
  printColors();
  Serial.println("Press Enter to begin autonomous scanning...");
  waitEnter();

  clearDisplay();
  calibrated = true;
  currentState = STATE_SCAN;
  Serial.println("Autonomous scanning enabled.");
}

long dist(int a[3], int b[3]) {
  long x = a[0] - b[0];
  long y = a[1] - b[1];
  long z = a[2] - b[2];
  return x * x + y * y + z * z;
}

int bestMatch(int x[3]) {
  int best = 0;
  long bestD = dist(x, saved[0]);

  for (int i = 1; i < NUM_COLORS; i++) {
    long d = dist(x, saved[i]);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }

  return best;
}

void processSerialCommands() {
  if (!Serial.available()) {
    return;
  }

  char cmd = Serial.read();
  while (Serial.available()) {
    Serial.read();
  }

  if (cmd == 'p' || cmd == 'P') {
    printColors();
    return;
  }

  if (cmd == 't' || cmd == 'T') {
    if (!calibrated) {
      calibrate();
    } else {
      Serial.println("Calibration is only available before autonomous scanning. Reset the board to recalibrate.");
    }
  }
}

void setup() {
  Serial.begin(115200);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  digitalWrite(TRIG_PIN, LOW);

  pinMode(PIN_LED_G, OUTPUT);
  pinMode(PIN_LED_R, OUTPUT);
  pinMode(PIN_LED_B, OUTPUT);
  pinMode(PIN_PHOTO, INPUT);

  pinMode(SR_DATA, OUTPUT);
  pinMode(SR_LATCH, OUTPUT);
  pinMode(SR_CLK, OUTPUT);

  off();
  clearDisplay();

  hand.attach(HAND_PIN);
  wrist.attach(WRIST_PIN);
  forearm.attach(FOREARM_PIN);
  elbow.attach(ELBOW_PIN);

  hand.write(HAND_OPEN);
  posHand = HAND_OPEN;

  elbow.write(ELBOW_SCAN_START);
  posElbow = ELBOW_SCAN_START;

  forearm.write(0);
  posForearm = 0;

  wrist.write(0);
  posWrist = 0;

  delay(1000);

  moveToPose(SCAN_FOREARM, SCAN_WRIST);
  hand.write(HAND_OPEN);
  posHand = HAND_OPEN;

  Serial.println("Robot started.");
  Serial.println("Manual calibration required before autonomous scanning.");
  Serial.println("Type t to calibrate.");
  Serial.println("Type p to print saved colors.");
}

void loop() {
  processSerialCommands();

  if (!calibrated) {
    delay(50);
    return;
  }

  switch (currentState) {
    case STATE_SCAN: {
      int streak = 0;
      int bestElbowAngle = -1;
      float bestDist = 999.0;
      bool foundBall = false;

      for (int angle = ELBOW_SCAN_START; angle <= ELBOW_SCAN_END; angle += ANGLE_STEP) {
        posElbow = angle;
        elbow.write(posElbow);
        delay(SCAN_SETTLE_MS);

        float distOut;
        bool hit = ballDetected(distOut);

        if (hit) {
          streak++;
          if (distOut < bestDist) {
            bestDist = distOut;
            bestElbowAngle = angle;
          }
        } else {
          if (streak >= MIN_STREAK_STEPS && streak <= MAX_STREAK_STEPS) {
            foundBall = true;
            break;
          }

          streak = 0;
          bestElbowAngle = -1;
          bestDist = 999.0;
        }
      }

      if (!foundBall && streak >= MIN_STREAK_STEPS && streak <= MAX_STREAK_STEPS) {
        foundBall = true;
      }

      if (foundBall && bestElbowAngle >= 0) {
        Serial.print("Ball accepted at angle ");
        Serial.print(bestElbowAngle);
        Serial.print(" dist ");
        Serial.println(bestDist);
        moveServoSmooth(elbow, posElbow, bestElbowAngle);
        currentState = STATE_DETECT;
        return;
      }

      Serial.println("No valid ball found. Rescanning...");
      moveServoSmooth(elbow, posElbow, ELBOW_SCAN_START);
      delay(150);
      break;
    }

    case STATE_DETECT: {
      moveServoSmooth(hand, posHand, HAND_OPEN);
      delay(POSE_SETTLE_MS);
      currentState = STATE_PICKUP;
      break;
    }

    case STATE_PICKUP: {
      moveToPose(PICKUP_FOREARM, PICKUP_WRIST);
      currentState = STATE_COLOR_SENSE;
      break;
    }

    case STATE_COLOR_SENSE: {
      int reading[3];
      int attempts = 0;

      detectedColor = NO_BALL_INDEX;
      resetColorTracking();

      while (attempts < COLOR_SENSE_ATTEMPTS) {
        getColor(reading);

        int match = bestMatch(reading);
        if (match == lastMatch) {
          matchCount++;
        } else {
          lastMatch = match;
          matchCount = 1;
        }

        if (matchCount >= REQUIRED_STABLE) {
          stableMatch = match;
          detectedColor = stableMatch;

          showColorLetter(detectedColor);

          Serial.print("G=");
          Serial.print(reading[0]);
          Serial.print(", R=");
          Serial.print(reading[1]);
          Serial.print(", B=");
          Serial.println(reading[2]);
          Serial.print("classified=");
          Serial.println(COLOR_TOKENS[detectedColor]);

          currentState = STATE_GRAB;
          break;
        }

        attempts++;
        delay(COLOR_SENSE_RETRY_MS);
      }

      if (currentState == STATE_COLOR_SENSE) {
        clearDisplay();
        detectedColor = NO_BALL_INDEX;
        Serial.println("Color sense failed after 10 attempts. Resetting...");
        currentState = STATE_RESET;
      }
      break;
    }

    case STATE_GRAB: {
      moveServoSmooth(hand, posHand, HAND_CLOSED);
      delay(GRIP_HOLD_MS);
      currentState = STATE_CARRY;
      break;
    }

    case STATE_CARRY: {
      moveToPose(CARRY_FOREARM, CARRY_WRIST);
      currentState = STATE_DELIVER;
      break;
    }

    case STATE_DELIVER: {
      int dropIndex = detectedColor;
      if (dropIndex < 0 || dropIndex >= NUM_COLORS) {
        dropIndex = NO_BALL_INDEX;
      }

      moveServoSmooth(elbow, posElbow, DROP_ELBOW[dropIndex]);
      moveToPose(DROP_FOREARM, DROP_WRIST);
      currentState = STATE_DROP;
      break;
    }

    case STATE_DROP: {
      moveServoSmooth(hand, posHand, HAND_OPEN);
      delay(DROP_HOLD_MS);
      currentState = STATE_RESET;
      break;
    }

    case STATE_RESET: {
      moveToPose(CARRY_FOREARM, CARRY_WRIST);
      moveServoSmooth(elbow, posElbow, ELBOW_SCAN_START);
      moveToPose(SCAN_FOREARM, SCAN_WRIST);
      hand.write(HAND_OPEN);
      posHand = HAND_OPEN;
      detectedColor = -1;
      resetColorTracking();
      delay(150);
      currentState = STATE_SCAN;
      break;
    }
  }
}
