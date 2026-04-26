/*
 * ================================================
 *  4-Axis Robotic Arm — Joystick Control
 *  Board  : Arduino Uno
 *  Servos : 4x SG90 or MG90S
 *  Input  : 4x Joystick modules (1 axis each used)
 * ================================================
 *
 *  Wiring:
 *  -------
 *  Joystick 1 (Base)     → A0    |  Servo 1 (Base)     → D9
 *  Joystick 2 (Shoulder) → A1    |  Servo 2 (Shoulder) → D10
 *  Joystick 3 (Elbow)    → A2    |  Servo 3 (Elbow)    → D11
 *  Joystick 4 (Gripper)  → A3    |  Servo 4 (Gripper)  → D6
 *
 *  How it works:
 *  -------------
 *  Push a joystick forward  → servo moves in one direction
 *  Push a joystick backward → servo moves the other direction
 *  Let go (center ~512)     → servo holds its position
 *
 *  Power note:
 *  -----------
 *  Do NOT power servos from the Arduino 5V pin.
 *  Use a separate 5V / 2A power supply.
 *  Connect the GND of that supply to Arduino GND.
 * ================================================
 */

#include <Servo.h>

// ── Servo objects ────────────────────────────────
Servo servo_base;
Servo servo_shoulder;
Servo servo_elbow;
Servo servo_gripper;

// ── Starting positions (degrees) ─────────────────
int base_deg     = 90;
int shoulder_deg = 90;
int elbow_deg    = 90;
int gripper_deg  = 45;

// ── Joystick analog pins ──────────────────────────
#define JOY_BASE     A0
#define JOY_SHOULDER A1
#define JOY_ELBOW    A2
#define JOY_GRIPPER  A3

// ── Tuning knobs ──────────────────────────────────
// How many degrees to move per loop tick when joystick is pushed.
// Raise this number = faster arm. Lower = slower/more precise.
#define SPEED 3

// Joystick dead zone: values between LOW_THRESH and HIGH_THRESH
// are treated as "center / not moving". This prevents drift.
// Most joystick modules center around 512 out of 0-1023.
#define LOW_THRESH  400
#define HIGH_THRESH 620

// Loop delay in milliseconds — controls how fast the loop runs.
// 20ms = 50 times per second. Good balance of speed and smoothness.
#define LOOP_DELAY  20

// ── Soft limits (degrees) ─────────────────────────
// Keeps each joint from hitting its physical end stop.
// Adjust these to match YOUR arm's safe range of motion.
#define BASE_MIN      0
#define BASE_MAX      180

#define SHOULDER_MIN  15
#define SHOULDER_MAX  165

#define ELBOW_MIN     15
#define ELBOW_MAX     165

#define GRIPPER_MIN   10
#define GRIPPER_MAX   90

// =================================================
void setup() {
  Serial.begin(9600);

  // Attach each servo to its PWM pin
  servo_base.attach(9);
  servo_shoulder.attach(10);
  servo_elbow.attach(11);
  servo_gripper.attach(6);

  // Write starting positions so arm starts at a known safe spot
  servo_base.write(base_deg);
  servo_shoulder.write(shoulder_deg);
  servo_elbow.write(elbow_deg);
  servo_gripper.write(gripper_deg);

  delay(500); // brief pause to let servos reach start position

  Serial.println("Robotic arm ready.");
}

// =================================================
void loop() {

  // ── Read all 4 joysticks ───────────────────────
  int joy_base     = analogRead(JOY_BASE);
  int joy_shoulder = analogRead(JOY_SHOULDER);
  int joy_elbow    = analogRead(JOY_ELBOW);
  int joy_gripper  = analogRead(JOY_GRIPPER);

  // ── Base ──────────────────────────────────────
  if (joy_base < LOW_THRESH)        base_deg -= SPEED;
  else if (joy_base > HIGH_THRESH)  base_deg += SPEED;
  base_deg = constrain(base_deg, BASE_MIN, BASE_MAX);

  // ── Shoulder ──────────────────────────────────
  if (joy_shoulder < LOW_THRESH)        shoulder_deg -= SPEED;
  else if (joy_shoulder > HIGH_THRESH)  shoulder_deg += SPEED;
  shoulder_deg = constrain(shoulder_deg, SHOULDER_MIN, SHOULDER_MAX);

  // ── Elbow ─────────────────────────────────────
  if (joy_elbow < LOW_THRESH)        elbow_deg -= SPEED;
  else if (joy_elbow > HIGH_THRESH)  elbow_deg += SPEED;
  elbow_deg = constrain(elbow_deg, ELBOW_MIN, ELBOW_MAX);

  // ── Gripper ───────────────────────────────────
  if (joy_gripper < LOW_THRESH)        gripper_deg -= SPEED;
  else if (joy_gripper > HIGH_THRESH)  gripper_deg += SPEED;
  gripper_deg = constrain(gripper_deg, GRIPPER_MIN, GRIPPER_MAX);

  // ── Write angles to servos ────────────────────
  servo_base.write(base_deg);
  servo_shoulder.write(shoulder_deg);
  servo_elbow.write(elbow_deg);
  servo_gripper.write(gripper_deg);

  // ── Print to Serial Monitor (for debugging) ───
  Serial.print("Base:");     Serial.print(base_deg);
  Serial.print("  Shldr:");  Serial.print(shoulder_deg);
  Serial.print("  Elbow:");  Serial.print(elbow_deg);
  Serial.print("  Grip:");   Serial.println(gripper_deg);

  // ── Wait before next loop ─────────────────────
  delay(LOOP_DELAY);
}
