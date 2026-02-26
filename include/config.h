#pragma once

// ============================================================
//  Connected Weather Station — Configuration
//  Edit this file to match your network and hardware setup.
// ============================================================

// ---- WiFi ----
#define WIFI_SSID          "Eagle_IoT"
#define WIFI_PASSWORD      "YOUR_PASSWORD"   // ⚠ Change this!
#define WIFI_TIMEOUT_MS    10000             // 10 s connection timeout

// ---- MQTT Broker ----
#define MQTT_SERVER        "broker.hivemq.com"
#define MQTT_PORT          1883
#define MQTT_TOPIC         "iot/station_meteo/data"
#define MQTT_CLIENT_PREFIX "ESP32_Meteo_"

// ---- I2C Pins ----
#define I2C_SDA            21
#define I2C_SCL            22

// ---- Sensor Addresses ----
#define BME280_ADDRESS     0x76

// ---- Timing ----
#define PUBLISH_INTERVAL_MS  60000   // 60 s between readings
#define MQTT_RETRY_DELAY_MS  5000    // 5 s between MQTT reconnect attempts
