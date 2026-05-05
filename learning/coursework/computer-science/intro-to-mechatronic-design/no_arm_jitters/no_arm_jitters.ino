#include <Servo.h>
#include <EEPROM.h>
#include <avr/pgmspace.h>

// =======================================================
// ARM POSE TYPE
// Must be declared before any function uses ArmPose.
// =======================================================
typedef struct {
  byte elbow;
  byte forearm;
  byte wrist;
  byte hand;
} ArmPose;

// =======================================================
// FUNCTION PROTOTYPES
// Prevents Arduino IDE from generating broken prototypes.
// =======================================================
void off();
void clearDisplay();
bool loadCalibration();
void saveCalibration();
void resetCalibration();

void rampServoAngle(Servo &srv, int startDeg, int endDeg);

void moveToPose(ArmPose p);
void moveToCalibrationPose(ArmPose p);
void pickBallFromPose(ArmPose pose);
void placeBallAtPose(ArmPose pose);
byte moveBallToSensorAndScan(ArmPose sourcePose);
void moveBallFromSensorToPose(ArmPose destinationPose);

void calibrateColors();
void calibrateArm();
void calibrateOnePose(const __FlashStringHelper* label, ArmPose &targetPose);

void printPose(const __FlashStringHelper* label, ArmPose p);
void printHolderPose(byte holderIndex, ArmPose p);
void printCalibration();
void printHolderValues();
void printColors();

void runAuditRepairCycle();
bool searchDispenserForColor(byte targetColor);

void testServos();
void testHandOnly();
void moveHandToAngle(byte angle);

void showColorLetter(byte colorIndex);

// =======================================================
// COLOR SENSOR PINS
// =======================================================
const int G = 8;
const int R = 7;
const int B = 12;
const int S = A3;

// =======================================================
// 74HC595 DISPLAY PINS
// =======================================================
const int DATA_PIN  = 3;
const int LATCH_PIN = 2;
const int CLOCK_PIN = 4;

// =======================================================
// SERVO PINS
// =======================================================
const int ELBOW_PIN   = 5;
const int FOREARM_PIN = 6;
const int WRIST_PIN   = 9;
const int HAND_PIN    = 11;   // hand servo moved from D10 to D11

Servo elbow;
Servo forearm;
Servo wrist;
Servo hand;

// =======================================================
// HOLDER SENSOR PINS
// =======================================================
const int HOLDER_YELLOW = A0;
const int HOLDER_GREEN  = A1;
const int HOLDER_RED    = A2;
const int HOLDER_BLUE   = A4;

const int HOLDER_THRESHOLD = 500;

// =======================================================
// COLOR INDEXES
// 0 = Yellow, 1 = Green, 2 = Red, 3 = Blue, 4 = No Ball
// =======================================================
const byte NUM_COLORS = 5;
const byte NUM_HOLDERS = 4;

const char NAME_YELLOW[] PROGMEM = "Yellow";
const char NAME_GREEN[]  PROGMEM = "Green";
const char NAME_RED[]    PROGMEM = "Red";
const char NAME_BLUE[]   PROGMEM = "Blue";
const char NAME_NONE[]   PROGMEM = "No Ball";

const char* const colorNames[] PROGMEM = {
  NAME_YELLOW,
  NAME_GREEN,
  NAME_RED,
  NAME_BLUE,
  NAME_NONE
};

void printName(byte index) {
  char buffer[10];
  strcpy_P(buffer, (PGM_P)pgm_read_word(&(colorNames[index])));
  Serial.print(buffer);
}

void printlnName(byte index) {
  printName(index);
  Serial.println();
}

int holderPins[NUM_HOLDERS] = {
  HOLDER_YELLOW,
  HOLDER_GREEN,
  HOLDER_RED,
  HOLDER_BLUE
};

// =======================================================
// SYSTEM SETTINGS
// =======================================================
const byte REQUIRED_STABLE = 3;
const byte MAX_DISPENSER_ATTEMPTS = 20;
const byte SERVO_STEP = 5;

// Gentle motion: ramp each servo in small steps instead of one jump.
const byte SERVO_RAMP_STEP_DEG = 2;
const unsigned int SERVO_RAMP_DELAY_MS = 22;
const unsigned int SERVO_INTER_JOINT_SETTLE_MS = 120;

const bool AUTO_RUN_AFTER_BOOT = false;

// =======================================================
// SAFE SERVO LIMITS
// =======================================================
const byte ELBOW_MIN_SAFE   = 0;
const byte ELBOW_MAX_SAFE   = 180;

const byte FOREARM_MIN_SAFE = 20;
const byte FOREARM_MAX_SAFE = 160;

const byte WRIST_MIN_SAFE   = 0;
const byte WRIST_MAX_SAFE   = 180;

// Wide hand range for finding the real open/closed angles.
// Once you know the real safe values, you can tighten this later.
const byte HAND_MIN_SAFE    = 20;
const byte HAND_MAX_SAFE    = 140;

// Temporary wide values.
// If direction is reversed, swap these after testing.
byte HAND_OPEN   = 120;
byte HAND_CLOSED = 35;
byte manualHandAngle = HAND_OPEN;
// =======================================================
// ARM POSES
// =======================================================
ArmPose currentPose = {90, 90, 90, 120};

ArmPose dispenserPickupPose = {90, 90, 90, 120};
ArmPose dispenserReturnPose = {90, 90, 90, 120};
ArmPose sensorPose          = {90, 90, 90, 120};

ArmPose holderPose[NUM_HOLDERS] = {
  {90, 90, 90, 120},
  {90, 90, 90, 120},
  {90, 90, 90, 120},
  {90, 90, 90, 120}
};

// =======================================================
// COLOR CALIBRATION DATA
// =======================================================
int saved[NUM_COLORS][3];

bool calibrated = false;
bool armCalibrated = false;

// =======================================================
// EEPROM STORAGE
// =======================================================
struct CalibrationData {
  unsigned long magic;

  byte hasColorCalibration;
  byte hasArmCalibration;

  int colorData[NUM_COLORS][3];

  byte handOpen;
  byte handClosed;

  ArmPose dispenserPickup;
  ArmPose dispenserReturn;
  ArmPose sensor;
  ArmPose holders[NUM_HOLDERS];
};

// Changed magic number so old EEPROM hand values are ignored.
const unsigned long EEPROM_MAGIC = 0xB011C0E2;

// =======================================================
// SMALL HELPERS
// =======================================================
byte clampSpecificServo(byte value, byte minVal, byte maxVal) {
  if (value < minVal) return minVal;
  if (value > maxVal) return maxVal;
  return value;
}

void enforcePoseLimits(ArmPose &p) {
  p.elbow   = clampSpecificServo(p.elbow,   ELBOW_MIN_SAFE,   ELBOW_MAX_SAFE);
  p.forearm = clampSpecificServo(p.forearm, FOREARM_MIN_SAFE, FOREARM_MAX_SAFE);
  p.wrist   = clampSpecificServo(p.wrist,   WRIST_MIN_SAFE,   WRIST_MAX_SAFE);
  p.hand    = clampSpecificServo(p.hand,    HAND_MIN_SAFE,    HAND_MAX_SAFE);
}

void adjustServoAngle(byte &angle, int delta, byte minVal, byte maxVal) {
  int nextValue = (int)angle + delta;

  if (nextValue < minVal) nextValue = minVal;
  if (nextValue > maxVal) nextValue = maxVal;

  angle = (byte)nextValue;
}

void enforceHandLimits() {
  HAND_OPEN = clampSpecificServo(HAND_OPEN, HAND_MIN_SAFE, HAND_MAX_SAFE);
  HAND_CLOSED = clampSpecificServo(HAND_CLOSED, HAND_MIN_SAFE, HAND_MAX_SAFE);

  if (HAND_OPEN == HAND_CLOSED) {
    Serial.println(F("Hand open/closed are identical. Resetting hand range."));
    HAND_OPEN = 120;
    HAND_CLOSED = 60;
  }
}

// =======================================================
// SETUP
// =======================================================
void setup() {
  pinMode(G, OUTPUT);
  pinMode(R, OUTPUT);
  pinMode(B, OUTPUT);

  pinMode(DATA_PIN, OUTPUT);
  pinMode(LATCH_PIN, OUTPUT);
  pinMode(CLOCK_PIN, OUTPUT);

  pinMode(HOLDER_YELLOW, INPUT);
  pinMode(HOLDER_GREEN, INPUT);
  pinMode(HOLDER_RED, INPUT);
  pinMode(HOLDER_BLUE, INPUT);

  elbow.attach(ELBOW_PIN);
  forearm.attach(FOREARM_PIN);
  wrist.attach(WRIST_PIN);
  hand.attach(HAND_PIN);

  Serial.begin(9600);

  off();
  clearDisplay();

  if (loadCalibration()) {
    Serial.println(F("Saved calibration loaded from EEPROM."));
  } else {
    Serial.println(F("No saved calibration found."));
  }

  enforceHandLimits();

  // Safe startup. Do not close the gripper on startup.
  currentPose.elbow = 90;
  currentPose.forearm = 90;
  currentPose.wrist = 90;
  currentPose.hand = HAND_OPEN;

  moveToPose(currentPose);

  Serial.print(F("Startup hand open angle: "));
  Serial.println(HAND_OPEN);
manualHandAngle = HAND_OPEN;
moveHandToAngle(HAND_OPEN);

  Serial.println(F("Commands:"));
  Serial.println(F("t = calibrate colors"));
  Serial.println(F("a = calibrate arm positions"));
  Serial.println(F("v = print calibration"));
  Serial.println(F("h = print holder sensors"));
  Serial.println(F("r = run audit/repair cycle"));
  Serial.println(F("p = print saved colors"));
  Serial.println(F("x = test all servos"));
  Serial.println(F("j = test hand only"));
  Serial.println(F("z = reset EEPROM calibration"));
  Serial.println(F("g/G = manually move hand -/+"));
  Serial.println(F("O = open hand"));
  Serial.println(F("C = close hand"));
  Serial.println(F("0/1/2/3/4/5/6 = hand angle test: 0/30/60/90/120/150/180"));

  if (AUTO_RUN_AFTER_BOOT && calibrated && armCalibrated) {
    runAuditRepairCycle();
  }
}

// =======================================================
// LOOP
// =======================================================
void loop() {
  if (Serial.available()) {
    char cmd = Serial.read();

    if (cmd == 't' || cmd == 'T') calibrateColors();
    if (cmd == 'a' || cmd == 'A') calibrateArm();
    if (cmd == 'v' || cmd == 'V') printCalibration();
    if (cmd == 'h' || cmd == 'H') printHolderValues();
    if (cmd == 'r' || cmd == 'R') runAuditRepairCycle();
    if (cmd == 'p' || cmd == 'P') printColors();
    if (cmd == 'x' || cmd == 'X') testServos();
    if (cmd == 'j' || cmd == 'J') testHandOnly();
    if (cmd == 'z' || cmd == 'Z') resetCalibration();

    // Direct hand angle tests
    if (cmd == '0') moveHandToAngle(0);
    if (cmd == '1') moveHandToAngle(30);
    if (cmd == '2') moveHandToAngle(60);
    if (cmd == '3') moveHandToAngle(90);
    if (cmd == '4') moveHandToAngle(120);
    if (cmd == '5') moveHandToAngle(150);
    if (cmd == '6') moveHandToAngle(180);

    // Direct hand controls outside calibration
    if (cmd == 'O') openHand();
    if (cmd == 'C') closeHand();

   if (cmd == 'g') {
  adjustServoAngle(manualHandAngle, -SERVO_STEP, HAND_MIN_SAFE, HAND_MAX_SAFE);
  moveHandToAngle(manualHandAngle);
}

if (cmd == 'G') {
  adjustServoAngle(manualHandAngle, SERVO_STEP, HAND_MIN_SAFE, HAND_MAX_SAFE);
  moveHandToAngle(manualHandAngle);
}

    while (Serial.available()) Serial.read();
  }
}

// =======================================================
// ORIGINAL COLOR SENSOR FUNCTIONS
// delay(300) and delay(100) retained
// =======================================================
void off() {
  digitalWrite(G, LOW);
  digitalWrite(R, LOW);
  digitalWrite(B, LOW);
}

int avgRead() {
  long total = 0;

  for (byte i = 0; i < 10; i++) {
    total += analogRead(S);
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
  x[0] = readOne(G);
  x[1] = readOne(R);
  x[2] = readOne(B);
}

long distColor(int a[3], int b[3]) {
  long x = a[0] - b[0];
  long y = a[1] - b[1];
  long z = a[2] - b[2];

  return x * x + y * y + z * z;
}

byte bestMatch(int x[3]) {
  byte best = 0;
  long bestD = distColor(x, saved[0]);

  for (byte i = 1; i < NUM_COLORS; i++) {
    long d = distColor(x, saved[i]);

    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }

  return best;
}

byte scanStableColor() {
  int last = -1;
  byte count = 0;

  while (count < REQUIRED_STABLE) {
    int now[3];
    getColor(now);

    byte match = bestMatch(now);

    if (match == last) {
      count++;
    } else {
      last = match;
      count = 1;
    }

    delay(50);
  }

  showColorLetter((byte)last);

  Serial.print(F("Stable color scanned: "));
  printlnName((byte)last);

  return (byte)last;
}

// =======================================================
// COLOR CALIBRATION
// =======================================================
void waitEnter() {
  Serial.println(F("Press Enter"));
  while (!Serial.available()) {}

  while (Serial.available()) {
    Serial.read();
  }
}

void calibrateColors() {
  Serial.println(F("COLOR CALIBRATION START"));
  calibrated = false;

  for (byte i = 0; i < NUM_COLORS; i++) {
    Serial.print(F("Place "));
    printName(i);

    if (i == 4) {
      Serial.println(F(" state"));
    } else {
      Serial.println(F(" ball"));
    }

    waitEnter();

    int temp[3];
    getColor(temp);

    saved[i][0] = temp[0];
    saved[i][1] = temp[1];
    saved[i][2] = temp[2];

    printName(i);
    Serial.println(F(" saved"));
  }

  calibrated = true;
  saveCalibration();

  Serial.println(F("COLOR CALIBRATION DONE"));
  printColors();
}

// =======================================================
// ARM CALIBRATION
// =======================================================
void calibrateArm() {
  Serial.println(F("ARM CALIBRATION START"));
  Serial.println(F("Commands:"));
  Serial.println(F("e/E = elbow -/+"));
  Serial.println(F("f/F = forearm -/+"));
  Serial.println(F("w/W = wrist -/+"));
  Serial.println(F("g/G = hand -/+"));
  Serial.println(F("o = save current hand angle as OPEN"));
  Serial.println(F("c = save current hand angle as CLOSED"));
  Serial.println(F("O = move hand to saved OPEN"));
  Serial.println(F("C = move hand to saved CLOSED"));
  Serial.println(F("s = save current arm position"));

  armCalibrated = false;

  calibrateOnePose(F("DISPENSER PICKUP POSITION"), dispenserPickupPose);
  calibrateOnePose(F("COLOR SENSOR POSITION"), sensorPose);
  calibrateOnePose(F("DISPENSER RETURN / REJECT POSITION"), dispenserReturnPose);

  calibrateOnePose(F("YELLOW HOLDER POSITION"), holderPose[0]);
  calibrateOnePose(F("GREEN HOLDER POSITION"), holderPose[1]);
  calibrateOnePose(F("RED HOLDER POSITION"), holderPose[2]);
  calibrateOnePose(F("BLUE HOLDER POSITION"), holderPose[3]);

  armCalibrated = true;
  saveCalibration();

  Serial.println(F("ARM CALIBRATION DONE"));
  printCalibration();
}

void calibrateOnePose(const __FlashStringHelper* label, ArmPose &targetPose) {
  Serial.println();
  Serial.print(F("Move arm to "));
  Serial.println(label);
  Serial.println(F("Type s to save."));

  bool savedPosition = false;

  while (!savedPosition) {
    if (Serial.available()) {
      char cmd = Serial.read();

      if (cmd == '\n' || cmd == '\r') continue;

      if (cmd == 'e') adjustServoAngle(currentPose.elbow, -SERVO_STEP, ELBOW_MIN_SAFE, ELBOW_MAX_SAFE);
      if (cmd == 'E') adjustServoAngle(currentPose.elbow,  SERVO_STEP, ELBOW_MIN_SAFE, ELBOW_MAX_SAFE);

      if (cmd == 'f') adjustServoAngle(currentPose.forearm, -SERVO_STEP, FOREARM_MIN_SAFE, FOREARM_MAX_SAFE);
      if (cmd == 'F') adjustServoAngle(currentPose.forearm,  SERVO_STEP, FOREARM_MIN_SAFE, FOREARM_MAX_SAFE);

      if (cmd == 'w') adjustServoAngle(currentPose.wrist, -SERVO_STEP, WRIST_MIN_SAFE, WRIST_MAX_SAFE);
      if (cmd == 'W') adjustServoAngle(currentPose.wrist,  SERVO_STEP, WRIST_MIN_SAFE, WRIST_MAX_SAFE);

      if (cmd == 'g') adjustServoAngle(currentPose.hand, -SERVO_STEP, HAND_MIN_SAFE, HAND_MAX_SAFE);
      if (cmd == 'G') adjustServoAngle(currentPose.hand,  SERVO_STEP, HAND_MIN_SAFE, HAND_MAX_SAFE);

      if (cmd == 'o') {
        HAND_OPEN = currentPose.hand;
        enforceHandLimits();
        Serial.print(F("HAND_OPEN saved as: "));
        Serial.println(HAND_OPEN);
      }

      if (cmd == 'c') {
        HAND_CLOSED = currentPose.hand;
        enforceHandLimits();
        Serial.print(F("HAND_CLOSED saved as: "));
        Serial.println(HAND_CLOSED);
      }

      if (cmd == 'O') {
        currentPose.hand = HAND_OPEN;
      }

      if (cmd == 'C') {
        currentPose.hand = HAND_CLOSED;
      }

      enforcePoseLimits(currentPose);

      moveToCalibrationPose(currentPose);
      printPose(F("Current"), currentPose);

      if (cmd == 's' || cmd == 'S') {
        targetPose = currentPose;
        enforcePoseLimits(targetPose);

        Serial.print(label);
        Serial.println(F(" saved."));
        printPose(F("Saved"), targetPose);

        savedPosition = true;
      }
    }
  }
}

// =======================================================
// ARM MOVEMENT
// =======================================================
void rampServoAngle(Servo &srv, int startDeg, int endDeg) {
  startDeg = constrain(startDeg, 0, 180);
  endDeg = constrain(endDeg, 0, 180);

  if (startDeg == endDeg) {
    srv.write(endDeg);
    return;
  }

  int step = (endDeg > startDeg) ? (int)SERVO_RAMP_STEP_DEG : -(int)SERVO_RAMP_STEP_DEG;
  int pos = startDeg;

  while (true) {
    if ((step > 0 && pos + step >= endDeg) || (step < 0 && pos + step <= endDeg)) {
      srv.write(endDeg);
      break;
    }
    pos += step;
    srv.write(pos);
    delay(SERVO_RAMP_DELAY_MS);
  }
}

void moveToCalibrationPose(ArmPose p) {
  enforcePoseLimits(p);

  rampServoAngle(elbow, currentPose.elbow, p.elbow);
  currentPose.elbow = p.elbow;
  delay(SERVO_INTER_JOINT_SETTLE_MS);

  rampServoAngle(forearm, currentPose.forearm, p.forearm);
  currentPose.forearm = p.forearm;
  delay(SERVO_INTER_JOINT_SETTLE_MS);

  rampServoAngle(wrist, currentPose.wrist, p.wrist);
  currentPose.wrist = p.wrist;
  delay(SERVO_INTER_JOINT_SETTLE_MS);

  rampServoAngle(hand, currentPose.hand, p.hand);
  currentPose.hand = p.hand;
  delay(SERVO_INTER_JOINT_SETTLE_MS);
}

void moveToPose(ArmPose p) {
  enforcePoseLimits(p);

  rampServoAngle(elbow, currentPose.elbow, p.elbow);
  currentPose.elbow = p.elbow;
  delay(SERVO_INTER_JOINT_SETTLE_MS);

  rampServoAngle(forearm, currentPose.forearm, p.forearm);
  currentPose.forearm = p.forearm;
  delay(SERVO_INTER_JOINT_SETTLE_MS);

  rampServoAngle(wrist, currentPose.wrist, p.wrist);
  currentPose.wrist = p.wrist;
  delay(SERVO_INTER_JOINT_SETTLE_MS);

  // Do NOT write p.hand here.
  // Hand is controlled only by openHand(), closeHand(), or calibration movement.
  delay(SERVO_INTER_JOINT_SETTLE_MS);
}

void openHand() {
  enforceHandLimits();

  Serial.print(F("Opening hand to: "));
  Serial.println(HAND_OPEN);

  moveHandToAngle(HAND_OPEN);
}

void closeHand() {
  enforceHandLimits();

  Serial.print(F("Closing hand to: "));
  Serial.println(HAND_CLOSED);

  moveHandToAngle(HAND_CLOSED);
}

void pickBallFromPose(ArmPose pose) {
  Serial.println(F("Picking ball from pose..."));

  openHand();
  delay(300);

  moveToPose(pose);
  delay(300);

  closeHand();
  delay(300);
}

void placeBallAtPose(ArmPose pose) {
  Serial.println(F("Placing ball at pose..."));

  moveToPose(pose);
  delay(300);

  openHand();
  delay(300);
}

byte moveBallToSensorAndScan(ArmPose sourcePose) {
  pickBallFromPose(sourcePose);
  placeBallAtPose(sensorPose);

  delay(500);

  byte detected = scanStableColor();

  Serial.print(F("Sensor detected: "));
  printlnName(detected);

  return detected;
}

void moveBallFromSensorToPose(ArmPose destinationPose) {
  pickBallFromPose(sensorPose);
  placeBallAtPose(destinationPose);
}

// =======================================================
// HOLDER AUDIT + REPAIR LOGIC
// =======================================================
bool holderOccupied(byte holderIndex) {
  int value = analogRead(holderPins[holderIndex]);

  printName(holderIndex);
  Serial.print(F(" holder sensor: "));
  Serial.println(value);

  return value > HOLDER_THRESHOLD;
}

void runAuditRepairCycle() {
  if (!calibrated || !armCalibrated) {
    Serial.println(F("ERROR: Calibrate colors and arm first."));
    return;
  }

  Serial.println(F("=== AUDIT / REPAIR CYCLE START ==="));

  bool correctColorAlreadyPresent[NUM_HOLDERS] = {
    false, false, false, false
  };

  bool holderNeedsRepair[NUM_HOLDERS] = {
    false, false, false, false
  };

  for (byte holder = 0; holder < NUM_HOLDERS; holder++) {
    Serial.println();
    Serial.print(F("Checking "));
    printName(holder);
    Serial.println(F(" holder..."));

    if (!holderOccupied(holder)) {
      Serial.println(F("Holder empty. Marking for repair."));
      holderNeedsRepair[holder] = true;
      continue;
    }

    byte scannedColor = moveBallToSensorAndScan(holderPose[holder]);

    bool correctSlot = (scannedColor == holder);
    bool validColor = (scannedColor < NUM_HOLDERS);
    bool duplicateColor = false;

    if (validColor) {
      if (correctColorAlreadyPresent[scannedColor]) {
        duplicateColor = true;
      }
    }

    if (correctSlot && !duplicateColor) {
      Serial.println(F("Correct ball in correct holder."));
      correctColorAlreadyPresent[holder] = true;
      moveBallFromSensorToPose(holderPose[holder]);
    } else {
      Serial.println(F("Wrong, duplicate, or no-ball reading."));
      Serial.println(F("Returning ball to dispenser."));
      moveBallFromSensorToPose(dispenserReturnPose);
      holderNeedsRepair[holder] = true;
    }
  }

  for (byte holder = 0; holder < NUM_HOLDERS; holder++) {
    if (holderNeedsRepair[holder]) {
      Serial.println();
      Serial.print(F("Repairing "));
      printName(holder);
      Serial.println(F(" holder..."));

      bool found = searchDispenserForColor(holder);

      if (found) {
        Serial.print(F("Correct "));
        printName(holder);
        Serial.println(F(" ball found. Moving from sensor to holder."));
        moveBallFromSensorToPose(holderPose[holder]);
      } else {
        Serial.print(F("FAILED: Could not find "));
        printName(holder);
        Serial.println(F(" ball in dispenser."));
      }
    }
  }

  Serial.println(F("=== AUDIT / REPAIR CYCLE COMPLETE ==="));
}

// =======================================================
// DISPENSER SEARCH LOGIC
// =======================================================
bool searchDispenserForColor(byte targetColor) {
  Serial.print(F("Searching dispenser for "));
  printlnName(targetColor);

  for (byte attempt = 1; attempt <= MAX_DISPENSER_ATTEMPTS; attempt++) {
    Serial.print(F("Dispenser attempt "));
    Serial.println(attempt);

    byte scannedColor = moveBallToSensorAndScan(dispenserPickupPose);

    if (scannedColor == targetColor) {
      Serial.println(F("Target color found."));
      return true;
    }

    if (scannedColor == 4) {
      Serial.println(F("No ball detected on sensor after pickup."));
    } else {
      Serial.print(F("Wrong color found: "));
      printlnName(scannedColor);
    }

    moveBallFromSensorToPose(dispenserReturnPose);

    delay(500);
  }

  Serial.println(F("Target color not found within attempt limit."));
  return false;
}

// =======================================================
// EEPROM SAVE / LOAD
// =======================================================
void saveCalibration() {
  CalibrationData config;

  config.magic = EEPROM_MAGIC;

  config.hasColorCalibration = calibrated ? 1 : 0;
  config.hasArmCalibration = armCalibrated ? 1 : 0;

  for (byte i = 0; i < NUM_COLORS; i++) {
    for (byte j = 0; j < 3; j++) {
      config.colorData[i][j] = saved[i][j];
    }
  }

  enforceHandLimits();

  config.handOpen = HAND_OPEN;
  config.handClosed = HAND_CLOSED;

  config.dispenserPickup = dispenserPickupPose;
  config.dispenserReturn = dispenserReturnPose;
  config.sensor = sensorPose;

  for (byte i = 0; i < NUM_HOLDERS; i++) {
    config.holders[i] = holderPose[i];
  }

  EEPROM.put(0, config);

  Serial.println(F("Calibration saved to EEPROM."));
}

bool loadCalibration() {
  CalibrationData config;

  EEPROM.get(0, config);

  if (config.magic != EEPROM_MAGIC) {
    calibrated = false;
    armCalibrated = false;
    return false;
  }

  calibrated = (config.hasColorCalibration == 1);
  armCalibrated = (config.hasArmCalibration == 1);

  for (byte i = 0; i < NUM_COLORS; i++) {
    for (byte j = 0; j < 3; j++) {
      saved[i][j] = config.colorData[i][j];
    }
  }

  HAND_OPEN = config.handOpen;
  HAND_CLOSED = config.handClosed;
  enforceHandLimits();

  dispenserPickupPose = config.dispenserPickup;
  dispenserReturnPose = config.dispenserReturn;
  sensorPose = config.sensor;

  for (byte i = 0; i < NUM_HOLDERS; i++) {
    holderPose[i] = config.holders[i];
  }

  enforcePoseLimits(dispenserPickupPose);
  enforcePoseLimits(dispenserReturnPose);
  enforcePoseLimits(sensorPose);

  for (byte i = 0; i < NUM_HOLDERS; i++) {
    enforcePoseLimits(holderPose[i]);
  }

  return calibrated || armCalibrated;
}

void resetCalibration() {
  Serial.println(F("RESETTING EEPROM CALIBRATION..."));

  for (int i = 0; i < EEPROM.length(); i++) {
    EEPROM.write(i, 0);
  }

  calibrated = false;
  armCalibrated = false;

  HAND_OPEN = 120;
  HAND_CLOSED = 35
  ;

  currentPose = {90, 90, 90, HAND_OPEN};

  dispenserPickupPose = {90, 90, 90, HAND_OPEN};
  dispenserReturnPose = {90, 90, 90, HAND_OPEN};
  sensorPose = {90, 90, 90, HAND_OPEN};

  for (byte i = 0; i < NUM_HOLDERS; i++) {
    holderPose[i] = {90, 90, 90, HAND_OPEN};
  }

manualHandAngle = HAND_OPEN;
moveHandToAngle(HAND_OPEN);

  Serial.println(F("EEPROM reset complete."));
  Serial.println(F("Recalibrate colors with t and arm with a."));
}

// =======================================================
// DISPLAY FUNCTIONS
// =======================================================
void sendToDisplay(byte pattern) {
  digitalWrite(LATCH_PIN, LOW);
  shiftOut(DATA_PIN, CLOCK_PIN, LSBFIRST, pattern);
  digitalWrite(LATCH_PIN, HIGH);
}

void clearDisplay() {
  sendToDisplay(0);
}

void showColorLetter(byte colorIndex) {
  byte pattern = 0;

  if (colorIndex == 0) {
    pattern = (1 << 2) | (1 << 1) | (1 << 6) | (1 << 5) | (1 << 4); // y
  }

  if (colorIndex == 1) {
    pattern = (1 << 2) | (1 << 7) | (1 << 1) | (1 << 6) | (1 << 5) | (1 << 4); // g
  }

  if (colorIndex == 2) {
    pattern = (1 << 3) | (1 << 1); // r
  }

  if (colorIndex == 3) {
    pattern = (1 << 2) | (1 << 1) | (1 << 5) | (1 << 3) | (1 << 4); // b
  }

  if (colorIndex == 4) {
    pattern = (1 << 7) | (1 << 1) | (1 << 4); // ?
  }

  sendToDisplay(pattern);
}

// =======================================================
// SERVO TESTS
// =======================================================
void moveHandToAngle(byte angle) {
  angle = clampSpecificServo(angle, HAND_MIN_SAFE, HAND_MAX_SAFE);

  Serial.print(F("Moving hand to angle: "));
  Serial.println(angle);

  rampServoAngle(hand, currentPose.hand, angle);
  manualHandAngle = angle;
  currentPose.hand = angle;

  delay(400);
}

void testServos() {
  Serial.println(F("=== SERVO TEST START ==="));

  Serial.println(F("Testing elbow on pin 5"));
  rampServoAngle(elbow, currentPose.elbow, 60);
  currentPose.elbow = 60;
  delay(300);
  rampServoAngle(elbow, currentPose.elbow, 120);
  currentPose.elbow = 120;
  delay(300);
  rampServoAngle(elbow, currentPose.elbow, 90);
  currentPose.elbow = 90;
  delay(300);

  Serial.println(F("Testing forearm on pin 6"));
  rampServoAngle(forearm, currentPose.forearm, 60);
  currentPose.forearm = 60;
  delay(300);
  rampServoAngle(forearm, currentPose.forearm, 120);
  currentPose.forearm = 120;
  delay(300);
  rampServoAngle(forearm, currentPose.forearm, 90);
  currentPose.forearm = 90;
  delay(300);

  Serial.println(F("Testing wrist on pin 9"));
  rampServoAngle(wrist, currentPose.wrist, 60);
  currentPose.wrist = 60;
  delay(300);
  rampServoAngle(wrist, currentPose.wrist, 120);
  currentPose.wrist = 120;
  delay(300);
  rampServoAngle(wrist, currentPose.wrist, 90);
  currentPose.wrist = 90;
  delay(300);

  Serial.println(F("Testing hand on pin 11"));
  moveHandToAngle(HAND_OPEN);
  delay(400);
  moveHandToAngle(HAND_CLOSED);
  delay(400);
  moveHandToAngle(HAND_OPEN);
  delay(400);

  currentPose.elbow = 90;
  currentPose.forearm = 90;
  currentPose.wrist = 90;
  currentPose.hand = HAND_OPEN;

  Serial.println(F("=== SERVO TEST END ==="));
}

void testHandOnly() {
  enforceHandLimits();

  Serial.println(F("=== HAND ONLY TEST ==="));

  Serial.print(F("HAND_OPEN = "));
  Serial.println(HAND_OPEN);

  Serial.print(F("HAND_CLOSED = "));
  Serial.println(HAND_CLOSED);

  Serial.println(F("Opening..."));
  moveHandToAngle(HAND_OPEN);
  delay(1000);

  Serial.println(F("Closing..."));
  moveHandToAngle(HAND_CLOSED);
  delay(1000);

  Serial.println(F("Opening again..."));
  moveHandToAngle(HAND_OPEN);
  delay(1000);

  currentPose.hand = HAND_OPEN;

  Serial.println(F("=== HAND TEST DONE ==="));
}

// =======================================================
// PRINT / DEBUG FUNCTIONS
// =======================================================
void printColors() {
  for (byte i = 0; i < NUM_COLORS; i++) {
    printName(i);
    Serial.print(F(": "));
    Serial.print(saved[i][0]);
    Serial.print(F(", "));
    Serial.print(saved[i][1]);
    Serial.print(F(", "));
    Serial.println(saved[i][2]);
  }
}

void printPose(const __FlashStringHelper* label, ArmPose p) {
  Serial.print(label);
  Serial.print(F(" Pose -> E: "));
  Serial.print(p.elbow);
  Serial.print(F(" | F: "));
  Serial.print(p.forearm);
  Serial.print(F(" | W: "));
  Serial.print(p.wrist);
  Serial.print(F(" | H: "));
  Serial.println(p.hand);
}

void printHolderPose(byte holderIndex, ArmPose p) {
  printName(holderIndex);
  Serial.print(F(" Holder Pose -> E: "));
  Serial.print(p.elbow);
  Serial.print(F(" | F: "));
  Serial.print(p.forearm);
  Serial.print(F(" | W: "));
  Serial.print(p.wrist);
  Serial.print(F(" | H: "));
  Serial.println(p.hand);
}

void printCalibration() {
  Serial.println(F("=== CALIBRATION DATA ==="));

  Serial.println(F("--- Colors ---"));
  printColors();

  Serial.println(F("--- Arm Poses ---"));
  printPose(F("Dispenser Pickup"), dispenserPickupPose);
  printPose(F("Color Sensor"), sensorPose);
  printPose(F("Dispenser Return"), dispenserReturnPose);

  for (byte i = 0; i < NUM_HOLDERS; i++) {
    printHolderPose(i, holderPose[i]);
  }

  Serial.print(F("HAND_OPEN: "));
  Serial.println(HAND_OPEN);

  Serial.print(F("HAND_CLOSED: "));
  Serial.println(HAND_CLOSED);

  Serial.println(F("========================"));
}

void printHolderValues() {
  Serial.println(F("Holder analog values:"));

  Serial.print(F("Yellow holder: "));
  Serial.println(analogRead(HOLDER_YELLOW));

  Serial.print(F("Green holder: "));
  Serial.println(analogRead(HOLDER_GREEN));

  Serial.print(F("Red holder: "));
  Serial.println(analogRead(HOLDER_RED));

  Serial.print(F("Blue holder: "));
  Serial.println(analogRead(HOLDER_BLUE));
}