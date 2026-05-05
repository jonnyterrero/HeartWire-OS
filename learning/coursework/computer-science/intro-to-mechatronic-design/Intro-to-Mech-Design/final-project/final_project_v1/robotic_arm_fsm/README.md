# Autonomous 4-Axis Robotic Arm (Arduino Uno, FSM)

A complete extended build of your project: the starter sketch with the LED command input, the 74HC595 4-digit 7‑segment display, a better ultrasonic filter (median + EMA), a safer STOP_HAND, and a GRAB retry path.

Main sketch: `robotic_arm_fsm.ino`

## Hardware
- Arduino Uno
- 4 × SG90 / MG90S servos (Hand, Wrist, Forearm, Elbow)
- HC-SR04 ultrasonic sensor
- 74HC595 shift register + 4‑digit common‑cathode 7‑segment display (or 4 × single digits)
- External 5–6 V / ≥2 A supply for the servos (share GND with Arduino)
- One digital line from your external LED sequencer (the "color landed" signal)

## Pin map (matches the sketch)

| Function              | Arduino Pin |
|-----------------------|:-----------:|
| Hand (gripper) servo  | D7          |
| Wrist servo           | D3          |
| Forearm servo         | D11         |
| Elbow servo           | D5          |
| HC-SR04 TRIG          | D2          |
| HC-SR04 ECHO          | D4          |
| LED command input     | D6          |
| 74HC595 DATA (DS)     | D12         |
| 74HC595 LATCH (RCLK)  | D8          |
| 74HC595 CLOCK (SRCLK) | D13         |
| Digit 1 common        | A0          |
| Digit 2 common        | A1          |
| Digit 3 common        | A2          |
| Digit 4 common        | A3          |

Notes
- Servos MUST run from the external supply, not the Arduino 5 V rail. Tie grounds together.
- If the HC-SR04 is 5 V only and your Arduino is 5 V, ECHO can connect directly. For 3.3 V boards, use a divider.
- Digit commons should be driven through NPN transistors (e.g. 2N2222) if you want brightness; direct pin drive works for small displays with 220–330 Ω segment resistors.
- If you don't have the 7‑segment yet, the display functions just do nothing visible — the FSM still runs.

## FSM

```
           cmdActive
  IDLE ───────────────▶ SCAN ──┐
    ▲                          │ object in [8,15] cm
    │ cycle done                ▼
  RETURN_HOME ◀── RELEASE ◀── MOVE_TO_DROP ◀── LIFT ◀── GRAB ◀── APPROACH
                                                               ▲
                                              ball slipped ────┘ (retry ≤ 2)

  any state ─── dist < 8 cm (and not holding) ───▶ STOP_HAND
  STOP_HAND ── path clear (dist > 15 cm) ───▶ IDLE
```

State codes shown on the display (alternating with distance in cm every 1 s):
`IDLE · SCAN · APPR · GRAB · LIFT · MOVE · RELS · HOME · STOP`

## Load / flash
1. Install the Arduino IDE (2.x) and open `robotic_arm_fsm.ino`.
2. Board: "Arduino Uno". Port: the one your Uno shows up on.
3. Upload. No extra libraries are needed — only the built‑in `Servo.h`.
4. Open Serial Monitor at 115200 if you add debug prints later.

## Calibration & bring-up (do these in this order)
1. Power servos from the external supply first, then plug in USB.
2. Drive the arm to each named pose by temporarily forcing `state` in code, and verify mechanical clearance before enabling the full loop.
3. Measure real distances with the sensor + `Serial.println(filteredCm)` and tune `OBJECT_MIN_CM` / `OBJECT_MAX_CM` to your actual ball placement.
4. Tune `STEP_MS` (servo step cadence) up if jitter, down for faster motion.
5. If the 7‑segment is dim or flickers, raise `DISPLAY_MS` slightly or lower `STEP_MS` overhead.

## LED command wiring
The sketch expects a clean digital input on D6:
- HIGH ⇒ "run pickup sequence"
- LOW  ⇒ hold in IDLE

If your external LED sequencer is driving an actual LED, tap its anode through a 10 kΩ resistor into D6 and keep the common ground. If you instead want a pushbutton, switch `INPUT` to `INPUT_PULLUP` in `setup()` and invert the read in `pollCommand()`.

## How the parts of the starter spec map to the code
- *Incremental stepping / smooth motion* → `moveSmooth()` + `STEP_MS` gate.
- *Non-blocking timing* → `millis()` cadences for display, sensor, command, stepping.
- *Median + EMA sensor filter* → `readDistanceCm()` with a 5‑sample ring buffer.
- *LED input trigger* → `pollCommand()` with 3‑sample debounce; `cmdActive` pushes `IDLE → SCAN` and falling edge sends `SCAN → IDLE`.
- *7‑segment display without breaking real‑time* → `multiplexDisplay()` runs every ~3 ms and swaps between state code and distance every 1 s.
- *Safety override* → any state except GRAB/LIFT/MOVE/RELEASE can jump to `STOP_HAND` when the filtered distance drops below `HAND_STOP_CM`. Holding states are excluded so the ball you just picked up doesn’t trigger a stop.
- *Retry after GRAB* → if the gripper ends up less than (HAND_CLOSED − 10°) after `LIFT`, we bounce back to `APPROACH` up to 2 times.

## Similar / reference projects
If you want a fuller mechanical build guide, code to cross‑check, or a color‑sorting variant, these are the most useful hits:

- **4 DoF Robot Arm Pick & Place Color Sorter with Inverse Kinematics** (Instructables) — Arduino Uno, HC‑SR04, TCS230 color sensor, full wiring + IK code. Very close to your end goal.
  https://www.instructables.com/4-DoF-Robot-Arm-Pick-Place-Color-Sorter-With-Inver/
- **4DOF Robotic Arm – Color Sorting Function: Code and Diagram** (YouTube walkthrough) — setup, calibration, testing of a 4DOF arm with color sorting.
  https://www.youtube.com/watch?v=j6LokhEP0CI
- **Build Your Own Object‑Tracking 4‑DOF Robotics Arm** (Arduino Project Hub) — Uno + HC‑SR04 + PCA9685 servo driver, good reference for cleaner servo control.
  https://projecthub.arduino.cc/roboattic_lab/build-your-own-object-tracking-4-dof-robotics-arm-with-arduino-dd36ba
- **Control Arduino Robot Arm With Ultrasonic Sensor** (Instructables, LittleArm) — small, similar architecture.
  https://www.instructables.com/Control-Arduino-Robot-Arm-With-Ultrasonic-Sensor/
- **MeArm Picking Up Things** (Instructables) — pick‑and‑place with an ultrasonic sensor using the classic MeArm chassis.
  https://www.instructables.com/My-MeArm-Picking-Up-Things/
- **MicroBeaut / Finite‑State** (GitHub) — a ready‑made FSM library for Arduino if you want to refactor your state machine into declarative transitions.
  https://github.com/MicroBeaut/Finite-State
- **Arekushi / Finite‑State‑Machine‑Arduino** (GitHub) — OO C++ FSM template for Uno, useful as a pattern reference.
  https://github.com/Arekushi/Finite-State-Machine-Arduino
- **0–9 Up/Down Counter with 74HC595 and 7‑Segment Display** — clean reference for the shift‑register display code.
  https://createlabz.store/blogs/createlabz-tutorials/0-9-arduino-up-down-counter-with-74hc595-and-7-segment-display
- **7‑segment display + 74HC595 tutorial** — bit maps for common‑cathode displays you can double‑check against mine.
  https://trandi.wordpress.com/2009/12/01/segments-display-arduino-74hc595-shift-register/

## Extending further
- Swap the open‑loop angle control for inverse kinematics (3‑link planar IK is enough for this geometry).
- Replace the ultrasonic with a cheap camera (ESP32‑CAM + color blob detection) if you want real color‑sorting that matches the LED.
- Add serial‑triggered test harness so you can simulate the LED command from the Arduino IDE during bench testing.
