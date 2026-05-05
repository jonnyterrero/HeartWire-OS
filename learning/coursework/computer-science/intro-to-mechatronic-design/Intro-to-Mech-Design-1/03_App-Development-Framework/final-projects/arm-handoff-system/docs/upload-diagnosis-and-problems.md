# Robotic Arm Upload Diagnosis And Problems

## Summary
- The sketch compiles successfully on Arduino Uno.
- The current blocker is upload/board communication, not code size or compile errors.
- The most likely failure modes observed were:
  - `COM3` being held by another process
  - invalid or conflicting pin assignments on the Uno
  - wiring on serial pins `D0/D1` or overlapping signals on the same pin

## Verified Facts
- Compile output reported:
  - program storage: `8820 bytes (27%)`
  - global memory: `911 bytes (44%)`
- Those numbers are healthy for an Uno and do not explain the upload failure.
- The active safe pin map in both copies of `arm-handoff-controller.ino` is currently:
  - `HAND_PIN = 4`
  - `WRIST_PIN = 7`
  - `FOREARM_PIN = 10`
  - `ELBOW_PIN = 12`
  - `TRIG = 2`
  - `ECHO = 3`
  - `LED_R = 5`
  - `LED_G = 8`
  - `LED_B = 6`
  - `SR_DATA = 9`
  - `SR_CLK = 11`
  - `SR_LATCH = 13`
  - `PHOTO = A3`
- The `Downloads` copy and the workspace copy matched when checked.
- `COM3` existed and later became openable again, which means the hard lock was intermittent rather than permanent.

## Main Problems Identified

### 1. Upload Port / Serial Access Problem
Observed errors:

```text
Warning: attempt 1 of 10: not in sync: resp=0x00
...
Error: unable to open port COM3 for programmer arduino
Failed uploading: uploading error: exit status 1
```

Interpretation:
- `resp=0x00` means the uploader is not receiving a valid bootloader response from the Uno.
- `unable to open port COM3` means the IDE/uploader could not reliably talk to the serial port at upload time.

Likely causes:
- Serial Monitor was open
- another Arduino IDE window/process was holding the port
- the board reset/bootloader window was missed
- board selection or COM port selection was wrong
- serial pins were being used by hardware attached to the board

### 2. Invalid Pin Reassignment Attempt
A failed pin map was previously tried with:
- `HAND_PIN = 1`
- `WRIST_PIN = 5`
- `FOREARM_PIN = 6`

That map is invalid for this design because:
- `D1` is the Uno hardware TX pin
  - using `D1` for a servo can break upload and Serial communication
- `WRIST_PIN = 5` conflicts with `PIN_LED_R = 5`
  - one pin cannot drive both a servo and the red LED
- `FOREARM_PIN = 6` conflicts with `PIN_LED_B = 6`
  - one pin cannot drive both a servo and the blue LED

### 3. Serial Pins Must Stay Reserved
Pins `D0` and `D1` must remain unused by the arm, LEDs, shift register, and sensors during normal Uno USB upload workflow.

Why:
- `D0` = RX
- `D1` = TX
- the USB-to-serial chip uses those lines to upload the sketch

If anything is connected there, uploads can fail with:
- `not in sync`
- `resp=0x00`
- port open errors

### 4. Many Arduino Processes Increase Port Confusion Risk
Multiple `Arduino IDE` processes and serial-related helper processes were observed.

Risk:
- extra IDE instances increase the chance that:
  - the wrong window owns the selected port
  - Serial Monitor reopens automatically
  - upload targets the wrong board/port state

## Root Cause Assessment
Most likely root causes, in order:

1. Port contention on `COM3`
2. Wiring or attempted use of serial pin `D1`
3. Overlapping pin assignments on `D5` and `D6`
4. Upload timing / bootloader handshake failure on reset

The sketch itself is not the primary problem based on the compile results.

## Current Safe Pin Map
Use this mapping and do not overlap signals:

```text
Hand servo     -> D4
Wrist servo    -> D7
Forearm servo  -> D10
Elbow servo    -> D12

HC-SR04 TRIG   -> D2
HC-SR04 ECHO   -> D3

RGB Red LED    -> D5
RGB Green LED  -> D8
RGB Blue LED   -> D6

74HC595 DATA   -> D9
74HC595 CLK    -> D11
74HC595 LATCH  -> D13

Photoresistor  -> A3
```

## Recommended Recovery Steps
1. Remove any wire from `D0` and `D1`.
2. Verify no servo shares a pin with the RGB LED or shift register.
3. Keep the safe pin map exactly as listed above.
4. Close Serial Monitor and Serial Plotter.
5. Close extra Arduino IDE windows if possible.
6. Unplug and replug the Uno.
7. Re-select:
   - board: `Arduino Uno`
   - port: `COM3`
8. Start upload again.
9. If upload still fails, press the Uno reset button exactly as upload begins.

## If The Error Persists
Check these next:
- damaged or charge-only USB cable
- wrong board profile
- wrong bootloader
- USB hub instability
- driver issues on the Uno or clone board
- hardware still attached to `D0/D1`

## Conclusion
The present issue is an upload/serial communication problem, not a sketch compile problem. The code size is fine. The main engineering constraint is keeping the Uno serial pins free and avoiding any pin-sharing conflicts while uploading.
