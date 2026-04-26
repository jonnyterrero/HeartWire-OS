const byte commonPin = A0;
const byte redPin = 2;
const byte bluePin = 3;
const byte greenPin = 4;
const byte sensorPin = A1;

// Adjust these after watching Serial Monitor values
const int settleTime = 500;     // LED stays on before reading
const int betweenTime = 600;    // pause between colors
const int yellowClose = 120;    // red and green can differ by this much for yellow
const int strongGap = 50;       // how much stronger a color must be

void setup() {
  Serial.begin(9600);

  pinMode(commonPin, OUTPUT);
  pinMode(redPin, OUTPUT);
  pinMode(bluePin, OUTPUT);
  pinMode(greenPin, OUTPUT);

  digitalWrite(commonPin, LOW); // change to HIGH if common anode

  Serial.println("Ball Color Sensor Started");
}

void setColor(byte red, byte blue, byte green) {
  digitalWrite(redPin, red);
  digitalWrite(bluePin, blue);
  digitalWrite(greenPin, green);
}

int readSensor() {
  long total = 0;

  for (byte i = 0; i < 10; i++) {
    total += analogRead(sensorPin);
    delay(10);
  }

  return total / 10;
}

int readWithColor(byte red, byte blue, byte green) {
  setColor(red, blue, green);
  delay(settleTime);

  int value = readSensor();

  setColor(LOW, LOW, LOW);
  delay(betweenTime);

  return value;
}

void loop() {
  int redValue = readWithColor(HIGH, LOW, LOW);
  int blueValue = readWithColor(LOW, HIGH, LOW);
  int greenValue = readWithColor(LOW, LOW, HIGH);

  Serial.print("R: ");
  Serial.print(redValue);
  Serial.print("  B: ");
  Serial.print(blueValue);
  Serial.print("  G: ");
  Serial.print(greenValue);
  Serial.print("  -> Detected Color: ");

  bool redStrong = redValue > blueValue + strongGap;
  bool greenStrong = greenValue > blueValue + strongGap;
  bool redGreenClose = abs(redValue - greenValue) < yellowClose;

  if (redStrong && greenStrong && redGreenClose) {
    Serial.println("YELLOW");
  }
  else if (redValue > blueValue + strongGap && redValue > greenValue + strongGap) {
    Serial.println("RED");
  }
  else if (blueValue > redValue + strongGap && blueValue > greenValue + strongGap) {
    Serial.println("BLUE");
  }
  else if (greenValue > redValue + strongGap && greenValue > blueValue + strongGap) {
    Serial.println("GREEN");
  }
  else {
    Serial.println("UNCLEAR");
  }

  delay(2500);
}
