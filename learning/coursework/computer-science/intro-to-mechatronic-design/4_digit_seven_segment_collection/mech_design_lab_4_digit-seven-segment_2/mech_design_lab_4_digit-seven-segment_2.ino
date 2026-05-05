/*
 * Expanding on last week's stepper code.
 * 28BYJ-48 stepper on pins 9,10,11,12 (ULN2003).
 * Now also drives a 4-digit 7-seg display (74HC595 + digit commons)
 * showing linear distance in mm (0000–0628) of a 50 mm arm tip.
 *
 * Forward: 0 → 628 mm (2 rotations), pause 2 s, reverse: 628 → 0 mm, repeat.
 * Serial monitor prints distance at each completed rotation.
 */

#define COMMON_ANODE 0

// ----- Motor pins (same as last week) -----
int motorPin1 = 9;
int motorPin2 = 10;
int motorPin3 = 11;
int motorPin4 = 12;

int direction_rotation = 1;   // 1 = one way, -1 = other way
int delayValue = 10;           // ms between steps — increase to slow motor down
int steps_per_revolution = 2048;
int stepCounter = 0;
int turnCounter = 0;
int stop_turn = 2;            // 2 full rotations = 628 mm

// ----- Arm geometry -----
const float ARM_RADIUS_MM = 50.0;
const float DIST_PER_REV  = 2.0 * PI * ARM_RADIUS_MM;  // ~314.16 mm
const int   MAX_DISTANCE  = 628;
const float STEPS_TO_MM   = DIST_PER_REV / 2048.0;     // precompute once

// ----- 74HC595 pins (same as your shift register sketch) -----
int latchPin = 2;   // pin 12 on 595
int dataPin  = 3;   // pin 14 on 595
int clockPin = 4;   // pin 11 on 595

// ----- Digit common pins (connect to each digit's common) -----
int digitPins[4] = {5, 6, 7, 8};  // digit 1 (thousands) → digit 4 (ones)

// ----- Segment table (bit order: DP G F E D C B A) -----
const byte SEGMENT_TABLE[10] = {
  0b00111111,   // 0
  0b00000110,   // 1
  0b01011011,   // 2
  0b01001111,   // 3
  0b01100110,   // 4
  0b01101101,   // 5
  0b01111101,   // 6
  0b00000111,   // 7
  0b01111111,   // 8
  0b01101111    // 9
};

int digits[4]    = {0, 0, 0, 0};
int currentDigit = 0;
int distance_mm  = 0;

// ----- Timing (non-blocking) -----
unsigned long lastStepTime = 0;
bool pausing = false;
unsigned long pauseStart = 0;

void setup() {
  pinMode(motorPin1, OUTPUT);
  pinMode(motorPin2, OUTPUT);
  pinMode(motorPin3, OUTPUT);
  pinMode(motorPin4, OUTPUT);

  pinMode(latchPin, OUTPUT);
  pinMode(dataPin, OUTPUT);
  pinMode(clockPin, OUTPUT);

  for (int i = 0; i < 4; i++) {
    pinMode(digitPins[i], OUTPUT);
  }

  Serial.begin(9600);
  lastStepTime = millis();
}

void loop() {
  // ALWAYS refresh the display — one digit per pass, runs thousands of times/sec
  refreshDisplay();

  // If we're in a 2 s pause, just wait it out (display keeps refreshing above)
  if (pausing) {
    if (millis() - pauseStart >= 2000) {
      pausing = false;
      direction_rotation = -direction_rotation;
      turnCounter = 0;
      stepCounter = 0;
      computeDistance();
      extractDigits();
    }
    return;
  }

  // Step the motor every delayValue ms (non-blocking)
  if (millis() - lastStepTime < (unsigned long)delayValue) {
    return;
  }
  lastStepTime = millis();

  // One step in current direction
  int phase = stepCounter % 4;
  if (direction_rotation == -1) {
    phase = (4 - 1 - phase) % 4;  // reverse order: 3,2,1,0
  }

  if (phase == 0) {
    digitalWrite(motorPin1, HIGH);
    digitalWrite(motorPin2, LOW);
    digitalWrite(motorPin3, LOW);
    digitalWrite(motorPin4, LOW);
  } else if (phase == 1) {
    digitalWrite(motorPin1, LOW);
    digitalWrite(motorPin2, HIGH);
    digitalWrite(motorPin3, LOW);
    digitalWrite(motorPin4, LOW);
  } else if (phase == 2) {
    digitalWrite(motorPin1, LOW);
    digitalWrite(motorPin2, LOW);
    digitalWrite(motorPin3, HIGH);
    digitalWrite(motorPin4, LOW);
  } else {
    digitalWrite(motorPin1, LOW);
    digitalWrite(motorPin2, LOW);
    digitalWrite(motorPin3, LOW);
    digitalWrite(motorPin4, HIGH);
  }

  stepCounter++;

  // Update distance and display digits
  computeDistance();
  extractDigits();

  // One full revolution completed?
  if (stepCounter % steps_per_revolution == 0) {
    int revsDone = stepCounter / steps_per_revolution;
    if (revsDone == (turnCounter + 1)) {
      turnCounter++;
      Serial.print("Rotation ");
      Serial.print(turnCounter);
      Serial.print(" — distance: ");
      Serial.print(distance_mm);
      Serial.println(" mm");
    }
  }

  // After 2 revolutions in this direction: pause 2 s and reverse
  if (turnCounter >= stop_turn) {
    digitalWrite(motorPin1, LOW);
    digitalWrite(motorPin2, LOW);
    digitalWrite(motorPin3, LOW);
    digitalWrite(motorPin4, LOW);

    Serial.print(direction_rotation == 1 ? "Reached 628 mm" : "Reached 0 mm");
    Serial.println(" — pausing 2 s");

    pausing = true;
    pauseStart = millis();
  }
}

void computeDistance() {
  int raw;
  if (direction_rotation == 1) {
    raw = (int)(stepCounter * STEPS_TO_MM);
  } else {
    raw = MAX_DISTANCE - (int)(stepCounter * STEPS_TO_MM);
  }
  if (raw < 0)            raw = 0;
  if (raw > MAX_DISTANCE) raw = MAX_DISTANCE;
  distance_mm = raw;
}

void extractDigits() {
  digits[0] = distance_mm / 1000;
  digits[1] = (distance_mm % 1000) / 100;
  digits[2] = (distance_mm % 100) / 10;
  digits[3] = distance_mm % 10;
}

void refreshDisplay() {
  // Turn off all digits (prevents ghosting)
  for (int i = 0; i < 4; i++) {
#if COMMON_ANODE
    digitalWrite(digitPins[i], HIGH);
#else
    digitalWrite(digitPins[i], LOW);
#endif
  }

  // Shift out segment pattern for current digit
  byte pattern = SEGMENT_TABLE[digits[currentDigit]];
#if COMMON_ANODE
  pattern = ~pattern;
#endif
  digitalWrite(latchPin, LOW);
  shiftOut(dataPin, clockPin, MSBFIRST, pattern);
  digitalWrite(latchPin, HIGH);

  // Turn on current digit
#if COMMON_ANODE
  digitalWrite(digitPins[currentDigit], LOW);
#else
  digitalWrite(digitPins[currentDigit], HIGH);
#endif

  currentDigit = (currentDigit + 1) % 4;
}
