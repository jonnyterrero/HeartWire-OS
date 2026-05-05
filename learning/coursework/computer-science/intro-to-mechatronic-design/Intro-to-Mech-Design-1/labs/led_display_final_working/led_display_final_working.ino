const int G = 8;
const int R = 7;
const int B = 12;
const int S = A3;

int lastMatch = -1;
int stableMatch = -1;
int matchCount = 1;
const int REQUIRED_STABLE = 3; // number of consistent readings required

// 74HC595 pins
const int DATA_PIN  = 3;
const int LATCH_PIN = 2;
const int CLOCK_PIN = 4;
 
const int NUM_COLORS = 5;
String names[NUM_COLORS] = {"Yellow", "Green", "Red", "Blue", "No Ball"};
int saved[NUM_COLORS][3];

bool calibrated = false;
 
void setup() {
  pinMode(G, OUTPUT);
  pinMode(R, OUTPUT);
  pinMode(B, OUTPUT);
 
  pinMode(DATA_PIN, OUTPUT);
  pinMode(LATCH_PIN, OUTPUT);
  pinMode(CLOCK_PIN, OUTPUT);
 
  Serial.begin(9600);
 
  off();
  clearDisplay();
 
  Serial.println("Type t to calibrate");
  Serial.println("Type p to print saved colors");
}
 
void loop() {
  if (Serial.available()) {
    char cmd = Serial.read();
 
    if (cmd == 't' || cmd == 'T') calibrate();
    if (cmd == 'p' || cmd == 'P') printColors();
 
    while (Serial.available()) Serial.read();
  }

  if (calibrated) {
    int now[3];
    getColor(now);

    int match = bestMatch(now);

if (match == lastMatch) {
  matchCount++;
} else {
  matchCount = 0;
}

lastMatch = match;

if (matchCount >= REQUIRED_STABLE && match != stableMatch) {
  stableMatch = match;

  Serial.print("Stable Detected: ");
  Serial.println(names[stableMatch]);

  showColorLetter(stableMatch);
}
    delay(50);
  }
}

void off() {
  digitalWrite(G, LOW);
  digitalWrite(R, LOW);
  digitalWrite(B, LOW);
}
 
void sendToDisplay(byte pattern) {
  digitalWrite(LATCH_PIN, LOW);
  shiftOut(DATA_PIN, CLOCK_PIN, LSBFIRST, pattern);
  digitalWrite(LATCH_PIN, HIGH);
}
 
void clearDisplay() {
  sendToDisplay(0);
}
 
void showColorLetter(int colorIndex) {
  byte pattern = 0;
 
  if (colorIndex == 0) pattern = (1 << 2) | (1 << 1) | (1 << 6) | (1 << 5) | (1 << 4);
  if (colorIndex == 1) pattern = (1 << 2) | (1 << 7) | (1 << 1) | (1 << 6) | (1 << 5) | (1 << 4);
  if (colorIndex == 2) pattern = (1 << 3) | (1 << 1);
  if (colorIndex == 3) pattern = (1 << 2) | (1 << 1) | (1 << 5) | (1 << 3) | (1 << 4);
  if (colorIndex == 4) pattern = (1 << 7) | (1 << 1) | (1 << 4);
 
  sendToDisplay(pattern);
}
 
int avgRead() {
  long total = 0;
 
  for (int i = 0; i < 10; i++) {
    total += analogRead(S);
    delay(5);
  }
 
  return total / 10;
}
 
int readOne(int ledPin) {
  off();
  digitalWrite(ledPin, HIGH);
  delay(300);
 
  int value = avgRead();
 
  off();
  delay(100);
 
  return value;
}
 
void getColor(int x[3]) {
  x[0] = readOne(G);
  x[1] = readOne(R);
  x[2] = readOne(B);
}
 
void waitEnter() {
  Serial.println("Press Enter");
  while (!Serial.available()) {}
  while (Serial.available()) Serial.read();
}
 
void calibrate() {
  Serial.println("CALIBRATION START");
  calibrated = false;
 
  for (int i = 0; i < NUM_COLORS; i++) {
    Serial.print("Place ");
    Serial.print(names[i]);
    Serial.println(i == 4 ? " state" : " ball");
    waitEnter();
 
    int temp[3];
    getColor(temp);
 
    saved[i][0] = temp[0];
    saved[i][1] = temp[1];
    saved[i][2] = temp[2];
 
    Serial.print(names[i]);
    Serial.println(" saved");
  }
 
  Serial.println("CALIBRATION DONE");
  printColors();

  Serial.println("Press Enter to begin scanning...");
  waitEnter();

  calibrated = true;
  Serial.println("Continuous scanning started...");
}
 
long dist(int a[3], int b[3]) {
  long x = a[0] - b[0];
  long y = a[1] - b[1];
  long z = a[2] - b[2];
  return x * x + y * y + z * z;
}
 
int bestMatch(int x[3]) {
  int best = 0;
  long bestD = dist(x, saved[0]);
 
  for (int i = 1; i < NUM_COLORS; i++) {
    long d = dist(x, saved[i]);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
 
  return best;
}

void printColors() {
  for (int i = 0; i < NUM_COLORS; i++) {
    Serial.print(names[i]);
    Serial.print(": ");
    Serial.print(saved[i][0]);
    Serial.print(", ");
    Serial.print(saved[i][1]);
    Serial.print(", ");
    Serial.println(saved[i][2]);
  }
}