// ============================================================
//  Connected Weather Station — Main Entry Point
//  ESP32 · BME280 · BH1750 · MQTT
// ============================================================

#include <Arduino.h>
#include "config.h"
#include "sensors.h"
#include "wifi_manager.h"
#include "mqtt_client.h"

static unsigned long lastPublish = 0;

void setup() {
    Serial.begin(115200);
    Serial.println("\n========================================");
    Serial.println(" Connected Weather Station — Eagle IoT");
    Serial.println("========================================\n");

    // 1. Sensors
    if (!initSensors()) {
        Serial.println("[INIT] Sensor init failed — check wiring");
        // Continue anyway; readings will show as invalid
    }

    // 2. WiFi
    if (!initWiFi()) {
        Serial.println("[INIT] WiFi init failed — will retry in loop");
    }

    // 3. MQTT
    initMQTT();
}

void loop() {
    // Keep connections alive
    ensureWiFiConnected();
    ensureMQTTConnected();
    mqttLoop();

    // Non-blocking publish interval
    if (millis() - lastPublish >= PUBLISH_INTERVAL_MS) {
        lastPublish = millis();

        SensorData data = readSensors();

        if (data.valid) {
            Serial.printf("T: %.1f°C  H: %.1f%%  P: %.1f hPa  L: %.1f lx\n",
                          data.temperature, data.humidity,
                          data.pressure, data.lux);
            publishSensorData(data);
        } else {
            Serial.println("[LOOP] Skipping publish — invalid sensor data");
        }
    }
}
