/*
 * 28BYJ-48 stepper (ULN2003): one direction -> pause 2 s -> other direction.
 * Uses your pin layout and step/turn counters.
 */

int motorPin1 = 9;
int motorPin2 = 10;
int motorPin3 = 11;
int motorPin4 = 12;

int direction_rotation = 1;   // 1 = one way, -1 = other way
int delayValue = 2;            // ms between steps (lower = faster)
int steps_per_revolution = 2048;
int stepCounter = 0;
int turnCounter = 0;
int stop_turn = 3;             // stop after this many back-and-forth cycles
const int PAUSE_MS = 2000;     // 2 second pause between directions

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

int stepPhase = 0;  // current phase in 0..7

void setup() {
  pinMode(motorPin1, OUTPUT);
  pinMode(motorPin2, OUTPUT);
  pinMode(motorPin3, OUTPUT);
  pinMode(motorPin4, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  if (turnCounter >= stop_turn) {
    // Optional: stop after 3 cycles, or remove this to run forever
    allPinsLow();
    return;
  }

  // --- Rotate one direction (1 revolution) ---
  direction_rotation = 1;
  stepCounter = 0;
  while (stepCounter < steps_per_revolution) {
    doOneStep();
    stepCounter++;
    delay(delayValue);
  }

  // --- Pause 2 seconds ---
  allPinsLow();
  delay(PAUSE_MS);

  // --- Rotate the other direction (1 revolution) ---
  direction_rotation = -1;
  stepCounter = 0;
  while (stepCounter < steps_per_revolution) {
    doOneStep();
    stepCounter++;
    delay(delayValue);
  }

  // --- Pause 2 seconds ---
  allPinsLow();
  delay(PAUSE_MS);

  turnCounter++;
}

void doOneStep() {
  int p = stepPhase;
  digitalWrite(motorPin1, STEP_SEQ[p][0]);
  digitalWrite(motorPin2, STEP_SEQ[p][1]);
  digitalWrite(motorPin3, STEP_SEQ[p][2]);
  digitalWrite(motorPin4, STEP_SEQ[p][3]);

  if (direction_rotation == 1) {
    stepPhase = (stepPhase + 1) % 8;
  } else {
    stepPhase = stepPhase - 1;
    if (stepPhase < 0) stepPhase = 7;
  }
}

void allPinsLow() {
  digitalWrite(motorPin1, LOW);
  digitalWrite(motorPin2, LOW);
  digitalWrite(motorPin3, LOW);
  digitalWrite(motorPin4, LOW);
}
