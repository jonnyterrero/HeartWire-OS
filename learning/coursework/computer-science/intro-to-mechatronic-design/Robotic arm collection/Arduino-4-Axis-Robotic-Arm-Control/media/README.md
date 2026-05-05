# Robotic Arm Control with Arduino
![Representative photo](media/representative-photo.jpg)

This project demonstrates how to control a robotic arm using four servos and potentiometers with an Arduino. The servos are mapped to the potentiometers to adjust the angles of different parts of the robotic arm.


## Components Used

- Arduino Uno
- 4x SG90/MG90S Servo Motors
- 4x B10K Potentiometers
- Breadboard
- Jumper cables

## Circuit Diagram

![Circuit Diagram](media/Arduino-4-Axis-Robotic-Arm-Control-Image-Schematics.png)


## How It Works

1. **Setup:**
   - Each servo motor is connected to a PWM pin on the Arduino.
   - Each potentiometer is connected to an analog input pin on the Arduino.
   - The Arduino reads the values from the potentiometers and maps them to servo angles (0-180 degrees).

2. **Loop:**
   - Continuously read the values from the potentiometers.
   - Map the analog values (0-1023) to servo angles (0-180 degrees).
   - Write the mapped values to the corresponding servos to adjust their angles.
   - Print the angles to the Serial Monitor for debugging.

## Installation and Usage

1. **Connect the Circuit:**
   - Follow the circuit diagram to connect the servos and potentiometers to the Arduino.

2. **Upload the Code:**
   - Open the provided Arduino code in the Arduino IDE.
   - Upload the code to the Arduino Uno.

3. **Control the Robotic Arm:**
   - Adjust the potentiometers to control the angles of the servos.

## Product Link

You can purchase the robotic arm kit from [this link](https://www.amazon.com/Robot-Acrylic-Rotating-Mechanical-Arduino/dp/B09SFFVDPH/ref=sr_1_9?crid=2YBWR6COI4LOG&dib=eyJ2IjoiMSJ9.tj97t4e_zbZp7634PlclYbWkkwRWUpNQJ0vFUBg2KQFCXnirG3YPHdqIBrVJomsIS1LLsMyveMDUULT9VWVl_jmNXC7LmrSWrLjvdaahRhIGo3FNO_DS9YfDM5o2YgoZKmd6MHgu-mGlNPNYgXLCVcA6UofhgQfrHzkpzFhpLQzOseMQ8RS6k7trkTsp93gPChIX_8bOvFDmt2T9ru6wT32IHJ1ZUEZrcLuFbMQ0QW8AwG0JQvKm5ZtcCyE9pDY798GQOt8ZAXfMq5tAUL_lU-MNoVEMXIMh-9gX9bg730s.-hr1hpaMwQdxd8sBXszRbe2h4-nW_JyXRdZxYY4g6rg&dib_tag=se&keywords=robot+arm+arduino&qid=1719349776&sprefix=Robotic+Arm+Arduino%2Caps%2C227&sr=8-9).

If you live in Türkiye [this link](https://www.robotistan.com/pleksi-robot-kol-arduino-uyumlu) 
