/*
 * Your script fixed: 4-pin stepper, direction, turn counting, 2 s pause then reverse.
 * Pins 9,10,11,12. Counts revolutions; after 3 revs, pauses 2 s and reverses direction.
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

// 4-phase full-step: one coil at a time (phase 0,1,2,3 = forward)
void setup() {
  pinMode(motorPin1, OUTPUT);
  pinMode(motorPin2, OUTPUT);
  pinMode(motorPin3, OUTPUT);
  pinMode(motorPin4, OUTPUT);   // was motorPin5
  Serial.begin(9600);
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
      Serial.println(turnCounter);
    }
  }

  // After 3 revolutions in this direction: pause 2 s and reverse
  if (turnCounter >= stop_turn) {
    digitalWrite(motorPin1, LOW);
    digitalWrite(motorPin2, LOW);
    digitalWrite(motorPin3, LOW);
    digitalWrite(motorPin4, LOW);
    delay(2000);
    direction_rotation = -direction_rotation;  // toggle: 1 -> -1, then -1 -> 1
    turnCounter = 0;
    stepCounter = 0;
  }
}
