const int button1Pin =2;
const int button2pin =7;
const int led1Pin = 13;
const int led2Pin = 12;
const int led3Pin = 4;

int button1State = 0;
int button2State = 0;

void setup () {
  pinMode(led1Pin, OUTPUT);
  pinMode(led2Pin, OUTPUT);
  pinMode(led3Pin, OUTPUT);
  pinMode(button1Pin, INPUT);
  pinMode(button2Pin, INPUT);
}
void loop() {
  button1State = digitalRead(button1Pin);
  button2State = digitalRead(button2Pin);

  digitalWrite(led1Pin, LOW);
  digitalWrite(led2Pin, LOW);
  digitalWrite(led3Pin, LOW);
  if (button1State==High && button2State==LOW){
    digitalWrite(led1Pin, High);
  }
  else if (button1State == LOW && button2State == HIGH) {
    digitalWrite(led2Pin, HIGH);
  }
  else if (button2State == HIGH && button2State == HIGH) {
  }
}