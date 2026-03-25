#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// --- Configuration ---
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
// Update this with your Render backend URL once deployed
const char* serverUrl = "http://your-render-url.com/iot"; 

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    // Simulated sensor readings
    int soil = random(40, 80);
    int light = random(60, 90);
    float humidity = random(600, 900) / 10.0;
    float temperature = random(250, 320) / 10.0;

    // Create JSON
    StaticJsonDocument<200> doc;
    doc["soil"] = soil;
    doc["light"] = light;
    doc["humidity"] = humidity;
    doc["temperature"] = temperature;

    String jsonPayload;
    serializeJson(doc, jsonPayload);

    // Send POST
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    int httpResponseCode = http.POST(jsonPayload);
    if (httpResponseCode > 0) {
      Serial.println("Data sent successfully: " + String(httpResponseCode));
    } else {
      Serial.println("Error sending data: " + String(httpResponseCode));
    }
    http.end();
  }
  delay(5000); // Send every 5 seconds
}
