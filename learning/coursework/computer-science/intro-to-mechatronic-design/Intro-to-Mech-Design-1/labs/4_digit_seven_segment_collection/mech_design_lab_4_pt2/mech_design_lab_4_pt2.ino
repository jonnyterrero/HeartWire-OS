int latchPin = 2;  // pin 12 on 595
int dataPin = 3;   // pin 14 on 595
int clockPin = 4;  // pin 11 on the 595

void setup() {
  pinMode(latchPin, OUTPUT);
  pinMode(dataPin, OUTPUT);
  pinMode(clockPin, OUTPUT);
}

void loop() {
  // 0
  digitalWrite(latchPin, LOW);
  shiftOut(dataPin, clockPin, MSBFIRST, 64);
  digitalWrite(latchPin, HIGH);
  delay(1000);

  // 1
  digitalWrite(latchPin, LOW);
  shiftOut(dataPin, clockPin, MSBFIRST, 121);
  digitalWrite(latchPin, HIGH);
  delay(1000);

  // 2
  digitalWrite(latchPin, LOW);
  shiftOut(dataPin, clockPin, MSBFIRST, 121);
  digitalWrite(latchPin, HIGH);
  delay(1000);

  // 3
  digitalWrite(latchPin, LOW);
  shiftOut(dataPin, clockPin, MSBFIRST, 121);
  digitalWrite(latchPin, HIGH);
  delay(1000);

  // 4
  digitalWrite(latchPin, LOW);
  shiftOut(dataPin, clockPin, MSBFIRST, 121);
  digitalWrite(latchPin, HIGH);
  delay(1000);

  // 5
  digitalWrite(latchPin, LOW);
  shiftOut(dataPin, clockPin, MSBFIRST, 121);
  digitalWrite(latchPin, HIGH);
  delay(1000);

  // 6
  digitalWrite(latchPin, LOW);
  shiftOut(dataPin, clockPin, MSBFIRST, 121);
  digitalWrite(latchPin, HIGH);
  delay(1000);

  // 7
  digitalWrite(latchPin, LOW);
  shiftOut(dataPin, clockPin, MSBFIRST, 121);
  digitalWrite(latchPin, HIGH);
  delay(1000);

  // 8
  digitalWrite(latchPin, LOW);
  shiftOut(dataPin, clockPin, MSBFIRST, 121);
  digitalWrite(latchPin, HIGH);
  delay(1000);

  // 9
  digitalWrite(latchPin, LOW);
  shiftOut(dataPin, clockPin, MSBFIRST, 121);
  digitalWrite(latchPin, HIGH);
  delay(1000);
}
