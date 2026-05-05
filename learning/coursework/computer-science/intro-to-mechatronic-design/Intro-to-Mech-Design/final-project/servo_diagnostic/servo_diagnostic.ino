// =====================================================================
// SERVO DIAGNOSTIC -- run this BEFORE the main sketch.
//
// Tests every pin that could be a servo, ONE AT A TIME, by attaching,
// sweeping 90->120->90, then detaching before the next pin.
//
// Watch the arm. The servo that visibly moves tells you which physical
// wire is on which Arduino pin. Record those pin numbers, then update
// HAND_PIN / WRIST_PIN / FOREARM_PIN / SHOULDER_PIN in arm_v5_holder.
//
// Open Serial Monitor at 115200 baud and press Enter to step through.
// =====================================================================

#include <Servo.h>

// All candidate pins. Every usable digital pin that isn't TX(D1)/RX(D0).
const int PINS_TO_TEST[] = { 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13 };
const int NUM_PINS = 12;

Servo testServo;

void waitEnter() {
  Serial.println("  Press Enter to continue...");
  while (!Serial.available()) {}
  while (Serial.available()) Serial.read();
}

void sweepTest(int pin) {
  testServo.attach(pin);
  delay(100);
  testServo.write(90);   delay(600);
  testServo.write(120);  delay(600);
  testServo.write(90);   delay(600);
  testServo.detach();
  delay(200);
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("=== SERVO DIAGNOSTIC ===");
  Serial.println("Each candidate pin gets a 90->120->90 sweep, one at a time.");
  Serial.println("Watch the arm. Note which pin number makes each joint move.");
  Serial.println("Press Enter to test the first pin.");
  waitEnter();
}

void loop() {
  for (int i = 0; i < NUM_PINS; i++) {
    int pin = PINS_TO_TEST[i];
    Serial.print("\nTesting D"); Serial.print(pin);
    Serial.println(" -- does anything move?");
    sweepTest(pin);
    waitEnter();
  }

  Serial.println("\n=== ALL PINS TESTED ===");
  Serial.println("Record which pin moved each joint, then update arm_v5_holder constants.");
  Serial.println("Press Enter to run the cycle again.");
  waitEnter();
}
