const byte commonPin = A0;
const byte redPin = 2;
const byte bluePin = 3;
const byte greenPin = 4;

void setup() {
  pinMode(commonPin, OUTPUT);
  pinMode(redPin, OUTPUT);
  pinMode(bluePin, OUTPUT);
  pinMode(greenPin, OUTPUT);

  digitalWrite(commonPin, LOW); // use HIGH instead if your LED is common anode
}

void setColor(byte red, byte blue, byte green) {
  digitalWrite(redPin, red);
  digitalWrite(bluePin, blue);
  digitalWrite(greenPin, green);
}

void loop() {
  setColor(HIGH, LOW, LOW);   // red
  delay(1000);

  setColor(LOW, HIGH, LOW);   // blue
  delay(1000);

  setColor(LOW, LOW, HIGH);   // green
  delay(1000);
}
