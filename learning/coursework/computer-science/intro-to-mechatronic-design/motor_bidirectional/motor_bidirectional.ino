/*
 * Bidirectional motor control with 2-second pause
 * Rotates one way -> pause 2 s -> rotates the other way -> repeat
 *
 * Wiring (L298N or similar H-bridge):
 *   IN1 -> Arduino pin 5
 *   IN2 -> Arduino pin 6
 *   ENA -> 5V (or PWM pin if you want speed control)
 *   Motor between OUT1 and OUT2
 *   Power: 12V to driver, GND shared with Arduino
 */

const int IN1 = 5;   // Motor direction pin 1
const int IN2 = 6;   // Motor direction pin 2
const int PAUSE_MS = 2000;   // Pause between directions: 2 seconds
const int RUN_MS = 3000;     // How long to run in each direction (change as needed)

void setup() {
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  stopMotor();  // Start with motor off
}

void loop() {
  // Rotate in one direction
  setDirection(true);
  delay(RUN_MS);

  // Pause: motor stopped for 2 seconds
  stopMotor();
  delay(PAUSE_MS);

  // Rotate in the other direction
  setDirection(false);
  delay(RUN_MS);

  // Pause again before repeating
  stopMotor();
  delay(PAUSE_MS);
}

// true = forward, false = reverse
void setDirection(bool forward) {
  digitalWrite(IN1, forward ? HIGH : LOW);
  digitalWrite(IN2, forward ? LOW : HIGH);
}

void stopMotor() {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
}
