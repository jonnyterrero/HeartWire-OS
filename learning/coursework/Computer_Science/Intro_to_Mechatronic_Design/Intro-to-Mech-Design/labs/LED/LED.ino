
const int buttonPin = 2;
const int buttonPin2 = 3;
const int ledPin = 13;
const int ledPin2 = 12;
const int ledPin3 = 11;
int buttonState = 0;
int buttonState2 = 0;
void setup() {
  pinMode(ledPin, OUTPUT);
  pinMode(ledPin2,OUTPUT);
  pinMode(ledPin3,OUTPUT);
  pinMode(buttonPin, INPUT);
  pinMode(buttonPin2, INPUT);
}

void loop() {
  buttonState = digitalRead(buttonPin);
  buttonState2 = digitalRead(buttonPin2);
  if (buttonState == HIGH) {
    if(buttonState2 ==HIGH) {
      digitalWrite(ledPin3,HIGH);
    delay(500);
    digitalWrite(ledPin3,LOW);
    delay(500);
    }
    else {
    digitalWrite(ledPin,HIGH);
    delay(500);
    digitalWrite(ledPin,LOW);
    delay(500);
  }
  }
  if (buttonState2 == HIGH) {
    if(buttonState ==HIGH) {
      digitalWrite(ledPin3,HIGH);
    delay(500);
    digitalWrite(ledPin3,LOW);
    delay(500);
    }
    else {
    digitalWrite(ledPin2,HIGH);
    delay(500);
    digitalWrite(ledPin2,LOW);
    delay(500);
  }
  }
  else{
    digitalWrite(ledPin,LOW);
    digitalWrite(ledPin2,LOW);
    digitalWrite(ledPin3,LOW);
  }
}