#elif SERVO_LAYOUT == 2
const int HAND_PIN     = 4;
const int WRIST_PIN    = 7;
const int FOREARM_PIN  = 10;
const int SHOULDER_PIN = 12;
const int PIN_LED_R = 11;  // red LED must be wired here (D7 is wrist in this layout)
const int PIN_LED_G = 8;
const int PIN_LED_B = 9;
#else
#error SERVO_LAYOUT must be 1 (V5) or 2 (working_arm servo pins + LED R on D11)
#endif
const int PIN_PHOTO = A3;