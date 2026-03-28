// ============================================================
//  Sensor Manager — BME280 (temp/humidity/pressure) + BH1750 (light)
//  Includes range validation to reject physically impossible values.
// ============================================================

#include "sensors.h"
#include "config.h"
#include <Wire.h>

static Adafruit_BME280 bme;
static BH1750 lightMeter;

bool initSensors() {
    Wire.begin(I2C_SDA, I2C_SCL);

    // ------- BME280 -------
    if (!bme.begin(BME280_ADDRESS)) {
        Serial.println("[SENSOR] BME280 not found at 0x76!");
        return false;
    }
    Serial.println("[SENSOR] BME280 OK");

    // ------- BH1750 -------
    if (!lightMeter.begin()) {
        Serial.println("[SENSOR] BH1750 not found!");
        return false;
    }
    Serial.println("[SENSOR] BH1750 OK");

    return true;
}

// Check if a value is within the physically valid range for a sensor
static bool inRange(float val, float lo, float hi) {
    return !isnan(val) && val >= lo && val <= hi;
}

SensorData readSensors() {
    SensorData data;

    data.temperature = bme.readTemperature();
    data.humidity    = bme.readHumidity();
    data.pressure    = bme.readPressure() / 100.0F;  // Pa → hPa
    data.lux         = lightMeter.readLightLevel();

    // Validate each reading against its physical range
    data.valid = inRange(data.temperature, TEMP_MIN,     TEMP_MAX)     &&
                 inRange(data.humidity,    HUMIDITY_MIN,  HUMIDITY_MAX) &&
                 inRange(data.pressure,    PRESSURE_MIN,  PRESSURE_MAX) &&
                 inRange(data.lux,         LUX_MIN,       LUX_MAX);

    if (!data.valid) {
        Serial.println("[SENSOR] Warning: one or more readings out of valid range");
        Serial.printf("  T=%.1f  H=%.1f  P=%.1f  L=%.1f\n",
                       data.temperature, data.humidity,
                       data.pressure, data.lux);
    }

    return data;
}
