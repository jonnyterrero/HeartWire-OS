# Ultrasonic distance triggers – wiring

## Sensor (HC-SR04)

| HC-SR04 | Arduino |
|---------|---------|
| VCC     | 5V      |
| GND     | GND     |
| Trig    | Pin 7   |
| Echo    | Pin 8   |

## Optional LEDs (one per zone)

Use 220Ω in series with each LED.

| Zone   | Distance  | Arduino pin |
|--------|-----------|-------------|
| Zone 1 | ≤ 100 mm  | Pin 3       |
| Zone 2 | ≤ 200 mm  | Pin 5       |
| Zone 3 | ≤ 300 mm  | Pin 6       |

- **≤ 100 mm**: LED on pin 3 on (closest).
- **≤ 200 mm**: LEDs on pins 3 and 5 on.
- **≤ 300 mm**: LEDs on pins 3, 5, and 6 on.
- **> 300 mm**: all three LEDs off.

Open **Serial Monitor at 9600 baud** to see distance in mm and which triggers are active.
