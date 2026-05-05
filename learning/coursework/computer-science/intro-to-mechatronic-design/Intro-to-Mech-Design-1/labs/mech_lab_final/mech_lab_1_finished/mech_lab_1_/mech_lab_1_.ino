// -------- Pin Definitions --------
const int button1Pin = 2;
const int button2Pin = 7;

const int ledPins[3] = {13, 12, 4};

// -------- State Variables --------
int currentLED = 0;

bool lastButton1State = HIGH;
bool lastButton2State = HIGH;

// -------- Setup --------
void setup() {
  pinMode(button1Pin, INPUT_PULLUP);
  pinMode(button2Pin, INPUT_PULLUP);

  for (int i = 0; i < 3; i++) {
    pinMode(ledPins[i], OUTPUT);
    digitalWrite(ledPins[i], LOW);
  }
}

// -------- Main Loop --------
void loop() {
  bool button1State = digitalRead(button1Pin);
  bool button2State = digitalRead(button2Pin);

  // ----- Button 1: Cycle LEDs -----
  if (lastButton1State == HIGH && button1State == LOW) {
    digitalWrite(ledPins[currentLED], LOW);   // turn off current LED
    currentLED = (currentLED + 1) % 3;        // move to next LED
    digitalWrite(ledPins[currentLED], HIGH);  // turn on new LED
    delay(200); // debounce
  }

  // ----- Button 2: Reset (All LEDs OFF) -----
  if (lastButton2State == HIGH && button2State == LOW) {
    for (int i = 0; i < 3; i++) {
      digitalWrite(ledPins[i], LOW);
    }
    currentLED = 0;
    delay(500); // debounce
  }

  lastButton1State = button1State;
  lastButton2State = button2State;
}
