/*
 * ================================================================
 *  4-Axis Robotic Arm — Polished Arduino Firmware
 *  Board  : Arduino Uno (ATmega328P) or Mega
 *  Servos : 4x SG90 or MG90S
 *  Input  : 4x B10K potentiometers on A0–A3
 * ================================================================
 *
 *  Improvements over the bare-bones pot → servo sketch:
 *  ─────────────────────────────────────────────────────────────
 *  1. EMA filter          — smooths ADC noise; kills jitter
 *  2. Deadband hysteresis — servo only moves on real input change
 *  3. Slew rate limiter   — caps deg/tick; protects gears & PSU
 *  4. Per-axis soft limits— configurable min/max per joint
 *  5. Startup home ramp   — smooth power-on to a known position
 *  6. Timed serial output — readable debug, not every-tick flood
 *  7. Consistent loop rate— millis()-based 50 Hz control loop
 *
 *  Pin map (matches repo wiring):
 *    Roll    : servo → D6,  pot → A0
 *    X       : servo → D5,  pot → A1
 *    Y       : servo → D9,  pot → A2
 *    Mouth   : servo → D3,  pot → A3
 *
 *  Power note:
 *    Do NOT power servos from the Arduino 5V pin.
 *    Use a dedicated 5V / 2A+ supply; share GND with Arduino.
 * ================================================================
 */

#include <Servo.h>

// ── Timing constants ─────────────────────────────────────────
static const uint16_t LOOP_PERIOD_MS   = 20;   // control loop  50 Hz
static const uint16_t SERIAL_PERIOD_MS = 250;  // debug print  4 Hz
static const uint16_t HOME_STEP_MS     = 12;   // ms per degree during homing

// ── Filter & motion parameters ───────────────────────────────
static const float   EMA_ALPHA    = 0.08f;
static const uint8_t DEADBAND_DEG = 2;
static const uint8_t MAX_SLEW_DEG = 2;

// ── Home position (degrees) ──────────────────────────────────
static const uint8_t HOME_DEG[4] = { 90, 90, 90, 45 };

// ════════════════════════════════════════════════════════════
//  Axis descriptor struct
// ════════════════════════════════════════════════════════════
struct Axis {
  const char* name;
  uint8_t     servoPin;
  uint8_t     potPin;
  uint8_t     minDeg;
  uint8_t     maxDeg;
  float       emaVal;
  uint8_t     curDeg;
};

// ── AXIS TABLE (repo wiring: Roll→6, X→5, Y→9, Mouth→3) ─────
//          name      servo  pot   min  max
Axis axes[4] = {
  { "Roll",    6, A0,   0,  180, 511.0f, 90 },
  { "X",       5, A1,  15,  165, 511.0f, 90 },
  { "Y",       9, A2,  15,  165, 511.0f, 90 },
  { "Mouth",   3, A3,  10,   90, 511.0f, 45 },
};

Servo servos[4];

// ── Forward declarations ─────────────────────────────────────
void    homeAllAxes();
uint8_t filterAndMap(Axis& ax);
void    slewToward(Axis& ax, uint8_t targetDeg, uint8_t idx);

// ════════════════════════════════════════════════════════════
void setup() {
  Serial.begin(115200);
  Serial.println(F("=== 4-Axis Robotic Arm — Starting ==="));

  for (uint8_t i = 0; i < 4; i++) {
    servos[i].attach(axes[i].servoPin);
    Serial.print(F("  Attached ")); Serial.println(axes[i].name);
  }

  homeAllAxes();

  Serial.println(F("Homing done. Entering control loop at 50 Hz.\n"));
}

// ════════════════════════════════════════════════════════════
void loop() {
  static uint32_t lastLoop   = 0;
  static uint32_t lastSerial = 0;
  uint32_t now = millis();

  if (now - lastLoop < LOOP_PERIOD_MS) return;
  lastLoop = now;

  for (uint8_t i = 0; i < 4; i++) {
    uint8_t target = filterAndMap(axes[i]);
    slewToward(axes[i], target, i);
  }

  if (now - lastSerial >= SERIAL_PERIOD_MS) {
    lastSerial = now;
    for (uint8_t i = 0; i < 4; i++) {
      Serial.print(axes[i].name);
      Serial.print(F(":"));
      Serial.print(axes[i].curDeg);
      Serial.print(F("°  "));
    }
    Serial.println();
  }
}

// ════════════════════════════════════════════════════════════
void homeAllAxes() {
  Serial.println(F("Homing..."));

  for (uint8_t i = 0; i < 4; i++) {
    servos[i].write(axes[i].curDeg);
  }
  delay(300);

  bool allDone = false;
  while (!allDone) {
    allDone = true;
    for (uint8_t i = 0; i < 4; i++) {
      if (axes[i].curDeg == HOME_DEG[i]) continue;
      allDone = false;
      axes[i].curDeg += (axes[i].curDeg < HOME_DEG[i]) ? 1 : -1;
      servos[i].write(axes[i].curDeg);
    }
    delay(HOME_STEP_MS);
  }
}

// ════════════════════════════════════════════════════════════
uint8_t filterAndMap(Axis& ax) {
  int16_t raw = analogRead(ax.potPin);

  ax.emaVal = EMA_ALPHA * (float)raw + (1.0f - EMA_ALPHA) * ax.emaVal;

  int16_t deg = map((long)ax.emaVal, 0, 1023, ax.minDeg, ax.maxDeg);
  deg = constrain(deg, ax.minDeg, ax.maxDeg);

  return (uint8_t)deg;
}

// ════════════════════════════════════════════════════════════
void slewToward(Axis& ax, uint8_t targetDeg, uint8_t idx) {
  int16_t error = (int16_t)targetDeg - (int16_t)ax.curDeg;

  if (abs(error) < DEADBAND_DEG) return;

  int16_t step = constrain(error, -(int16_t)MAX_SLEW_DEG,
                                   (int16_t)MAX_SLEW_DEG);

  int16_t next = (int16_t)ax.curDeg + step;
  next = constrain(next, ax.minDeg, ax.maxDeg);
  ax.curDeg = (uint8_t)next;
  servos[idx].write(ax.curDeg);
}
