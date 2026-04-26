/*
 * ================================================================
 *  4-Axis Robotic Arm — Joystick Control
 *  Board  : Arduino Uno
 *  Power  : 9V into Arduino barrel jack
 *           Joysticks → Arduino 5V pin (low current, fine)
 *           Servos    → separate 5V / 2A+ supply (shared GND!)
 * ================================================================
 *
 *  PIN MAPPING (from your notes):
 *  --------------------------------
 *  TOP motor   → Servo pin 7  ↔ Joystick A3
 *  2nd motor   → Servo pin 9  ↔ Joystick A2
 *  3rd motor   → Servo pin 11 ↔ Joystick A1   (hand/gripper)
 *  4th motor   → Servo pin 5  ↔ Joystick A4
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
Servo servo_top;       // TOP motor
Servo servo_second;    // 2nd motor
Servo servo_hand;      // 3rd motor (hand / gripper)
Servo servo_fourth;    // 4th motor

// ── Servo digital pins ────────────────────────────────────────
#define PIN_TOP     7
#define PIN_SECOND  9
#define PIN_HAND    11
#define PIN_FOURTH  5

// ── Joystick analog pins ──────────────────────────────────────
#define JOY_TOP     A3
#define JOY_SECOND  A2
#define JOY_HAND    A1
#define JOY_FOURTH  A4

// ── Starting angles for each servo (degrees) ─────────────────
int top_degree    = 90;   // center position
int second_degree = 90;   // center position
int hand_degree   = 45;   // gripper starts slightly closed
int fourth_degree = 90;   // center position

// ── Movement speed ────────────────────────────────────────────
// How many degrees to add/subtract each loop tick.
// Raise this number = faster arm movement.
// Lower this number = slower, more precise movement.
int move_speed = 3;

// ── Joystick deadzone thresholds ─────────────────────────────
// ADC center is ~512. We ignore anything between 340 and 680
// so the arm doesn't drift when the joystick is at rest.
int LOW_THRESH  = 340;
int HIGH_THRESH = 680;

// ════════════════════════════════════════════════════════════
void setup() {
  Serial.begin(9600);

  // Attach each servo to its pin
  servo_top.attach(PIN_TOP);
  servo_second.attach(PIN_SECOND);
  servo_hand.attach(PIN_HAND);
  servo_fourth.attach(PIN_FOURTH);

  // Write starting positions right away
  // This prevents servos from snapping to a random angle on power-up
  servo_top.write(top_degree);
  servo_second.write(second_degree);
  servo_hand.write(hand_degree);
  servo_fourth.write(fourth_degree);

  Serial.println("=== Robotic Arm Ready ===");
  Serial.println("Move joysticks to control each axis.");
  delay(500);
}

// ════════════════════════════════════════════════════════════
void loop() {

  // ── Step 1: Read all 4 joysticks ─────────────────────────
  int joy_top    = analogRead(JOY_TOP);
  int joy_second = analogRead(JOY_SECOND);
  int joy_hand   = analogRead(JOY_HAND);
  int joy_fourth = analogRead(JOY_FOURTH);

  // ── Step 2: TOP motor (servo pin 7, joystick A3) ─────────
  // Full rotation base — 0° to 180°
  if (joy_top < LOW_THRESH) {
    top_degree = top_degree - move_speed;   // push left  → move left
  }
  else if (joy_top > HIGH_THRESH) {
    top_degree = top_degree + move_speed;   // push right → move right
  }
  top_degree = constrain(top_degree, 0, 180);  // hard stops at 0 and 180
  servo_top.write(top_degree);

  // ── Step 3: 2nd motor (servo pin 9, joystick A2) ─────────
  // Limited range to protect the joint — 15° to 165°
  if (joy_second < LOW_THRESH) {
    second_degree = second_degree - move_speed;
  }
  else if (joy_second > HIGH_THRESH) {
    second_degree = second_degree + move_speed;
  }
  second_degree = constrain(second_degree, 15, 165);
  servo_second.write(second_degree);

  // ── Step 4: 3rd motor / HAND (servo pin 11, joystick A1) ─
  // Gripper range — 10° (open) to 90° (fully closed)
  if (joy_hand < LOW_THRESH) {
    hand_degree = hand_degree - move_speed;   // open gripper
  }
  else if (joy_hand > HIGH_THRESH) {
    hand_degree = hand_degree + move_speed;   // close gripper
  }
  hand_degree = constrain(hand_degree, 10, 90);
  servo_hand.write(hand_degree);

  // ── Step 5: 4th motor (servo pin 5, joystick A4) ─────────
  // Limited range — 15° to 165°
  if (joy_fourth < LOW_THRESH) {
    fourth_degree = fourth_degree - move_speed;
  }
  else if (joy_fourth > HIGH_THRESH) {
    fourth_degree = fourth_degree + move_speed;
  }
  fourth_degree = constrain(fourth_degree, 15, 165);
  servo_fourth.write(fourth_degree);

  // ── Step 6: Print current angles to Serial Monitor ───────
  // Open Serial Monitor (top right of Arduino IDE) at 9600 baud
  // to see live angles while you move the arm.
  Serial.print("TOP:");    Serial.print(top_degree);
  Serial.print("  2nd:");  Serial.print(second_degree);
  Serial.print("  Hand:"); Serial.print(hand_degree);
  Serial.print("  4th:");  Serial.println(fourth_degree);

  // ── Step 7: Wait 20ms before next loop (50 Hz) ───────────
  delay(20);
}
