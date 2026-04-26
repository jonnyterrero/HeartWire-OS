# Final Project Sorting FSM

Integrated Arduino sketch for the final project arm:

- waits for a ball in the holder/contact sensor
- reads ball color with the RGB LED + photoresistor rig
- shows the target bin number on the 74HC595 7-segment display
- picks the ball with the arm FSM
- drops into one of four color bins
- keeps the ultrasonic sensor as a safety stop

## Pin Map

### Servos
- Hand / gripper: `D7`
- Wrist: `D3`
- Forearm: `D11`
- Elbow / sweep: `D5`

### Ultrasonic
- `TRIG`: `D2`
- `ECHO`: `D4`

### Color sensor rig
- RGB red channel: `D6`
- RGB green channel: `D9`
- RGB blue channel: `D10`
- Photoresistor analog input: `A0`
- Ball-holder contact input: `A1`

### 74HC595 display
- Data: `D12`
- Latch: `D8`
- Clock: `D13`

## Wiring Assumptions

- The photoresistor divider output goes to `A0`.
- The ball-holder contact drives `A1` HIGH when a ball is present.
- The RGB LED is wired as common-cathode.
  - If yours is common-anode, set `RGB_COMMON_ANODE = true`.
- The holder/contact threshold is `HOLDER_THRESHOLD = 700`.
  - If the holder input is inverted or weak, change `HOLDER_ACTIVE_HIGH` and `HOLDER_THRESHOLD`.

## Bin Mapping

- Bin `1` = Green
- Bin `2` = Red
- Bin `3` = Blue
- Bin `4` = Yellow

## First Constants To Retune

These are the most likely values to need hardware tuning:

- `DROP_GREEN_ELBOW`
- `DROP_RED_ELBOW`
- `DROP_BLUE_ELBOW`
- `DROP_YELLOW_ELBOW`
- `WRIST_PICKUP`
- `FOREARM_PICKUP`
- `HOLDER_THRESHOLD`
- `STRONG_GAP`
- `YELLOW_CLOSE`

## Serial Commands

- `t`: calibrate colors
- `p`: print saved calibration values
- `r`: print one live `R/G/B` reading
- `s`: print current FSM status
- `c`: clear calibration

Run `t` and `r` only while the arm is already in `IDLE` / home pose.

## Calibration Order

When you run `t`, the sketch asks for:

1. `No Ball`
2. `Green`
3. `Red`
4. `Blue`
5. `Yellow`

Run that once per power-up if you want the calibrated nearest-match mode instead of the heuristic fallback.
