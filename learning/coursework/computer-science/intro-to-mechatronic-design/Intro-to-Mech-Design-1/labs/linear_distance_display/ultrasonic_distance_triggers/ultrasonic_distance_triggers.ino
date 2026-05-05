/*
 * Ultrasonic distance sensor with servo and LEDs
 * - Below 10 cm:  red LED blinks, servo moves (30°)
 * - Below 20 cm:  yellow LED blinks, servo moves (90°)
 * - 30 cm or above: green LED always on, servo holds (stops moving)
 *
 * Wiring:
 * - HC-SR04: Trig -> 12, Echo -> 13, VCC -> 5V, GND -> GND
 * - LEDs (with 220 Ω): Red -> 2, Yellow -> 3, Green -> 4
 * - Servo: signal -> 9, VCC -> 5V (or external), GND -> GND
 */

#include <Servo.h>

Servo myservo;

int trigPin = 12;
int echoPin = 13;
int redLed = 2;
int yellowLed = 3;
int greenLed = 4;

float duration;
float distance;  // in cm

const unsigned long BLINK_INTERVAL_MS = 300;  // LED blink period
unsigned long lastBlinkTime = 0;
bool blinkState = false;

void setup() {
  Serial.begin(9600);

  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(redLed, OUTPUT);
  pinMode(yellowLed, OUTPUT);
  pinMode(greenLed, OUTPUT);

  myservo.attach(9);

  Serial.println("Ultrasonic triggers: 10cm, 20cm, 30cm");
}

void loop() {
  // Trigger ultrasonic pulse
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  duration = pulseIn(echoPin, HIGH);
  distance = (duration * 0.034) / 2;  // distance in cm

  Serial.print(distance);
  Serial.println(" cm");

  // Update blink state for red/yellow
  unsigned long now = millis();
  if (now - lastBlinkTime >= BLINK_INTERVAL_MS) {
    lastBlinkTime = now;
    blinkState = !blinkState;
  }

  // Turn off all LEDs first, then set by zone
  digitalWrite(redLed, LOW);
  digitalWrite(yellowLed, LOW);
  digitalWrite(greenLed, LOW);

  if (distance < 10.0) {
    // Below 10 cm: red blinks, servo moves
    digitalWrite(redLed, blinkState ? HIGH : LOW);
    myservo.write(30);
  } else if (distance < 20.0) {
    // Below 20 cm: yellow blinks, servo moves
    digitalWrite(yellowLed, blinkState ? HIGH : LOW);
    myservo.write(90);
  } else if (distance >= 30.0) {
    // 30 cm or above: green always on, servo stopped (don't keep writing to servo)
    digitalWrite(greenLed, HIGH);
    myservo.write(90);  // hold at 90° (or remove this line to leave servo where it was)
  } else {
    // Between 20 and 30 cm: no LED, servo can stay at 90
    myservo.write(90);
  }

  delay(450);
}
