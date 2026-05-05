int pins[] = {9, 10, 11, 12};
int direction = 1;
int delayValue = 2;
int steps_per_rotation = 2048;
int stepCounter = 0;
int turnCounter = 0;
int stop_turn = 3;

void setup() {
  for (int i = 0; i < 4; i++) pinMode(pins[i], OUTPUT);
  Serial.begin(9600);
}

void loop() {
  if (direction == 1) {
    for (int i = 0; i < 4; i++) {
      if (i == stepCounter % 4) {
        digitalWrite(pins[i], HIGH);
      } else {
        digitalWrite(pins[i], LOW);
      }
    }
    stepCounter++;
    delay(delayValue);

    if (stepCounter >= steps_per_rotation * (turnCounter + 1)) {
      turnCounter++;
      Serial.println(turnCounter);
      if (turnCounter >= stop_turn) {
        delay(2000);
        direction = 0;
      }
    }
  }
  else {
    for (int i = 0; i < 4; i++) {
      if (i == stepCounter % 4) {
        digitalWrite(pins[i], HIGH);
      } else {
        digitalWrite(pins[i], LOW);
      }
    }
    stepCounter--;
    delay(delayValue);

    if (stepCounter <= steps_per_rotation * (turnCounter - 1)) {
      turnCounter--;
      Serial.println(turnCounter);
      if (turnCounter <= 0) {
        delay(2000);
        direction = 1;
      }
    }
  }
}
