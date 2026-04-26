/*
 * Arduino PWM LED Pulse Control - Red and Blue LEDs Only
 * 
 * Hardware Setup:
 * - Potentiometer: Connect middle pin to A0, outer pins to 5V and GND
 * - 4 LEDs: Connect through current-limiting resistors (220Ω recommended) to PWM pins
 * - Digital Pins: 3, 5, 6, 9 (PWM-capable pins on most Arduino boards)
 * 
 * Circuit:
 * - Potentiometer: A0 (analog input)
 * - Red LED: Pin 3 (PWM) - FLASHES
 * - Blue LED: Pin 5 (PWM) - FLASHES
 * - Green LED: Pin 6 (PWM) - OFF
 * - Yellow LED: Pin 9 (PWM) - OFF
 * - Each LED needs a current-limiting resistor (220Ω) in series
 * 
 * Functionality:
 * - Only Red and Blue LEDs pulse (fade in and out) at 4V
 * - Potentiometer adjusts the pulse speed (faster/slower)
 * - On a 5V Arduino, 4V = 80% of full scale = PWM value of 204
 */

// Define LED pins (PWM-capable pins) with color assignments
const int RED_LED_PIN = 3;
const int BLUE_LED_PIN = 5;
const int GREEN_LED_PIN = 6;
const int YELLOW_LED_PIN = 9;

// Potentiometer pin
const int POT_PIN = A0;

// Set voltage: 4V on a 5V system
// PWM value = (4V / 5V) * 255 = 204
const int MAX_PWM_VALUE = 204;  // Corresponds to 4V

// Pulse control variables
int brightness = 0;        // Current brightness level
int fadeAmount = 5;        // Amount to fade per step
int pulseDelay = 30;       // Delay between brightness changes (ms)
int potValue = 0;          // Raw potentiometer reading (0-1023)

// Pulse delay range (in milliseconds)
const int MIN_DELAY = 5;   // Fastest pulse
const int MAX_DELAY = 100; // Slowest pulse

void setup() {
  // Initialize serial communication for debugging
  Serial.begin(9600);
  
  // Set LED pins as outputs
  pinMode(RED_LED_PIN, OUTPUT);
  pinMode(BLUE_LED_PIN, OUTPUT);
  pinMode(GREEN_LED_PIN, OUTPUT);
  pinMode(YELLOW_LED_PIN, OUTPUT);
  
  // Potentiometer pin is analog input
  pinMode(POT_PIN, INPUT);
  
  // Turn off Green and Yellow LEDs
  analogWrite(GREEN_LED_PIN, 0);
  analogWrite(YELLOW_LED_PIN, 0);
  
  Serial.println("Red/Blue LED Pulse Control initialized");
  Serial.print("Pulsing at 4V (PWM max: ");
  Serial.print(MAX_PWM_VALUE);
  Serial.println(")");
  Serial.println("Potentiometer controls pulse speed");
}

void loop() {
  // Read potentiometer value (0-1023)
  potValue = analogRead(POT_PIN);
  
  // Map potentiometer value to pulse delay (inverse: lower pot = faster pulse)
  // Lower delay = faster pulse, Higher delay = slower pulse
  pulseDelay = map(potValue, 0, 1023, MIN_DELAY, MAX_DELAY);
  
  // Set the brightness of Red and Blue LEDs only
  analogWrite(RED_LED_PIN, brightness);
  analogWrite(BLUE_LED_PIN, brightness);
  
  // Change the brightness for next time through the loop
  brightness = brightness + fadeAmount;
  
  // Reverse the direction of the fading at the ends of the pulse
  if (brightness <= 0 || brightness >= MAX_PWM_VALUE) {
    fadeAmount = -fadeAmount;
  }
  
  // Optional: Print values to serial monitor for debugging
  Serial.print("Pot Value: ");
  Serial.print(potValue);
  Serial.print(" | Pulse Delay: ");
  Serial.print(pulseDelay);
  Serial.print("ms | Brightness: ");
  Serial.println(brightness);
  
  // Wait for the specified delay to see the dimming effect
  delay(pulseDelay);
}
