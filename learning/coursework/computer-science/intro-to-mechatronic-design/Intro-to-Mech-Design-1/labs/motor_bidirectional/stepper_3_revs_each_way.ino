/*
 * 28BYJ-48 stepper: 3 full rotations one way -> pause 2 s -> 3 full rotations other way -> repeat.
 * Same wiring: pins 9,10,11,12 (ULN2003).
 *
 * If one physical turn is not 360°, change STEPS_PER_REVOLUTION (try 4096 for full-step).
 */

const int motorPin1 = 9;
const int motorPin2 = 10;
const int motorPin3 = 11;
const int motorPin4 = 12;

const int delayValue = 2;               // ms between steps (lower = faster)
const int STEPS_PER_REVOLUTION = 2048;  // steps for 1 full 360° (28BYJ-48 half-step; some need 4096)
const int PAUSE_MS = 2000;              // 2 second pause between directions
const int REVOLUTIONS_EACH_WAY = 3;     // full 360° turns before switching direction

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
  // --- Direction 1: exactly 3 full rotations (3 x 360°) ---
  for (int rev = 0; rev < REVOLUTIONS_EACH_WAY; rev++) {
    runOneRevolution(1);
  }

  // --- Pause 2 seconds ---
  allPinsLow();
  delay(PAUSE_MS);

  // --- Direction 2: exactly 3 full rotations the other way ---
  for (int rev = 0; rev < REVOLUTIONS_EACH_WAY; rev++) {
    runOneRevolution(-1);
  }

  // --- Pause 2 seconds ---
  allPinsLow();
  delay(PAUSE_MS);
}

// One full 360° rotation. dir = 1 (forward) or -1 (reverse)
void runOneRevolution(int dir) {
  for (int s = 0; s < STEPS_PER_REVOLUTION; s++) {
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
