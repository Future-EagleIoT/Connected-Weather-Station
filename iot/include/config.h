#pragma once

// ============================================================
//  Connected Weather Station — Configuration
//  Credentials are in secrets.h (gitignored).
// ============================================================

#include "secrets.h"

// ---- API Endpoint ----
#define API_DATA_PATH      "/api/v1/data"    // POST sensor readings here
#define API_TIMEOUT_MS     10000             // HTTP request timeout

// ---- WiFi ----
#define WIFI_TIMEOUT_MS    10000             // 10 s connection timeout

// ---- I2C Pins ----
#define I2C_SDA            21
#define I2C_SCL            22

// ---- Sensor Addresses ----
#define BME280_ADDRESS     0x76

// ---- Sensor Valid Ranges ----
#define TEMP_MIN           -40.0f
#define TEMP_MAX           85.0f
#define HUMIDITY_MIN       0.0f
#define HUMIDITY_MAX       100.0f
#define PRESSURE_MIN       300.0f
#define PRESSURE_MAX       1100.0f
#define LUX_MIN            0.0f
#define LUX_MAX            65535.0f

// ---- Timing ----
#define PUBLISH_INTERVAL_MS   60000   // 60 s between readings
#define API_RETRY_DELAY_MS    5000    // 5 s between API retry attempts
#define WATCHDOG_TIMEOUT_S    120     // 2 min watchdog timer
