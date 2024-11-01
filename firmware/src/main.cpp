#include <Arduino.h>
#include <Notecard.h>
#include <SensirionI2CScd4x.h>
#include <Wire.h>

#define DEVELOPMENT false

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

  if (J *rsp = notecard.requestAndResponseWithRetry(req, 5))
  {
    voltage = JGetNumber(rsp, "value");
    notecard.deleteResponse(rsp);
  }
  return voltage;
}

void setup()
{
  #if DEVELOPMENT
    // Provide visual signal when the Host MCU is powered
    pinMode(LED_BUILTIN, OUTPUT);
    digitalWrite(LED_BUILTIN, HIGH);

    static const size_t MAX_SERIAL_WAIT_MS = 5000;
    size_t begin_serial_wait_ms = ::millis();
    // Wait for the serial port to become available
    while (!Serial && (MAX_SERIAL_WAIT_MS > (::millis() - begin_serial_wait_ms)));
    Serial.begin(115200);
    notecard.setDebugOutputStream(Serial);
  #else
    Serial.end();
  #endif

  notecard.begin();
  scd4x.begin(Wire);

  uint16_t error;

  #if DEVELOPMENT
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
  #endif

  // Start Measurement
  error = scd4x.startPeriodicMeasurement();
  #if DEVELOPMENT
    if (error) {
      Serial.print("Error trying to execute startPeriodicMeasurement(): ");
      errorToString(error, errorMessage, 256);
      Serial.println(errorMessage);
    }
  #endif

  #if DEVELOPMENT
    Serial.println("Waiting for first measurement... (5 sec)");
  #endif

  delay(5000);

  // Read Measurement
  uint16_t co2;
  float temp;
  float humidity;

  // From https://learn.adafruit.com/adafruit-scd-40-and-scd-41/arduino
  error = scd4x.readMeasurement(co2, temp, humidity);

  #if DEVELOPMENT
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
  #endif

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
      notecard.sendRequestWithRetry(req, 5);
    }
  }

  error = scd4x.stopPeriodicMeasurement();
  #if DEVELOPMENT
    if (error) {
      Serial.print("Error trying to execute stopPeriodicMeasurement(): ");
      errorToString(error, errorMessage, 256);
      Serial.println(errorMessage);
    }
  #endif
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
