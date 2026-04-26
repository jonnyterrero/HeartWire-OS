/*
 * 4-Axis Robotic Arm — Complete (Hand/Wrist/Forearm/Elbow)
 * Servos: 7, 9, 11, 5 | Joysticks: A3, A5, A1, A4
 * Deadzone-based incremental control.
 */

#include <Servo.h>

Servo servo_hand, servo_second, servo_fore_arm, servo_elbow;

#define PIN_HAND      7
#define PIN_SECOND    9
#define PIN_FORE_ARM  11
#define PIN_ELBOW     5

#define JOY_HAND      A3
#define JOY_SECOND    A5
#define JOY_FORE_ARM  A1
#define JOY_ELBOW     A4

int hand_degree = 90, second_degree = 90, fore_arm_degree = 45, elbow_degree = 90;
int move_speed = 3;
int LOW_THRESH = 340, HIGH_THRESH = 680;

void setup() {
  Serial.begin(9600);
  servo_hand.attach(PIN_HAND);
  servo_second.attach(PIN_SECOND);
  servo_fore_arm.attach(PIN_FORE_ARM);
  servo_elbow.attach(PIN_ELBOW);
  servo_hand.write(hand_degree);
  servo_second.write(second_degree);
  servo_fore_arm.write(fore_arm_degree);
  servo_elbow.write(elbow_degree);
  Serial.println("=== Robotic Arm Ready ===");
  delay(500);
}

void loop() {
  int joy_hand     = analogRead(JOY_HAND);
  int joy_second   = analogRead(JOY_SECOND);
  int joy_fore_arm = analogRead(JOY_FORE_ARM);
  int joy_elbow    = analogRead(JOY_ELBOW);

  if (joy_hand < LOW_THRESH) hand_degree -= move_speed;
  else if (joy_hand > HIGH_THRESH) hand_degree += move_speed;
  hand_degree = constrain(hand_degree, 0, 180);
  servo_hand.write(hand_degree);

  if (joy_second < LOW_THRESH) second_degree -= move_speed;
  else if (joy_second > HIGH_THRESH) second_degree += move_speed;
  second_degree = constrain(second_degree, 15, 165);
  servo_second.write(second_degree);

  if (joy_fore_arm < LOW_THRESH) fore_arm_degree -= move_speed;
  else if (joy_fore_arm > HIGH_THRESH) fore_arm_degree += move_speed;
  fore_arm_degree = constrain(fore_arm_degree, 10, 90);
  servo_fore_arm.write(fore_arm_degree);

  if (joy_elbow < LOW_THRESH) elbow_degree -= move_speed;
  else if (joy_elbow > HIGH_THRESH) elbow_degree += move_speed;
  elbow_degree = constrain(elbow_degree, 15, 165);
  servo_elbow.write(elbow_degree);

  Serial.print("Hand:");  Serial.print(hand_degree);
  Serial.print(" Wrist:"); Serial.print(second_degree);
  Serial.print(" Fore:"); Serial.print(fore_arm_degree);
  Serial.print(" Elbow:"); Serial.println(elbow_degree);

  delay(20);
}
