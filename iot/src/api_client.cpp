// ============================================================
//  HTTPS API Client — replaces MQTT for secure data ingestion
//  Posts JSON to backend with API key authentication.
// ============================================================

#include "api_client.h"
#include "config.h"
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

static WiFiClientSecure secureClient;

void initAPIClient() {
    // Accept any valid TLS certificate (for Cloud Run / Let's Encrypt).
    // For production with pinned certs, load a root CA here instead.
    secureClient.setInsecure();  // TODO: pin root CA for production
    Serial.printf("[API] Endpoint: %s%s\n", API_BASE_URL, API_DATA_PATH);
}

bool postSensorData(const SensorData& data) {
    // Build JSON payload
    JsonDocument doc;
    doc["device_id"]   = DEVICE_ID;
    doc["temperature"]  = serialized(String(data.temperature, 2));
    doc["humidity"]     = serialized(String(data.humidity, 2));
    doc["pressure"]     = serialized(String(data.pressure, 2));
    doc["lux"]          = serialized(String(data.lux, 2));
    doc["timestamp"]    = millis() / 1000;  // uptime in seconds

    char payload[512];
    serializeJson(doc, payload);

    // Build full URL
    String url = String(API_BASE_URL) + API_DATA_PATH;

    HTTPClient http;
    http.begin(secureClient, url);
    http.setTimeout(API_TIMEOUT_MS);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-API-Key", DEVICE_API_KEY);

    int code = http.POST(payload);

    if (code >= 200 && code < 300) {
        Serial.printf("[API] POST OK (%d) → %s\n", code, API_DATA_PATH);
        http.end();
        return true;
    }

    if (code > 0) {
        Serial.printf("[API] POST failed — HTTP %d\n", code);
    } else {
        Serial.printf("[API] Connection error: %s\n", http.errorToString(code).c_str());
    }

    http.end();
    return false;
}
