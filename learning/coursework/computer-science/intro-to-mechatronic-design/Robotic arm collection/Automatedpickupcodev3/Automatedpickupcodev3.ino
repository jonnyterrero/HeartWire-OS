#include <Servo.h>

// Servos
Servo servo1;
Servo servo2;
Servo servo3;
Servo servo4;

// Servo pins
const int servoPin1 = 7;
const int servoPin2 = 3;
const int servoPin3 = 11;
const int servoPin4 = 5;

// Ultrasonic sensor pins
const int trigPin = 2;
const int echoPin = 4;

// Servo sweep variables
int angle = 0;
int step = 2;

// Distance threshold (cm)
const int detectDistance = 6;

// Stop and sequence flags
bool stopped = false;
bool sequenceStarted = false;

void setup() {
  Serial.begin(9600);

  servo1.attach(servoPin1);
  servo2.attach(servoPin2);
  servo3.attach(servoPin3);
  servo4.attach(servoPin4);

  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  // Initial positions
  servo4.write(90); // claw neutral
  servo2.write(0);
  servo3.write(57);
  servo1.write(0);
}

void loop() {
  // -------- ULTRASONIC READ --------
  long duration;
  float distance;

  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);

  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  duration = pulseIn(echoPin, HIGH);
  distance = duration * 0.034 / 2;

  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");

  // -------- DETECTION --------
  if (distance > 0 && distance < detectDistance && !stopped) {
    stopped = true; // stop sweep
  }

  // -------- SERVO 1 SWEEP --------
  if (!stopped) {
    servo1.write(angle);
    angle += step;

    if (angle >= 180 || angle <= 0) {
      step = -step;
    }
  }

  // -------- SEQUENCE AFTER STOP --------
  if (stopped && !sequenceStarted) {
    sequenceStarted = true;

    delay(500); // wait after stopping

    moveServoSlow(servo2, 10, 15);

    delay(100);

    // Step 1: Move servo 3 slowly down
    moveServoSlow(servo3, 150, 15); // 135 = down

    delay(2000); // wait 2 seconds

    // Step 2: Close claw (servo 4)
    moveServoSlow(servo4, 20, 15);  // 20 = closed

    delay(2000); // wait 2 seconds

    // Step 3: Move servo 2 up to lift into bag
    moveServoSlow(servo3, 0, 15);

  delay(500); // optional pause
   
    // Step 4: Move servo 3 up after claw closes
    moveServoSlow(servo2, 90, 15); // 90 = up

    delay(2000); // wait 2 seconds

    // Step 5: Move servo 1 to bag (whole arm rotation)
    moveServoSlow(servo1, 180, 15);

    delay(500); // optional pause

    // Step 6: Move servo 3 down
    moveServoSlow(servo3, 135, 15);

    delay(500); // optional pause

    // Step 7: Open claw (servo 4)
    moveServoSlow(servo4, 180, 15);

    delay(500); // optional pause

    moveServoSlow(servo1, 0, 15);

    delay(100);

    moveServoSlow(servo3, 57, 15);

    delay(100);

    moveServoSlow(servo2, 0, 15);

    delay(100);

    // -------- RESET FOR NEXT CYCLE --------
    servo1.write(0);
    servo2.write(0);
    servo3.write(57);
    servo4.write(90);

    angle = 0; // reset sweep angle
    step = 2;  // reset sweep direction

    stopped = false;
    sequenceStarted = false;
  }

  delay(50); // small loop delay
}

// -------- Helper Function: Move single servo slowly --------
void moveServoSlow(Servo &s, int target, int speedDelay) {
  int current = s.read();

  while (current != target) {
    if (current < target) current++;
    else if (current > target) current--;

    s.write(current);
    delay(speedDelay);
  }
}