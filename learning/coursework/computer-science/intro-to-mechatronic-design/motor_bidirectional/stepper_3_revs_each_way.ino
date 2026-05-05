/*
 * 28BYJ-48 stepper: 3 full rotations one way -> pause 2 s -> 3 full rotations other way -> repeat.
 * Same wiring: pins 9,10,11,12 (ULN2003).
 */

int motorPin1 = 9;
int motorPin2 = 10;
int motorPin3 = 11;
int motorPin4 = 12;

int delayValue = 2;              // ms between steps (lower = faster)
int steps_per_revolution = 2048; // 2048 half-steps = 1 full 360° on 28BYJ-48
const int PAUSE_MS = 2000;       // 2 second pause between directions
const int REVOLUTIONS = 3;       // number of full 360° turns each way

// Half-step sequence for 28BYJ-48 (8 steps per cycle)
const int STEP_SEQ[8][4] = {
  {1, 0, 0, 0},
  {1, 1, 0, 0},
  {0, 1, 0, 0},
  {0, 1, 1, 0},
  {0, 0, 1, 0},
  {0, 0, 1, 1},
  {0, 0, 0, 1},
  {1, 0, 0, 1}
};

int stepPhase = 0;

void setup() {
  pinMode(motorPin1, OUTPUT);
  pinMode(motorPin2, OUTPUT);
  pinMode(motorPin3, OUTPUT);
  pinMode(motorPin4, OUTPUT);
}

void loop() {
  // --- 3 full rotations in one direction ---
  runRevolutions(REVOLUTIONS, 1);

  // --- Pause 2 seconds ---
  allPinsLow();
  delay(PAUSE_MS);

  // --- 3 full rotations in the opposite direction ---
  runRevolutions(REVOLUTIONS, -1);

  // --- Pause 2 seconds ---
  allPinsLow();
  delay(PAUSE_MS);
}

// revs = number of full 360° turns, dir = 1 (forward) or -1 (reverse)
void runRevolutions(int revs, int dir) {
  int steps = revs * steps_per_revolution;
  for (int i = 0; i < steps; i++) {
    digitalWrite(motorPin1, STEP_SEQ[stepPhase][0]);
    digitalWrite(motorPin2, STEP_SEQ[stepPhase][1]);
    digitalWrite(motorPin3, STEP_SEQ[stepPhase][2]);
    digitalWrite(motorPin4, STEP_SEQ[stepPhase][3]);
    delay(delayValue);

    if (dir == 1) {
      stepPhase = (stepPhase + 1) % 8;
    } else {
      stepPhase--;
      if (stepPhase < 0) stepPhase = 7;
    }
  }
}

void allPinsLow() {
  digitalWrite(motorPin1, LOW);
  digitalWrite(motorPin2, LOW);
  digitalWrite(motorPin3, LOW);
  digitalWrite(motorPin4, LOW);
}
