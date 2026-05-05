/*
 * Stepper + 7-seg + Serial. 3 revs one way -> pause 2 s -> 3 revs other way -> repeat.
 * - Motor: 28BYJ-48 + ULN2003 on pins 9,10,11,12 (driver LEDs light when stepping).
 * - 7-seg: one digit on 74HC595, latch=2, data=3, clock=4.
 * - Arduino LED (pin 13) on while running. Serial: one line per rotation.
 */

int motorPin1 = 9;
int motorPin2 = 10;
int motorPin3 = 11;
int motorPin4 = 12;

int direction_rotation = 1;   // 1 = one way, -1 = other way
int delayValue = 2;
int steps_per_revolution = 2048;
int stepCounter = 0;
int turnCounter = 0;
int stop_turn = 3;

int latchPin = 2;  // pin 12 on 595
int dataPin = 3;   // pin 14 on 595
int clockPin = 4;  // pin 11 on the 595

// Byte values for digits 0–9 on your display (matches your wiring where 121 = "3")
byte digitBytes[10] = {126, 48, 109, 121, 51, 91, 95, 112, 127, 123};

void setup() {
  pinMode(motorPin1, OUTPUT);
  pinMode(motorPin2, OUTPUT);
  pinMode(motorPin3, OUTPUT);
  pinMode(motorPin4, OUTPUT);
  pinMode(latchPin, OUTPUT);
  pinMode(dataPin, OUTPUT);
  pinMode(clockPin, OUTPUT);
  pinMode(13, OUTPUT);   // Arduino built-in LED
  digitalWrite(13, HIGH); // LED on = running
  Serial.begin(9600);

  // --- Segment test: lights one segment at a time ---
  // Open Serial Monitor and watch the display.
  // For each step, note which segment lights up and report back.
  //
  //   Segment map:
  //       AAA
  //      F   B
  //       GGG
  //      E   C
  //       DDD    DP
  //
  char segNames[] = {'A','B','C','D','E','F','G','P'};
  for (int i = 0; i < 8; i++) {
    byte val = (1 << i);  // bit 0, 1, 2, 3, 4, 5, 6, 7
    Serial.print("Bit ");
    Serial.print(i);
    Serial.print(" (byte ");
    Serial.print(val);
    Serial.print(") — should light segment: ???  -> Which segment lights? (A-G or DP)");
    Serial.println();
    digitalWrite(latchPin, LOW);
    shiftOut(dataPin, clockPin, MSBFIRST, val);
    digitalWrite(latchPin, HIGH);
    delay(3000);
  }
  Serial.println("Segment test done. Motor starting.");
}

void loop() {
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
  delay(delayValue);

  // One full revolution completed?
  if (stepCounter % steps_per_revolution == 0) {
    int revsDone = stepCounter / steps_per_revolution;
    if (revsDone == (turnCounter + 1)) {
      turnCounter++;
      // 7-seg: show rotation number (0–9)
      digitalWrite(latchPin, LOW);
      shiftOut(dataPin, clockPin, MSBFIRST, digitBytes[turnCounter % 10]);
      digitalWrite(latchPin, HIGH);
      Serial.println(turnCounter);
    }
  }

  // After 3 revolutions in this direction: pause 2 s and reverse
  if (turnCounter >= stop_turn) {
    digitalWrite(motorPin1, LOW);
    digitalWrite(motorPin2, LOW);
    digitalWrite(motorPin3, LOW);
    digitalWrite(motorPin4, LOW);
    digitalWrite(latchPin, LOW);
    shiftOut(dataPin, clockPin, MSBFIRST, digitBytes[0]);
    digitalWrite(latchPin, HIGH);
    delay(2000);
    direction_rotation = -direction_rotation;  // toggle: 1 -> -1, then -1 -> 1
    turnCounter = 0;
    stepCounter = 0;
  }
}
