/*
 * Arduino PWM LED Pulse Control
 * 
 * Hardware Setup:
 * - 4 LEDs: Connect through current-limiting resistors (220Ω recommended) to PWM pins
 * - Digital Pins: 3, 5, 6, 9 (PWM-capable pins on most Arduino boards)
 * 
 * Circuit:
 * - Red LED: Pin 3 (PWM)
 * - Blue LED: Pin 5 (PWM)
 * - Green LED: Pin 6 (PWM)
 * - Yellow LED: Pin 9 (PWM)
 * - Each LED needs a current-limiting resistor (220Ω) in series
 * 
 * Functionality:
 * - LEDs pulse (fade in and out) at a set voltage of 4V
 * - On a 5V Arduino, 4V = 80% of full scale = PWM value of 204
 */

// Define LED pins (PWM-capable pins) with color assignments
const int RED_LED_PIN = 3;
const int BLUE_LED_PIN = 5;
const int GREEN_LED_PIN = 6;
const int YELLOW_LED_PIN = 9;

// Set voltage: 4V on a 5V system
// PWM value = (4V / 5V) * 255 = 204
const int MAX_PWM_VALUE = 204;  // Corresponds to 4V

// Pulse control variables
int brightness = 0;        // Current brightness level
int fadeAmount = 5;        // Amount to fade per step
int pulseDelay = 30;       // Delay between brightness changes (ms)

void setup() {
  // Initialize serial communication for debugging
  Serial.begin(9600);
  
  // Set LED pins as outputs
  pinMode(RED_LED_PIN, OUTPUT);
  pinMode(BLUE_LED_PIN, OUTPUT);
  pinMode(GREEN_LED_PIN, OUTPUT);
  pinMode(YELLOW_LED_PIN, OUTPUT);
  
  Serial.println("PWM LED Pulse Control initialized");
  Serial.print("Pulsing at 4V (PWM max: ");
  Serial.print(MAX_PWM_VALUE);
  Serial.println(")");
}

void loop() {
  // Set the brightness of all LEDs
  analogWrite(RED_LED_PIN, brightness);
  analogWrite(BLUE_LED_PIN, brightness);
  analogWrite(GREEN_LED_PIN, brightness);
  analogWrite(YELLOW_LED_PIN, brightness);
  
  // Change the brightness for next time through the loop
  brightness = brightness + fadeAmount;
  
  // Reverse the direction of the fading at the ends of the pulse
  if (brightness <= 0 || brightness >= MAX_PWM_VALUE) {
    fadeAmount = -fadeAmount;
  }
  
  // Optional: Print brightness to serial monitor for debugging
  Serial.print("Brightness: ");
  Serial.println(brightness);
  
  // Wait for the specified delay to see the dimming effect
  delay(pulseDelay);
}
