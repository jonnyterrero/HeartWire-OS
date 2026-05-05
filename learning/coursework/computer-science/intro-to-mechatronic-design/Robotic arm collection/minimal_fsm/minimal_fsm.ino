#include <Servo.h>

Servo waistS, shoulderS, wristS, clawS;

// --- Pins ---
const int pinWaist = 11, pinShoulder = 7, pinClaw = 5, pinWrist = 3;
const int trigPin = 4, echoPin = 2; 

// --- Tracking Position ---
int curW = 70, curS = 15, curWr = 30, curC = 101; 
float ang1 = 70.0; 
int seekDirection = 1;
float sweepSpeed = 0.35; 
int distance = 0;

// --- Timing Settings ---
const int motionDelay = 800;  
const int stepSpeed = 15;     

// --- Helper: Smooth Movement ---
void softMove(Servo &s, int &currentPos, int targetPos, int speed) {
  while (currentPos != targetPos) {
    if (currentPos < targetPos) currentPos++;
    else currentPos--;
    s.write(currentPos);
    delay(speed); 
  }
}

void grabSequence() {

  softMove(clawS, curC, 170, 10);
  delay(motionDelay); 

  softMove(wristS, curWr, 140, 15);
  delay(motionDelay); 

  softMove(clawS, curC, 130, 20);
  delay(motionDelay); 

  softMove(shoulderS, curS, 100, 20); 
  delay(motionDelay); 

  int tempW = (int)ang1; 
  softMove(waistS, tempW, 170, 15);   
  curW = 170;
  delay(motionDelay); 
  
  softMove(clawS, curC, 160, 15);     
  delay(motionDelay); 
}

void returnSequence() {
  Serial.println(">>> SEQUENCE START: RETURN");

  softMove(waistS, curW, 70, 15);
  delay(motionDelay);

  softMove(shoulderS, curS, 15, 20);
  delay(motionDelay);

  softMove(wristS, curWr, 30, 15);
  delay(motionDelay);

  softMove(clawS, curC, 101, 10);
  
  ang1 = 70; 
  delay(1000); 
}

void setup() {
  Serial.begin(9600);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  waistS.attach(pinWaist);
  shoulderS.attach(pinShoulder);
  wristS.attach(pinWrist);
  clawS.attach(pinClaw);

  // Home Start
  waistS.write(70); shoulderS.write(15);
  wristS.write(30); clawS.write(101);
  
  delay(2000);
}

void loop() {
  digitalWrite(trigPin, LOW); delayMicroseconds(2);
  digitalWrite(trigPin, HIGH); delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  long duration = pulseIn(echoPin, HIGH, 30000); 
  distance = (duration * 0.034) / 2;

  if (distance <= 7 && distance > 3) {
           delay(100);
      grabSequence();
      returnSequence();
      distance = 99; 
  } 

  if (distance > 7.6 || distance == 0) {
    ang1 += (sweepSpeed * seekDirection);
    if (ang1 >= 135) { ang1 = 135; seekDirection = -1; }
    if (ang1 <= 0) { ang1 = 0; seekDirection = 1; }
    
    waistS.writeMicroseconds(map(ang1, 0, 180, 544, 2400));
    curW = (int)ang1;
  }
  delay(10); 
}