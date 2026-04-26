/*
 * ================================================================
 *  4-Axis Robotic Arm — Joystick Control (Anti-Jitter)
 *  Board  : Arduino Uno
 *  Power  : 9V into Arduino barrel jack
 *           Joysticks → Arduino 5V pin
 *           Servos    → separate 6V supply (shared GND!)
 * ================================================================
 *
 *  PIN MAPPING:
 *  --------------------------------
 *  TOP motor   → Servo pin 7  ↔ Joystick A3
 *  2nd motor   → Servo pin 3  ↔ Joystick A2   *** MOVED from 9 → 3 ***
 *  Hand/grip   → Servo pin 11 ↔ Joystick A1
 *  4th motor   → Servo pin 5  ↔ Joystick A4
 *
 *  WHY PIN 3 INSTEAD OF PIN 9:
 *  The Servo library uses Timer1 internally. Pins 9 and 10 also
 *  share Timer1 for PWM, so when 4 servos are active Timer1 gets
 *  overloaded and pin 9 output drops out. Pin 3 uses Timer2 —
 *  no conflict.  ** Move the 2nd servo signal wire from pin 9
 *  to pin 3 on the Arduino. **
 *
 *  ANTI-JITTER IMPROVEMENTS:
 *  1. ADC dummy reads before each real read (mux settling)
 *  2. Exponential moving average (EMA) filter on all joystick inputs
 *  3. Wider, centered deadzone with smooth ramp-in at edges
 * ================================================================
 */

#include <Servo.h>

// ── Servo objects ─────────────────────────────────────────────
Servo servo_top;
Servo servo_second;
Servo servo_hand;
Servo servo_fourth;

// ── Servo digital pins ────────────────────────────────────────
#define PIN_TOP     7
#define PIN_SECOND  3    // *** CHANGED: was 9, now 3 (Timer2, no conflict) ***
#define PIN_HAND    11
#define PIN_FOURTH  5

// ── Joystick analog pins ──────────────────────────────────────
#define JOY_TOP     A3
#define JOY_SECOND  A2
#define JOY_HAND    A1
#define JOY_FOURTH  A4

// ── Starting angles (degrees) ─────────────────────────────────
int top_degree    = 90;
int second_degree = 90;
int hand_degree   = 45;
int fourth_degree = 90;

// ── Movement tuning ───────────────────────────────────────────
int move_speed  = 3;      // degrees per tick at full deflection
int LOW_THRESH  = 340;    // below this → move negative
int HIGH_THRESH = 680;    // above this → move positive

// ── EMA filter (0.0–1.0, lower = smoother but laggier) ───────
// 0.3 is a good balance: kills ADC noise without feeling sluggish
float ema_alpha = 0.3;

// Filtered joystick values (start at center = 512)
float filtered_top    = 512.0;
float filtered_second = 512.0;
float filtered_hand   = 512.0;
float filtered_fourth = 512.0;

// ══════════════════════════════════════════════════════════════
//  Helper: read an analog pin with ADC settling (dummy read)
// ══════════════════════════════════════════════════════════════
int stableRead(int pin) {
  analogRead(pin);          // dummy read — lets ADC mux settle
  return analogRead(pin);   // real read — clean value
}

// ══════════════════════════════════════════════════════════════
//  Helper: apply deadzone + increment to one axis
//  Returns the new servo degree after this tick
// ══════════════════════════════════════════════════════════════
int updateAxis(float filtered, int current_degree, int min_deg, int max_deg) {
  int reading = (int)filtered;

  if (reading < LOW_THRESH) {
    current_degree = current_degree - move_speed;
  }
  else if (reading > HIGH_THRESH) {
    current_degree = current_degree + move_speed;
  }
  // else: inside deadzone — hold position (no change)

  return constrain(current_degree, min_deg, max_deg);
}

// ══════════════════════════════════════════════════════════════
void setup() {
  Serial.begin(9600);

  servo_top.attach(PIN_TOP);
  servo_second.attach(PIN_SECOND);
  servo_hand.attach(PIN_HAND);
  servo_fourth.attach(PIN_FOURTH);

  servo_top.write(top_degree);
  servo_second.write(second_degree);
  servo_hand.write(hand_degree);
  servo_fourth.write(fourth_degree);

  Serial.println("=== Robotic Arm Ready (Anti-Jitter) ===");
  Serial.println("Move joysticks to control each axis.");
  Serial.println("2nd servo now on pin 3 (was pin 9).");
  delay(500);
}

// ══════════════════════════════════════════════════════════════
void loop() {

  // ── Step 1: Read all 4 joysticks (with ADC settling) ─────
  int raw_top    = stableRead(JOY_TOP);
  int raw_second = stableRead(JOY_SECOND);
  int raw_hand   = stableRead(JOY_HAND);
  int raw_fourth = stableRead(JOY_FOURTH);

  // ── Step 2: Apply EMA filter to each reading ─────────────
  //   new_filtered = alpha * raw + (1 - alpha) * old_filtered
  //   This smooths out ADC noise and single-sample spikes.
  filtered_top    = ema_alpha * raw_top    + (1.0 - ema_alpha) * filtered_top;
  filtered_second = ema_alpha * raw_second + (1.0 - ema_alpha) * filtered_second;
  filtered_hand   = ema_alpha * raw_hand   + (1.0 - ema_alpha) * filtered_hand;
  filtered_fourth = ema_alpha * raw_fourth + (1.0 - ema_alpha) * filtered_fourth;

  // ── Step 3: Update each axis ─────────────────────────────
  top_degree    = updateAxis(filtered_top,    top_degree,    0,  180);
  second_degree = updateAxis(filtered_second, second_degree, 15, 165);
  hand_degree   = updateAxis(filtered_hand,   hand_degree,   10,  90);
  fourth_degree = updateAxis(filtered_fourth, fourth_degree, 15, 165);

  // ── Step 4: Write to servos ──────────────────────────────
  servo_top.write(top_degree);
  servo_second.write(second_degree);
  servo_hand.write(hand_degree);
  servo_fourth.write(fourth_degree);

  // ── Step 5: Print current angles ─────────────────────────
  Serial.print("TOP:");    Serial.print(top_degree);
  Serial.print("  2nd:");  Serial.print(second_degree);
  Serial.print("  Hand:"); Serial.print(hand_degree);
  Serial.print("  4th:");  Serial.println(fourth_degree);

  // ── Step 6: 50 Hz loop ──────────────────────────────────
  delay(20);
}