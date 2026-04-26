#include <Servo.h>

#define PIN_HAND 7
#define PIN_WRIST 3
#define PIN_FOREARM 11
#define PIN_ELBOW 5

#define PIN_TRIG 2
#define PIN_ECHO 4

#define PIN_RGB_RED 6
#define PIN_RGB_GREEN 9
#define PIN_RGB_BLUE 10
#define PIN_COLOR_SENSOR A0
#define PIN_BALL_HOLDER A1

#define PIN_595_DATA 12
#define PIN_595_LATCH 8
#define PIN_595_CLOCK 13

const bool RGB_COMMON_ANODE = false;
const bool SENSOR_HIGHER_IS_BRIGHTER = true;
const bool HOLDER_ACTIVE_HIGH = true;

const unsigned long STEP_MS = 15;
const unsigned long SENSOR_MS = 40;
const unsigned long HOLDER_POLL_MS = 20;
const unsigned long RELEASE_HOLD_MS = 500;
const unsigned long COLOR_SETTLE_MS = 300;
const unsigned long COLOR_SAMPLE_INTERVAL_MS = 8;

const uint8_t HOLDER_STABLE_N = 3;
const uint8_t COLOR_SAMPLE_COUNT = 10;
const uint8_t REQUIRED_COLOR_MATCHES = 2;
const uint8_t MAX_COLOR_ATTEMPTS = 4;

const int HOLDER_THRESHOLD = 700;
const int STRONG_GAP = 50;
const int YELLOW_CLOSE = 120;
const int MIN_COLOR_SPREAD = 25;

const float HAND_STOP_CM = 8.0f;
const float CLEAR_PATH_CM = 15.0f;

const int HAND_OPEN = 0;
const int HAND_CLOSED = 90;
const int WRIST_HOME = 150;
const int WRIST_PICKUP = 60;
const int WRIST_DROP = 90;
const int FOREARM_HOME = 45;
const int FOREARM_PICKUP = 105;
const int ELBOW_HOME = 20;

// Retune these for the physical bin layout.
const int DROP_GREEN_ELBOW = 115;
const int DROP_RED_ELBOW = 135;
const int DROP_BLUE_ELBOW = 155;
const int DROP_YELLOW_ELBOW = 175;

const uint8_t SEG_DIGITS[10] = {
  0b00111111, 0b00000110, 0b01011011, 0b01001111, 0b01100110,
  0b01101101, 0b01111101, 0b00000111, 0b01111111, 0b01101111
};
const uint8_t SEG_BLANK = 0b00000000;
const uint8_t SEG_DASH = 0b01000000;
const uint8_t SEG_E = 0b01111001;
const uint8_t SEG_S = 0b01101101;

enum State : uint8_t {
  STATE_IDLE,
  STATE_DETECT_COLOR,
  STATE_APPROACH,
  STATE_GRAB,
  STATE_LIFT,
  STATE_MOVE_TO_DROP,
  STATE_RELEASE,
  STATE_RETURN_HOME,
  STATE_STOP_HAND
};

enum DetectedColor : uint8_t {
  DETECTED_NONE,
  DETECTED_GREEN,
  DETECTED_RED,
  DETECTED_BLUE,
  DETECTED_YELLOW,
  DETECTED_UNKNOWN
};

enum ColorChannel : uint8_t {
  CHANNEL_RED,
  CHANNEL_GREEN,
  CHANNEL_BLUE,
  CHANNEL_COUNT
};

struct ArmPose {
  int hand;
  int wrist;
  int forearm;
  int elbow;
};

struct DropPose {
  int elbow;
  int forearm;
  int wrist;
  uint8_t binDigit;
};

struct ColorReading {
  int values[CHANNEL_COUNT];
};

const ArmPose HOME_POSE = {HAND_OPEN, WRIST_HOME, FOREARM_HOME, ELBOW_HOME};
const ArmPose APPROACH_POSE = {HAND_OPEN, WRIST_HOME, FOREARM_PICKUP, ELBOW_HOME};
const ArmPose GRAB_ALIGN_POSE = {HAND_OPEN, WRIST_PICKUP, FOREARM_PICKUP, ELBOW_HOME};
const ArmPose LIFT_POSE = {HAND_CLOSED, WRIST_HOME, FOREARM_HOME, ELBOW_HOME};

const DropPose DROP_POSES[] = {
  {ELBOW_HOME, FOREARM_HOME, WRIST_HOME, 0},
  {DROP_GREEN_ELBOW, FOREARM_HOME, WRIST_DROP, 1},
  {DROP_RED_ELBOW, FOREARM_HOME, WRIST_DROP, 2},
  {DROP_BLUE_ELBOW, FOREARM_HOME, WRIST_DROP, 3},
  {DROP_YELLOW_ELBOW, FOREARM_HOME, WRIST_DROP, 4}
};

const uint8_t RGB_PINS[CHANNEL_COUNT] = {PIN_RGB_RED, PIN_RGB_GREEN, PIN_RGB_BLUE};
const char* const STATE_NAMES[] = {
  "IDLE", "DETECT", "APPROACH", "GRAB", "LIFT",
  "MOVE_TO_DROP", "RELEASE", "RETURN_HOME", "STOP_HAND"
};
const char* const COLOR_NAMES[] = {
  "No Ball", "Green", "Red", "Blue", "Yellow", "Unknown"
};
const DetectedColor CALIBRATION_SEQUENCE[] = {
  DETECTED_NONE, DETECTED_GREEN, DETECTED_RED, DETECTED_BLUE, DETECTED_YELLOW
};

Servo sHand, sWrist, sForearm, sElbow;

State state = STATE_IDLE;
DetectedColor activeColor = DETECTED_NONE;
DropPose activeDropPose = DROP_POSES[DETECTED_NONE];

int handPos = HAND_OPEN;
int wristPos = WRIST_HOME;
int forearmPos = FOREARM_HOME;
int elbowPos = ELBOW_HOME;

int holderRawValue = 0;
bool holderRawState = false;
bool holderActive = false;
uint8_t holderStableCount = 0;

bool calibrated = false;
int saved[5][CHANNEL_COUNT];

float distBuf[5] = {100.0f, 100.0f, 100.0f, 100.0f, 100.0f};
float filteredCm = 100.0f;
uint8_t distIdx = 0;

ColorReading pendingReading = {{0, 0, 0}};
DetectedColor lastColorMatch = DETECTED_UNKNOWN;
uint8_t colorChannel = CHANNEL_RED;
uint8_t colorSamplesTaken = 0;
uint8_t colorMatchCount = 0;
uint8_t colorAttemptCount = 0;
long colorAccum = 0;
bool colorScanActive = false;

unsigned long stateEnteredMs = 0;
unsigned long lastStepMs = 0;
unsigned long lastSensorMs = 0;
unsigned long lastHolderPollMs = 0;
unsigned long colorSettledAtMs = 0;
unsigned long lastColorSampleMs = 0;

const char* stateName(State value) { return STATE_NAMES[value]; }
const char* colorName(DetectedColor value) { return COLOR_NAMES[value]; }

bool isSortableColor(DetectedColor value) {
  return value >= DETECTED_GREEN && value <= DETECTED_YELLOW;
}

int normalizeSensorValue(int value) {
  return SENSOR_HIGHER_IS_BRIGHTER ? value : -value;
}

bool nearTarget(int current, int target, int tolerance = 2) {
  return abs(current - target) <= tolerance;
}

void sendToDisplay(uint8_t pattern) {
  digitalWrite(PIN_595_LATCH, LOW);
  shiftOut(PIN_595_DATA, PIN_595_CLOCK, MSBFIRST, pattern);
  digitalWrite(PIN_595_LATCH, HIGH);
}

void showDigit(uint8_t digit) {
  sendToDisplay(digit <= 9 ? SEG_DIGITS[digit] : SEG_BLANK);
}

void showActiveBin() {
  isSortableColor(activeColor) ? showDigit(activeDropPose.binDigit) : sendToDisplay(SEG_BLANK);
}

void writeRgbPin(uint8_t pin, bool on) {
  digitalWrite(pin, RGB_COMMON_ANODE ? !on : on);
}

void setActiveColorChannel(int activeChannel) {
  for (uint8_t i = 0; i < CHANNEL_COUNT; i++) {
    writeRgbPin(RGB_PINS[i], i == activeChannel);
  }
}

void allRgbOff() {
  setActiveColorChannel(-1);
}

void moveSmooth(Servo& servo, int& current, int target, int stepSize = 1) {
  if (current < target) {
    current = min(current + stepSize, target);
  } else if (current > target) {
    current = max(current - stepSize, target);
  }
  servo.write(current);
}

void moveToPose(const ArmPose& pose, int handStep = 1, bool moveHand = true) {
  if (moveHand) {
    moveSmooth(sHand, handPos, pose.hand, handStep);
  }
  moveSmooth(sWrist, wristPos, pose.wrist);
  moveSmooth(sForearm, forearmPos, pose.forearm);
  moveSmooth(sElbow, elbowPos, pose.elbow);
}

bool poseReached(const ArmPose& pose, int tolerance = 2, bool checkHand = true) {
  return (!checkHand || nearTarget(handPos, pose.hand, tolerance)) &&
         nearTarget(wristPos, pose.wrist, tolerance) &&
         nearTarget(forearmPos, pose.forearm, tolerance) &&
         nearTarget(elbowPos, pose.elbow, tolerance);
}

bool armAtHome() {
  return poseReached(HOME_POSE);
}

bool safeForBlockingSerialAction() {
  return state == STATE_IDLE && armAtHome();
}

ArmPose makeDropPose(bool handOpen) {
  return {handOpen ? HAND_OPEN : HAND_CLOSED, activeDropPose.wrist, activeDropPose.forearm, activeDropPose.elbow};
}

void resetColorScan() {
  colorChannel = CHANNEL_RED;
  colorSamplesTaken = 0;
  colorAccum = 0;
  colorScanActive = false;
}

void resetColorDetection() {
  resetColorScan();
  colorMatchCount = 0;
  colorAttemptCount = 0;
  lastColorMatch = DETECTED_UNKNOWN;
}

void enterState(State nextState) {
  if (state == nextState) {
    return;
  }

  state = nextState;
  stateEnteredMs = millis();
  colorScanActive = false;

  if (state == STATE_DETECT_COLOR) {
    resetColorDetection();
  }

  Serial.print("State -> ");
  Serial.println(stateName(state));

  if (state == STATE_STOP_HAND) {
    sendToDisplay(SEG_S);
  }
}

float pingOnceCm() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);

  unsigned long duration = pulseIn(PIN_ECHO, HIGH, 12000UL);
  if (!duration) {
    return 400.0f;
  }

  float cm = duration * 0.0343f / 2.0f;
  return (cm < 2.0f || cm > 300.0f) ? filteredCm : cm;
}

float readDistanceCm() {
  distBuf[distIdx] = pingOnceCm();
  distIdx = (distIdx + 1) % 5;

  float sorted[5];
  for (uint8_t i = 0; i < 5; i++) {
    sorted[i] = distBuf[i];
  }

  for (uint8_t i = 0; i < 4; i++) {
    for (uint8_t j = i + 1; j < 5; j++) {
      if (sorted[j] < sorted[i]) {
        float swap = sorted[i];
        sorted[i] = sorted[j];
        sorted[j] = swap;
      }
    }
  }

  filteredCm = 0.4f * sorted[2] + 0.6f * filteredCm;
  return filteredCm;
}

bool readHolderRawState() {
  holderRawValue = analogRead(PIN_BALL_HOLDER);
  return HOLDER_ACTIVE_HIGH ? holderRawValue >= HOLDER_THRESHOLD
                            : holderRawValue <= HOLDER_THRESHOLD;
}

void pollHolderSensor() {
  bool raw = readHolderRawState();

  if (raw == holderRawState) {
    if (holderStableCount < 255) holderStableCount++;
  } else {
    holderStableCount = 0;
    holderRawState = raw;
  }

  if (holderStableCount >= HOLDER_STABLE_N) {
    holderActive = holderRawState;
  }
}

long colorDistanceSq(const ColorReading& reading, const int savedReading[CHANNEL_COUNT]) {
  long distance = 0;

  for (uint8_t i = 0; i < CHANNEL_COUNT; i++) {
    long delta = reading.values[i] - savedReading[i];
    distance += delta * delta;
  }

  return distance;
}

DetectedColor classifyHeuristic(const ColorReading& reading) {
  int normalized[CHANNEL_COUNT];
  int minValue = normalizeSensorValue(reading.values[0]);
  int maxValue = minValue;

  for (uint8_t i = 0; i < CHANNEL_COUNT; i++) {
    normalized[i] = normalizeSensorValue(reading.values[i]);
    minValue = min(minValue, normalized[i]);
    maxValue = max(maxValue, normalized[i]);
  }

  if (maxValue - minValue < MIN_COLOR_SPREAD) {
    return DETECTED_NONE;
  }

  bool redOverBlue = normalized[CHANNEL_RED] > normalized[CHANNEL_BLUE] + STRONG_GAP;
  bool greenOverBlue = normalized[CHANNEL_GREEN] > normalized[CHANNEL_BLUE] + STRONG_GAP;
  bool redOverGreen = normalized[CHANNEL_RED] > normalized[CHANNEL_GREEN] + STRONG_GAP;
  bool greenOverRed = normalized[CHANNEL_GREEN] > normalized[CHANNEL_RED] + STRONG_GAP;
  bool blueOverRed = normalized[CHANNEL_BLUE] > normalized[CHANNEL_RED] + STRONG_GAP;
  bool blueOverGreen = normalized[CHANNEL_BLUE] > normalized[CHANNEL_GREEN] + STRONG_GAP;
  bool redGreenClose = abs(normalized[CHANNEL_RED] - normalized[CHANNEL_GREEN]) <= YELLOW_CLOSE;

  if (redOverBlue && greenOverBlue && redGreenClose) return DETECTED_YELLOW;
  if (redOverGreen && redOverBlue) return DETECTED_RED;
  if (greenOverRed && greenOverBlue) return DETECTED_GREEN;
  if (blueOverRed && blueOverGreen) return DETECTED_BLUE;
  return DETECTED_UNKNOWN;
}

DetectedColor classifyCalibrated(const ColorReading& reading) {
  uint8_t bestIndex = 0;
  long bestDistance = colorDistanceSq(reading, saved[0]);

  for (uint8_t i = 1; i < 5; i++) {
    long distance = colorDistanceSq(reading, saved[i]);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = i;
    }
  }

  return static_cast<DetectedColor>(bestIndex);
}

DetectedColor classifyColor(const ColorReading& reading) {
  return calibrated ? classifyCalibrated(reading) : classifyHeuristic(reading);
}

void printColorReading(const ColorReading& reading, DetectedColor detected) {
  Serial.print("R: ");
  Serial.print(reading.values[CHANNEL_RED]);
  Serial.print("  G: ");
  Serial.print(reading.values[CHANNEL_GREEN]);
  Serial.print("  B: ");
  Serial.print(reading.values[CHANNEL_BLUE]);
  Serial.print("  -> ");
  Serial.println(colorName(detected));
}

void beginColorScan() {
  for (uint8_t i = 0; i < CHANNEL_COUNT; i++) {
    pendingReading.values[i] = 0;
  }

  colorScanActive = true;
  colorChannel = CHANNEL_RED;
  colorSettledAtMs = millis();
  colorSamplesTaken = 0;
  colorAccum = 0;
  lastColorSampleMs = colorSettledAtMs;
  setActiveColorChannel(colorChannel);

  Serial.println("Color scan started");
  sendToDisplay(SEG_DASH);
}

bool sampleActiveChannel(unsigned long now, int& average) {
  if (now - lastColorSampleMs < COLOR_SAMPLE_INTERVAL_MS) {
    return false;
  }

  lastColorSampleMs = now;
  colorAccum += analogRead(PIN_COLOR_SENSOR);

  if (++colorSamplesTaken < COLOR_SAMPLE_COUNT) {
    return false;
  }

  average = colorAccum / COLOR_SAMPLE_COUNT;
  return true;
}

bool finishColorAttempt(DetectedColor& result) {
  allRgbOff();
  colorScanActive = false;

  DetectedColor match = classifyColor(pendingReading);
  colorAttemptCount++;
  printColorReading(pendingReading, match);

  if (match == lastColorMatch) {
    colorMatchCount++;
  } else {
    lastColorMatch = match;
    colorMatchCount = 1;
  }

  if (isSortableColor(match) && colorMatchCount >= REQUIRED_COLOR_MATCHES) {
    result = match;
    return true;
  }

  if (colorAttemptCount >= MAX_COLOR_ATTEMPTS) {
    result = match;
    return true;
  }

  beginColorScan();
  return false;
}

bool updateColorScan(DetectedColor& result) {
  unsigned long now = millis();
  result = DETECTED_UNKNOWN;

  if (!colorScanActive) {
    beginColorScan();
  }

  if (now - colorSettledAtMs < COLOR_SETTLE_MS) {
    return false;
  }

  int average = 0;
  if (!sampleActiveChannel(now, average)) {
    return false;
  }

  pendingReading.values[colorChannel] = average;

  if (++colorChannel < CHANNEL_COUNT) {
    setActiveColorChannel(colorChannel);
    colorSettledAtMs = now;
    colorSamplesTaken = 0;
    colorAccum = 0;
    lastColorSampleMs = now;
    return false;
  }

  return finishColorAttempt(result);
}

int blockingAverageSensorRead() {
  long total = 0;

  for (uint8_t i = 0; i < COLOR_SAMPLE_COUNT; i++) {
    total += analogRead(PIN_COLOR_SENSOR);
    delay(COLOR_SAMPLE_INTERVAL_MS);
  }

  return total / COLOR_SAMPLE_COUNT;
}

ColorReading blockingReadColor() {
  ColorReading reading = {{0, 0, 0}};

  for (uint8_t channel = 0; channel < CHANNEL_COUNT; channel++) {
    setActiveColorChannel(channel);
    delay(COLOR_SETTLE_MS);
    reading.values[channel] = blockingAverageSensorRead();
    allRgbOff();
    delay(100);
  }

  return reading;
}

void waitForEnter() {
  Serial.println("Press Enter when ready...");
  while (!Serial.available()) {}
  while (Serial.available()) Serial.read();
}

void printCalibration() {
  if (!calibrated) {
    Serial.println("Calibration not saved yet.");
    return;
  }

  for (uint8_t i = 0; i < 5; i++) {
    Serial.print(COLOR_NAMES[i]);
    Serial.print(": ");
    Serial.print(saved[i][CHANNEL_RED]);
    Serial.print(", ");
    Serial.print(saved[i][CHANNEL_GREEN]);
    Serial.print(", ");
    Serial.println(saved[i][CHANNEL_BLUE]);
  }
}

void calibrateColors() {
  Serial.println("Calibration start");
  calibrated = false;
  moveToPose(HOME_POSE, 2);
  allRgbOff();
  sendToDisplay(SEG_BLANK);

  for (uint8_t i = 0; i < 5; i++) {
    DetectedColor target = CALIBRATION_SEQUENCE[i];
    Serial.print("Place ");
    Serial.print(colorName(target));
    Serial.println(target == DETECTED_NONE ? " state" : " ball");
    waitForEnter();

    ColorReading reading = blockingReadColor();
    for (uint8_t channel = 0; channel < CHANNEL_COUNT; channel++) {
      saved[i][channel] = reading.values[channel];
    }

    Serial.print(colorName(target));
    Serial.println(" saved");
    printColorReading(reading, target);
  }

  calibrated = true;
  Serial.println("Calibration complete");
  printCalibration();
}

void printLiveReading() {
  ColorReading reading = blockingReadColor();
  printColorReading(reading, classifyColor(reading));
}

void printStatus() {
  Serial.print("State: ");
  Serial.println(stateName(state));
  Serial.print("Holder raw: ");
  Serial.print(holderRawValue);
  Serial.print("  active: ");
  Serial.println(holderActive ? "YES" : "NO");
  Serial.print("Distance cm: ");
  Serial.println(filteredCm);
  Serial.print("Active color: ");
  Serial.println(colorName(activeColor));
}

bool requireIdleHome(const char* message) {
  if (safeForBlockingSerialAction()) {
    return true;
  }

  Serial.println(message);
  return false;
}

void processSerialCommands() {
  if (!Serial.available()) {
    return;
  }

  char cmd = Serial.read();
  while (Serial.available()) Serial.read();

  switch (cmd) {
    case 't':
    case 'T':
      if (requireIdleHome("Calibration blocked: return the arm to IDLE/home first.")) calibrateColors();
      break;

    case 'p':
    case 'P':
      printCalibration();
      break;

    case 'r':
    case 'R':
      if (requireIdleHome("Live read blocked: return the arm to IDLE/home first.")) printLiveReading();
      break;

    case 's':
    case 'S':
      printStatus();
      break;

    case 'c':
    case 'C':
      calibrated = false;
      Serial.println("Calibration cleared");
      break;
  }
}

void setup() {
  Serial.begin(115200);

  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  pinMode(PIN_BALL_HOLDER, INPUT);
  pinMode(PIN_595_DATA, OUTPUT);
  pinMode(PIN_595_LATCH, OUTPUT);
  pinMode(PIN_595_CLOCK, OUTPUT);

  for (uint8_t i = 0; i < CHANNEL_COUNT; i++) {
    pinMode(RGB_PINS[i], OUTPUT);
  }

  digitalWrite(PIN_TRIG, LOW);
  allRgbOff();
  sendToDisplay(SEG_BLANK);

  sHand.attach(PIN_HAND);
  sWrist.attach(PIN_WRIST);
  sForearm.attach(PIN_FOREARM);
  sElbow.attach(PIN_ELBOW);
  sHand.write(handPos);
  sWrist.write(wristPos);
  sForearm.write(forearmPos);
  sElbow.write(elbowPos);

  stateEnteredMs = millis();
  Serial.println("State -> IDLE");
  Serial.println("Final project sorting FSM ready");
  Serial.println("Commands: t=calibrate, p=print calibration, r=read live color, s=status");
  Serial.println("Bins: 1=Green, 2=Red, 3=Blue, 4=Yellow");
}

void loop() {
  unsigned long now = millis();

  processSerialCommands();

  if (now - lastSensorMs >= SENSOR_MS) {
    lastSensorMs = now;
    readDistanceCm();
  }

  if (now - lastHolderPollMs >= HOLDER_POLL_MS) {
    lastHolderPollMs = now;
    pollHolderSensor();
  }

  if (filteredCm < HAND_STOP_CM &&
      state != STATE_STOP_HAND &&
      state != STATE_GRAB &&
      state != STATE_LIFT &&
      state != STATE_MOVE_TO_DROP &&
      state != STATE_RELEASE) {
    enterState(STATE_STOP_HAND);
  }

  if (now - lastStepMs < STEP_MS) {
    return;
  }
  lastStepMs = now;

  switch (state) {
    case STATE_IDLE:
      activeColor = DETECTED_NONE;
      activeDropPose = DROP_POSES[DETECTED_NONE];
      moveToPose(HOME_POSE, 2);
      allRgbOff();

      if (holderActive) {
        sendToDisplay(SEG_DASH);
      } else {
        showDigit(0);
      }

      if (holderActive && poseReached(HOME_POSE)) {
        enterState(STATE_DETECT_COLOR);
      }
      break;

    case STATE_DETECT_COLOR: {
      moveToPose(HOME_POSE, 2);

      if (!holderActive) {
        allRgbOff();
        enterState(STATE_IDLE);
        break;
      }

      DetectedColor detected = DETECTED_UNKNOWN;
      if (!updateColorScan(detected)) {
        break;
      }

      if (isSortableColor(detected)) {
        activeColor = detected;
        activeDropPose = DROP_POSES[detected];
        showActiveBin();

        Serial.print("Locked color -> ");
        Serial.print(colorName(activeColor));
        Serial.print("  bin ");
        Serial.println(activeDropPose.binDigit);

        enterState(STATE_APPROACH);
      } else {
        Serial.println("Color detection failed or no ball matched. Returning to idle.");
        sendToDisplay(SEG_E);
        enterState(STATE_IDLE);
      }
      break;
    }

    case STATE_APPROACH:
      showActiveBin();
      moveToPose(APPROACH_POSE, 2);
      if (poseReached(APPROACH_POSE)) enterState(STATE_GRAB);
      break;

    case STATE_GRAB:
      showActiveBin();
      moveToPose(GRAB_ALIGN_POSE, 2, false);

      if (poseReached(GRAB_ALIGN_POSE, 2, false)) {
        moveSmooth(sHand, handPos, HAND_CLOSED, 2);
        if (nearTarget(handPos, HAND_CLOSED)) enterState(STATE_LIFT);
      }
      break;

    case STATE_LIFT:
      showActiveBin();
      moveToPose(LIFT_POSE, 2);
      if (poseReached(LIFT_POSE)) enterState(STATE_MOVE_TO_DROP);
      break;

    case STATE_MOVE_TO_DROP: {
      ArmPose pose = makeDropPose(false);
      showActiveBin();
      moveToPose(pose, 2);
      if (poseReached(pose)) enterState(STATE_RELEASE);
      break;
    }

    case STATE_RELEASE: {
      ArmPose pose = makeDropPose(true);
      showActiveBin();
      moveToPose(pose, 2);

      if (poseReached(pose) && now - stateEnteredMs >= RELEASE_HOLD_MS) {
        enterState(STATE_RETURN_HOME);
      }
      break;
    }

    case STATE_RETURN_HOME:
      showActiveBin();
      moveToPose(HOME_POSE, 2);
      if (poseReached(HOME_POSE)) enterState(STATE_IDLE);
      break;

    case STATE_STOP_HAND:
      allRgbOff();
      sendToDisplay(SEG_DASH);
      moveToPose(HOME_POSE, 2);
      if (filteredCm > CLEAR_PATH_CM) enterState(STATE_IDLE);
      break;
  }
}
