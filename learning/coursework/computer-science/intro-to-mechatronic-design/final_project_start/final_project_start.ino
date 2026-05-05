const byte commonPin = A0;
const byte redPin = 2;
const byte bluePin = 3;
const byte greenPin = 4;

// Track current state
int state = 0;

void setup() {
  Serial.begin(9600);  // ✅ Initialize Serial

  pinMode(commonPin, OUTPUT);
  pinMode(redPin, OUTPUT);
  pinMode(bluePin, OUTPUT);
  pinMode(greenPin, OUTPUT);

  digitalWrite(commonPin, LOW); // change to HIGH if common anode

  Serial.println("RGB LED Test Started");
}

void setColor(byte red, byte blue, byte green, const char* colorName) {
  digitalWrite(redPin, red);
  digitalWrite(bluePin, blue);
  digitalWrite(greenPin, green);

  // ✅ Print what’s happening
  Serial.print("Color: ");
  Serial.println(colorName);
}

void loop() {
  switch (state) {
    case 0:
      setColor(HIGH, LOW, LOW, "RED");
      break;

    case 1:
      setColor(LOW, HIGH, LOW, "BLUE");
      break;

    case 2:
      setColor(LOW, LOW, HIGH, "GREEN");
      break;
  }

  state++;
  if (state > 2) state = 0;

  delay(1000);
}