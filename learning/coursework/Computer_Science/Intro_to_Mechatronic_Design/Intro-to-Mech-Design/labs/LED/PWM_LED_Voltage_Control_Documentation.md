# Arduino PWM LED Voltage-Based Control

## Project Overview
Arduino script for controlling 4 LEDs (Red, Blue, Green, Yellow) using PWM with a potentiometer input. The system responds differently based on voltage thresholds.

---

## Hardware Setup

### Components Required:
- **Potentiometer**: Connect middle pin to A0, outer pins to 5V and GND
- **4 LEDs**: Connect through current-limiting resistors (220Ω recommended) to PWM pins
- **Digital Pins**: 3, 5, 6, 9 (PWM-capable pins on most Arduino boards)

### Circuit Connections:
- **Potentiometer**: A0 (analog input)
- **Red LED**: Pin 3 (PWM)
- **Blue LED**: Pin 5 (PWM)
- **Green LED**: Pin 6 (PWM)
- **Yellow LED**: Pin 9 (PWM)
- Each LED needs a current-limiting resistor (220Ω) in series

---

## Functionality

### LED Behavior:
- **Yellow LED**: Always ON, brightness increases with potentiometer intensity
- **Below 4V**: Green LED stays ON
- **At/Above 4V**: Red and Blue LEDs alternate flashing
- **4V threshold**: Analog reading of ~819 (4V/5V * 1023)

---

## Complete Arduino Code

```cpp
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
```

---

## Key Features

### Variable Definitions:
- **LED Pins**: Red (3), Blue (5), Green (6), Yellow (9)
- **Voltage Threshold**: 819 (analog reading for 4V)
- **Flash Interval**: 250ms between red/blue alternations

### Control Logic:
1. **Yellow LED**: Continuously adjusts brightness (0-255) based on potentiometer position
2. **Below 4V**: Green LED illuminated, Red/Blue off
3. **Above 4V**: Red and Blue alternate flashing every 250ms, Green off

### Serial Output:
The code includes debug output showing:
- Potentiometer value (raw and voltage)
- Yellow LED brightness level
- Current operating mode

---

## Notes
- Ensure all LEDs have proper current-limiting resistors (220Ω recommended)
- The potentiometer should be connected with proper voltage references (5V and GND)
- Serial monitor can be used at 9600 baud for debugging
