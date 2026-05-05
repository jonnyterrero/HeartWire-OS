/*
 * Arduino PWM LED Voltage-Based Control
 * 
 * Hardware Setup:
 * - Potentiometer: Connect middle pin to A0, outer pins to 5V and GND
 * - 4 LEDs: Connect through current-limiting resistors (220Ω recommended) to PWM pins
 * - Digital Pins: 3, 5, 6, 9 (PWM-capable pins on most Arduino boards)
 * 
 * Circuit:
 * - Potentiometer: A0 (analog input)
 * - Red LED: Pin 3 (PWM)
 * - Blue LED: Pin 5 (PWM)
 * - Green LED: Pin 6 (PWM)
 * - Yellow LED: Pin 9 (PWM)
 * - Each LED needs a current-limiting resistor (220Ω) in series
 * 
 * Functionality:
 * - Yellow LED: Always ON, brightness increases with potentiometer intensity
 * - Below 4V: Green LED stays ON
 * - At/Above 4V: Red and Blue LEDs alternate flashing
 * - 4V threshold = analog reading of ~819 (4V/5V * 1023)
 */

// Define LED pins (PWM-capable pins) with color assignments
const int RED_LED_PIN = 3;
const int BLUE_LED_PIN = 5;
const int GREEN_LED_PIN = 6;
const int YELLOW_LED_PIN = 9;

// Potentiometer pin
const int POT_PIN = A0;

// Voltage threshold: 4V on a 5V system
// Analog reading = (4V / 5V) * 1023 = 818.4 ≈ 819
const int VOLTAGE_THRESHOLD = 819;  // Analog reading corresponding to 4V

// PWM values
const int LED_ON = 255;   // Full brightness
const int LED_OFF = 0;    // Off

// Variables
int potValue = 0;         // Raw potentiometer reading (0-1023)
int yellowBrightness = 0; // Yellow LED brightness (0-255)
bool redBlueToggle = false;  // Toggle for alternating red/blue flash
unsigned long lastFlashTime = 0;  // Last time LEDs were toggled
const int FLASH_INTERVAL = 250;   // Time between flashes in milliseconds

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
  
  Serial.println("Voltage-Based LED Control initialized");
  Serial.print("4V threshold at analog reading: ");
  Serial.println(VOLTAGE_THRESHOLD);
}

void loop() {
  // Read potentiometer value (0-1023)
  potValue = analogRead(POT_PIN);
  
  // Calculate Yellow LED brightness based on potentiometer intensity
  // Map potentiometer value (0-1023) to PWM value (0-255)
  yellowBrightness = map(potValue, 0, 1023, 0, 255);
  
  // Yellow LED always stays on with variable brightness
  analogWrite(YELLOW_LED_PIN, yellowBrightness);
  
  // Check if voltage is below or at/above 4V threshold
  if (potValue < VOLTAGE_THRESHOLD) {
    // Below 4V: Green LED ON, Red and Blue OFF
    analogWrite(GREEN_LED_PIN, LED_ON);
    analogWrite(RED_LED_PIN, LED_OFF);
    analogWrite(BLUE_LED_PIN, LED_OFF);
    
    // Reset toggle state when entering this mode
    redBlueToggle = false;
  } else {
    // At/Above 4V: Red and Blue alternate flashing, Green OFF
    analogWrite(GREEN_LED_PIN, LED_OFF);
    
    // Alternate between Red and Blue LEDs
    unsigned long currentTime = millis();
    if (currentTime - lastFlashTime >= FLASH_INTERVAL) {
      redBlueToggle = !redBlueToggle;  // Toggle state
      lastFlashTime = currentTime;
    }
    
    // Set Red and Blue based on toggle state
    if (redBlueToggle) {
      analogWrite(RED_LED_PIN, LED_ON);
      analogWrite(BLUE_LED_PIN, LED_OFF);
    } else {
      analogWrite(RED_LED_PIN, LED_OFF);
      analogWrite(BLUE_LED_PIN, LED_ON);
    }
  }
  
  // Optional: Print values to serial monitor for debugging
  Serial.print("Pot Value: ");
  Serial.print(potValue);
  Serial.print(" (");
  Serial.print((potValue * 5.0) / 1023.0, 2);
  Serial.print("V) | Yellow Brightness: ");
  Serial.print(yellowBrightness);
  Serial.print(" | Mode: ");
  if (potValue < VOLTAGE_THRESHOLD) {
    Serial.println("Below 4V - Green ON");
  } else {
    Serial.print("At/Above 4V - ");
    Serial.print(redBlueToggle ? "Red" : "Blue");
    Serial.println(" flashing");
  }
  
  // Small delay for stability
  delay(10);
}
