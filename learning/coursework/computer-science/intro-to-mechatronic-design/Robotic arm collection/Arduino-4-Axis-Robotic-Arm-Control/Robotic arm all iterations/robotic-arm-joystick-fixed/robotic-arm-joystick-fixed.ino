/*
 * ================================================================
 *  4-Axis Robotic Arm — Joystick Control (Fixed)
 *  Board  : Arduino Uno
 *  Power  : 9V into Arduino barrel jack
 *           Joysticks → Arduino 5V pin
 *           Servos    → separate 5V / 2A+ supply (shared GND!)
 * ================================================================
 *
 *  PIN MAPPING (change JOY_* below if your wiring differs):
 *    TOP motor   → Servo pin 7   ↔ Joystick A0
 *    2nd motor   → Servo pin 9   ↔ Joystick A2
 *    3rd motor   → Servo pin 11  ↔ Joystick A4 (hand/gripper)
 *    4th motor   → Servo pin 5   ↔ Joystick A5
 *
 *  TROUBLESHOOTING:
 *    Set DEBUG_JOYSTICKS to true below, then open Serial Monitor.
 *    You should see raw values (0-1023) change when you move each joystick.
 *    If values stay at 0, 1023, or random - check wiring:
 *      - Each joystick: VCC→5V, GND→GND, VRx→analog pin
 *      - Try VRy instead of VRx if one axis doesn't work
 * ================================================================
 */

#include <Servo.h>

// -------- Set to true to see raw joystick values (for debugging) --------
#define DEBUG_JOYSTICKS true

// -------- Servo pins --------
#define PIN_TOP     7
#define PIN_SECOND  9
#define PIN_HAND    11
#define PIN_FOURTH  5

// -------- Joystick analog pins (A0, A2, A4, A5 per your wiring) --------
#define JOY_TOP     A0
#define JOY_SECOND  A2
#define JOY_HAND    A4
#define JOY_FOURTH  A5

// -------- Servo objects --------
Servo servo_top;
Servo servo_second;
Servo servo_hand;
Servo servo_fourth;

// -------- Angle limits --------
const int TOP_MIN    = 0;
const int TOP_MAX    = 180;

const int SECOND_MIN = 15;
const int SECOND_MAX = 165;

const int HAND_MIN   = 10;
const int HAND_MAX   = 90;

const int FOURTH_MIN = 15;
const int FOURTH_MAX = 165;

void setup() {
  Serial.begin(9600);
  Serial.println("=== Robotic Arm Joystick Control ===");

  servo_top.attach(PIN_TOP);
  servo_second.attach(PIN_SECOND);
  servo_hand.attach(PIN_HAND);
  servo_fourth.attach(PIN_FOURTH);

  // Start at center positions
  servo_top.write(90);
  servo_second.write(90);
  servo_hand.write(45);
  servo_fourth.write(90);

  delay(500);

  if (DEBUG_JOYSTICKS) {
    Serial.println("DEBUG MODE: Raw joystick values (0-1023)");
    Serial.println("Move each joystick - values should change.\n");
  } else {
    Serial.println("Ready! Move joysticks to control the arm.");
    Serial.println("(Set DEBUG_JOYSTICKS to true to see raw values)\n");
  }
}

void loop() {
  // -------- Read raw joystick values --------
  int joy_top    = analogRead(JOY_TOP);
  int joy_second = analogRead(JOY_SECOND);
  int joy_hand   = analogRead(JOY_HAND);
  int joy_fourth = analogRead(JOY_FOURTH);

  if (DEBUG_JOYSTICKS) {
    // -------- DEBUG: Print raw values only --------
    Serial.print("TOP:");    Serial.print(joy_top);
    Serial.print("  2nd:");  Serial.print(joy_second);
    Serial.print("  Hand:"); Serial.print(joy_hand);
    Serial.print("  4th:");  Serial.println(joy_fourth);
    delay(100);
    return;  // Don't move servos in debug mode
  }

  // -------- Direct mapping: joystick 0-1023 → servo angle --------
  // No deadzone - simpler and works with any joystick
  int top_deg    = map(joy_top,    0, 1023, TOP_MIN,    TOP_MAX);
  int second_deg = map(joy_second,  0, 1023, SECOND_MIN, SECOND_MAX);
  int hand_deg   = map(joy_hand,   0, 1023, HAND_MIN,   HAND_MAX);
  int fourth_deg = map(joy_fourth,  0, 1023, FOURTH_MIN, FOURTH_MAX);

  // -------- Keep within limits --------
  top_deg    = constrain(top_deg,    TOP_MIN,    TOP_MAX);
  second_deg = constrain(second_deg, SECOND_MIN, SECOND_MAX);
  hand_deg   = constrain(hand_deg,   HAND_MIN,   HAND_MAX);
  fourth_deg = constrain(fourth_deg, FOURTH_MIN, FOURTH_MAX);

  // -------- Move servos --------
  servo_top.write(top_deg);
  servo_second.write(second_deg);
  servo_hand.write(hand_deg);
  servo_fourth.write(fourth_deg);

  // -------- Print angles --------
  Serial.print("TOP:");    Serial.print(top_deg);
  Serial.print("  2nd:");  Serial.print(second_deg);
  Serial.print("  Hand:"); Serial.print(hand_deg);
  Serial.print("  4th:");  Serial.println(fourth_deg);

  delay(20);
}
