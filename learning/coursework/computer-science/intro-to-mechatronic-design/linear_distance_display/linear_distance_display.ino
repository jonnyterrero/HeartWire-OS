/*
 * Linear Distance Display — Arduino UNO
 *
 * Displays the linear distance (mm) traveled by the tip of a 50 mm arm
 * on a 4-digit multiplexed 7-segment display (74HC595 + digit commons).
 *
 * Distance per rotation = 2 * PI * 50 mm ≈ 314 mm
 * Maximum travel        = 2 rotations   ≈ 628 mm
 *
 * Motor runs forward 0 → 628 mm, pauses, reverses 628 → 0 mm, repeats.
 */

// ===================== CONFIGURATION =====================

// Set to 1 for common-anode display, 0 for common-cathode
#define COMMON_ANODE 0

// Arm geometry
const float ARM_RADIUS_MM = 50.0;
const float DIST_PER_REV  = 2.0 * PI * ARM_RADIUS_MM;   // ~314.16 mm
const int   MAX_DISTANCE  = 628;                         // 2 full rotations

// Encoder — set this to match your encoder's rated ticks per revolution
const int TICKS_PER_REV = 200;

// Motor PWM speed (0–255)
const int MOTOR_SPEED = 150;

// Pause at each end before reversing (ms)
const unsigned long PAUSE_MS = 500;

// Multiplex refresh rate — time each digit stays lit (ms)
const unsigned long DIGIT_REFRESH_MS = 3;

// ===================== PIN ASSIGNMENTS =====================
// Change these to match your wiring.

// 74HC595 shift register (drives segments A–G)
const int DATA_PIN  = 4;
const int CLOCK_PIN = 5;
const int LATCH_PIN = 6;

// Digit-select pins (Arduino → digit common transistors / direct)
const int DIGIT_1 = 10;   // thousands (leftmost)
const int DIGIT_2 = 11;
const int DIGIT_3 = 12;
const int DIGIT_4 = 13;   // ones      (rightmost)

// Motor H-bridge (L298N / L293D style)
const int EN_PIN   = 9;   // PWM enable
const int DIR1_PIN = 7;
const int DIR2_PIN = 8;

// Rotary encoder (channel A must be on an interrupt pin)
const int ENC_A = 2;      // INT0 on UNO
const int ENC_B = 3;

// ===================== SEGMENT LOOKUP =====================
// Bit layout: DP G F E D C B A   (bit 0 = segment A)
// Values below are for common-cathode (HIGH lights a segment).

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

// ===================== GLOBAL STATE =====================

volatile long encoderTicks = 0;

int  distance_mm  = 0;
int  digits[4]    = {0, 0, 0, 0};
int  currentDigit = 0;
unsigned long lastDigitTime = 0;

enum State { FORWARD, PAUSE_AT_MAX, REVERSE, PAUSE_AT_MIN };
State motorState = FORWARD;
unsigned long pauseStart = 0;

const int digitPins[4] = { DIGIT_1, DIGIT_2, DIGIT_3, DIGIT_4 };

// ===================== ENCODER ISR =====================

void encoderISR() {
  if (digitalRead(ENC_B) == LOW) {
    encoderTicks++;
  } else {
    encoderTicks--;
  }
}

// ===================== SETUP =====================

void setup() {
  // 74HC595
  pinMode(DATA_PIN,  OUTPUT);
  pinMode(CLOCK_PIN, OUTPUT);
  pinMode(LATCH_PIN, OUTPUT);

  // Digit commons
  for (int i = 0; i < 4; i++) {
    pinMode(digitPins[i], OUTPUT);
  }

  // Motor
  pinMode(EN_PIN,   OUTPUT);
  pinMode(DIR1_PIN, OUTPUT);
  pinMode(DIR2_PIN, OUTPUT);

  // Encoder
  pinMode(ENC_A, INPUT_PULLUP);
  pinMode(ENC_B, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(ENC_A), encoderISR, RISING);

  Serial.begin(9600);
  setMotorForward();
}

// ===================== LOOP =====================

void loop() {
  computeDistance();
  handleMotorState();
  extractDigits();
  refreshDisplay();
}

// ===================== DISTANCE =====================

void computeDistance() {
  noInterrupts();
  long ticks = encoderTicks;
  interrupts();

  float rotations = (float)ticks / (float)TICKS_PER_REV;
  int raw = (int)(rotations * DIST_PER_REV);

  if (raw < 0)            raw = 0;
  if (raw > MAX_DISTANCE) raw = MAX_DISTANCE;

  distance_mm = raw;
}

// ===================== MOTOR STATE MACHINE =====================

void handleMotorState() {
  switch (motorState) {

    case FORWARD:
      if (distance_mm >= MAX_DISTANCE) {
        stopMotor();
        pauseStart = millis();
        motorState = PAUSE_AT_MAX;
        Serial.println("628 mm reached — pausing");
      }
      break;

    case PAUSE_AT_MAX:
      if (millis() - pauseStart >= PAUSE_MS) {
        setMotorReverse();
        motorState = REVERSE;
        Serial.println("Reversing");
      }
      break;

    case REVERSE:
      if (distance_mm <= 0) {
        stopMotor();
        pauseStart = millis();
        motorState = PAUSE_AT_MIN;
        Serial.println("0 mm reached — pausing");
      }
      break;

    case PAUSE_AT_MIN:
      if (millis() - pauseStart >= PAUSE_MS) {
        setMotorForward();
        motorState = FORWARD;
        Serial.println("Going forward");
      }
      break;
  }
}

// ===================== MOTOR HELPERS =====================

void setMotorForward() {
  digitalWrite(DIR1_PIN, HIGH);
  digitalWrite(DIR2_PIN, LOW);
  analogWrite(EN_PIN, MOTOR_SPEED);
}

void setMotorReverse() {
  digitalWrite(DIR1_PIN, LOW);
  digitalWrite(DIR2_PIN, HIGH);
  analogWrite(EN_PIN, MOTOR_SPEED);
}

void stopMotor() {
  analogWrite(EN_PIN, 0);
  digitalWrite(DIR1_PIN, LOW);
  digitalWrite(DIR2_PIN, LOW);
}

// ===================== DISPLAY =====================

void extractDigits() {
  int v = distance_mm;
  digits[0] = v / 1000;
  digits[1] = (v % 1000) / 100;
  digits[2] = (v % 100)  / 10;
  digits[3] = v % 10;
}

void shiftSegments(byte pattern) {
#if COMMON_ANODE
  pattern = ~pattern;
#endif
  digitalWrite(LATCH_PIN, LOW);
  shiftOut(DATA_PIN, CLOCK_PIN, MSBFIRST, pattern);
  digitalWrite(LATCH_PIN, HIGH);
}

void refreshDisplay() {
  unsigned long now = millis();
  if (now - lastDigitTime < DIGIT_REFRESH_MS) return;
  lastDigitTime = now;

  // Turn off all digits first (blanking prevents ghosting)
  for (int i = 0; i < 4; i++) {
#if COMMON_ANODE
    digitalWrite(digitPins[i], HIGH);   // anode: HIGH = off
#else
    digitalWrite(digitPins[i], LOW);    // cathode: LOW = off
#endif
  }

  // Push segment pattern for the current digit
  shiftSegments(SEGMENT_TABLE[digits[currentDigit]]);

  // Enable the current digit
#if COMMON_ANODE
  digitalWrite(digitPins[currentDigit], LOW);    // anode: LOW = on
#else
  digitalWrite(digitPins[currentDigit], HIGH);   // cathode: HIGH = on
#endif

  currentDigit = (currentDigit + 1) % 4;
}
