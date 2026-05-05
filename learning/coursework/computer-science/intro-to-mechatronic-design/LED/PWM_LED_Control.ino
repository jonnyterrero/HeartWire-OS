/*
 * Arduino PWM LED Control with Potentiometer
 * 
 * Hardware Setup:
 * - Potentiometer: Connect middle pin to A0, outer pins to 5V and GND
 * - 4 LEDs: Connect through current-limiting resistors (220Ω recommended) to PWM pins
 * - Digital Pins: 3, 5, 6, 9 (PWM-capable pins on most Arduino boards)
 * 
 * Circuit:
 * - Potentiometer: A0 (analog input)
 * - LED 1: Pin 3 (PWM)
 * - LED 2: Pin 5 (PWM)
 * - LED 3: Pin 6 (PWM)
 * - LED 4: Pin 9 (PWM)
 * - Each LED needs a current-limiting resistor (220Ω) in series
 */

// Define LED pins (PWM-capable pins)
const int LED1_PIN = 3;
const int LED2_PIN = 5;
const int LED3_PIN = 6;
const int LED4_PIN = 9;

// Potentiometer pin
const int POT_PIN = A0;

// Variables
int potValue = 0;        // Raw potentiometer reading (0-1023)
int pwmValue = 0;        // PWM value (0-255)

void setup() {
  // Initialize serial communication for debugging
  Serial.begin(9600);
  
  // Set LED pins as outputs
  pinMode(LED1_PIN, OUTPUT);
  pinMode(LED2_PIN, OUTPUT);
  pinMode(LED3_PIN, OUTPUT);
  pinMode(LED4_PIN, OUTPUT);
  
  // Potentiometer pin is analog input (no need to set pinMode, but it's good practice)
  pinMode(POT_PIN, INPUT);
  
  Serial.println("PWM LED Control initialized");
}

void loop() {
  // Read potentiometer value (0-1023)
  potValue = analogRead(POT_PIN);
  
  // Map potentiometer value (0-1023) to PWM value (0-255)
  pwmValue = map(potValue, 0, 1023, 0, 255);
  
  // Apply PWM to all LEDs
  analogWrite(LED1_PIN, pwmValue);
  analogWrite(LED2_PIN, pwmValue);
  analogWrite(LED3_PIN, pwmValue);
  analogWrite(LED4_PIN, pwmValue);
  
  // Optional: Print values to serial monitor for debugging
  Serial.print("Pot Value: ");
  Serial.print(potValue);
  Serial.print(" | PWM Value: ");
  Serial.println(pwmValue);
  
  // Small delay for stability
  delay(10);
}
