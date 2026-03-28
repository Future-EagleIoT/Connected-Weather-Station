#include "wifi_manager.h"
#include "config.h"
#include <WiFi.h>

bool initWiFi() {
    Serial.printf("[WIFI] Connecting to %s ", WIFI_SSID);
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    unsigned long start = millis();
    while (WiFi.status() != WL_CONNECTED) {
        if (millis() - start > WIFI_TIMEOUT_MS) {
            Serial.println("\n[WIFI] Connection timed out!");
            return false;
        }
        delay(500);
        Serial.print(".");
    }

    Serial.println();
    Serial.print("[WIFI] Connected — IP: ");
    Serial.println(WiFi.localIP());
    return true;
}

bool ensureWiFiConnected() {
    if (WiFi.status() == WL_CONNECTED) {
        return true;
    }
    Serial.println("[WIFI] Connection lost, reconnecting...");
    return initWiFi();
}
