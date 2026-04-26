// v4_ik_pick_and_place.ino — polar targets + 2-link IK (see arm_kinematics.h)
#include <Servo.h>
#include "arm_kinematics.h"

#ifndef DEBUG_FSM
#define DEBUG_FSM 1
#endif

#define PIN_HAND     7
#define PIN_WRIST    3
#define PIN_FOREARM 11
#define PIN_ELBOW    5
#define PIN_TRIG     2
#define PIN_ECHO     4

#define SENSOR_TIMEOUT_US       3500
#define SENSOR_MAX_RANGE_MM      400
#define SENSOR_MIN_RANGE_MM       20
#define SENSOR_BURST_DELAY_MS     65
#define EWMA_ALPHA               0.3f

#define TICK_MS             20
#define SERVO_SPEED_DEG      2
#define CONFIRM_MS         800
#define DWELL_PINGS          3
#define SETTLE_MS          300
#define GRIP_CLOSE_MS      500
#define CARRY_TIMEOUT_MS  5000
#define SCAN_STEP_DEG        5

#define HAND_OPEN_DEG        0
#define HAND_CLOSED_DEG    110

struct Joint {
  Servo servo;
  int current, target, pin;
  bool attached, holdAttached;
};

enum State {
  STATE_SCAN, STATE_DWELL, STATE_APPROACH, STATE_OPEN_GRIP,
  STATE_LOWER_WRIST, STATE_CLOSE_GRIP, STATE_LIFT,
  STATE_TRANSFER, STATE_DROP, STATE_RESET
};

Joint jHand, jWrist, jForearm, jElbow;
State currentState = STATE_RESET;
unsigned long stateStart = 0, lastTick = 0;

int scanAngle = 0;
bool scanningRight = true;
int dwellCount = 0;

float ewmaDistance = 0.0f;
unsigned long lastPingMs = 0, confirmStart = 0;
bool objectConfirmed = false;

float detected_r = 0, detected_theta = 0, detected_z = 0;
unsigned long settleStart = 0;
bool settling = false;

PolarTarget g_pickup_approach, g_pickup_grab;
bool g_pickup_cache_valid = false;

static float pingBuf[3] = { 0, 0, 0 };
static uint8_t pingIdx = 0;

void jointInit(Joint &j, int pin, int start) {
  j.pin = pin;
  j.current = j.target = start;
  j.attached = j.holdAttached = false;
  j.servo.attach(pin);
  j.servo.write(start);
  j.attached = true;
}

void jointMoveTo(Joint &j, int deg) {
  deg = constrain(deg, 0, 180);
  j.target = deg;
  if (!j.attached) {
    j.servo.attach(j.pin);
    j.attached = true;
  }
}

void jointHold(Joint &j) {
  j.holdAttached = true;
  if (!j.attached) {
    j.servo.attach(j.pin);
    j.attached = true;
  }
  j.servo.write(j.current);
}

void jointRelease(Joint &j) { j.holdAttached = false; }

void jointStep(Joint &j) {
  if (j.current != j.target) {
    if (j.current < j.target) j.current = min(j.current + SERVO_SPEED_DEG, j.target);
    else j.current = max(j.current - SERVO_SPEED_DEG, j.target);
    if (!j.attached) {
      j.servo.attach(j.pin);
      j.attached = true;
    }
    j.servo.write(j.current);
  } else if (j.holdAttached) {
    j.servo.write(j.current);
  }
}

bool allJointsSettled() {
  return jElbow.current == jElbow.target && jForearm.current == jForearm.target &&
         jWrist.current == jWrist.target;
}

void tickAllJoints() {
  jointStep(jHand);
  jointStep(jWrist);
  jointStep(jForearm);
  jointStep(jElbow);
}

bool moveToPolar(PolarTarget t) {
  IKSolution sol;
  if (!solveIK(t, sol)) {
    Serial.println(F("IK FAIL → RESET"));
    currentState = STATE_RESET;
    stateStart = millis();
    return false;
  }
  jointMoveTo(jElbow, sol.elbow_deg);
  jointMoveTo(jForearm, sol.forearm_deg);
  jointMoveTo(jWrist, sol.wrist_deg);
  return true;
}

void computeDetectedPosition(float d_mm, int elbow_servo, int forearm_servo, int wrist_servo) {
  float r_tip, z_tip;
  fkTipFromServo(forearm_servo, wrist_servo, r_tip, z_tip);
  detected_r = r_tip + d_mm + SENSOR_AXIAL_OFFSET_MM;
  detected_theta = ((float)elbow_servo - ELBOW_OFFSET_DEG) / ELBOW_DIR;
  detected_z = 0.0f;
#if DEBUG_IK
  Serial.print(F("DET r="));
  Serial.println(detected_r, 1);
#endif
}

float pingOnce_mm() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  unsigned long dur = pulseIn(PIN_ECHO, HIGH, SENSOR_TIMEOUT_US);
  if (dur == 0) return -1.0f;
  float d = (float)dur * 0.1715f;
  if (d < SENSOR_MIN_RANGE_MM || d > SENSOR_MAX_RANGE_MM) return -1.0f;
  return d;
}

float medianOf3() {
  float a = pingBuf[0], b = pingBuf[1], c = pingBuf[2];
  if (a > b) {
    float t = a;
    a = b;
    b = t;
  }
  if (b > c) {
    float t = b;
    b = c;
    c = t;
  }
  if (a > b) {
    float t = a;
    a = b;
    b = t;
  }
  return b;
}

float updateSensor() {
  unsigned long now = millis();
  if (now - lastPingMs < SENSOR_BURST_DELAY_MS) return ewmaDistance;
  lastPingMs = now;
  float raw = pingOnce_mm();
  if (raw < 0.0f) return ewmaDistance;
  pingBuf[pingIdx] = raw;
  pingIdx = (pingIdx + 1) % 3;
  float med = medianOf3();
  if (ewmaDistance < 1.0f) ewmaDistance = med;
  else ewmaDistance = EWMA_ALPHA * med + (1.0f - EWMA_ALPHA) * ewmaDistance;
  return ewmaDistance;
}

void changeState(State newState) {
  currentState = newState;
  stateStart = millis();
  settling = false;
#if DEBUG_FSM
  static const char *names[] = { "SCAN", "DWELL", "APPROACH", "OPEN_GRIP", "LOWER_WRIST",
                                 "CLOSE_GRIP", "LIFT", "TRANSFER", "DROP", "RESET" };
  Serial.print(F("→ "));
  Serial.println(names[(int)newState]);
#endif
}

void runFSM() {
  unsigned long now = millis();
  unsigned long elapsed = now - stateStart;

  switch (currentState) {

  case STATE_SCAN: {
    PolarTarget scanPose = computeScanTarget(scanAngle);
    scanPose.phi = IK_PHI_FREE;
    if (!moveToPolar(scanPose)) return;
    if (allJointsSettled()) {
      changeState(STATE_DWELL);
      dwellCount = 0;
    }
    break;
  }

  case STATE_DWELL: {
    float d = updateSensor();
    if (d > SENSOR_MIN_RANGE_MM && d < SENSOR_MAX_RANGE_MM) {
      if (confirmStart == 0) confirmStart = now;
      else if (now - confirmStart >= CONFIRM_MS) {
        dwellCount++;
        confirmStart = 0;
        if (dwellCount >= DWELL_PINGS) {
          objectConfirmed = true;
          computeDetectedPosition(d, jElbow.current, jForearm.current, jWrist.current);
          computePickupTargets(detected_r, detected_theta, detected_z, g_pickup_approach, g_pickup_grab);
          g_pickup_cache_valid = true;
          changeState(STATE_APPROACH);
          return;
        }
      }
    } else
      confirmStart = 0;

    if (elapsed > 2000) {
      confirmStart = 0;
      dwellCount = 0;
      if (scanningRight) {
        scanAngle += SCAN_STEP_DEG;
        if (scanAngle > 135) {
          scanAngle = 135;
          scanningRight = false;
        }
      } else {
        scanAngle -= SCAN_STEP_DEG;
        if (scanAngle < 0) {
          scanAngle = 0;
          scanningRight = true;
        }
      }
      changeState(STATE_SCAN);
    }
    break;
  }

  case STATE_APPROACH:
    if (!g_pickup_cache_valid) {
      computePickupTargets(detected_r, detected_theta, detected_z, g_pickup_approach, g_pickup_grab);
      g_pickup_cache_valid = true;
    }
    if (!moveToPolar(g_pickup_approach)) return;
    if (allJointsSettled()) changeState(STATE_OPEN_GRIP);
    break;

  case STATE_OPEN_GRIP:
    jointMoveTo(jHand, HAND_OPEN_DEG);
    jointRelease(jHand);
    if (jHand.current == jHand.target) {
      if (!settling) {
        settling = true;
        settleStart = now;
      }
      if (now - settleStart >= SETTLE_MS) changeState(STATE_LOWER_WRIST);
    }
    break;

  case STATE_LOWER_WRIST:
    if (!g_pickup_cache_valid) {
      computePickupTargets(detected_r, detected_theta, detected_z, g_pickup_approach, g_pickup_grab);
      g_pickup_cache_valid = true;
    }
    if (!moveToPolar(g_pickup_grab)) return;
    if (allJointsSettled()) changeState(STATE_CLOSE_GRIP);
    break;

  case STATE_CLOSE_GRIP:
    jointMoveTo(jHand, HAND_CLOSED_DEG);
    jointHold(jHand);
    if (jHand.current == jHand.target) {
      if (!settling) {
        settling = true;
        settleStart = now;
      }
      if (now - settleStart >= GRIP_CLOSE_MS) changeState(STATE_LIFT);
    }
    jHand.servo.write(HAND_CLOSED_DEG);
    break;

  case STATE_LIFT:
    if (!g_pickup_cache_valid) {
      computePickupTargets(detected_r, detected_theta, detected_z, g_pickup_approach, g_pickup_grab);
      g_pickup_cache_valid = true;
    }
    if (!moveToPolar(g_pickup_approach)) return;
    jointHold(jHand);
    jHand.servo.write(HAND_CLOSED_DEG);
    if (allJointsSettled()) changeState(STATE_TRANSFER);
    if (elapsed > CARRY_TIMEOUT_MS) {
      Serial.println(F("LIFT timeout"));
      changeState(STATE_RESET);
    }
    break;

  case STATE_TRANSFER: {
    PolarTarget drop = computeDropTarget();
    if (!moveToPolar(drop)) return;
    jointHold(jHand);
    jHand.servo.write(HAND_CLOSED_DEG);
    if (allJointsSettled()) {
      if (!settling) {
        settling = true;
        settleStart = now;
      }
      if (now - settleStart >= SETTLE_MS) changeState(STATE_DROP);
    }
    if (elapsed > CARRY_TIMEOUT_MS) {
      Serial.println(F("TRANSFER timeout"));
      changeState(STATE_RESET);
    }
    break;
  }

  case STATE_DROP:
    jointRelease(jHand);
    jointMoveTo(jHand, HAND_OPEN_DEG);
    if (jHand.current == jHand.target) {
      if (!settling) {
        settling = true;
        settleStart = now;
      }
      if (now - settleStart >= SETTLE_MS) {
        objectConfirmed = false;
        changeState(STATE_RESET);
      }
    }
    break;

  case STATE_RESET:
    g_pickup_cache_valid = false;
    {
      PolarTarget home = computeHomeTarget();
      jointRelease(jHand);
      jointMoveTo(jHand, HAND_OPEN_DEG);
      if (!moveToPolar(home)) {
        jointMoveTo(jElbow, 90);
        jointMoveTo(jForearm, (int)FOREARM_OFFSET_DEG);
        jointMoveTo(jWrist, (int)WRIST_OFFSET_DEG);
      }
      if (allJointsSettled() && jHand.current == jHand.target) {
        if (!settling) {
          settling = true;
          settleStart = now;
        }
        if (now - settleStart >= SETTLE_MS) {
          scanAngle = 0;
          scanningRight = true;
          ewmaDistance = 0.0f;
          confirmStart = 0;
          changeState(STATE_SCAN);
        }
      }
    }
    break;
  }
}

void setup() {
  Serial.begin(115200);
  Serial.println(F("v4 IK pick-place"));
#if DEBUG_FSM
  Serial.println(F("DEBUG_FSM on"));
#endif
#if DEBUG_IK
  Serial.println(F("DEBUG_IK on"));
#endif

  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);

  Serial.print(F("L1="));
  Serial.print(ARM_L1_MM, 1);
  Serial.print(F(" L2="));
  Serial.print(ARM_L2_EFF_MM, 1);
  Serial.print(F(" baseZ="));
  Serial.println(ARM_BASE_Z_MM, 1);

  PolarTarget home = computeHomeTarget();
  IKSolution sol;
  if (solveIK(home, sol)) {
    jointInit(jElbow, PIN_ELBOW, sol.elbow_deg);
    jointInit(jForearm, PIN_FOREARM, sol.forearm_deg);
    jointInit(jWrist, PIN_WRIST, sol.wrist_deg);
  } else {
    Serial.println(F("WARN home IK; defaults"));
    jointInit(jElbow, PIN_ELBOW, 90);
    jointInit(jForearm, PIN_FOREARM, (int)FOREARM_OFFSET_DEG);
    jointInit(jWrist, PIN_WRIST, (int)WRIST_OFFSET_DEG);
  }
  jointInit(jHand, PIN_HAND, HAND_OPEN_DEG);
  delay(1000);
  changeState(STATE_RESET);
  Serial.println(F("ready"));
}

void loop() {
  unsigned long now = millis();
  if (now - lastTick >= TICK_MS) {
    lastTick = now;
    tickAllJoints();
    runFSM();
  }
}
