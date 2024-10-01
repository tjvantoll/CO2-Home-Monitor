#include <Arduino.h>
#include <Notecard.h>

#define serialDebug Serial
#define productUID "com.blues.tvantoll:co2_home_monitor"

Notecard notecard;

void setup()
{
  static const size_t MAX_SERIAL_WAIT_MS = 5000;
  size_t begin_serial_wait_ms = ::millis();
  // Wait for the serial port to become available
  while (!serialDebug && (MAX_SERIAL_WAIT_MS > (::millis() - begin_serial_wait_ms)));
  serialDebug.begin(115200);
  notecard.setDebugOutputStream(serialDebug);

  notecard.begin();

  {
    // Configure the Notecard
    J *req = notecard.newRequest("hub.set");
    JAddStringToObject(req, "product", productUID);
    JAddStringToObject(req, "mode", "periodic");
    JAddNumberToObject(req, "outbound", 60);
    JAddNumberToObject(req, "inbound", 60 * 6);
    notecard.sendRequest(req);
  }
  
  {
    J *req = notecard.newRequest("note.template");
    JAddStringToObject(req, "file", "data.qo");
    JAddNumberToObject(req, "port", 1);
    JAddStringToObject(req, "format", "compact");
    J *body = JCreateObject();
    JAddNumberToObject(body, "co2", 14.1);
    JAddNumberToObject(body, "temp", 14.1);
    JAddNumberToObject(body, "_time", 14);
    JAddNumberToObject(body, "voltage", 14.1);
    JAddItemToObject(req, "body", body);
    notecard.sendRequest(req);
  }
}

float getCO2()
{
  return 12.0;
}

float getTemperature()
{
  float temp;
  J *req = notecard.newRequest("card.temp");

  if (J *rsp = notecard.requestAndResponse(req))
  {
      temp = JGetNumber(rsp, "value");
      notecard.deleteResponse(rsp);
  }
  return temp;
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

void loop()
{
  float co2 = getCO2();
  float temp = getTemperature();
  float voltage = getVoltage();

  J *req = notecard.newRequest("note.add");
  if (req != NULL)
  {
    JAddStringToObject(req, "file", "data.qo");
    J *body = JAddObjectToObject(req, "body");
    if (body)
    {
      JAddNumberToObject(body, "co2", co2);
      JAddNumberToObject(body, "temp", temp);
      JAddNumberToObject(body, "voltage", voltage);
    }
    notecard.sendRequest(req);
  }

  delay(1000 * 60 * 60);
}
