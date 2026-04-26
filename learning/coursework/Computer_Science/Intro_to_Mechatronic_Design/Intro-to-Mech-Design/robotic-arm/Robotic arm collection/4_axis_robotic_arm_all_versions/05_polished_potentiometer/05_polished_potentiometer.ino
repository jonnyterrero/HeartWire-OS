/*
 * 4-Axis Robotic Arm — Polished (Potentiometers)
 * EMA filter, slew limit, soft limits, homing.
 * Servos: 6, 5, 9, 3 | Pots: A0, A1, A2, A3
 */

#include <Servo.h>

static const uint16_t LOOP_PERIOD_MS   = 20;
static const uint16_t SERIAL_PERIOD_MS = 250;
static const uint16_t HOME_STEP_MS     = 12;
static const float   EMA_ALPHA    = 0.08f;
static const uint8_t DEADBAND_DEG = 2;
static const uint8_t MAX_SLEW_DEG = 2;
static const uint8_t HOME_DEG[4] = { 90, 90, 90, 45 };

struct Axis {
  const char* name;
  uint8_t     servoPin;
  uint8_t     potPin;
  uint8_t     minDeg;
  uint8_t     maxDeg;
  float       emaVal;
  uint8_t     curDeg;
};

Axis axes[4] = {
  { "Roll",    6, A0,   0,  180, 511.0f, 90 },
  { "X",       5, A1,  15,  165, 511.0f, 90 },
  { "Y",       9, A2,  15,  165, 511.0f, 90 },
  { "Mouth",   3, A3,  10,   90, 511.0f, 45 },
};

Servo servos[4];

void homeAllAxes();
uint8_t filterAndMap(Axis& ax);
void slewToward(Axis& ax, uint8_t targetDeg, uint8_t idx);

void setup() {
  Serial.begin(115200);
  Serial.println(F("=== 4-Axis Robotic Arm — Starting ==="));
  for (uint8_t i = 0; i < 4; i++) {
    servos[i].attach(axes[i].servoPin);
    Serial.print(F("  Attached ")); Serial.println(axes[i].name);
  }
  homeAllAxes();
  Serial.println(F("Homing done. Entering control loop.\n"));
}

void loop() {
  static uint32_t lastLoop = 0, lastSerial = 0;
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
      Serial.print(F(":")); Serial.print(axes[i].curDeg);
      Serial.print(F("°  "));
    }
    Serial.println();
  }
}

void homeAllAxes() {
  for (uint8_t i = 0; i < 4; i++) servos[i].write(axes[i].curDeg);
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

uint8_t filterAndMap(Axis& ax) {
  int16_t raw = analogRead(ax.potPin);
  ax.emaVal = EMA_ALPHA * (float)raw + (1.0f - EMA_ALPHA) * ax.emaVal;
  int16_t deg = map((long)ax.emaVal, 0, 1023, ax.minDeg, ax.maxDeg);
  return (uint8_t)constrain(deg, ax.minDeg, ax.maxDeg);
}

void slewToward(Axis& ax, uint8_t targetDeg, uint8_t idx) {
  int16_t error = (int16_t)targetDeg - (int16_t)ax.curDeg;
  if (abs(error) < DEADBAND_DEG) return;
  int16_t step = constrain(error, -(int16_t)MAX_SLEW_DEG, (int16_t)MAX_SLEW_DEG);
  int16_t next = constrain((int16_t)ax.curDeg + step, ax.minDeg, ax.maxDeg);
  ax.curDeg = (uint8_t)next;
  servos[idx].write(ax.curDeg);
}
