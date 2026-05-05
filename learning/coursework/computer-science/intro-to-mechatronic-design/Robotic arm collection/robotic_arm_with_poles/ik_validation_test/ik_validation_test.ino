// ================================================================
//  ik_validation_test.ino
//  Static IK Validation — No Servos Required
//
//  Purpose: Run 10+ known (r, θ, z, φ) targets through the IK solver
//           and Serial-print the computed servo angles. Compare the
//           output against hand calculations or known-good values.
//
//  Usage:
//    1. Upload to Arduino Uno
//    2. Open Serial Monitor at 115200 baud
//    3. Results print automatically on boot
//    4. Press 'd' + Enter to run dry-run FSM simulation
//
//  Compile: Arduino IDE, Board = "Arduino Uno"
// ================================================================

#include <math.h>

// ================================================================
//  ARM GEOMETRY — MUST MATCH YOUR PHYSICAL ARM
//  Copy these values from v4_ik_pick_and_place.ino
// ================================================================
#define ARM_L1_MM           100.0f   // <<<< MUST MATCH MAIN SKETCH
#define ARM_L2_EFF_MM        80.0f   // <<<< MUST MATCH MAIN SKETCH
#define ARM_BASE_Z_MM        50.0f   // <<<< MUST MATCH MAIN SKETCH

#define WS_OUTER_MARGIN     0.95f
#define WS_INNER_MARGIN     1.10f
#define WS_R_MIN_MM         10.0f
#define WS_Z_MIN_MM          0.0f
#define IK_PHI_TOL_MM        8.0f

// Servo calibration — MUST MATCH MAIN SKETCH
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

// ================================================================
//  DATA STRUCTURES (duplicated from main sketch for standalone use)
// ================================================================

struct PolarTarget {
  float r;
  float theta;
  float z;
  float phi;
};

struct IKSolution {
  int   elbow_deg;
  int   forearm_deg;
  int   wrist_deg;
  float phi_actual;
  bool  valid;
};

// ================================================================
//  IK SOLVER (duplicated from main sketch — keep in sync!)
// ================================================================

int geoToServo_forearm(float geo_deg) {
  float s = FOREARM_OFFSET_DEG + FOREARM_DIR * geo_deg;
  return constrain((int)(s + 0.5f), FOREARM_SERVO_MIN, FOREARM_SERVO_MAX);
}

int geoToServo_wrist(float geo_deg) {
  float s = WRIST_OFFSET_DEG + WRIST_DIR * geo_deg;
  return constrain((int)(s + 0.5f), WRIST_SERVO_MIN, WRIST_SERVO_MAX);
}

int geoToServo_elbow(float theta_deg) {
  float s = ELBOW_OFFSET_DEG + ELBOW_DIR * theta_deg;
  return constrain((int)(s + 0.5f), ELBOW_SERVO_MIN, ELBOW_SERVO_MAX);
}

bool solveIK(PolarTarget t, IKSolution &sol) {
  sol.valid = false;

  float L1   = ARM_L1_MM;
  float Leff = ARM_L2_EFF_MM;

  if (t.r < WS_R_MIN_MM) {
    Serial.println(F("  FAIL: r < minimum"));
    return false;
  }
  if (t.z < WS_Z_MIN_MM) {
    Serial.println(F("  FAIL: z < 0"));
    return false;
  }

  float D_max = (L1 + Leff) * WS_OUTER_MARGIN;
  float D_min = fabsf(L1 - Leff) * WS_INNER_MARGIN;
  float zp    = t.z - ARM_BASE_Z_MM;

  sol.elbow_deg = geoToServo_elbow(t.theta);

  float q1_rad, q2_rad;
  bool  solved = false;

  // Case A: φ specified
  if (t.phi > IK_PHI_FREE + 1.0f) {
    float phi_rad = t.phi * (PI / 180.0f);
    float rw = t.r - Leff * cosf(phi_rad);
    float zw = zp  - Leff * sinf(phi_rad);
    float Dw = sqrtf(rw * rw + zw * zw);

    if (fabsf(Dw - L1) < IK_PHI_TOL_MM) {
      q1_rad = atan2f(zw, rw);
      q2_rad = phi_rad - q1_rad;
      sol.phi_actual = t.phi;
      solved = true;
    } else {
      Serial.print(F("  CaseA fail (Dw="));
      Serial.print(Dw, 1);
      Serial.print(F(" vs L1="));
      Serial.print(L1, 1);
      Serial.println(F(") → CaseB"));
    }
  }

  // Case B: φ free (Law of Cosines)
  if (!solved) {
    float D = sqrtf(t.r * t.r + zp * zp);
    if (D > D_max) {
      Serial.print(F("  FAIL: D="));
      Serial.print(D, 1);
      Serial.print(F(" > Dmax="));
      Serial.println(D_max, 1);
      return false;
    }
    if (D < D_min) {
      Serial.print(F("  FAIL: D="));
      Serial.print(D, 1);
      Serial.print(F(" < Dmin="));
      Serial.println(D_min, 1);
      return false;
    }

    float cosQ2 = (D * D - L1 * L1 - Leff * Leff) / (2.0f * L1 * Leff);
    cosQ2 = constrain(cosQ2, -1.0f, 1.0f);

    q2_rad = acosf(cosQ2);  // Elbow-down first
    float sinQ2 = sinf(q2_rad);
    float alpha  = atan2f(zp, t.r);
    float beta   = atan2f(Leff * sinQ2, L1 + Leff * cosQ2);
    q1_rad = alpha - beta;
    sol.phi_actual = (q1_rad + q2_rad) * (180.0f / PI);
    solved = true;

    // Check servo limits
    int fa = geoToServo_forearm(q1_rad * (180.0f / PI));
    int wr = geoToServo_wrist(q2_rad * (180.0f / PI));
    if (fa <= FOREARM_SERVO_MIN || fa >= FOREARM_SERVO_MAX ||
        wr <= WRIST_SERVO_MIN  || wr >= WRIST_SERVO_MAX) {
      // Try elbow-up
      q2_rad = -acosf(cosQ2);
      sinQ2  = sinf(q2_rad);
      beta   = atan2f(Leff * sinQ2, L1 + Leff * cosQ2);
      q1_rad = alpha - beta;
      sol.phi_actual = (q1_rad + q2_rad) * (180.0f / PI);
    }
  }

  sol.forearm_deg = geoToServo_forearm(q1_rad * (180.0f / PI));
  sol.wrist_deg   = geoToServo_wrist(q2_rad * (180.0f / PI));
  sol.valid       = true;
  return true;
}

// ================================================================
//  FORWARD KINEMATICS VERIFICATION
// ================================================================

/*
 * verifyFK()
 * ----------
 * Given the IK solution (servo angles), compute the FK to find
 * where the end effector actually ends up. Compare with target.
 *
 * This is the "plug-back check" — solve IK, then compute FK from
 * the result, and verify it matches the original target.
 */
void verifyFK(PolarTarget t, IKSolution sol) {
  if (!sol.valid) return;

  float L1   = ARM_L1_MM;
  float Leff = ARM_L2_EFF_MM;

  // Reverse the servo→geo mapping to get geometric angles
  float q1_deg = ((float)sol.forearm_deg - FOREARM_OFFSET_DEG) / FOREARM_DIR;
  float q2_deg = ((float)sol.wrist_deg   - WRIST_OFFSET_DEG)   / WRIST_DIR;

  float q1_rad = q1_deg * (PI / 180.0f);
  float q2_rad = q2_deg * (PI / 180.0f);

  // FK equations
  float r_fk  = L1 * cosf(q1_rad) + Leff * cosf(q1_rad + q2_rad);
  float zp_fk = L1 * sinf(q1_rad) + Leff * sinf(q1_rad + q2_rad);
  float z_fk  = zp_fk + ARM_BASE_Z_MM;
  float phi_fk = (q1_deg + q2_deg);

  // Compute errors
  float err_r = fabsf(r_fk - t.r);
  float err_z = fabsf(z_fk - t.z);

  Serial.print(F("  FK check: r="));
  Serial.print(r_fk, 1);
  Serial.print(F(" z="));
  Serial.print(z_fk, 1);
  Serial.print(F(" phi="));
  Serial.print(phi_fk, 1);
  Serial.print(F("  |err_r|="));
  Serial.print(err_r, 2);
  Serial.print(F("mm |err_z|="));
  Serial.print(err_z, 2);
  Serial.print(F("mm"));

  if (err_r < 2.0f && err_z < 2.0f) {
    Serial.println(F("  [PASS]"));
  } else {
    Serial.println(F("  [FAIL — CHECK CALIBRATION]"));
  }
}

// ================================================================
//  TEST CASES
// ================================================================

struct TestCase {
  const char* name;
  PolarTarget target;
  bool expect_valid;  // true = should solve, false = should fail
};

// Build test cases programmatically to save SRAM (use PROGMEM for names)
// Note: with L1=100, Leff=80, Dmin≈22, Dmax≈171

const TestCase tests[] = {
  // --- REACHABLE TARGETS (expect_valid = true) ---

  // Test 1: Arm fully extended horizontally, phi free
  { "Full extend horiz",
    { 170.0f, 0.0f, 50.0f, IK_PHI_FREE },
    true },

  // Test 2: Medium reach, centered, phi free
  { "Medium reach center",
    { 120.0f, 45.0f, 50.0f, IK_PHI_FREE },
    true },

  // Test 3: Target above base, phi free
  { "Above base",
    { 100.0f, 90.0f, 120.0f, IK_PHI_FREE },
    true },

  // Test 4: Target below base height, phi free
  { "Below base height",
    { 150.0f, 30.0f, 10.0f, IK_PHI_FREE },
    true },

  // Test 5: Close to base, phi free
  { "Close reach",
    { 40.0f, 60.0f, 50.0f, IK_PHI_FREE },
    true },

  // Test 6: With approach angle φ = 0° (horizontal gripper)
  { "Phi=0 horiz grip",
    { 120.0f, 0.0f, 50.0f, 0.0f },
    true },  // May fall back to CaseB if overconstrained

  // Test 7: With approach angle φ = -90° (gripper down)
  { "Phi=-90 grip down",
    { 100.0f, 45.0f, 0.0f, -90.0f },
    true },  // May fall back to CaseB

  // Test 8: Sweep angle test (θ = 135°)
  { "Sweep 135 deg",
    { 130.0f, 135.0f, 50.0f, IK_PHI_FREE },
    true },

  // --- UNREACHABLE TARGETS (expect_valid = false) ---

  // Test 9: Way too far
  { "Too far (expect FAIL)",
    { 300.0f, 0.0f, 50.0f, IK_PHI_FREE },
    false },

  // Test 10: Below table
  { "Below table (FAIL)",
    { 100.0f, 0.0f, -10.0f, IK_PHI_FREE },
    false },

  // Test 11: r = 0 (overhead singularity)
  { "r=0 singular (FAIL)",
    { 0.0f, 0.0f, 100.0f, IK_PHI_FREE },
    false },

  // Test 12: Simulated pickup (scan detected ball at d=80mm, θ=45°)
  { "Simulated pickup",
    { 260.0f, 45.0f, 0.0f, IK_PHI_FREE },
    true },  // Likely out of range — tests boundary
};

#define NUM_TESTS  (sizeof(tests) / sizeof(tests[0]))

// ================================================================
//  DRY-RUN FSM SIMULATION
// ================================================================

/*
 * dryRunFSM()
 * -----------
 * Simulate the FSM state transitions with IK calls.
 * No servos move — only Serial output. Shows what angles the arm
 * would command at each FSM state.
 */
void dryRunFSM() {
  Serial.println(F("\n========================================"));
  Serial.println(F("DRY-RUN FSM SIMULATION"));
  Serial.println(F("========================================\n"));

  IKSolution sol;

  // 1. Reset / Home
  Serial.println(F("--- STATE_RESET: Moving to home ---"));
  PolarTarget home = { ARM_L1_MM * 0.7f, 0.0f, ARM_BASE_Z_MM + 40.0f, 0.0f };
  if (solveIK(home, sol)) {
    Serial.print(F("  Home: E="));
    Serial.print(sol.elbow_deg);
    Serial.print(F(" F="));
    Serial.print(sol.forearm_deg);
    Serial.print(F(" W="));
    Serial.println(sol.wrist_deg);
    verifyFK(home, sol);
  }

  // 2. Scan at several angles
  Serial.println(F("\n--- STATE_SCAN: Sweep positions ---"));
  float scanR = ARM_L1_MM + ARM_L2_EFF_MM;
  for (int angle = 0; angle <= 135; angle += 45) {
    Serial.print(F("  Scan at θ="));
    Serial.print(angle);
    Serial.println(F("°:"));
    PolarTarget scan = { scanR, (float)angle, ARM_BASE_Z_MM, IK_PHI_FREE };
    if (solveIK(scan, sol)) {
      Serial.print(F("    E="));
      Serial.print(sol.elbow_deg);
      Serial.print(F(" F="));
      Serial.print(sol.forearm_deg);
      Serial.print(F(" W="));
      Serial.print(sol.wrist_deg);
      Serial.print(F(" phi="));
      Serial.println(sol.phi_actual, 1);
    }
  }

  // 3. Simulate detection at d=80mm, θ=45°
  float d_detect = 80.0f;
  float theta_detect = 45.0f;
  float r_ball = scanR + d_detect;
  float z_ball = 0.0f;  // On table

  Serial.println(F("\n--- DETECTION: Ball at d=80mm, θ=45° ---"));
  Serial.print(F("  Ball polar: r="));
  Serial.print(r_ball, 1);
  Serial.print(F(" θ="));
  Serial.print(theta_detect, 1);
  Serial.print(F(" z="));
  Serial.println(z_ball, 1);

  // 4. Approach (above ball)
  Serial.println(F("\n--- STATE_APPROACH: Above ball ---"));
  PolarTarget approach = { r_ball, theta_detect, z_ball + 30.0f, -90.0f };
  if (solveIK(approach, sol)) {
    Serial.print(F("  Approach: E="));
    Serial.print(sol.elbow_deg);
    Serial.print(F(" F="));
    Serial.print(sol.forearm_deg);
    Serial.print(F(" W="));
    Serial.println(sol.wrist_deg);
    verifyFK(approach, sol);
  } else {
    Serial.println(F("  Approach IK FAILED (ball may be out of workspace)"));
  }

  // 5. Grab (at ball)
  Serial.println(F("\n--- STATE_LOWER_WRIST: At ball ---"));
  PolarTarget grab = { r_ball, theta_detect, z_ball, -90.0f };
  if (solveIK(grab, sol)) {
    Serial.print(F("  Grab: E="));
    Serial.print(sol.elbow_deg);
    Serial.print(F(" F="));
    Serial.print(sol.forearm_deg);
    Serial.print(F(" W="));
    Serial.println(sol.wrist_deg);
    verifyFK(grab, sol);
  } else {
    Serial.println(F("  Grab IK FAILED"));
  }

  // 6. Transfer to drop
  Serial.println(F("\n--- STATE_TRANSFER: To drop position ---"));
  PolarTarget drop = { 80.0f, 170.0f, 100.0f, -45.0f };
  if (solveIK(drop, sol)) {
    Serial.print(F("  Drop: E="));
    Serial.print(sol.elbow_deg);
    Serial.print(F(" F="));
    Serial.print(sol.forearm_deg);
    Serial.print(F(" W="));
    Serial.println(sol.wrist_deg);
    verifyFK(drop, sol);
  }

  Serial.println(F("\n--- DRY-RUN COMPLETE ---\n"));
}

// ================================================================
//  SETUP AND LOOP
// ================================================================

void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println(F("========================================="));
  Serial.println(F("  IK VALIDATION TEST SUITE"));
  Serial.println(F("========================================="));
  Serial.print(F("L1 = "));    Serial.print(ARM_L1_MM, 1);    Serial.println(F(" mm"));
  Serial.print(F("Leff = "));  Serial.print(ARM_L2_EFF_MM, 1); Serial.println(F(" mm"));
  Serial.print(F("baseZ = ")); Serial.print(ARM_BASE_Z_MM, 1); Serial.println(F(" mm"));

  float Dmax = (ARM_L1_MM + ARM_L2_EFF_MM) * WS_OUTER_MARGIN;
  float Dmin = fabsf(ARM_L1_MM - ARM_L2_EFF_MM) * WS_INNER_MARGIN;
  Serial.print(F("Workspace: Dmin="));
  Serial.print(Dmin, 1);
  Serial.print(F("mm  Dmax="));
  Serial.print(Dmax, 1);
  Serial.println(F("mm\n"));

  // Run all static test cases
  int pass = 0, fail = 0;

  for (int i = 0; i < (int)NUM_TESTS; i++) {
    Serial.print(F("TEST "));
    Serial.print(i + 1);
    Serial.print(F(": "));
    Serial.println(tests[i].name);

    Serial.print(F("  Target: r="));
    Serial.print(tests[i].target.r, 1);
    Serial.print(F(" θ="));
    Serial.print(tests[i].target.theta, 1);
    Serial.print(F(" z="));
    Serial.print(tests[i].target.z, 1);
    Serial.print(F(" φ="));
    if (tests[i].target.phi < -900.0f)
      Serial.println(F("FREE"));
    else {
      Serial.println(tests[i].target.phi, 1);
    }

    IKSolution sol;
    bool result = solveIK(tests[i].target, sol);

    if (result) {
      Serial.print(F("  SOLVED: elbow="));
      Serial.print(sol.elbow_deg);
      Serial.print(F(" forearm="));
      Serial.print(sol.forearm_deg);
      Serial.print(F(" wrist="));
      Serial.print(sol.wrist_deg);
      Serial.print(F(" phi_actual="));
      Serial.println(sol.phi_actual, 1);

      // FK verification
      verifyFK(tests[i].target, sol);
    } else {
      Serial.println(F("  NO SOLUTION (unreachable)"));
    }

    // Check expectation
    if (result == tests[i].expect_valid) {
      Serial.println(F("  EXPECTATION: MATCH\n"));
      pass++;
    } else {
      Serial.println(F("  EXPECTATION: MISMATCH *** CHECK THIS ***\n"));
      fail++;
    }
  }

  Serial.println(F("========================================="));
  Serial.print(F("RESULTS: "));
  Serial.print(pass);
  Serial.print(F(" pass, "));
  Serial.print(fail);
  Serial.println(F(" fail"));
  Serial.println(F("========================================="));
  Serial.println(F("\nSend 'd' to run dry-run FSM simulation."));
}

void loop() {
  // Wait for serial command to run dry-run
  if (Serial.available() > 0) {
    char c = Serial.read();
    if (c == 'd' || c == 'D') {
      dryRunFSM();
    }
  }
}
