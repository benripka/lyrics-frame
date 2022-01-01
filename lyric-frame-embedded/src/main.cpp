// GxEPD2_HelloWorld.ino by Jean-Marc Zingg

// see GxEPD2_wiring_examples.h for wiring suggestions and examples
// if you use a different wiring, you need to adapt the constructor parameters!

// uncomment next line to use class GFX of library GFX_Root instead of Adafruit_GFX
//#include <GFX.h>

#include <GxEPD2_BW.h>
#include <GxEPD2_3C.h>
#include <Fonts/FreeMonoBold9pt7b.h>
#include <SPI.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

// select the display class and display driver class in the following file (new style):
#include "GxEPD2_display_selection_new_style.h"
#include "Adafruit_I2CDevice.h"

// alternately you can copy the constructor from GxEPD2_display_selection.h or GxEPD2_display_selection_added.h to here
// e.g. for Wemos D1 mini:
// GxEPD2_BW<GxEPD2_154_D67, GxEPD2_154_D67::HEIGHT> display(GxEPD2_154_D67(/*CS=D8*/ SS, /*DC=D3*/ 0, /*RST=D4*/ 2, /*BUSY=D2*/ 4)); // GDEH0154D67

const char HelloWorld[] = "Mutha fuckin lyrics\nMutha fuckin lyrics\nMutha fuckin lyrics\nMutha fuckin lyrics\nMutha fuckin lyrics\nMutha fuckin lyrics\nMutha fuckin lyrics\nMutha fuckin lyrics\nMutha fuckin lyrics\nMutha fuckin lyrics\nMutha fuckin lyrics\nMutha fuckin lyrics\nMutha fuckin lyrics\nMutha fuckin lyrics\n";

void helloWorld(const char message[])
{
  display.setRotation(0);
  display.setFont(&FreeMonoBold9pt7b);
  display.setTextColor(GxEPD_BLACK);
  int16_t tbx, tby;
  uint16_t tbw, tbh;
  display.getTextBounds(message, 0, 0, &tbx, &tby, &tbw, &tbh);
  // center the bounding box by transposition of the origin:
  uint16_t x = ((display.width() - tbw) / 2) - tbx;
  uint16_t y = ((display.height() - tbh) / 2) - tby;
  display.setFullWindow();
  display.firstPage();
  do
  {
    display.fillScreen(GxEPD_WHITE);
    display.setCursor(x, y);
    display.print(HelloWorld);
  } while (display.nextPage());
}

char ssid[] = "SM-A326W7504"; //  your network SSID (name)
char pass[] = "joiscool";     // your network password

int status = WL_IDLE_STATUS;
IPAddress server(74, 125, 115, 105); // Google

// Initialize the client library
WiFiClient client;

// void setup() {
//   Serial.begin(9600);
//   Serial.println("Attempting to connect to WPA network...");
//   Serial.print("SSID: ");
//   Serial.println(ssid);

//   // display.init();
//   // helloWorld(HelloWorld);
//   // display.hibernate();

//   status = WiFi.begin(ssid, pass);
//   if ( status != WL_CONNECTED) {
//     Serial.println("Couldn't get a wifi connection");
//     // don't do anything else:
//     while(true);
//   }
//   else {
//     Serial.println("Connected to wifi");
//     Serial.println("\nStarting connection...");
//     // if you get a connection, report back via serial:
//     if (client.connect(server, 80)) {
//       Serial.println("connected");
//       // Make a HTTP request:
//       client.println("GET /search?q=arduino HTTP/1.0");
//       // String response = client.readString();
//       // helloWorld(response.c_str());
//     }
//   }
// }

const char host[] = "www.google.com";
uint16_t port = 80;

void setup()
{
  Serial.begin(9600);
  Serial.println();

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, pass);

  Serial.print("Connecting");
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }
  Serial.println();

  Serial.print("Connected, IP address: ");
  Serial.println(WiFi.localIP());
}

void loop()
{
  if (WiFi.status() == WL_CONNECTED)
  {
    WiFiClient client;
    HTTPClient http;

    String serverPath = "http://13.114.161.124:3000";

    // Your Domain name with URL path or IP address with path
    http.begin(client, serverPath.c_str());

    // Send HTTP GET request
    int httpResponseCode = http.GET();

    if (httpResponseCode > 0)
    {
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
      String payload = http.getString();
      Serial.println(payload);
    }
    else
    {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
    }
    // Free resources
    http.end();
  }
  else
  {
    Serial.println("WiFi Disconnected");
  }
  delay(5000);
};