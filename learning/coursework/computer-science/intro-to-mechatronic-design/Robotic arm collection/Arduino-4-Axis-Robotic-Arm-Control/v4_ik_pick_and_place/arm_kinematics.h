// arm_kinematics.h — 2-link planar IK/FK + polar targets (include once from sketch)
#ifndef ARM_KINEMATICS_H
#define ARM_KINEMATICS_H

#include <Arduino.h>
#include <math.h>

#ifndef DEBUG_IK
#define DEBUG_IK 0
#endif

// --- Measure / calibrate (mm and deg) ---
#define ARM_L1_MM           100.0f
#define ARM_L2_EFF_MM        80.0f
#define ARM_BASE_Z_MM        50.0f

#define WS_OUTER_MARGIN     0.95f
#define WS_INNER_MARGIN     1.10f
#define WS_R_MIN_MM         10.0f
#define WS_Z_MIN_MM          0.0f

#define SENSOR_AXIAL_OFFSET_MM  0.0f

#define ELBOW_OFFSET_DEG     0.0f
#define ELBOW_DIR            1.0f
#define ELBOW_SERVO_MIN      0
#define ELBOW_SERVO_MAX    180

#define FOREARM_OFFSET_DEG 105.0f
#define FOREARM_DIR         -1.0f
#define FOREARM_SERVO_MIN    0
#define FOREARM_SERVO_MAX  180

#define WRIST_OFFSET_DEG   105.0f
#define WRIST_DIR           -1.0f
#define WRIST_SERVO_MIN      0
#define WRIST_SERVO_MAX    180

#define IK_PHI_FREE  (-999.0f)

#define SCAN_R_MM       (ARM_L1_MM + ARM_L2_EFF_MM)
#define SCAN_Z_MM       ARM_BASE_Z_MM
#define SCAN_PHI_DEG    0.0f

#define DROP_R_MM       80.0f
#define DROP_THETA_DEG  170.0f
#define DROP_Z_MM       100.0f
#define DROP_PHI_DEG    -45.0f

#define APPROACH_Z_OFFSET_MM  30.0f
#define PICKUP_PHI_DEG       -90.0f

#define HOME_R_MM       (ARM_L1_MM * 0.7f)
#define HOME_THETA_DEG  0.0f
#define HOME_Z_MM       (ARM_BASE_Z_MM + 40.0f)
#define HOME_PHI_DEG    0.0f

struct PolarTarget {
  float r, theta, z, phi;
};

struct IKSolution {
  int elbow_deg, forearm_deg, wrist_deg;
  float phi_actual;
  bool valid;
};

inline int geoToServo_forearm(float geo_deg) {
  float s = FOREARM_OFFSET_DEG + FOREARM_DIR * geo_deg;
  return constrain((int)(s + 0.5f), FOREARM_SERVO_MIN, FOREARM_SERVO_MAX);
}
inline int geoToServo_wrist(float geo_deg) {
  float s = WRIST_OFFSET_DEG + WRIST_DIR * geo_deg;
  return constrain((int)(s + 0.5f), WRIST_SERVO_MIN, WRIST_SERVO_MAX);
}
inline int geoToServo_elbow(float theta_deg) {
  float s = ELBOW_OFFSET_DEG + ELBOW_DIR * theta_deg;
  return constrain((int)(s + 0.5f), ELBOW_SERVO_MIN, ELBOW_SERVO_MAX);
}

inline float servoToGeo_forearm(int servo_deg) {
  return ((float)servo_deg - FOREARM_OFFSET_DEG) / FOREARM_DIR;
}
inline float servoToGeo_wrist(int servo_deg) {
  return ((float)servo_deg - WRIST_OFFSET_DEG) / WRIST_DIR;
}

static inline float absAngleDiffDeg(float a_deg, float b_deg) {
  float d = a_deg - b_deg;
  while (d > 180.0f) d -= 360.0f;
  while (d < -180.0f) d += 360.0f;
  return fabsf(d);
}

inline void fkTipFromGeo(float q1_deg, float q2_deg, float &r_out, float &zp_out) {
  float q1 = q1_deg * (PI / 180.0f);
  float q2 = q2_deg * (PI / 180.0f);
  r_out  = ARM_L1_MM * cosf(q1) + ARM_L2_EFF_MM * cosf(q1 + q2);
  zp_out = ARM_L1_MM * sinf(q1) + ARM_L2_EFF_MM * sinf(q1 + q2);
}

inline void fkTipFromServo(int forearm_servo, int wrist_servo, float &r_out, float &z_abs_out) {
  float q1 = servoToGeo_forearm(forearm_servo);
  float q2 = servoToGeo_wrist(wrist_servo);
  float zp;
  fkTipFromGeo(q1, q2, r_out, zp);
  z_abs_out = ARM_BASE_Z_MM + zp;
}

inline bool solveIK(PolarTarget t, IKSolution &sol) {
  sol.valid = false;
  float L1 = ARM_L1_MM, Leff = ARM_L2_EFF_MM;

  if (t.r < WS_R_MIN_MM || t.z < WS_Z_MIN_MM) return false;

  float D_max = (L1 + Leff) * WS_OUTER_MARGIN;
  float D_min = fabsf(L1 - Leff) * WS_INNER_MARGIN;
  float zp = t.z - ARM_BASE_Z_MM;
  float D = sqrtf(t.r * t.r + zp * zp);

  if (D > D_max || D < D_min) {
#if DEBUG_IK
    Serial.print(F("IK FAIL D="));
    Serial.println(D, 1);
#endif
    return false;
  }

  sol.elbow_deg = geoToServo_elbow(t.theta);

  float D2 = D * D, L1sq = L1 * L1, Lsq = Leff * Leff;
  float cosQ2 = (D2 - L1sq - Lsq) / (2.0f * L1 * Leff);
  cosQ2 = constrain(cosQ2, -1.0f, 1.0f);
  float q2_mag = acosf(cosQ2);
  const float q2_candidates[2] = { q2_mag, -q2_mag };
  const bool phiFree = (t.phi <= IK_PHI_FREE + 1.0f);

  bool found = false;
  float best_q1 = 0, best_q2 = 0, best_phi = 0, best_err = 1e9f;

  for (int i = 0; i < 2; i++) {
    float q2r = q2_candidates[i];
    float sinQ2 = sinf(q2r);
    float alpha = atan2f(zp, t.r);
    float beta = atan2f(Leff * sinQ2, L1 + Leff * cosf(q2r));
    float q1r = alpha - beta;
    float q1_deg = q1r * (180.0f / PI);
    float q2_deg = q2r * (180.0f / PI);

    int fa = geoToServo_forearm(q1_deg);
    int wr = geoToServo_wrist(q2_deg);
    if (fa <= FOREARM_SERVO_MIN || fa >= FOREARM_SERVO_MAX ||
        wr <= WRIST_SERVO_MIN || wr >= WRIST_SERVO_MAX)
      continue;

    float phi_actual = (q1r + q2r) * (180.0f / PI);

    if (phiFree) {
      best_q1 = q1_deg;
      best_q2 = q2_deg;
      best_phi = phi_actual;
      found = true;
      break;
    }
    float err = absAngleDiffDeg(phi_actual, t.phi);
    if (!found || err < best_err) {
      best_err = err;
      best_q1 = q1_deg;
      best_q2 = q2_deg;
      best_phi = phi_actual;
      found = true;
    }
  }

  if (!found) return false;

  sol.forearm_deg = geoToServo_forearm(best_q1);
  sol.wrist_deg = geoToServo_wrist(best_q2);
  sol.phi_actual = best_phi;
  sol.valid = true;

#if DEBUG_IK
  Serial.print(F("IK OK r="));
  Serial.print(t.r, 1);
  Serial.print(F(" z="));
  Serial.print(t.z, 1);
  Serial.print(F(" → "));
  Serial.print(sol.forearm_deg);
  Serial.print(F(","));
  Serial.println(sol.wrist_deg);
#endif
  return true;
}

inline PolarTarget computeScanTarget(int scan_theta_servo) {
  PolarTarget t;
  t.r = SCAN_R_MM;
  t.theta = ((float)scan_theta_servo - ELBOW_OFFSET_DEG) / ELBOW_DIR;
  t.z = SCAN_Z_MM;
  t.phi = SCAN_PHI_DEG;
  return t;
}

inline void computePickupTargets(float r_det, float th_det, float z_det,
                                 PolarTarget &ap, PolarTarget &gr) {
  ap.r = gr.r = r_det;
  ap.theta = gr.theta = th_det;
  ap.z = z_det + APPROACH_Z_OFFSET_MM;
  gr.z = z_det;
  ap.phi = gr.phi = PICKUP_PHI_DEG;
}

inline PolarTarget computeDropTarget() {
  PolarTarget t = { DROP_R_MM, DROP_THETA_DEG, DROP_Z_MM, DROP_PHI_DEG };
  return t;
}

inline PolarTarget computeHomeTarget() {
  PolarTarget t = { HOME_R_MM, HOME_THETA_DEG, HOME_Z_MM, HOME_PHI_DEG };
  return t;
}

#endif
