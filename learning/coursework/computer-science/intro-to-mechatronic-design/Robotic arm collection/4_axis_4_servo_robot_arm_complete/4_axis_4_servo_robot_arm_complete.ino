/*
 * ================================================================
 *  4-Axis Robotic Arm — Joystick Control
 *  Board  : Arduino Uno
 *  Power  : 9V into Arduino barrel jack
 *           Joysticks → Arduino 5V pin
 *           Servos    → separate 6V supply (shared GND!)
 * ================================================================
 *
 *  PIN MAPPING:
 *  --------------------------------
 *  Hand (gripper) → Servo pin 7  ↔ Joystick A3
 *  Wrist          → Servo pin 9  ↔ Joystick A2
 *  Forearm        → Servo pin 11 ↔ Joystick A1
 *  Elbow          → Servo pin 5  ↔ Joystick A4
 *
 *  HOW THE JOYSTICK CONTROL WORKS:
 *  --------------------------------
 *  Joystick center (at rest) reads ~512 out of 0–1023
 *  Push joystick one way  → reads below 340 → servo moves –
 *  Push joystick other way → reads above 680 → servo moves +
 *  Joystick in deadzone (340–680) → servo holds its position
 *
 *  move_speed = how many degrees per loop tick the servo moves.
 *  delay(20)  = loop runs 50 times per second.
 *  So max speed = move_speed × 50 = degrees per second.
 *  At move_speed = 3 → max 150 degrees/second.
 * ================================================================
 */

#include <Servo.h>

// ── Servo objects ─────────────────────────────────────────────
Servo servo_hand;       // TOP motor (hand / gripper)
Servo servo_second;     // 2nd motor (wrist)
Servo servo_fore_arm;   // 3rd motor (intermediate arm)
Servo servo_elbow;      // 4th motor (bottom)

// ── Servo digital pins ────────────────────────────────────────
#define PIN_HAND      7
#define PIN_SECOND    9
#define PIN_FORE_ARM  11
#define PIN_ELBOW     5

// ── Joystick analog pins ──────────────────────────────────────
#define JOY_HAND      A3
#define JOY_SECOND    A5
#define JOY_FORE_ARM  A1
#define JOY_ELBOW     A4

// ── Starting angles for each servo (degrees) ─────────────────
int hand_degree     = 90;   // center position
int second_degree   = 90;   // center position
int fore_arm_degree = 45;   // starts slightly closed
int elbow_degree    = 90;   // center position

// ── Movement speed ────────────────────────────────────────────
int move_speed = 3;

// ── Joystick deadzone thresholds ─────────────────────────────
int LOW_THRESH  = 340;
int HIGH_THRESH = 680;

// ════════════════════════════════════════════════════════════
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
  Serial.println("Move joysticks to control each axis.");
  delay(500);
}

// ════════════════════════════════════════════════════════════
void loop() {

  // ── Step 1: Read all 4 joysticks ─────────────────────────
  int joy_hand     = analogRead(JOY_HAND);
  int joy_second   = analogRead(JOY_SECOND);
  int joy_fore_arm = analogRead(JOY_FORE_ARM);
  int joy_elbow    = analogRead(JOY_ELBOW);

  // ── Step 2: Hand / gripper (servo pin 7, joystick A3) ────
  if (joy_hand < LOW_THRESH) {
    hand_degree = hand_degree - move_speed;
  }
  else if (joy_hand > HIGH_THRESH) {
    hand_degree = hand_degree + move_speed;
  }
  hand_degree = constrain(hand_degree, 0, 180);
  servo_hand.write(hand_degree);

  // ── Step 3: Wrist (servo pin 9, joystick A2) ─────────────
  if (joy_second < LOW_THRESH) {
    second_degree = second_degree - move_speed;
  }
  else if (joy_second > HIGH_THRESH) {
    second_degree = second_degree + move_speed;
  }
  second_degree = constrain(second_degree, 15, 165);
  servo_second.write(second_degree);

  // ── Step 4: Forearm (servo pin 11, joystick A1) ──────────
  if (joy_fore_arm < LOW_THRESH) {
    fore_arm_degree = fore_arm_degree - move_speed;
  }
  else if (joy_fore_arm > HIGH_THRESH) {
    fore_arm_degree = fore_arm_degree + move_speed;
  }
  fore_arm_degree = constrain(fore_arm_degree, 10, 90);
  servo_fore_arm.write(fore_arm_degree);

  // ── Step 5: Elbow (servo pin 5, joystick A4) ─────────────
  if (joy_elbow < LOW_THRESH) {
    elbow_degree = elbow_degree - move_speed;
  }
  else if (joy_elbow > HIGH_THRESH) {
    elbow_degree = elbow_degree + move_speed;
  }
  elbow_degree = constrain(elbow_degree, 15, 165);
  servo_elbow.write(elbow_degree);

  // ── Step 6: Print current angles ─────────────────────────
  Serial.print("Hand:");    Serial.print(hand_degree);
  Serial.print("  Wrist:"); Serial.print(second_degree);
  Serial.print("  Fore:");  Serial.print(fore_arm_degree);
  Serial.print("  Elbow:"); Serial.println(elbow_degree);

  // ── Step 7: Wait 20ms before next loop (50 Hz) ───────────
  delay(20);
}