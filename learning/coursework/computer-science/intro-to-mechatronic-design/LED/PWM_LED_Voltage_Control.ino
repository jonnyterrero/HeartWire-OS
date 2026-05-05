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
 * - Below 4V: Green LED is ON, Yellow LED shows residual power (0-4V proportional)
 * - At/Above 4V: Red and Blue LEDs alternate flash, Green and Yellow are OFF
 * - Yellow LED displays voltage level from 0-4V range
 */

// Define LED pins (PWM-capable pins) with color assignments
const int RED_LED_PIN = 3;
const int BLUE_LED_PIN = 5;
const int GREEN_LED_PIN = 6;
const int YELLOW_LED_PIN = 9;

// Potentiometer pin
const int POT_PIN = A0;

// Voltage thresholds
// 4V on a 5V system = (4V / 5V) * 1023 = 818.4 ≈ 819
const int VOLTAGE_4V_THRESHOLD = 819;  // ADC value corresponding to 4V
const int MAX_PWM_VALUE = 255;         // Full brightness

// Variables
int potValue = 0;           // Raw potentiometer reading (0-1023)
float voltage = 0.0;        // Calculated voltage (0-5V)
int yellowPWM = 0;         // PWM value for yellow LED (0-204 for 0-4V range)

// Red/Blue alternating flash variables
bool redLEDState = true;   // Tracks which LED is currently on
unsigned long lastFlashTime = 0;
const int FLASH_INTERVAL = 200;  // Time between alternations (ms)

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
  Serial.println("Below 4V: Green ON, Yellow shows voltage");
  Serial.println("At/Above 4V: Red/Blue alternate flash");
}

void loop() {
  // Read potentiometer value (0-1023)
  potValue = analogRead(POT_PIN);
  
  // Calculate voltage (0-5V)
  voltage = (potValue / 1023.0) * 5.0;
  
  // Determine behavior based on voltage threshold
  if (voltage < 4.0) {
    // Below 4V: Green ON, Yellow shows residual power (0-4V)
    
    // Turn off Red and Blue LEDs
    analogWrite(RED_LED_PIN, 0);
    analogWrite(BLUE_LED_PIN, 0);
    
    // Green LED is ON (full brightness)
    analogWrite(GREEN_LED_PIN, MAX_PWM_VALUE);
    
    // Yellow LED shows residual power: map voltage (0-4V) to PWM (0-204)
    // PWM value = (voltage / 4.0) * 204
    yellowPWM = map(potValue, 0, VOLTAGE_4V_THRESHOLD, 0, 204);
    analogWrite(YELLOW_LED_PIN, yellowPWM);
    
  } else {
    // At/Above 4V: Red and Blue alternate flash, Green and Yellow OFF
    
    // Turn off Green and Yellow LEDs
    analogWrite(GREEN_LED_PIN, 0);
    analogWrite(YELLOW_LED_PIN, 0);
    
    // Alternate Red and Blue LEDs
    unsigned long currentTime = millis();
    if (currentTime - lastFlashTime >= FLASH_INTERVAL) {
      redLEDState = !redLEDState;  // Toggle state
      lastFlashTime = currentTime;
    }
    
    // Flash at 4V brightness (PWM 204)
    if (redLEDState) {
      analogWrite(RED_LED_PIN, 204);
      analogWrite(BLUE_LED_PIN, 0);
    } else {
      analogWrite(RED_LED_PIN, 0);
      analogWrite(BLUE_LED_PIN, 204);
    }
  }
  
  // Optional: Print values to serial monitor for debugging
  Serial.print("Voltage: ");
  Serial.print(voltage, 2);
  Serial.print("V | Pot: ");
  Serial.print(potValue);
  if (voltage < 4.0) {
    Serial.print(" | Yellow PWM: ");
    Serial.println(yellowPWM);
  } else {
    Serial.print(" | Red/Blue: ");
    Serial.println(redLEDState ? "RED" : "BLUE");
  }
  
  // Small delay for stability
  delay(10);
}
