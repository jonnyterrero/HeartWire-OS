// ================================================================
//  ik_servo_calibration.ino
//  Physical Servo Calibration Tool for IK Angle Mapping
//
//  Purpose: Interactively command each servo to various angles and
//           record the physical geometric angle. Use this data to
//           determine OFFSET and DIR calibration constants.
//
//  Usage:
//    1. Upload to Arduino Uno
//    2. Open Serial Monitor at 115200 baud
//    3. Follow on-screen prompts
//
//  Commands:
//    e/f/w/h  — Select servo (Elbow/Forearm/Wrist/Hand)
//    +/-      — Adjust selected servo by 5° steps
//    0-9      — Quick-set: 0=0°, 1=20°, 2=40° ... 9=180°
//    p        — Print current angles of all servos
//    r        — Return all servos to 90° (neutral)
//    m        — Start calibration measurement mode
//
//  Compile: Arduino IDE, Board = "Arduino Uno"
// ================================================================

#include <Servo.h>

// Pins (must match your wiring)
#define PIN_HAND        7
#define PIN_WRIST       3
#define PIN_FOREARM    11
#define PIN_ELBOW       5

// Step size for +/- commands
#define STEP_DEG  5

Servo servoHand, servoWrist, servoForearm, servoElbow;

int angleHand    = 90;
int angleWrist   = 90;
int angleForearm = 90;
int angleElbow   = 90;

// Which servo is currently selected
enum SelectedServo { SEL_ELBOW, SEL_FOREARM, SEL_WRIST, SEL_HAND };
SelectedServo selected = SEL_FOREARM;

const char* servoName(SelectedServo s) {
  switch (s) {
    case SEL_ELBOW:   return "ELBOW (pin 5)";
    case SEL_FOREARM: return "FOREARM (pin 11)";
    case SEL_WRIST:   return "WRIST (pin 3)";
    case SEL_HAND:    return "HAND (pin 7)";
    default:          return "???";
  }
}

int* selectedAngle() {
  switch (selected) {
    case SEL_ELBOW:   return &angleElbow;
    case SEL_FOREARM: return &angleForearm;
    case SEL_WRIST:   return &angleWrist;
    case SEL_HAND:    return &angleHand;
    default:          return &angleElbow;
  }
}

Servo* selectedServo() {
  switch (selected) {
    case SEL_ELBOW:   return &servoElbow;
    case SEL_FOREARM: return &servoForearm;
    case SEL_WRIST:   return &servoWrist;
    case SEL_HAND:    return &servoHand;
    default:          return &servoElbow;
  }
}

void writeSelected(int deg) {
  deg = constrain(deg, 0, 180);
  *selectedAngle() = deg;
  selectedServo()->write(deg);
}

void printAll() {
  Serial.println(F("--- Current Servo Angles ---"));
  Serial.print(F("  Elbow   (pin 5):  ")); Serial.print(angleElbow);   Serial.println(F("°"));
  Serial.print(F("  Forearm (pin 11): ")); Serial.print(angleForearm); Serial.println(F("°"));
  Serial.print(F("  Wrist   (pin 3):  ")); Serial.print(angleWrist);   Serial.println(F("°"));
  Serial.print(F("  Hand    (pin 7):  ")); Serial.print(angleHand);    Serial.println(F("°"));
  Serial.print(F("  Selected: ")); Serial.println(servoName(selected));
  Serial.println();
}

void printHelp() {
  Serial.println(F("========================================="));
  Serial.println(F("  IK SERVO CALIBRATION TOOL"));
  Serial.println(F("========================================="));
  Serial.println(F("Commands:"));
  Serial.println(F("  e — Select ELBOW servo"));
  Serial.println(F("  f — Select FOREARM servo"));
  Serial.println(F("  w — Select WRIST servo"));
  Serial.println(F("  h — Select HAND servo"));
  Serial.println(F("  + — Increase selected servo by 5°"));
  Serial.println(F("  - — Decrease selected servo by 5°"));
  Serial.println(F("  0-9 — Quick set (0=0°, 5=100°, 9=180°)"));
  Serial.println(F("  p — Print all servo angles"));
  Serial.println(F("  r — Reset all to 90°"));
  Serial.println(F("  m — Start calibration measurement guide"));
  Serial.println(F("  ? — Show this help"));
  Serial.println(F("=========================================\n"));
}

/*
 * calibrationGuide()
 * ------------------
 * Interactive step-by-step guide for measuring the servo-to-geometric
 * angle mapping for the forearm and wrist joints.
 */
void calibrationGuide() {
  Serial.println(F("\n========================================="));
  Serial.println(F("  CALIBRATION MEASUREMENT GUIDE"));
  Serial.println(F("=========================================\n"));

  Serial.println(F("WHAT YOU NEED:"));
  Serial.println(F("  - Phone with a level/protractor app, or a physical protractor"));
  Serial.println(F("  - Ruler or tape measure (mm)"));
  Serial.println(F("  - Pen and paper to record values\n"));

  Serial.println(F("STEP 1: MEASURE LINK LENGTHS"));
  Serial.println(F("  a) Identify the forearm pivot axis (where the forearm servo shaft is)"));
  Serial.println(F("  b) Identify the wrist pivot axis (where the wrist servo shaft is)"));
  Serial.println(F("  c) L1 = distance from forearm pivot to wrist pivot = _____ mm"));
  Serial.println(F("  d) Identify the gripper tip (fingertip when closed)"));
  Serial.println(F("  e) L2_eff = distance from wrist pivot to gripper tip = _____ mm"));
  Serial.println(F("  f) z0 = height of forearm pivot above the table = _____ mm\n"));

  Serial.println(F("STEP 2: FOREARM SERVO CALIBRATION"));
  Serial.println(F("  I will command the forearm servo to different angles."));
  Serial.println(F("  At each angle, measure the physical link angle from HORIZONTAL."));
  Serial.println(F("  Convention: 0° = horizontal, positive = link points UP.\n"));

  selected = SEL_FOREARM;

  int testAngles[] = {60, 90, 105, 120, 150};
  Serial.println(F("  Servo°  →  Physical angle from horizontal (measure and record):"));

  for (int i = 0; i < 5; i++) {
    writeSelected(testAngles[i]);
    delay(800);

    Serial.print(F("    Servo = "));
    Serial.print(testAngles[i]);
    Serial.println(F("° → Physical link angle = _____ ° (measure now, then send any key)"));

    // Wait for user input
    while (!Serial.available()) {}
    while (Serial.available()) Serial.read();  // Flush
  }

  Serial.println(F("\n  From your measurements, find:"));
  Serial.println(F("    FOREARM_OFFSET = servo value where link is horizontal (0° geo)"));
  Serial.println(F("    FOREARM_DIR    = +1 if servo↑ = link↑, or -1 if servo↑ = link↓"));
  Serial.println(F("  Formula: servo = OFFSET + DIR × geo_angle\n"));

  Serial.println(F("STEP 3: WRIST SERVO CALIBRATION"));
  Serial.println(F("  Same procedure for the wrist servo."));
  Serial.println(F("  Geometric 0° = wrist link aligned with forearm link."));
  Serial.println(F("  Positive = link bends CCW (away from forearm).\n"));

  selected = SEL_WRIST;

  Serial.println(F("  Servo°  →  Physical angle relative to forearm (measure and record):"));

  for (int i = 0; i < 5; i++) {
    writeSelected(testAngles[i]);
    delay(800);

    Serial.print(F("    Servo = "));
    Serial.print(testAngles[i]);
    Serial.println(F("° → Physical relative angle = _____ ° (measure now, then send any key)"));

    while (!Serial.available()) {}
    while (Serial.available()) Serial.read();
  }

  Serial.println(F("\n  From your measurements, find:"));
  Serial.println(F("    WRIST_OFFSET = servo value where wrist is aligned with forearm"));
  Serial.println(F("    WRIST_DIR    = +1 or -1 (same logic as forearm)\n"));

  Serial.println(F("STEP 4: ELBOW SERVO CALIBRATION"));
  selected = SEL_ELBOW;

  Serial.println(F("  Command elbow to 0°:"));
  writeSelected(0);
  delay(800);
  Serial.println(F("  Mark the direction the arm points. This is θ=0° (or θ=OFFSET)."));
  Serial.println(F("  Now increasing to 90°:"));
  writeSelected(90);
  delay(800);
  Serial.println(F("  Did the arm sweep CCW (from above)? If yes, DIR=+1. If CW, DIR=-1.\n"));

  Serial.println(F("STEP 5: VERIFICATION"));
  Serial.println(F("  Enter your computed constants into the main sketch."));
  Serial.println(F("  Upload the test sketch (ik_validation_test.ino)."));
  Serial.println(F("  Run the FK verification. If errors > 5mm, re-measure.\n"));

  Serial.println(F("========================================="));
  Serial.println(F("  CALIBRATION GUIDE COMPLETE"));
  Serial.println(F("=========================================\n"));

  // Reset to neutral
  writeSelected(90);
  selected = SEL_FOREARM;
}

// ================================================================
//  SETUP AND LOOP
// ================================================================

void setup() {
  Serial.begin(115200);
  delay(500);

  servoElbow.attach(PIN_ELBOW);
  servoForearm.attach(PIN_FOREARM);
  servoWrist.attach(PIN_WRIST);
  servoHand.attach(PIN_HAND);

  servoElbow.write(90);
  servoForearm.write(90);
  servoWrist.write(90);
  servoHand.write(90);

  delay(500);

  printHelp();
  printAll();
}

void loop() {
  if (Serial.available() > 0) {
    char c = Serial.read();

    switch (c) {
      case 'e': selected = SEL_ELBOW;   Serial.print(F("Selected: ")); Serial.println(servoName(selected)); break;
      case 'f': selected = SEL_FOREARM; Serial.print(F("Selected: ")); Serial.println(servoName(selected)); break;
      case 'w': selected = SEL_WRIST;   Serial.print(F("Selected: ")); Serial.println(servoName(selected)); break;
      case 'h': selected = SEL_HAND;    Serial.print(F("Selected: ")); Serial.println(servoName(selected)); break;

      case '+':
      case '=':
        writeSelected(*selectedAngle() + STEP_DEG);
        Serial.print(servoName(selected));
        Serial.print(F(" → "));
        Serial.println(*selectedAngle());
        break;

      case '-':
      case '_':
        writeSelected(*selectedAngle() - STEP_DEG);
        Serial.print(servoName(selected));
        Serial.print(F(" → "));
        Serial.println(*selectedAngle());
        break;

      case '0': writeSelected(0);   Serial.print(servoName(selected)); Serial.println(F(" → 0°"));   break;
      case '1': writeSelected(20);  Serial.print(servoName(selected)); Serial.println(F(" → 20°"));  break;
      case '2': writeSelected(40);  Serial.print(servoName(selected)); Serial.println(F(" → 40°"));  break;
      case '3': writeSelected(60);  Serial.print(servoName(selected)); Serial.println(F(" → 60°"));  break;
      case '4': writeSelected(80);  Serial.print(servoName(selected)); Serial.println(F(" → 80°"));  break;
      case '5': writeSelected(100); Serial.print(servoName(selected)); Serial.println(F(" → 100°")); break;
      case '6': writeSelected(120); Serial.print(servoName(selected)); Serial.println(F(" → 120°")); break;
      case '7': writeSelected(140); Serial.print(servoName(selected)); Serial.println(F(" → 140°")); break;
      case '8': writeSelected(160); Serial.print(servoName(selected)); Serial.println(F(" → 160°")); break;
      case '9': writeSelected(180); Serial.print(servoName(selected)); Serial.println(F(" → 180°")); break;

      case 'p': printAll(); break;

      case 'r':
        angleElbow = 90; angleForearm = 90; angleWrist = 90; angleHand = 90;
        servoElbow.write(90); servoForearm.write(90);
        servoWrist.write(90); servoHand.write(90);
        Serial.println(F("All servos → 90°"));
        break;

      case 'm': calibrationGuide(); break;
      case '?': printHelp(); break;

      default: break;  // Ignore CR, LF, etc.
    }
  }
}
