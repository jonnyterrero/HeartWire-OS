/*
 * 4-Axis Robotic Arm — Simple Joystick Control
 * Servos: 4, 7, 10, 12 | Joysticks: A0, A2, A4, A5
 */

#include <Servo.h>

const int SERVO_1_PIN = 4;
const int SERVO_2_PIN = 7;
const int SERVO_3_PIN = 10;
const int SERVO_4_PIN = 12;

const int JOYSTICK_1_PIN = A0;
const int JOYSTICK_2_PIN = A2;
const int JOYSTICK_3_PIN = A4;
const int JOYSTICK_4_PIN = A5;

Servo servo1, servo2, servo3, servo4;

const int SERVO_MIN = 0;
const int SERVO_MAX = 180;

void setup() {
  Serial.begin(9600);
  servo1.attach(SERVO_1_PIN);
  servo2.attach(SERVO_2_PIN);
  servo3.attach(SERVO_3_PIN);
  servo4.attach(SERVO_4_PIN);
  servo1.write(90); servo2.write(90); servo3.write(90); servo4.write(90);
  delay(500);
}

void loop() {
  int joy1 = analogRead(JOYSTICK_1_PIN);
  int joy2 = analogRead(JOYSTICK_2_PIN);
  int joy3 = analogRead(JOYSTICK_3_PIN);
  int joy4 = analogRead(JOYSTICK_4_PIN);

  int angle1 = constrain(map(joy1, 0, 1023, SERVO_MIN, SERVO_MAX), SERVO_MIN, SERVO_MAX);
  int angle2 = constrain(map(joy2, 0, 1023, SERVO_MIN, SERVO_MAX), SERVO_MIN, SERVO_MAX);
  int angle3 = constrain(map(joy3, 0, 1023, SERVO_MIN, SERVO_MAX), SERVO_MIN, SERVO_MAX);
  int angle4 = constrain(map(joy4, 0, 1023, SERVO_MIN, SERVO_MAX), SERVO_MIN, SERVO_MAX);

  servo1.write(angle1);
  servo2.write(angle2);
  servo3.write(angle3);
  servo4.write(angle4);

  Serial.print("S1:"); Serial.print(angle1);
  Serial.print(" S2:"); Serial.print(angle2);
  Serial.print(" S3:"); Serial.print(angle3);
  Serial.print(" S4:"); Serial.println(angle4);

  delay(20);
}
