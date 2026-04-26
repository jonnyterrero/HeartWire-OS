int redPin = 2;
int greenPin = 4;
int bluePin = 3;
int Sense = A0;
int Latch = 8;
int Data = 9;
int clock = 11;
int r = 0;
int g = 0;
int b = 0;

void setup() {
  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(bluePin, OUTPUT);
  pinMode(Sense, INPUT);
  pinMode(Latch, OUTPUT);
  pinMode(Data, OUTPUT);
  pinMode(clock, OUTPUT);
  Serial.begin(9600);
}

void loop() {
ColorCheck:
  //load ball
  delay(2000);
  Serial.print("please load ball...");
  digitalWrite(Latch, LOW);
  shiftOut(Data, clock, MSBFIRST, 0);
  digitalWrite(Latch, HIGH);
  delay(2000);
  digitalWrite(Latch, LOW);
  shiftOut(Data, clock, MSBFIRST, 83);
  digitalWrite(Latch, HIGH);
  Serial.println("  scan started");
  //set led red and store value
  setColor(255, 0, 0);
  delay(2000);
  r = analogRead(Sense);
  Serial.println(r);
  setColor(0,0,0);
  delay(2000);
  //set led green and store value
  setColor(0,255,0);
  delay(1000);
  g = analogRead(Sense);
  Serial.println(g);
  setColor(0,0,0);
  delay(1000);
  //set led blue and store value
  setColor(0,0,255);
  delay(1000);
  b = analogRead(Sense);
  Serial.println(b);
  setColor(0,0,0);
  delay(1000);

  //compare values, highest value should be color of ball
 

    digitalWrite(Latch, LOW);
    shiftOut(Data, clock, MSBFIRST, 80);
    digitalWrite(Latch, HIGH);
    Serial.println("this ball is red");
  }

  if(g > r && g >= b+10){
    if(g <= r+50 && g >= r-50){ // if red is within a range of 30 of green
      digitalWrite(Latch, LOW);
      shiftOut(Data, clock, MSBFIRST, 110);
      digitalWrite(Latch, HIGH);
      Serial.println("this ball is yellow");
      goto ColorCheck;
    }

    digitalWrite(Latch, LOW);
    shiftOut(Data, clock, MSBFIRST, 111);
    digitalWrite(Latch, HIGH);
    Serial.println("this ball is green");
  }

  if(b > r && b >= g-10){ //g-15 to allow for relief
    digitalWrite(Latch, LOW);
    shiftOut(Data, clock, MSBFIRST, 124);
    digitalWrite(Latch, HIGH);
    Serial.println("this ball is blue");
  }
  else{
    goto ColorCheck;
  }
}

void setColor(int red, int green, int blue) {
  // For Common Cathode:
  analogWrite(redPin, red);
  analogWrite(greenPin, green);
  analogWrite(bluePin, blue);
}