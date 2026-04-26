/*
 * 4-Axis Robotic Arm — Potentiometer Control (Basic)
 * Servos: 6, 5, 9, 3 | Pots: A0, A1, A2, A3
 */

#include <Servo.h>

Servo servoRoll, servoX, servoY, servoMouth;

void setup() {
  Serial.begin(9600);
  servoRoll.attach(6);
  servoX.attach(5);
  servoY.attach(9);
  servoMouth.attach(3);
}

void loop() {
  int potRoll   = analogRead(A0);
  int potX     = analogRead(A1);
  int potY     = analogRead(A2);
  int potMouth = analogRead(A3);

  int angleRoll   = map(potRoll,   0, 1023, 0, 180);
  int angleX      = map(potX,      0, 1023, 0, 180);
  int angleY      = map(potY,      0, 1023, 0, 180);
  int angleMouth  = map(potMouth,  0, 1023, 0, 180);

  servoRoll.write(angleRoll);
  servoX.write(angleX);
  servoY.write(angleY);
  servoMouth.write(angleMouth);

  Serial.print("Roll:");  Serial.print(angleRoll);
  Serial.print(" X:");    Serial.print(angleX);
  Serial.print(" Y:");   Serial.print(angleY);
  Serial.print(" Mouth:"); Serial.println(angleMouth);

  delay(200);
}
