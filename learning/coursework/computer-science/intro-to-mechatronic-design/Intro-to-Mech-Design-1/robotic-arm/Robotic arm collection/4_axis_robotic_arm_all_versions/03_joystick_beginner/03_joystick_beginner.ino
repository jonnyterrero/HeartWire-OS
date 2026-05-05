/*
 * 4-Axis Robotic Arm — Joystick Control (Beginner-Friendly)
 * Servos: 6, 5, 9, 3 | Joysticks: A0, A1, A2, A3
 * Has deadzone to reduce jitter.
 */

#include <Servo.h>

const int SERVO_ROLL_PIN  = 6;
const int SERVO_X_PIN     = 5;
const int SERVO_Y_PIN     = 9;
const int SERVO_MOUTH_PIN = 3;

const int JOYSTICK_ROLL_PIN  = A0;
const int JOYSTICK_X_PIN     = A1;
const int JOYSTICK_Y_PIN     = A2;
const int JOYSTICK_MOUTH_PIN = A3;

Servo servoRoll, servoX, servoY, servoMouth;

const int ROLL_MIN = 0, ROLL_MAX = 180;
const int X_MIN = 15, X_MAX = 165;
const int Y_MIN = 15, Y_MAX = 165;
const int MOUTH_MIN = 10, MOUTH_MAX = 90;

const int JOYSTICK_DEADZONE_LOW = 450;
const int JOYSTICK_DEADZONE_HIGH = 574;

int applyDeadzone(int mappedAngle, int rawJoystickValue, int centerAngle) {
  if (rawJoystickValue >= JOYSTICK_DEADZONE_LOW && rawJoystickValue <= JOYSTICK_DEADZONE_HIGH) {
    return centerAngle;
  }
  return mappedAngle;
}

void setup() {
  Serial.begin(9600);
  servoRoll.attach(SERVO_ROLL_PIN);
  servoX.attach(SERVO_X_PIN);
  servoY.attach(SERVO_Y_PIN);
  servoMouth.attach(SERVO_MOUTH_PIN);
  servoRoll.write(90); servoX.write(90); servoY.write(90); servoMouth.write(45);
  delay(1000);
}

void loop() {
  int joystickRoll  = analogRead(JOYSTICK_ROLL_PIN);
  int joystickX     = analogRead(JOYSTICK_X_PIN);
  int joystickY     = analogRead(JOYSTICK_Y_PIN);
  int joystickMouth = analogRead(JOYSTICK_MOUTH_PIN);

  int angleRoll  = map(joystickRoll,  0, 1023, ROLL_MIN,  ROLL_MAX);
  int angleX     = map(joystickX,     0, 1023, X_MIN,     X_MAX);
  int angleY     = map(joystickY,     0, 1023, Y_MIN,     Y_MAX);
  int angleMouth = map(joystickMouth, 0, 1023, MOUTH_MIN, MOUTH_MAX);

  angleRoll = applyDeadzone(angleRoll, joystickRoll, 90);
  angleX    = applyDeadzone(angleX,    joystickX,    90);
  angleY    = applyDeadzone(angleY,    joystickY,    90);

  angleRoll  = constrain(angleRoll,  ROLL_MIN,  ROLL_MAX);
  angleX     = constrain(angleX,     X_MIN,     X_MAX);
  angleY     = constrain(angleY,     Y_MIN,     Y_MAX);
  angleMouth = constrain(angleMouth, MOUTH_MIN, MOUTH_MAX);

  servoRoll.write(angleRoll);
  servoX.write(angleX);
  servoY.write(angleY);
  servoMouth.write(angleMouth);

  Serial.print("Roll:");  Serial.print(angleRoll);
  Serial.print(" X:");   Serial.print(angleX);
  Serial.print(" Y:");   Serial.print(angleY);
  Serial.print(" Mouth:"); Serial.println(angleMouth);

  delay(20);
}
