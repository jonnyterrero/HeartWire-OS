/*
 * ================================================================
 *  4-Axis Robotic Arm — Simple Joystick Control
 * ================================================================
 *
 *  Hardware:
 *    - Arduino Uno (powered by 9V supply)
 *    - 4x SG90 or MG90S servo motors
 *    - 4x analog joystick modules (powered by Arduino 5V)
 *
 *  Power Setup:
 *    - Arduino: 9V power supply connected to barrel jack or Vin
 *    - Joysticks: 5V and GND from Arduino (each joystick needs 5V and GND)
 *    - Servos: Use external 5V supply (2A+) - do NOT power from Arduino 5V
 *              Share GND between Arduino and servo supply
 *
 *  Wiring:
 *    SERVOS (PWM pins):
 *      Servo 1 (Roll/Base)   -> Pin 4
 *      Servo 2 (Shoulder)    -> Pin 7
 *      Servo 3 (Elbow)       -> Pin 10
 *      Servo 4 (Gripper)     -> Pin 12
 *
 *    JOYSTICKS (analog pins - use X axis from each):
 *      Joystick 1 -> A0
 *      Joystick 2 -> A2
 *      Joystick 3 -> A4
 *      Joystick 4 -> A5
 *
 *    Each joystick: VCC -> 5V, GND -> GND, VRx -> analog pin above
 * ================================================================
 */

#include <Servo.h>

// -------- Servo pins --------
const int SERVO_1_PIN = 4;
const int SERVO_2_PIN = 7;
const int SERVO_3_PIN = 10;
const int SERVO_4_PIN = 12;

// -------- Joystick pins --------
const int JOYSTICK_1_PIN = A0;
const int JOYSTICK_2_PIN = A2;
const int JOYSTICK_3_PIN = A4;
const int JOYSTICK_4_PIN = A5;

// -------- Servo objects --------
Servo servo1;
Servo servo2;
Servo servo3;
Servo servo4;

// -------- Angle limits (0 to 180 degrees) - change if your arm needs different limits --------
const int SERVO_1_MIN = 0;
const int SERVO_1_MAX = 180;

const int SERVO_2_MIN = 0;
const int SERVO_2_MAX = 180;

const int SERVO_3_MIN = 0;
const int SERVO_3_MAX = 180;

const int SERVO_4_MIN = 0;
const int SERVO_4_MAX = 180;

/*
 * setup() runs once when the Arduino starts.
 */
void setup() {
  Serial.begin(9600);
  Serial.println("4-Axis Robotic Arm - Joystick Control");
  Serial.println("--------------------------------------");

  // Attach each servo to its pin
  servo1.attach(SERVO_1_PIN);
  servo2.attach(SERVO_2_PIN);
  servo3.attach(SERVO_3_PIN);
  servo4.attach(SERVO_4_PIN);

  // Move to a starting position
  servo1.write(90);
  servo2.write(90);
  servo3.write(90);
  servo4.write(90);

  delay(500);

  Serial.println("Ready! Move the joysticks.");
  Serial.println();
}

/*
 * loop() runs over and over.
 * Read joysticks -> convert to angle -> move servos.
 */
void loop() {
  // -------- Read joystick values (0 to 1023) --------
  int joy1 = analogRead(JOYSTICK_1_PIN);
  int joy2 = analogRead(JOYSTICK_2_PIN);
  int joy3 = analogRead(JOYSTICK_3_PIN);
  int joy4 = analogRead(JOYSTICK_4_PIN);

  // -------- Convert to servo angles (0 to 180) --------
  // map(value, inMin, inMax, outMin, outMax)
  int angle1 = map(joy1, 0, 1023, SERVO_1_MIN, SERVO_1_MAX);
  int angle2 = map(joy2, 0, 1023, SERVO_2_MIN, SERVO_2_MAX);
  int angle3 = map(joy3, 0, 1023, SERVO_3_MIN, SERVO_3_MAX);
  int angle4 = map(joy4, 0, 1023, SERVO_4_MIN, SERVO_4_MAX);

  // -------- Keep angles in safe range --------
  angle1 = constrain(angle1, SERVO_1_MIN, SERVO_1_MAX);
  angle2 = constrain(angle2, SERVO_2_MIN, SERVO_2_MAX);
  angle3 = constrain(angle3, SERVO_3_MIN, SERVO_3_MAX);
  angle4 = constrain(angle4, SERVO_4_MIN, SERVO_4_MAX);

  // -------- Move the servos --------
  servo1.write(angle1);
  servo2.write(angle2);
  servo3.write(angle3);
  servo4.write(angle4);

  // -------- Print to Serial Monitor --------
  Serial.print("S1:");
  Serial.print(angle1);
  Serial.print(" S2:");
  Serial.print(angle2);
  Serial.print(" S3:");
  Serial.print(angle3);
  Serial.print(" S4:");
  Serial.println(angle4);

  delay(20);  // Small delay between readings
}
