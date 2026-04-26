#include <Servo.h>

Servo servo_hand, servo_wrist, servo_forearm, servo_elbow;

int posHand = 45, posWrist = 90, posForearm = 90, posElbow = 90;

void setup() {
  Serial.begin(9600);
  servo_hand.attach(7);
  servo_wrist.attach(3);
  servo_forearm.attach(11);
  servo_elbow.attach(5);

  servo_hand.write(posHand);
  servo_wrist.write(posWrist);
  servo_forearm.write(posForearm);
  servo_elbow.write(posElbow);

  Serial.println(F("=== CALIBRATION MODE ==="));
  Serial.println(F("Commands:  h+  h-  w+  w-  f+  f-  e+  e-"));
  Serial.println(F("Each press moves that joint 5 degrees."));
  Serial.println(F("Type 'p' to print all current angles."));
  printAll();
}

void printAll() {
  Serial.println(F("------------------------------"));
  Serial.print(F("  Hand    (pin 7)  = ")); Serial.println(posHand);
  Serial.print(F("  Wrist   (pin 3)  = ")); Serial.println(posWrist);
  Serial.print(F("  Forearm (pin 11) = ")); Serial.println(posForearm);
  Serial.print(F("  Elbow   (pin 5)  = ")); Serial.println(posElbow);
  Serial.println(F("------------------------------"));
}

void loop() {
  if (!Serial.available()) return;

  String cmd = Serial.readStringUntil('\n');
  cmd.trim();

  if (cmd == "h+") posHand = constrain(posHand + 5, 0, 180);
  else if (cmd == "h-") posHand = constrain(posHand - 5, 0, 180);
  else if (cmd == "w+") posWrist = constrain(posWrist + 5, 0, 180);
  else if (cmd == "w-") posWrist = constrain(posWrist - 5, 0, 180);
  else if (cmd == "f+") posForearm = constrain(posForearm + 5, 0, 180);
  else if (cmd == "f-") posForearm = constrain(posForearm - 5, 0, 180);
  else if (cmd == "e+") posElbow = constrain(posElbow + 5, 0, 180);
  else if (cmd == "e-") posElbow = constrain(posElbow - 5, 0, 180);
  else if (cmd == "p") { printAll(); return; }
  else { Serial.println(F("Unknown cmd")); return; }

  servo_hand.write(posHand);
  servo_wrist.write(posWrist);
  servo_forearm.write(posForearm);
  servo_elbow.write(posElbow);

  printAll();
}