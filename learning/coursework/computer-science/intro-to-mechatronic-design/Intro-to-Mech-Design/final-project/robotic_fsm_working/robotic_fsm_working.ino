#include <Servo.h>

 

//

Servo wrist, forearm, upperArm, shoulder;

 

//

const int WRIST_PIN     = 4;

const int FOREARM_PIN   = 7;

const int UPPER_ARM_PIN = 10;

const int SHOULDER_PIN  = 12;

 

//

const int TRIG_PIN = 2;

const int ECHO_PIN = 3;

 

//

const int CLAW_OPEN   = 170;

const int CLAW_CLOSED = 115;

 

// ─── Shoulder Positions

const int SCAN_START = 0;

const int SCAN_END   = 135;

const int DROP_POS   = 180;

 

// ─── Arm Poses

int SCAN_UPPER_ARM   = 80;

int SCAN_FOREARM     = 55; //was 65

 

int PICKUP_UPPER_ARM = 45;

int PICKUP_FOREARM   = 98; //95 before

 

int CARRY_UPPER_ARM  = 170;

int CARRY_FOREARM    = 170;

 

int DROP_UPPER_ARM   = 170;

int DROP_FOREARM     = 170;

 

// ─── Detection Config

// Ball should be close and only appear for a SHORT group of scan angles.

const float DETECT_MIN_CM       = 3.0;

const float DETECT_MAX_CM       = 14.1; //13.8

const float MIN_VALID_SENSOR_CM = 2.5;   //

 

const int   MIN_STREAK_STEPS    = 3;     // too short = noise 2 before

const int   MAX_STREAK_STEPS    = 6;     // too long = wall/robot/bag

const int   ANGLE_STEP          = 1; ////2 before

 

const int   SENSOR_SAMPLES      = 2;

const float MAX_SAMPLE_SPREAD   = 0.5; //0.3 before

 

// ─── Timing ───────────────────────────────────────────────────────────────────

const int SERVO_SPEED_MS = 15;

const int SCAN_SETTLE_MS = 10; //20

const int POSE_SETTLE_MS = 150;

const int GRIP_HOLD_MS   = 300;

const int DROP_HOLD_MS   = 500;  //300

 

// ─── State Machine ────────────────────────────────────────────────────────────

enum State {

  STATE_SCAN,

  STATE_DETECT,

  STATE_PICKUP,

  STATE_GRAB,

  STATE_CARRY,

  STATE_DELIVER,

  STATE_DROP,

  STATE_RESET

};

 

State currentState = STATE_SCAN;

 

// ─── Position Tracking ────────────────────────────────────────────────────────

int posShoulder = 0;

int posUpperArm = 0;

int posForearm  = 0;

int posClaw     = CLAW_OPEN;

 

// ─────────────────────────────────────────────────────────────────────────────

// SENSOR

// ─────────────────────────────────────────────────────────────────────────────

float readDistanceCM() {

  digitalWrite(TRIG_PIN, LOW);

  delayMicroseconds(4);

  digitalWrite(TRIG_PIN, HIGH);

  delayMicroseconds(10);

  digitalWrite(TRIG_PIN, LOW);

 

  long duration = pulseIn(ECHO_PIN, HIGH, 30000);

  if (duration == 0) return -1.0;

 

  float dist = (duration * 0.0343) / 2.0;

 

  if (dist < 0 || dist > 300) return -1.0;

  return dist;

}

 

bool getStableDistance(float &avgDist) {

  float vals[SENSOR_SAMPLES];

  int valid = 0;

 

  for (int i = 0; i < SENSOR_SAMPLES; i++) {

    float d = readDistanceCM();

    if (d > 0) {

      vals[valid] = d;

      valid++;

    }

    delay(10);

  }

 

  if (valid < 2) return false;

 

  float minVal = vals[0];

  float maxVal = vals[0];

  float sum = 0.0;

 

  for (int i = 0; i < valid; i++) {

    if (vals[i] < minVal) minVal = vals[i];

    if (vals[i] > maxVal) maxVal = vals[i];

    sum += vals[i];

  }

 

  avgDist = sum / valid;

 

  if ((maxVal - minVal) > MAX_SAMPLE_SPREAD) return false;

 

  return true;

}

 

bool ballDetected(float &distOut) {

  if (!getStableDistance(distOut)) {

    return false;

  }

 

  if (distOut < MIN_VALID_SENSOR_CM) {

    return false;

  }

 

  bool inRange = (distOut >= DETECT_MIN_CM && distOut <= DETECT_MAX_CM);

 

  if (inRange) {

    Serial.print("Candidate dist: ");

    Serial.print(distOut);

    Serial.println(" cm");

  }

 

  return inRange;

}

 

// ─────────────────────────────────────────────────────────────────────────────

// MOVEMENT HELPERS

// ─────────────────────────────────────────────────────────────────────────────

void moveServoSmooth(Servo &s, int &currentPos, int target) {

  int step = (target > currentPos) ? 1 : -1;

 

  while (currentPos != target) {

    currentPos += step;

    s.write(currentPos);

    delay(SERVO_SPEED_MS);

  }

}

 

void moveToPose(int tUpperArm, int tForearm) {

  bool moving = true;

 

  while (moving) {

    moving = false;

 

    if (posUpperArm != tUpperArm) {

      posUpperArm += (tUpperArm > posUpperArm) ? 1 : -1;

      upperArm.write(posUpperArm);

      moving = true;

    }

 

    if (posForearm != tForearm) {

      posForearm += (tForearm > posForearm) ? 1 : -1;

      forearm.write(posForearm);

      moving = true;

    }

 

    if (moving) delay(SERVO_SPEED_MS);

  }

 

  delay(POSE_SETTLE_MS);

}

 

// ─────────────────────────────────────────────────────────────────────────────

// SETUP

// ─────────────────────────────────────────────────────────────────────────────

void setup() {

  Serial.begin(115200);

 

  pinMode(TRIG_PIN, OUTPUT);

  pinMode(ECHO_PIN, INPUT);

  digitalWrite(TRIG_PIN, LOW);

 

  wrist.attach(WRIST_PIN);

  forearm.attach(FOREARM_PIN);

  upperArm.attach(UPPER_ARM_PIN);

  shoulder.attach(SHOULDER_PIN);

 

  wrist.write(CLAW_OPEN);

  posClaw = CLAW_OPEN;

 

  shoulder.write(SCAN_START);

  posShoulder = SCAN_START;

 

  upperArm.write(0);

  posUpperArm = 0;

 

  forearm.write(0);

  posForearm = 0;

 

  delay(1000);

 

  // Move automatically into scan pose

  moveToPose(SCAN_UPPER_ARM, SCAN_FOREARM);

  wrist.write(CLAW_OPEN);

  posClaw = CLAW_OPEN;

 

  Serial.println("Robot started.");

  Serial.println("Scanning for ball...");

}

 

// ─────────────────────────────────────────────────────────────────────────────

// LOOP

// ─────────────────────────────────────────────────────────────────────────────

void loop() {

  switch (currentState) {

 

    case STATE_SCAN: {

      int streak = 0;

      int bestAngle = -1;

      float bestDist = 999.0;

      bool foundBall = false;

 

      for (int angle = SCAN_START; angle <= SCAN_END; angle += ANGLE_STEP) {

        posShoulder = angle;

        shoulder.write(posShoulder);

        delay(SCAN_SETTLE_MS);

 

        float dist;

        bool hit = ballDetected(dist);

 

        if (hit) {

          streak++;

 

          if (dist < bestDist) {

            bestDist = dist;

            bestAngle = angle;

          }

        } else {

          if (streak >= MIN_STREAK_STEPS && streak <= MAX_STREAK_STEPS) {

            foundBall = true;

            break;

          }

 

          streak = 0;

          bestAngle = -1;

          bestDist = 999.0;

        }

      }

 

      // Handle case where streak continues until the end of the scan

      if (!foundBall && streak >= MIN_STREAK_STEPS && streak <= MAX_STREAK_STEPS) {

        foundBall = true;

      }

 

      if (foundBall && bestAngle >= 0) {

        Serial.print("Ball accepted at angle ");

        Serial.print(bestAngle);

        Serial.print(" dist ");

        Serial.println(bestDist);

 

        moveServoSmooth(shoulder, posShoulder, bestAngle);

        currentState = STATE_DETECT;

        return;

      }

 

      Serial.println("No valid ball found. Rescanning...");

      moveServoSmooth(shoulder, posShoulder, SCAN_START);

      delay(150);

      break;

    }

 

    case STATE_DETECT: {

      moveServoSmooth(wrist, posClaw, CLAW_OPEN);

      delay(POSE_SETTLE_MS);

      currentState = STATE_PICKUP;

      break;

    }

 

    case STATE_PICKUP: {

      moveToPose(PICKUP_UPPER_ARM, PICKUP_FOREARM);

      currentState = STATE_GRAB;

      break;

    }

 

    case STATE_GRAB: {

      moveServoSmooth(wrist, posClaw, CLAW_CLOSED);

      delay(GRIP_HOLD_MS);

      currentState = STATE_CARRY;

      break;

    }

 

    case STATE_CARRY: {

      moveToPose(CARRY_UPPER_ARM, CARRY_FOREARM);

      currentState = STATE_DELIVER;

      break;

    }

 

    case STATE_DELIVER: {

      moveServoSmooth(shoulder, posShoulder, DROP_POS);

      moveToPose(DROP_UPPER_ARM, DROP_FOREARM);

      currentState = STATE_DROP;

      break;

    }

 

    case STATE_DROP: {

      moveServoSmooth(wrist, posClaw, CLAW_OPEN);

      delay(DROP_HOLD_MS);

      currentState = STATE_RESET;

      break;

    }

 

    case STATE_RESET: {

      moveToPose(CARRY_UPPER_ARM, CARRY_FOREARM);

      moveServoSmooth(shoulder, posShoulder, SCAN_START);

      moveToPose(SCAN_UPPER_ARM, SCAN_FOREARM);

 

      wrist.write(CLAW_OPEN);

      posClaw = CLAW_OPEN;

 

      delay(150);

      currentState = STATE_SCAN;

      break;

    }

  }

}