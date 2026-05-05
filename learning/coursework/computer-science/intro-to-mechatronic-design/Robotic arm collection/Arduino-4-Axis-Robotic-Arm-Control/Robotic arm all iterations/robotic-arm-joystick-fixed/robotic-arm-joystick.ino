/*
 * ================================================================
 *  4-Axis Robotic Arm — Joystick Control (Beginner-Friendly)
 * ================================================================
 *
 *  Hardware:
 *    - Arduino Uno
 *    - 4x SG90 or MG90S servo motors
 *    - 4x analog joystick modules (2-axis, we use 1 axis per joystick)
 *
 *  Wiring:
 *    SERVOS (PWM pins):
 *      Roll   (base rotation)  -> Pin 6
 *      X      (shoulder)      -> Pin 5
 *      Y      (elbow)         -> Pin 9
 *      Mouth  (gripper)       -> Pin 3
 *
 *    JOYSTICKS (analog pins):
 *      Joystick 1 (Roll)   -> A0  (use the X axis wire)
 *      Joystick 2 (X)      -> A1  (use the X axis wire)
 *      Joystick 3 (Y)      -> A2  (use the X axis wire)
 *      Joystick 4 (Mouth)  -> A3  (use the X axis wire)
 *
 *    Each joystick also needs: VCC -> 5V, GND -> GND
 *
 *  Power: Use an external 5V supply (2A+) for the servos.
 *         Connect GND of the supply to Arduino GND.
 * ================================================================
 */

#include <Servo.h>

// -------- Pin definitions (change these to match your wiring) --------

// Servo pins - which digital pin each servo is connected to
const int SERVO_ROLL_PIN  = 6;
const int SERVO_X_PIN     = 5;
const int SERVO_Y_PIN     = 9;
const int SERVO_MOUTH_PIN = 3;

// Joystick pins - which analog pin each joystick's X-axis is connected to
const int JOYSTICK_ROLL_PIN  = A0;
const int JOYSTICK_X_PIN     = A1;
const int JOYSTICK_Y_PIN     = A2;
const int JOYSTICK_MOUTH_PIN = A3;

// -------- Servo objects --------
Servo servoRoll;
Servo servoX;
Servo servoY;
Servo servoMouth;

// -------- Angle limits (degrees) - adjust if your arm has different limits --------
const int ROLL_MIN  = 0;
const int ROLL_MAX  = 180;

const int X_MIN     = 15;
const int X_MAX     = 165;

const int Y_MIN     = 15;
const int Y_MAX     = 165;

const int MOUTH_MIN = 10;
const int MOUTH_MAX = 90;

// -------- Deadzone: joystick values in this range are treated as "center" --------
// Prevents jitter when you release the joystick (center is around 512)
const int JOYSTICK_DEADZONE_LOW  = 450;
const int JOYSTICK_DEADZONE_HIGH = 574;

// -------- How often to print angles to Serial (milliseconds) --------
const unsigned long SERIAL_PRINT_INTERVAL = 500;

unsigned long lastSerialPrint = 0;

/*
 * setup() runs once when the Arduino powers on or resets.
 */
void setup() {
  // Start serial communication so we can see the angles in the Serial Monitor
  Serial.begin(9600);
  Serial.println("4-Axis Robotic Arm - Joystick Control");
  Serial.println("--------------------------------------");

  // Attach each servo to its pin
  servoRoll.attach(SERVO_ROLL_PIN);
  servoX.attach(SERVO_X_PIN);
  servoY.attach(SERVO_Y_PIN);
  servoMouth.attach(SERVO_MOUTH_PIN);

  // Move all servos to a safe starting position (90 degrees)
  Serial.println("Moving to home position...");
  servoRoll.write(90);
  servoX.write(90);
  servoY.write(90);
  servoMouth.write(45);  // Gripper starts slightly open

  delay(1000);  // Wait for servos to reach position

  Serial.println("Ready! Move the joysticks to control the arm.");
  Serial.println();
}

/*
 * loop() runs over and over forever.
 * We read each joystick, convert to an angle, and move the servo.
 */
void loop() {
  // -------- Step 1: Read the raw values from each joystick --------
  // analogRead returns 0 to 1023
  int joystickRoll  = analogRead(JOYSTICK_ROLL_PIN);
  int joystickX     = analogRead(JOYSTICK_X_PIN);
  int joystickY     = analogRead(JOYSTICK_Y_PIN);
  int joystickMouth = analogRead(JOYSTICK_MOUTH_PIN);

  // -------- Step 2: Convert joystick values to servo angles --------
  // map(input, inMin, inMax, outMin, outMax) converts one range to another
  // Joystick: 0 = left, 512 = center, 1023 = right
  // Servo: we want 0 degrees to 180 degrees (or min to max for each joint)
  int angleRoll  = map(joystickRoll,  0, 1023, ROLL_MIN,  ROLL_MAX);
  int angleX     = map(joystickX,     0, 1023, X_MIN,     X_MAX);
  int angleY     = map(joystickY,     0, 1023, Y_MIN,     Y_MAX);
  int angleMouth = map(joystickMouth, 0, 1023, MOUTH_MIN, MOUTH_MAX);

  // -------- Step 3: Apply deadzone for Roll, X, Y (optional - reduces jitter) --------
  // For the gripper (Mouth), we usually want direct control, so no deadzone
  angleRoll = applyDeadzone(angleRoll, joystickRoll, 90);
  angleX    = applyDeadzone(angleX,    joystickX,    90);
  angleY    = applyDeadzone(angleY,    joystickY,    90);
  // angleMouth - no deadzone, so gripper responds immediately

  // -------- Step 4: Keep angles within safe limits --------
  angleRoll  = constrain(angleRoll,  ROLL_MIN,  ROLL_MAX);
  angleX     = constrain(angleX,     X_MIN,     X_MAX);
  angleY     = constrain(angleY,     Y_MIN,     Y_MAX);
  angleMouth = constrain(angleMouth, MOUTH_MIN, MOUTH_MAX);

  // -------- Step 5: Send the angles to the servos --------
  servoRoll.write(angleRoll);
  servoX.write(angleX);
  servoY.write(angleY);
  servoMouth.write(angleMouth);

  // -------- Step 6: Print angles to Serial Monitor (every 500 ms) --------
  if (millis() - lastSerialPrint >= SERIAL_PRINT_INTERVAL) {
    lastSerialPrint = millis();

    Serial.print("Roll: ");
    Serial.print(angleRoll);
    Serial.print("  X: ");
    Serial.print(angleX);
    Serial.print("  Y: ");
    Serial.print(angleY);
    Serial.print("  Mouth: ");
    Serial.println(angleMouth);
  }

  // Small delay so we don't read the joysticks too fast
  delay(20);
}

/*
 * applyDeadzone - if the joystick is near center, hold the servo at centerAngle
 * This prevents the servo from jittering when you're not touching the joystick.
 */
int applyDeadzone(int mappedAngle, int rawJoystickValue, int centerAngle) {
  if (rawJoystickValue >= JOYSTICK_DEADZONE_LOW && rawJoystickValue <= JOYSTICK_DEADZONE_HIGH) {
    return centerAngle;  // Joystick is in the "center" zone, hold position
  }
  return mappedAngle;
}
