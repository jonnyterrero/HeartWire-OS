#include <Servo.h>

// Declare servo objects for each part of the robotic arm
Servo servoRoll;
Servo servoX;
Servo servoY;
Servo servoMouth;

void setup() {
  // Initialize serial communication for debugging
  Serial.begin(9600);
  
  // Attach each servo to a PWM pin on the Arduino
  servoRoll.attach(6);
  servoX.attach(5);
  servoY.attach(9);
  servoMouth.attach(3);
}

void loop() {
  // Read the potentiometer values
  int potRoll = analogRead(A0);
  int potX = analogRead(A1);
  int potY = analogRead(A2);
  int potMouth = analogRead(A3);

  // Map the potentiometer values to servo angles (0-180 degrees)
  int angleRoll = map(potRoll, 0, 1023, 0, 180);
  int angleX = map(potX, 0, 1023, 0, 180);
  int angleY = map(potY, 0, 1023, 0, 180);
  int angleMouth = map(potMouth, 0, 1023, 0, 180);

  // Write the angles to the servos to adjust their positions
  servoRoll.write(angleRoll);
  servoX.write(angleX);
  servoY.write(angleY);
  servoMouth.write(angleMouth);

  // Print the angles to the Serial Monitor for debugging
  Serial.print("Roll angle: ");
  Serial.print(angleRoll);
  Serial.print(" ");
  Serial.print("X angle: ");
  Serial.print(angleX);
  Serial.print(" ");
  Serial.print("Y angle: ");
  Serial.print(angleY);
  Serial.print(" ");
  Serial.print("Mouth angle: ");
  Serial.println(angleMouth);

  // Small delay to stabilize the readings
  delay(200);
}