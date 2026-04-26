/*
 * ================================================================
 *  4-Axis Robotic Arm — Joystick Control
 *  Board  : Arduino Uno
 *  Input  : 4x Joysticks (analog, one axis each)
 *  Servos : 4x SG90 or MG90S
 * ================================================================
 *
 *  WIRING:
 *  -------
 *  Servo pins  (PWM digital):
 *    Base     → pin 4
 *    Shoulder → pin 7
 *    Elbow    → pin 10
 *    Gripper  → pin 12
 *
 *  Joystick analog pins:
 *    Base joy     → A0
 *    Shoulder joy → A2
 *    Elbow joy    → A4
 *    Gripper joy  → A5
 *
 *  POWER:
 *  ------
 *  - Arduino powered by 9V into the barrel jack (onboard regulator handles it)
 *  - Joystick VCC → Arduino 5V pin  (low current, fine)
 *  - Joystick GND → Arduino GND
 *  - Servos: DO NOT power from Arduino 5V pin.
 *    Use a separate 5V / 2A+ power supply for the servos.
 *    Connect that supply's GND to Arduino GND (shared ground).
 *
 *  HOW IT WORKS:
 *  -------------
 *  Each joystick reads 0–1023 from the ADC.
 *  - Center (no input)  ≈ 512
 *  - Push one way       → reads < 340  → servo moves –
 *  - Push other way     → reads > 680  → servo moves +
 *  - Dead zone 340–680  → servo holds position (no drift)
 *
 *  Each loop adds/subtracts degrees from the current angle.
 *  constrain() keeps all angles inside safe limits.
 *  delay(20) sets the loop speed to ~50 times per second.
 * ================================================================
 */

#include <Servo.h>

// ── Servo objects ─────────────────────────────────────────────
Servo servo_base;
Servo servo_shoulder;
Servo servo_elbow;
Servo servo_gripper;

// ── Current angle for each servo (starts at 90° = center) ────
int base_degree     = 90;
int shoulder_degree = 90;
int elbow_degree    = 90;
int gripper_degree  = 45;   // gripper starts slightly closed

// ── How many degrees to move per loop tick ───────────────────
// Increase this number = faster movement
// Decrease this number = slower, more precise movement
int move_speed = 3;   // degrees per tick (at 50 Hz = 150 deg/sec max)

// ── Joystick threshold values ────────────────────────────────
// ADC reads 0–1023. Center is ~512.
// Below LOW_THRESH  = joystick pushed one direction
// Above HIGH_THRESH = joystick pushed other direction
// Between them      = deadzone (arm holds still)
int LOW_THRESH  = 340;
int HIGH_THRESH = 680;

// ── Joystick analog input pins ────────────────────────────────
#define JOY_BASE      A0
#define JOY_SHOULDER  A2
#define JOY_ELBOW     A4
#define JOY_GRIPPER   A5

// ════════════════════════════════════════════════════════════
void setup() {
  Serial.begin(9600);

  // Attach each servo to its pin
  servo_base.attach(4);
  servo_shoulder.attach(7);
  servo_elbow.attach(10);
  servo_gripper.attach(12);

  // Write starting positions so servos don't snap randomly on power-up
  servo_base.write(base_degree);
  servo_shoulder.write(shoulder_degree);
  servo_elbow.write(elbow_degree);
  servo_gripper.write(gripper_degree);

  Serial.println("Robotic Arm Ready.");
  delay(500); // brief pause after startup
}

// ════════════════════════════════════════════════════════════
void loop() {

  // ── Read all 4 joysticks ────────────────────────────────
  int joy_base     = analogRead(JOY_BASE);
  int joy_shoulder = analogRead(JOY_SHOULDER);
  int joy_elbow    = analogRead(JOY_ELBOW);
  int joy_gripper  = analogRead(JOY_GRIPPER);

  // ── BASE servo ───────────────────────────────────────────
  // Full rotation: 0° to 180°
  if (joy_base < LOW_THRESH) {
    base_degree -= move_speed;   // push left  → rotate left
  }
  else if (joy_base > HIGH_THRESH) {
    base_degree += move_speed;   // push right → rotate right
  }
  base_degree = constrain(base_degree, 0, 180);
  servo_base.write(base_degree);

  // ── SHOULDER servo ───────────────────────────────────────
  // Limited range: 15° to 165° (keeps away from hard stops)
  if (joy_shoulder < LOW_THRESH) {
    shoulder_degree -= move_speed;
  }
  else if (joy_shoulder > HIGH_THRESH) {
    shoulder_degree += move_speed;
  }
  shoulder_degree = constrain(shoulder_degree, 15, 165);
  servo_shoulder.write(shoulder_degree);

  // ── ELBOW servo ─────────────────────────────────────────
  // Limited range: 15° to 165°
  if (joy_elbow < LOW_THRESH) {
    elbow_degree -= move_speed;
  }
  else if (joy_elbow > HIGH_THRESH) {
    elbow_degree += move_speed;
  }
  elbow_degree = constrain(elbow_degree, 15, 165);
  servo_elbow.write(elbow_degree);

  // ── GRIPPER servo ────────────────────────────────────────
  // Small range: 10° (open) to 90° (closed)
  if (joy_gripper < LOW_THRESH) {
    gripper_degree -= move_speed;
  }
  else if (joy_gripper > HIGH_THRESH) {
    gripper_degree += move_speed;
  }
  gripper_degree = constrain(gripper_degree, 10, 90);
  servo_gripper.write(gripper_degree);

  // ── Print angles to Serial Monitor (for debugging) ──────
  Serial.print("Base:");     Serial.print(base_degree);
  Serial.print("  Shldr:");  Serial.print(shoulder_degree);
  Serial.print("  Elbow:");  Serial.print(elbow_degree);
  Serial.print("  Grip:");   Serial.println(gripper_degree);

  // ── Loop speed: 20ms = 50 loops per second ───────────────
  delay(20);
}
