#include <Arduino.h>
#include <Notecard.h>
#include <SensirionI2CScd4x.h>
#include <Wire.h>

#define productUID "com.blues.tvantoll:co2_home_monitor"

Notecard notecard;
SensirionI2CScd4x scd4x;

void printUint16Hex(uint16_t value)
{
  Serial.print(value < 4096 ? "0" : "");
  Serial.print(value < 256 ? "0" : "");
  Serial.print(value < 16 ? "0" : "");
  Serial.print(value, HEX);
}

void printSerialNumber(uint16_t serial0, uint16_t serial1, uint16_t serial2)
{
  Serial.print("Serial: 0x");
  printUint16Hex(serial0);
  printUint16Hex(serial1);
  printUint16Hex(serial2);
  Serial.println();
}

float getVoltage()
{
  float voltage;
  J *req = notecard.newRequest("card.voltage");

  if (J *rsp = notecard.requestAndResponse(req))
  {
    voltage = JGetNumber(rsp, "value");
    notecard.deleteResponse(rsp);
  }
  return voltage;
}

void setup()
{
  // Provide visual signal when the Host MCU is powered
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, HIGH);

  static const size_t MAX_SERIAL_WAIT_MS = 5000;
  size_t begin_serial_wait_ms = ::millis();
  // Wait for the serial port to become available
  while (!Serial && (MAX_SERIAL_WAIT_MS > (::millis() - begin_serial_wait_ms)));
  Serial.begin(115200);
  notecard.setDebugOutputStream(Serial);

  notecard.begin();
  Wire.begin();
  scd4x.begin(Wire);

  uint16_t error;
  char errorMessage[256];

  uint16_t serial0;
  uint16_t serial1;
  uint16_t serial2;
  error = scd4x.getSerialNumber(serial0, serial1, serial2);
  if (error) {
    Serial.print("Error trying to execute getSerialNumber(): ");
    errorToString(error, errorMessage, 256);
    Serial.println(errorMessage);
  } else {
    printSerialNumber(serial0, serial1, serial2);
  }

  {
    // Configure the Notecard
    J *req = notecard.newRequest("hub.set");
    JAddStringToObject(req, "product", productUID);
    JAddStringToObject(req, "mode", "periodic");
    JAddStringToObject(req, "voutbound", "usb:1;high:60;normal:120;low:360;dead:0");
    JAddStringToObject(req, "vinbound", "usb:1;high:1440;normal:1440;low:1440;dead:0");
    notecard.sendRequest(req);
  }

  {
    // Configure a template for the data
    J *req = notecard.newRequest("note.template");
    JAddStringToObject(req, "file", "data.qo");
    JAddNumberToObject(req, "port", 1);
    JAddStringToObject(req, "format", "compact");
    J *body = JCreateObject();
    JAddNumberToObject(body, "co2", 12);
    JAddNumberToObject(body, "temp", 14.1);
    JAddNumberToObject(body, "humidity", 14.1);
    JAddNumberToObject(body, "_time", 14);
    JAddNumberToObject(body, "voltage", 14.1);
    JAddItemToObject(req, "body", body);
    notecard.sendRequest(req);
  }

  {
    // Optimize power usage for LiPo battery
    J *req = notecard.newRequest("card.voltage");
    JAddStringToObject(req, "mode", "lipo");
    notecard.sendRequest(req);
  }

  // Start Measurement
  error = scd4x.startPeriodicMeasurement();
  if (error) {
    Serial.print("Error trying to execute startPeriodicMeasurement(): ");
    errorToString(error, errorMessage, 256);
    Serial.println(errorMessage);
  }

  Serial.println("Waiting for first measurement... (5 sec)");
  delay(5000);

  // Read Measurement
  uint16_t co2;
  float temp;
  float humidity;

  // From https://learn.adafruit.com/adafruit-scd-40-and-scd-41/arduino
  error = scd4x.readMeasurement(co2, temp, humidity);
  if (error) {
    Serial.print("Error trying to execute readMeasurement(): ");
    errorToString(error, errorMessage, 256);
    Serial.println(errorMessage);
  } else if (co2 == 0) {
    Serial.println("Invalid sample detected, skipping.");
  } else {
    Serial.print("Co2:");
    Serial.print(co2);
    Serial.print("\t");
    Serial.print("Temperature:");
    Serial.print(temp);
    Serial.print("\t");
    Serial.print("Humidity:");
    Serial.println(humidity);
  }

  {
    J *req = notecard.newRequest("note.add");
    if (req != NULL)
    {
      JAddStringToObject(req, "file", "data.qo");
      J *body = JAddObjectToObject(req, "body");
      if (body)
      {
        JAddNumberToObject(body, "co2", co2);
        JAddNumberToObject(body, "temp", temp);
        JAddNumberToObject(body, "humidity", humidity);
        JAddNumberToObject(body, "voltage", getVoltage());
      }
      notecard.sendRequest(req);
    }
  }

  error = scd4x.stopPeriodicMeasurement();
  if (error) {
    Serial.print("Error trying to execute stopPeriodicMeasurement(): ");
    errorToString(error, errorMessage, 256);
    Serial.println(errorMessage);
  }
}

void loop()
{
  // Request that the Notecard place the host to sleep. Use a "command"
  // instead of a "request" because the host is going to power down and
  // cannot receive a response.
  J *req = notecard.newCommand("card.attn");
  JAddStringToObject(req, "mode", "sleep");
  JAddNumberToObject(req, "seconds", 3600);
  notecard.sendRequest(req);

  // Delay 1 second in case the host fails to sleep and try again
  delay(1000);
}
