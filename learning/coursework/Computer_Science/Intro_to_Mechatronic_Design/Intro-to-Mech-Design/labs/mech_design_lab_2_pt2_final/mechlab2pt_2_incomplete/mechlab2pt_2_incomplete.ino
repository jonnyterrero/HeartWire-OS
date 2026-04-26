/*
 * Ultrasonic distance sensor – separate script
 * Servo range: 0° to 180°
 *
 * - Below 10 cm:  red LED blinks, servo -> 0°
 * - Below 20 cm:  yellow LED blinks, servo -> 90°
 * - 30 cm or above: green LED always on, servo -> 180°
 *
 * Wiring:
 * - HC-SR04: Trig -> 12, Echo -> 13, VCC -> 5V, GND -> GND
 * - LEDs (220 Ω): Red -> 2, Yellow -> 3, Green -> 4
 * - Servo: signal -> 9, VCC -> 5V, GND -> GND
 */

#include <Servo.h>

Servo myservo;

const int trigPin = 12;
const int echoPin = 13;
const int redLed = 2;
const int yellowLed = 3;
const int greenLed = 4;

float duration;
float distance;  // in cm

const unsigned long BLINK_INTERVAL_MS = 300;
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
  myservo.write(90);  // start at mid (0–180°)

  Serial.println("Ultrasonic + Servo (0-180°): 10cm=0°, 20cm=90°, 30cm+=180°");
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

  digitalWrite(redLed, LOW);
  digitalWrite(yellowLed, LOW);
  digitalWrite(greenLed, LOW);

  if (distance < 10.0) {
    digitalWrite(redLed, blinkState ? HIGH : LOW);
    myservo.write(0,180);    // below 10 cm -> 0°
  } else if (distance < 20.0) {
    digitalWrite(yellowLed, blinkState ? HIGH : LOW);
    myservo.write(90);   // below 20 cm -> 90°
  } else if (distance >= 30.0) {
    digitalWrite(greenLed, HIGH);
    myservo.write(180);  // 30 cm or above -> 180°
  } else {
    // Between 20 and 30 cm: no LED, hold at 90°
    myservo.write(90);
  }

  delay(450);
}
