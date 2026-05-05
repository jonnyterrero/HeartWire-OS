# 4-Axis Robotic Arm — All Versions

All robotic arm sketches in one place. Each folder contains an Arduino sketch you can open and upload.

## Versions

| Folder | Description | Servos | Input |
|--------|-------------|--------|-------|
| **01_joystick_fixed** | Joystick control, direct mapping, debug mode | 7, 9, 11, 5 | A0, A2, A4, A5 |
| **02_joystick_simple** | Simplest joystick, direct map | 4, 7, 10, 12 | A0, A2, A4, A5 |
| **03_joystick_beginner** | Joystick with deadzone | 6, 5, 9, 3 | A0, A1, A2, A3 |
| **04_potentiometer_basic** | Basic potentiometer control | 6, 5, 9, 3 | A0, A1, A2, A3 |
| **05_polished_potentiometer** | Advanced: EMA filter, slew limit, homing | 6, 5, 9, 3 | A0, A1, A2, A3 |
| **06_complete_arm** | Hand/Wrist/Forearm/Elbow, deadzone control | 7, 9, 11, 5 | A3, A5, A1, A4 |

## Power

- **Arduino**: 9V barrel jack
- **Joysticks**: 5V and GND from Arduino
- **Servos**: External 5V/2A+ supply, share GND with Arduino

## Usage

1. Open the folder in Arduino IDE (File → Open → select the .ino file)
2. Adjust pin definitions if your wiring differs
3. Upload to Arduino Uno
