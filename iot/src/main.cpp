// ============================================================
//  Connected Weather Station — Main Entry Point
//  ESP32 · BME280 · BH1750 · HTTPS API
//  Reads sensors every 60s and POSTs data to the backend.
// ============================================================

#include <Arduino.h>
#include <esp_task_wdt.h>
#include "config.h"
#include "sensors.h"
#include "wifi_manager.h"
#include "api_client.h"

static unsigned long lastPublish = 0;
static unsigned long lastRetry   = 0;
static bool          pendingRetry = false;

void setup() {
    Serial.begin(115200);
    Serial.println("\n========================================");
    Serial.println(" Connected Weather Station — Eagle IoT");
    Serial.println("========================================\n");

    // Enable hardware watchdog (resets if loop hangs > 120s)
    esp_task_wdt_init(WATCHDOG_TIMEOUT_S, true);
    esp_task_wdt_add(NULL);

    // 1. Sensors
    if (!initSensors()) {
        Serial.println("[INIT] Sensor init failed — check wiring");
    }

    // 2. WiFi
    if (!initWiFi()) {
        Serial.println("[INIT] WiFi init failed — will retry in loop");
    }

    // 3. HTTPS API client
    initAPIClient();
}

void loop() {
    // Feed the watchdog
    esp_task_wdt_reset();

    // Keep WiFi alive
    if (!ensureWiFiConnected()) {
        return;  // Skip this cycle if WiFi is down
    }

    // Non-blocking publish interval
    unsigned long now = millis();

    // Handle pending retry (non-blocking, no delay())
    if (pendingRetry && (now - lastRetry >= API_RETRY_DELAY_MS)) {
        pendingRetry = false;
    }

    if (!pendingRetry && (now - lastPublish >= PUBLISH_INTERVAL_MS)) {
        lastPublish = now;

        SensorData data = readSensors();

        if (data.valid) {
            Serial.printf("T: %.1f°C  H: %.1f%%  P: %.1f hPa  L: %.1f lx\n",
                          data.temperature, data.humidity,
                          data.pressure, data.lux);

            if (!postSensorData(data)) {
                // Schedule non-blocking retry
                pendingRetry = true;
                lastRetry = now;
                Serial.printf("[LOOP] Will retry in %d ms\n", API_RETRY_DELAY_MS);
            }
        } else {
            Serial.println("[LOOP] Skipping publish — invalid sensor data");
        }
    }
}
