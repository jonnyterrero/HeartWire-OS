# Inverse Kinematics — Full Mathematical Derivation
## 4-Axis Pick-and-Place Robotic Arm (Arduino Uno)

---

## 1. Kinematic Model Definition

### 1.1 Joint and Link Identification

The arm is a **serial chain with 4 joints**, 3 of which contribute to end-effector positioning:

| Joint | Role | DOF Type | Servo Pin |
|-------|------|----------|-----------|
| Elbow | Base horizontal sweep | Revolute (yaw) | 5 |
| Forearm | Vertical-plane shoulder | Revolute (pitch) | 11 |
| Wrist | Vertical-plane elbow | Revolute (pitch) | 3 |
| Hand | Gripper open/close | Revolute (grip) | 7 |

Link lengths (all in mm, **user must measure**):

| Link | Symbol | Description |
|------|--------|-------------|
| L₁ | `ARM_L1_MM` | Forearm pivot → Wrist pivot |
| L₂ | `ARM_L2_MM` | Wrist pivot → Gripper mount (or start of fingers) |
| L₃ | `ARM_L3_MM` | Gripper mount → Gripper tip (tool offset) |

**Key assumption**: L₂ and L₃ are **colinear** (the gripper extends straight
from the wrist link). If your gripper is angled, measure the straight-line
distance from wrist pivot to fingertip and use that as L_eff directly.

Effective second link:  **L_eff = L₂ + L₃**

Additional parameter:
- **z₀** (`ARM_BASE_Z_MM`): Height of the forearm pivot above the table/ground plane (mm)

### 1.2 Coordinate System

**Origin**: At the base rotation (elbow) pivot point, on the table surface.

**Axes**:
- x: forward (θ = 0° reference direction)
- y: left (θ = 90°)
- z: up (vertical)

**Polar workspace coordinates** (what we command):

| Symbol | Name | Units | Description |
|--------|------|-------|-------------|
| r | Radial reach | mm | Horizontal distance from z-axis to end effector |
| θ | Sweep angle | deg | Angle in horizontal plane (maps to elbow servo) |
| z | Height | mm | Vertical position of end effector above table |
| φ | Approach angle | deg | Gripper tilt from horizontal (0°=horiz, -90°=down) |

---

## 2. Forward Kinematics

### 2.1 Decomposition: Base Rotation + Planar Arm

The base rotation (elbow servo) only affects the horizontal sweep angle θ.
After removing base rotation, the arm reduces to a **2-link planar
manipulator** operating in the vertical (r, z′) plane, where z′ = z - z₀.

**Joint variables in the vertical plane:**
- q₁ : Forearm geometric angle from horizontal (+CCW, i.e., up is positive)
- q₂ : Wrist geometric angle **relative to forearm link** (+CCW)

### 2.2 Forward Kinematics Equations

**Cartesian position of end effector in world frame:**

**Horizontal position** (in the arm's vertical plane):

    r  =  L₁ · cos(q₁)  +  L_eff · cos(q₁ + q₂)

**Vertical position:**

    z  =  z₀  +  L₁ · sin(q₁)  +  L_eff · sin(q₁ + q₂)

**Horizontal position in world frame:**

    x  =  r · cos(θ)
    y  =  r · sin(θ)

**End-effector approach angle** (absolute tilt from horizontal):

    φ  =  q₁ + q₂

The approach angle is determined by both joint angles. φ = 0° means the
gripper is horizontal; φ = -90° means it points straight down.

---

## 3. Denavit-Hartenberg Parameters

For completeness, the DH table (modified DH convention):

| Link i | aᵢ (mm) | αᵢ (deg) | dᵢ (mm) | θᵢ |
|--------|---------|----------|---------|-----|
| 1 (base→forearm) | 0 | 90° | z₀ | θ_elbow (variable) |
| 2 (forearm link) | L₁ | 0° | 0 | q₁ (variable) |
| 3 (wrist link) | L_eff | 0° | 0 | q₂ (variable) |

**Note**: The DH convention is standard for robot analysis, but for a 2-link
planar arm with base rotation, the **geometric decomposition** (Section 4)
is far more practical for an Arduino implementation. The DH table is
included for reference; the code uses the geometric method.

---

## 4. Inverse Kinematics Derivation (Geometric / Law of Cosines)

### 4.0 Problem Statement

**Given**: Target polar coordinates (r, θ, z) and optionally approach angle φ.
**Find**: Joint angles (θ_elbow, q₁, q₂) that place the gripper tip at the target.

### 4.1 Step 1 — Elbow Angle (Trivial)

The base rotation maps directly:

    θ_elbow  =  θ

This is a 1:1 mapping. The elbow servo sweeps the entire arm to angle θ.

### 4.2 Step 2 — Reduce to 2D (Vertical Plane Problem)

After setting θ_elbow = θ, the problem reduces to finding (q₁, q₂) such
that the end effector reaches position (r, z) in the vertical plane.

Define the adjusted height:

    z′  =  z  −  z₀

Now we need:

    r   =  L₁·cos(q₁)  +  L_eff·cos(q₁ + q₂)     ... (FK-r)
    z′  =  L₁·sin(q₁)  +  L_eff·sin(q₁ + q₂)     ... (FK-z)

### 4.3 Step 3 — Case A: Approach Angle φ Specified

When the user specifies the desired gripper tilt φ, we have:

    q₁ + q₂  =  φ      ... (constraint)

**Compute the wrist pivot position** by subtracting the second link
contribution:

    r_w  =  r  −  L_eff · cos(φ)
    z_w  =  z′ −  L_eff · sin(φ)

Now the wrist pivot must be reached by the first link alone:

    r_w  =  L₁ · cos(q₁)
    z_w  =  L₁ · sin(q₁)

Therefore:

    q₁  =  atan2(z_w, r_w)

**Reachability check**: The distance from origin to wrist pivot must equal L₁:

    D_w  =  √(r_w² + z_w²)

    Condition:  |D_w − L₁|  <  ε   (tolerance, e.g., 5 mm)

If this condition fails, the target is NOT reachable with the specified
approach angle. The solver should then either:
  (a) Report failure and fall back to STATE_RESET, OR
  (b) Switch to Case B (position-only) and let φ be free.

If reachable:

    q₂  =  φ  −  q₁

### 4.4 Step 4 — Case B: Position-Only IK (φ Free)

This is the **standard 2-link IK** using the Law of Cosines. Used when
approach angle is not constrained, or as a fallback from Case A.

**Distance from origin to target in the vertical plane:**

    D  =  √(r² + z′²)

**Reachability check** (triangle inequality):

    D_min  =  |L₁ − L_eff|
    D_max  =   L₁ + L_eff

    Condition:  D_min  ≤  D  ≤  D_max

If D < D_min: target is inside the inner workspace boundary (too close).
If D > D_max: target is outside the outer workspace boundary (too far).

**Law of Cosines for the relative wrist angle q₂:**

    cos(q₂)  =  (D² − L₁² − L_eff²) / (2 · L₁ · L_eff)

Let  C₂ = cos(q₂). Verify |C₂| ≤ 1 (guaranteed if D is within bounds).

    q₂  =  ± acos(C₂)

The ± gives two solutions:
  - **Elbow-up** (q₂ < 0): the arm bends "inward" — typically preferred
    for picking objects below the arm
  - **Elbow-down** (q₂ > 0): the arm bends "outward"

For a pick-and-place arm reaching downward, **elbow-down** (positive q₂) is
usually the correct configuration. The code should try elbow-down first and
fall back to elbow-up if servo limits are violated.

**Forearm angle q₁:**

Using the two-argument arctangent:

    α  =  atan2(z′, r)                                      [angle to target]
    β  =  atan2(L_eff · sin(q₂),  L₁ + L_eff · cos(q₂))  [offset angle]

    q₁  =  α  −  β

**Resulting approach angle:**

    φ_result  =  q₁ + q₂

### 4.5 Step 5 — Geometric-to-Servo Angle Mapping

The geometric angles (q₁, q₂) assume:
  - q₁ = 0° when the forearm link is horizontal, positive = up
  - q₂ = 0° when the wrist link is aligned with the forearm, positive = CCW

Physical servos have arbitrary zero points and may be inverted. Define
calibration constants:

    servo_forearm  =  FOREARM_OFFSET  +  FOREARM_DIR · q₁_deg
    servo_wrist    =  WRIST_OFFSET    +  WRIST_DIR   · q₂_deg

Where:
  - FOREARM_OFFSET = servo reading (°) when forearm is exactly horizontal
  - FOREARM_DIR    = +1 or -1 (determines sign convention)
  - Same for wrist

**Calibration procedure** (Section 8 in this document):
  1. Command forearm servo to various angles, measure physical link angle
  2. Find the servo value where the link is horizontal → OFFSET
  3. Increase servo by +10°; if link goes up, DIR = +1; if down, DIR = -1

### 4.6 Summary of the Full IK Pipeline

    Input:  (r, θ, z, φ_desired)
                    │
                    ▼
    θ_elbow = θ   (direct mapping)
                    │
                    ▼
            ┌───────────────────┐
            │  Is φ specified?  │
            └───────┬───────────┘
               yes  │        no
                    ▼           ▼
          Case A: Wrist     Case B: Law of
          point method      Cosines method
                    │           │
                    ▼           ▼
           (q₁, q₂)        (q₁, q₂)
                    │           │
                    ▼           ▼
          Geo → Servo mapping
                    │
                    ▼
          constrain() to [SERVO_MIN, SERVO_MAX]
                    │
                    ▼
          jointMoveTo() each servo

---

## 5. Singularities and Workspace Boundaries

### 5.1 Full Extension Singularity (D = L₁ + L_eff)

When the target is at maximum reach, q₂ = 0° (links are collinear).

- **Symptom**: cos(q₂) = 1.0 exactly → acos(1.0) = 0
- **Problem**: Loss of a DOF. Small target changes require large joint movements.
- **Mitigation**: Define D_max_safe = 0.95 · (L₁ + L_eff). Reject targets beyond this.

### 5.2 Full Retraction Singularity (D = |L₁ − L_eff|)

When the target is at minimum reach, q₂ = ±180° (links fold on each other).

- **Symptom**: cos(q₂) = -1.0
- **Problem**: Arm is fully folded; mechanical binding likely.
- **Mitigation**: Define D_min_safe = 1.1 · |L₁ − L_eff|. Reject targets inside this.

### 5.3 Overhead Singularity (r → 0, z > 0)

When the target is directly above the base. q₁ → 90°, and small errors
in r cause large swings in θ (base rotation becomes undefined when r = 0).

- **Mitigation**: Enforce r_min > 10 mm.

### 5.4 Below-Table Targets (z < 0)

The arm cannot reach below the table surface.

- **Mitigation**: Enforce z ≥ 0 in the solver.

### 5.5 Servo Limit Violations

After computing (q₁, q₂), the mapped servo angles may fall outside [0°, 180°].

- **Mitigation**: After mapping to servo angles, check limits. If violated:
  1. Try the other elbow configuration (up vs down)
  2. If both fail, report unreachable

---

## 6. Scan-to-Detect Mapping

### 6.1 Sensor Geometry

The HC-SR04 is mounted on the gripper, pointing forward when the wrist
is at WRIST_SCAN = 90° (horizontal). The sensor measures distance `d`
along the gripper axis.

During scanning:
  - Elbow sweeps through angles θ_scan ∈ [0°, 135°]
  - Wrist is horizontal (sensor points radially outward)
  - Forearm is at scan position (approximately horizontal)

### 6.2 Detected Object Position

When the sensor reports a confirmed distance `d` at elbow angle `θ_elbow`:

The sensor is at a known position along the arm. With wrist horizontal
and forearm at the scan position:

    Sensor position from base:
      r_sensor  =  L₁ · cos(q₁_scan) + L_eff · cos(q₁_scan + q₂_scan)
      z_sensor  =  z₀ + L₁ · sin(q₁_scan) + L_eff · sin(q₁_scan + q₂_scan)

    Since wrist is horizontal during scan (φ_scan ≈ 0°):
      The measured distance d is along the radial direction.

    Ball position:
      r_ball  =  r_sensor + d
      θ_ball  =  θ_elbow
      z_ball  =  z_sensor  (approximately, for a ball on the table: z_ball ≈ ball_radius)

### 6.3 Practical Simplification

If the arm is roughly horizontal during scanning:

    r_ball  ≈  (L₁ + L_eff) + d
    θ_ball  =  θ_elbow
    z_ball  =  z₀  (or table height + ball radius)

For more accurate mapping, use the FK equations with the actual scan-pose
joint angles to compute the sensor tip position, then add d.

### 6.4 Generating the Pickup Target

Once (r_ball, θ_ball, z_ball) is known:

    Pickup target:
      r     =  r_ball
      θ     =  θ_ball
      z     =  z_ball  (or slightly above for approach clearance)
      φ     =  -90°    (approach from above, gripper pointing down)

    This target goes through solveIK() to get servo angles for pickup.

---

## 7. Workspace Envelope

The reachable workspace in the vertical plane is an **annular region**:

    Inner radius:  D_min = |L₁ − L_eff|
    Outer radius:  D_max =  L₁ + L_eff

Any point (r, z′) where √(r² + z′²) ∈ [D_min, D_max] is kinematically
reachable (ignoring servo limits). The servo limits further constrain
the usable workspace to a subset of this annulus.

In 3D, the full workspace is a **torus-like volume** swept by rotating
the annular region about the z-axis through the elbow servo's range.

---

## 8. Calibration Procedure (Physical Arm)

### 8.1 Measuring Link Lengths

1. Remove power from servos (or use calibration sketch in neutral position).
2. Identify the forearm pivot axis — mark it.
3. Identify the wrist pivot axis — mark it.
4. Measure L₁ = straight-line distance from forearm pivot to wrist pivot (mm).
5. Measure L₂ = distance from wrist pivot to start of gripper fingers (mm).
6. Measure L₃ = distance from finger base to fingertip (mm).
7. Compute L_eff = L₂ + L₃.
8. Measure z₀ = height of forearm pivot above the table surface (mm).

### 8.2 Servo Angle Mapping

For each positioning servo (forearm, wrist):

1. Load the calibration sketch.
2. Command the servo to 90°.
3. Measure the physical link angle from horizontal with a protractor or phone level app.
4. Record: at servo=90°, geometric angle = X°.
5. Command servo to 100°. Measure again.
6. If geometric angle increased: DIR = +1. If decreased: DIR = -1.
7. Compute OFFSET = servo_reading - DIR × geometric_angle.

For the elbow (base rotation):
1. Command elbow to 0°. Mark the direction the arm points → this is θ = ELBOW_OFFSET.
2. Increasing servo angle should sweep the arm CCW (from above). If it goes CW, set ELBOW_DIR = -1.

---

*End of mathematical derivation. See the companion .ino files for implementation.*
