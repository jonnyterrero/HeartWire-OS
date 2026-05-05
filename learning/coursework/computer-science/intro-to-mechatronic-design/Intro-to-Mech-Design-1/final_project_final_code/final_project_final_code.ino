// =======================================================
// BALL SORT INTEGRATED SKETCH
// User-defined target sequence (Y/G/R/B), 4-DOF arm,
// photoresistor color detector, 4-slot holder, dispenser.
//
// Ultrasonic / range-sensor logic from the standalone arm
// sketch is intentionally NOT used here.
//
// Hardware constraints:
//   - Dispenser holds at most 4 balls.
//   - Holder has exactly 4 spots.
//   - Color detector holds at most 1 ball.
//   - 8 balls total in the system.
//
// Initial state per project spec:
//   - Dispenser: 1 of each color (Y, G, R, B) -> 4 balls.
//   - Holder:    any combination of 4 balls.
// =======================================================

#include <Servo.h>
#include <EEPROM.h>
#include <avr/pgmspace.h>

// =======================================================
// COLOR ENUM
// =======================================================
enum Color : byte {
  COLOR_YELLOW  = 0,
  COLOR_GREEN   = 1,
  COLOR_RED     = 2,
  COLOR_BLUE    = 3,
  COLOR_NONE    = 4,
  COLOR_UNKNOWN = 255
};

const byte NUM_BALL_COLORS = 4;   // Y, G, R, B
const byte NUM_COLORS      = 5;   // includes COLOR_NONE for empty-sensor calibration
const byte NUM_HOLDERS     = 4;

// =======================================================
// ARM POSE TYPE
// =======================================================
typedef struct {
  byte elbow;
  byte forearm;
  byte wrist;
  byte hand;
} ArmPose;

// =======================================================
// FORWARD DECLARATIONS
// =======================================================
void moveToPose(ArmPose p);
void pickBallFromPose(ArmPose pose);
void placeBallAtPose(ArmPose pose);
byte moveBallToSensorAndScan(ArmPose sourcePose);
void moveBallFromSensorToPose(ArmPose destinationPose);
void calibrateOnePose(const __FlashStringHelper* label, ArmPose &targetPose);
void printPose(const __FlashStringHelper* label, ArmPose p);
void printSpotPose(byte spotIndex, ArmPose p);

bool runAudit();
bool checkFeasibility();
bool runRepair();
bool repairSpot(byte i);
void runFullCycle();
bool readTargetSequence();
void printHelp();

void calibrateColors();
void calibrateArm();
void printCalibration();
void printColors();
void printHolderValues();

void saveCalibration();
bool loadCalibration();

void off();
int  avgRead();
int  readOne(int ledPin);
void getColor(int x[3]);
long distColor(int a[3], int b[3]);
byte bestMatch(int x[3]);
byte scanStableColor();

void sendToDisplay(byte pattern);
void clearDisplay();
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
const int HAND_PIN    = 10;

Servo elbow;
Servo forearm;
Servo wrist;
Servo hand;

// =======================================================
// HOLDER PRESENCE SENSORS (one per spot, position-only)
// =======================================================
const int HOLDER_PIN_0 = A0;
const int HOLDER_PIN_1 = A1;
const int HOLDER_PIN_2 = A2;
const int HOLDER_PIN_3 = A4;
const int HOLDER_THRESHOLD = 500;

const int holderPins[NUM_HOLDERS] = {
  HOLDER_PIN_0, HOLDER_PIN_1, HOLDER_PIN_2, HOLDER_PIN_3
};

// =======================================================
// COLOR NAMES (PROGMEM)
// =======================================================
const char NAME_YELLOW[] PROGMEM = "Yellow";
const char NAME_GREEN[]  PROGMEM = "Green";
const char NAME_RED[]    PROGMEM = "Red";
const char NAME_BLUE[]   PROGMEM = "Blue";
const char NAME_NONE[]   PROGMEM = "No Ball";

const char* const colorNames[] PROGMEM = {
  NAME_YELLOW, NAME_GREEN, NAME_RED, NAME_BLUE, NAME_NONE
};

void printName(byte index) {
  if (index >= NUM_COLORS) {
    Serial.print(F("Unknown"));
    return;
  }
  char buffer[10];
  strcpy_P(buffer, (PGM_P)pgm_read_word(&(colorNames[index])));
  Serial.print(buffer);
}

void printlnName(byte index) {
  printName(index);
  Serial.println();
}

// =======================================================
// SYSTEM SETTINGS
// =======================================================
const byte REQUIRED_STABLE        = 3;
const byte MAX_DISPENSER_ATTEMPTS = 20;
const byte SERVO_STEP             = 5;

byte HAND_OPEN   = 35;
byte HAND_CLOSED = 85;

ArmPose currentPose         = {90, 90, 90, 35};
ArmPose dispenserPickupPose = {90, 90, 90, 35};
ArmPose dispenserReturnPose = {90, 90, 90, 35};
ArmPose sensorPose          = {90, 90, 90, 35};
ArmPose holderPose[NUM_HOLDERS] = {
  {90, 90, 90, 35},
  {90, 90, 90, 35},
  {90, 90, 90, 35},
  {90, 90, 90, 35}
};

// =======================================================
// COLOR + STATE DATA
// =======================================================
int  saved[NUM_COLORS][3];
bool calibrated    = false;
bool armCalibrated = false;

byte targetColor[NUM_HOLDERS] = {
  COLOR_UNKNOWN, COLOR_UNKNOWN, COLOR_UNKNOWN, COLOR_UNKNOWN
};
byte holderColor[NUM_HOLDERS] = {
  COLOR_UNKNOWN, COLOR_UNKNOWN, COLOR_UNKNOWN, COLOR_UNKNOWN
};
bool targetSet = false;

// Logical inventory; spec mandates 4 balls in dispenser at start.
byte dispenserCount = 4;

// =======================================================
// EEPROM STORAGE (versioned)
// =======================================================
struct CalibrationData {
  unsigned long magic;
  byte          version;
  int           colorData[NUM_COLORS][3];
  byte          handOpen;
  byte          handClosed;
  ArmPose       dispenserPickup;
  ArmPose       dispenserReturn;
  ArmPose       sensor;
  ArmPose       holders[NUM_HOLDERS];
};
const unsigned long EEPROM_MAGIC   = 0xB011C0DE;
const byte          EEPROM_VERSION = 2;

// =======================================================
// SETUP
// =======================================================
void setup() {
  pinMode(G, OUTPUT);
  pinMode(R, OUTPUT);
  pinMode(B, OUTPUT);

  pinMode(DATA_PIN,  OUTPUT);
  pinMode(LATCH_PIN, OUTPUT);
  pinMode(CLOCK_PIN, OUTPUT);

  for (byte i = 0; i < NUM_HOLDERS; i++) {
    pinMode(holderPins[i], INPUT);
  }

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

  moveToPose(currentPose);

  Serial.println(F("Type ? for command list."));
}

// =======================================================
// LOOP (command dispatcher)
// =======================================================
void loop() {
  if (Serial.available()) {
    char cmd = Serial.read();
    if (cmd == '\n' || cmd == '\r') return;

    switch (cmd) {
      case 't': case 'T': calibrateColors();    break;
      case 'a': case 'A': calibrateArm();       break;
      case 'v': case 'V': printCalibration();   break;
      case 'h': case 'H': printHolderValues();  break;
      case 'p': case 'P': printColors();        break;
      case 's': case 'S': readTargetSequence(); break;
      case 'r': case 'R': runFullCycle();       break;
      case '?':           printHelp();          break;
      default:                                  break;
    }
    while (Serial.available()) Serial.read();
  }
}

// =======================================================
// HELP
// =======================================================
void printHelp() {
  Serial.println(F("=== COMMANDS ==="));
  Serial.println(F("t = calibrate colors"));
  Serial.println(F("a = calibrate arm poses (Spot1..Spot4)"));
  Serial.println(F("v = print calibration"));
  Serial.println(F("h = print holder presence sensors"));
  Serial.println(F("p = print saved color RGB"));
  Serial.println(F("s = set target sequence (4 chars Y/G/R/B)"));
  Serial.println(F("r = run audit + feasibility + repair"));
  Serial.println(F("? = this help"));
}

// =======================================================
// COLOR SENSOR (preserved baseline timings: 300/100, 10x5ms)
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
  byte best  = 0;
  long bestD = distColor(x, saved[0]);
  for (byte i = 1; i < NUM_COLORS; i++) {
    long d = distColor(x, saved[i]);
    if (d < bestD) {
      bestD = d;
      best  = i;
    }
  }
  return best;
}

byte scanStableColor() {
  int  last  = -1;
  byte count = 0;
  while (count < REQUIRED_STABLE) {
    int now[3];
    getColor(now);
    byte match = bestMatch(now);
    if (match == last) {
      count++;
    } else {
      last  = match;
      count = 1;
    }
    delay(50);
  }
  showColorLetter((byte)last);
  Serial.print(F("Stable color: "));
  printlnName((byte)last);
  return (byte)last;
}

// =======================================================
// COLOR CALIBRATION
// =======================================================
void waitEnter() {
  Serial.println(F("Press Enter"));
  while (!Serial.available()) {}
  while (Serial.available()) Serial.read();
}

void calibrateColors() {
  Serial.println(F("COLOR CALIBRATION START"));
  calibrated = false;
  for (byte i = 0; i < NUM_COLORS; i++) {
    Serial.print(F("Place "));
    printName(i);
    if (i == COLOR_NONE) {
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
// ARM CALIBRATION (Spot1..Spot4 labeling)
// =======================================================
void calibrateArm() {
  Serial.println(F("ARM CALIBRATION START"));
  Serial.println(F("e/E = elbow -/+   f/F = forearm -/+"));
  Serial.println(F("w/W = wrist -/+   o = open hand   c = close hand"));
  Serial.println(F("s = save current position"));

  armCalibrated = false;
  calibrateOnePose(F("DISPENSER PICKUP"), dispenserPickupPose);
  calibrateOnePose(F("COLOR SENSOR"),     sensorPose);
  calibrateOnePose(F("DISPENSER RETURN"), dispenserReturnPose);
  calibrateOnePose(F("SPOT 1"), holderPose[0]);
  calibrateOnePose(F("SPOT 2"), holderPose[1]);
  calibrateOnePose(F("SPOT 3"), holderPose[2]);
  calibrateOnePose(F("SPOT 4"), holderPose[3]);
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
      if (cmd == 'e') currentPose.elbow   -= SERVO_STEP;
      if (cmd == 'E') currentPose.elbow   += SERVO_STEP;
      if (cmd == 'f') currentPose.forearm -= SERVO_STEP;
      if (cmd == 'F') currentPose.forearm += SERVO_STEP;
      if (cmd == 'w') currentPose.wrist   -= SERVO_STEP;
      if (cmd == 'W') currentPose.wrist   += SERVO_STEP;
      if (cmd == 'o') currentPose.hand    = HAND_OPEN;
      if (cmd == 'c') currentPose.hand    = HAND_CLOSED;
      currentPose.elbow   = constrain(currentPose.elbow,   0, 180);
      currentPose.forearm = constrain(currentPose.forearm, 0, 180);
      currentPose.wrist   = constrain(currentPose.wrist,   0, 180);
      currentPose.hand    = constrain(currentPose.hand,    0, 180);
      moveToPose(currentPose);
      printPose(F("Current"), currentPose);
      if (cmd == 's' || cmd == 'S') {
        targetPose = currentPose;
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
void moveToPose(ArmPose p) {
  elbow.write(p.elbow);     delay(250);
  forearm.write(p.forearm); delay(250);
  wrist.write(p.wrist);     delay(250);
  hand.write(p.hand);       delay(250);
  currentPose = p;
}

void openHand() {
  hand.write(HAND_OPEN);
  currentPose.hand = HAND_OPEN;
  delay(500);
}

void closeHand() {
  hand.write(HAND_CLOSED);
  currentPose.hand = HAND_CLOSED;
  delay(500);
}

void pickBallFromPose(ArmPose pose) {
  openHand();
  moveToPose(pose);
  closeHand();
}

void placeBallAtPose(ArmPose pose) {
  moveToPose(pose);
  openHand();
}

byte moveBallToSensorAndScan(ArmPose sourcePose) {
  pickBallFromPose(sourcePose);
  placeBallAtPose(sensorPose);
  delay(500);
  byte detected = scanStableColor();
  Serial.print(F("Sensor: "));
  printlnName(detected);
  return detected;
}

void moveBallFromSensorToPose(ArmPose destinationPose) {
  pickBallFromPose(sensorPose);
  placeBallAtPose(destinationPose);
}

// =======================================================
// HOLDER PRESENCE
// =======================================================
bool holderOccupied(byte spotIndex) {
  int value = analogRead(holderPins[spotIndex]);
  Serial.print(F("Spot "));
  Serial.print(spotIndex + 1);
  Serial.print(F(" presence: "));
  Serial.println(value);
  return value > HOLDER_THRESHOLD;
}

// =======================================================
// SERIAL: TARGET SEQUENCE
// =======================================================
byte charToColor(char c) {
  switch (c) {
    case 'Y': case 'y': return COLOR_YELLOW;
    case 'G': case 'g': return COLOR_GREEN;
    case 'R': case 'r': return COLOR_RED;
    case 'B': case 'b': return COLOR_BLUE;
  }
  return COLOR_UNKNOWN;
}

bool readTargetSequence() {
  Serial.println(F("Enter target sequence: 4 chars from Y/G/R/B"));
  Serial.println(F("Order maps to Spot 1..Spot 4. Example: BRYG"));

  while (Serial.available()) Serial.read();

  char buf[8];
  byte n = 0;
  unsigned long deadline = millis() + 60000UL;
  while (n < 6 && (long)(millis() - deadline) < 0) {
    if (Serial.available()) {
      char c = Serial.read();
      if (c == '\n' || c == '\r') {
        if (n > 0) break;
        continue;
      }
      buf[n++] = c;
    }
  }
  while (Serial.available()) Serial.read();

  if (n != 4) {
    Serial.println(F("ERROR: need exactly 4 chars."));
    return false;
  }

  byte tmp[NUM_HOLDERS];
  for (byte i = 0; i < NUM_HOLDERS; i++) {
    byte c = charToColor(buf[i]);
    if (c == COLOR_UNKNOWN || c == COLOR_NONE) {
      Serial.print(F("ERROR: invalid char '"));
      Serial.write(buf[i]);
      Serial.println(F("'. Use Y/G/R/B."));
      return false;
    }
    tmp[i] = c;
  }

  for (byte i = 0; i < NUM_HOLDERS; i++) targetColor[i] = tmp[i];
  targetSet = true;

  Serial.print(F("Target set: "));
  for (byte i = 0; i < NUM_HOLDERS; i++) {
    Serial.print(F("Spot "));
    Serial.print(i + 1);
    Serial.print(F("="));
    printName(targetColor[i]);
    if (i < NUM_HOLDERS - 1) Serial.print(F(", "));
  }
  Serial.println();
  return true;
}

// =======================================================
// AUDIT
// Pick from each spot, scan, return to same spot.
// dispenserCount stays at its entry value (4).
// =======================================================
bool runAudit() {
  Serial.println(F("--- AUDIT ---"));
  for (byte i = 0; i < NUM_HOLDERS; i++) {
    Serial.print(F("Auditing Spot "));
    Serial.println(i + 1);

    if (!holderOccupied(i)) {
      Serial.print(F("ERROR: Spot "));
      Serial.print(i + 1);
      Serial.println(F(" empty. Aborting."));
      return false;
    }

    byte scanned = moveBallToSensorAndScan(holderPose[i]);

    if (scanned >= NUM_BALL_COLORS) {
      Serial.print(F("ERROR: Spot "));
      Serial.print(i + 1);
      Serial.println(F(" scanned No Ball / unknown."));
      // Best-effort restore so the spot is not left empty.
      moveBallFromSensorToPose(holderPose[i]);
      return false;
    }

    holderColor[i] = scanned;
    Serial.print(F("Spot "));
    Serial.print(i + 1);
    Serial.print(F(" = "));
    printlnName(scanned);

    moveBallFromSensorToPose(holderPose[i]);
  }
  Serial.println(F("--- AUDIT OK ---"));
  return true;
}

// =======================================================
// FEASIBILITY
// total[c] = (1 from initial dispenser) + count(c in holder).
// need[c]  = count(c in target).
// Require total[c] >= need[c] for all c.
// =======================================================
bool checkFeasibility() {
  byte total[NUM_BALL_COLORS] = {1, 1, 1, 1};
  byte need[NUM_BALL_COLORS]  = {0, 0, 0, 0};

  for (byte i = 0; i < NUM_HOLDERS; i++) {
    if (holderColor[i] >= NUM_BALL_COLORS) return false;
    total[holderColor[i]]++;
  }
  for (byte i = 0; i < NUM_HOLDERS; i++) {
    if (targetColor[i] >= NUM_BALL_COLORS) return false;
    need[targetColor[i]]++;
  }

  Serial.println(F("--- FEASIBILITY ---"));
  bool ok = true;
  for (byte c = 0; c < NUM_BALL_COLORS; c++) {
    Serial.print(F("  "));
    printName(c);
    Serial.print(F(": have "));
    Serial.print(total[c]);
    Serial.print(F(", need "));
    Serial.println(need[c]);
    if (total[c] < need[c]) ok = false;
  }
  if (ok) Serial.println(F("Feasibility OK."));
  else    Serial.println(F("INFEASIBLE: target cannot be built from system inventory."));
  return ok;
}

// =======================================================
// REPAIR
//
// Per-spot invariant: dispenserCount == 4 on entry/exit.
//
// Search dispenser by cycling (pull -> scan -> return).
// On match, perform the swap dance:
//   1) sensor already holds the correct ball (D = 3)
//   2) pick wrong ball from spot i
//   3) place wrong ball into dispenser return     (D: 3 -> 4)
//   4) move correct ball from sensor to spot i
// =======================================================
bool repairSpot(byte i) {
  Serial.print(F("Repair Spot "));
  Serial.print(i + 1);
  Serial.print(F(" (have "));
  printName(holderColor[i]);
  Serial.print(F(", want "));
  printName(targetColor[i]);
  Serial.println(F(")"));

  for (byte attempt = 1; attempt <= MAX_DISPENSER_ATTEMPTS; attempt++) {
    Serial.print(F("  Dispenser attempt "));
    Serial.print(attempt);
    Serial.print(F("  (D="));
    Serial.print(dispenserCount);
    Serial.println(F(")"));

    byte scanned = moveBallToSensorAndScan(dispenserPickupPose);
    if (dispenserCount > 0) dispenserCount--;

    if (scanned == COLOR_NONE) {
      Serial.println(F("  No ball at sensor; assuming empty pickup. Retrying."));
      // The hand was opened, so the claw is empty either way; safest to
      // resync the count optimistically to the entry invariant.
      dispenserCount++;
      continue;
    }

    if (scanned >= NUM_BALL_COLORS) {
      Serial.println(F("  Unknown scan result; cycling."));
      moveBallFromSensorToPose(dispenserReturnPose);
      dispenserCount++;
      continue;
    }

    if (scanned == targetColor[i]) {
      // Swap dance.
      pickBallFromPose(holderPose[i]);
      placeBallAtPose(dispenserReturnPose);
      dispenserCount++;

      moveBallFromSensorToPose(holderPose[i]);
      holderColor[i] = targetColor[i];

      Serial.print(F("  Spot "));
      Serial.print(i + 1);
      Serial.println(F(" repaired."));
      return true;
    }

    // Wrong color: rotate dispenser.
    moveBallFromSensorToPose(dispenserReturnPose);
    dispenserCount++;
  }

  Serial.print(F("  FAILED to find "));
  printName(targetColor[i]);
  Serial.print(F(" for Spot "));
  Serial.println(i + 1);
  return false;
}

bool runRepair() {
  Serial.println(F("--- REPAIR ---"));
  for (byte i = 0; i < NUM_HOLDERS; i++) {
    if (holderColor[i] == targetColor[i]) {
      Serial.print(F("Spot "));
      Serial.print(i + 1);
      Serial.println(F(" already correct."));
      continue;
    }
    if (!repairSpot(i)) return false;
  }
  Serial.println(F("--- REPAIR DONE ---"));
  return true;
}

// =======================================================
// FULL CYCLE
// =======================================================
void runFullCycle() {
  if (!calibrated) {
    Serial.println(F("ERROR: run 't' to calibrate colors."));
    return;
  }
  if (!armCalibrated) {
    Serial.println(F("ERROR: run 'a' to calibrate arm."));
    return;
  }
  if (!targetSet) {
    Serial.println(F("ERROR: run 's' to set target sequence."));
    return;
  }

  dispenserCount = 4;  // spec: dispenser starts full

  Serial.println(F("=== START CYCLE ==="));
  if (!runAudit())         { Serial.println(F("=== ABORT ===")); return; }
  if (!checkFeasibility()) { Serial.println(F("=== ABORT ===")); return; }
  if (!runRepair())        { Serial.println(F("=== ABORT ===")); return; }
  Serial.println(F("=== CYCLE COMPLETE ==="));
}

// =======================================================
// EEPROM
// =======================================================
void saveCalibration() {
  CalibrationData config;
  config.magic   = EEPROM_MAGIC;
  config.version = EEPROM_VERSION;
  for (byte i = 0; i < NUM_COLORS; i++)
    for (byte j = 0; j < 3; j++)
      config.colorData[i][j] = saved[i][j];
  config.handOpen        = HAND_OPEN;
  config.handClosed      = HAND_CLOSED;
  config.dispenserPickup = dispenserPickupPose;
  config.dispenserReturn = dispenserReturnPose;
  config.sensor          = sensorPose;
  for (byte i = 0; i < NUM_HOLDERS; i++)
    config.holders[i] = holderPose[i];
  EEPROM.put(0, config);
  Serial.println(F("Calibration saved to EEPROM."));
}

bool loadCalibration() {
  CalibrationData config;
  EEPROM.get(0, config);
  if (config.magic != EEPROM_MAGIC) {
    calibrated    = false;
    armCalibrated = false;
    return false;
  }
  if (config.version != EEPROM_VERSION) {
    Serial.print(F("EEPROM version mismatch (got "));
    Serial.print(config.version);
    Serial.print(F(", want "));
    Serial.print(EEPROM_VERSION);
    Serial.println(F("). Recalibrate with 't' and 'a'."));
    calibrated    = false;
    armCalibrated = false;
    return false;
  }
  for (byte i = 0; i < NUM_COLORS; i++)
    for (byte j = 0; j < 3; j++)
      saved[i][j] = config.colorData[i][j];
  HAND_OPEN           = config.handOpen;
  HAND_CLOSED         = config.handClosed;
  dispenserPickupPose = config.dispenserPickup;
  dispenserReturnPose = config.dispenserReturn;
  sensorPose          = config.sensor;
  for (byte i = 0; i < NUM_HOLDERS; i++)
    holderPose[i] = config.holders[i];
  calibrated    = true;
  armCalibrated = true;
  return true;
}

// =======================================================
// 7-SEG DISPLAY
// =======================================================
void sendToDisplay(byte pattern) {
  digitalWrite(LATCH_PIN, LOW);
  shiftOut(DATA_PIN, CLOCK_PIN, LSBFIRST, pattern);
  digitalWrite(LATCH_PIN, HIGH);
}

void clearDisplay() { sendToDisplay(0); }

void showColorLetter(byte colorIndex) {
  byte pattern = 0;
  if (colorIndex == COLOR_YELLOW) pattern = (1 << 2) | (1 << 1) | (1 << 6) | (1 << 5) | (1 << 4);              // y
  if (colorIndex == COLOR_GREEN)  pattern = (1 << 2) | (1 << 7) | (1 << 1) | (1 << 6) | (1 << 5) | (1 << 4);   // g
  if (colorIndex == COLOR_RED)    pattern = (1 << 3) | (1 << 1);                                               // r
  if (colorIndex == COLOR_BLUE)   pattern = (1 << 2) | (1 << 1) | (1 << 5) | (1 << 3) | (1 << 4);              // b
  if (colorIndex == COLOR_NONE)   pattern = (1 << 7) | (1 << 1) | (1 << 4);                                    // ?
  sendToDisplay(pattern);
}

// =======================================================
// PRINT / DEBUG
// =======================================================
void printColors() {
  for (byte i = 0; i < NUM_COLORS; i++) {
    printName(i);
    Serial.print(F(": "));
    Serial.print(saved[i][0]); Serial.print(F(", "));
    Serial.print(saved[i][1]); Serial.print(F(", "));
    Serial.println(saved[i][2]);
  }
}

void printPose(const __FlashStringHelper* label, ArmPose p) {
  Serial.print(label);
  Serial.print(F(" -> E:")); Serial.print(p.elbow);
  Serial.print(F(" F:"));    Serial.print(p.forearm);
  Serial.print(F(" W:"));    Serial.print(p.wrist);
  Serial.print(F(" H:"));    Serial.println(p.hand);
}

void printSpotPose(byte spotIndex, ArmPose p) {
  Serial.print(F("Spot "));
  Serial.print(spotIndex + 1);
  Serial.print(F(" -> E:")); Serial.print(p.elbow);
  Serial.print(F(" F:"));    Serial.print(p.forearm);
  Serial.print(F(" W:"));    Serial.print(p.wrist);
  Serial.print(F(" H:"));    Serial.println(p.hand);
}

void printCalibration() {
  Serial.println(F("=== CALIBRATION ==="));
  Serial.println(F("--- Colors ---"));
  printColors();
  Serial.println(F("--- Poses ---"));
  printPose(F("Dispenser Pickup"), dispenserPickupPose);
  printPose(F("Color Sensor"),     sensorPose);
  printPose(F("Dispenser Return"), dispenserReturnPose);
  for (byte i = 0; i < NUM_HOLDERS; i++) printSpotPose(i, holderPose[i]);
  Serial.print(F("Target set: "));
  Serial.println(targetSet ? F("yes") : F("no"));
  if (targetSet) {
    for (byte i = 0; i < NUM_HOLDERS; i++) {
      Serial.print(F("  Spot "));
      Serial.print(i + 1);
      Serial.print(F(" = "));
      printlnName(targetColor[i]);
    }
  }
  Serial.println(F("==================="));
}

void printHolderValues() {
  Serial.println(F("Holder analog values:"));
  for (byte i = 0; i < NUM_HOLDERS; i++) {
    Serial.print(F("Spot "));
    Serial.print(i + 1);
    Serial.print(F(": "));
    Serial.println(analogRead(holderPins[i]));
  }
}
