/*
 * Ultrasonic distance sensor with servo and LEDs
 * Triggers at 10 cm, 20 cm, 30 cm (100 mm, 200 mm, 300 mm)
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

  // Turn off all LEDs first, then turn on the one(s) for current zone
  digitalWrite(redLed, LOW);
  digitalWrite(yellowLed, LOW);
  digitalWrite(greenLed, LOW);

  if (distance <= 10.0) {
    digitalWrite(redLed, HIGH);   // Close: red
    myservo.write(30);            // e.g. 30°
  } else if (distance <= 20.0) {
    digitalWrite(yellowLed, HIGH); // Medium: yellow
    myservo.write(90);              // e.g. 90°
  } else if (distance <= 30.0) {
    digitalWrite(greenLed, HIGH);   // In range: green
    myservo.write(150);             // e.g. 150°
  } else {
    // Beyond 30 cm: all off, servo to default
    myservo.write(90);
  }

  delay(450);
}
