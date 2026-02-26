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

SensorData readSensors() {
    SensorData data;

    data.temperature = bme.readTemperature();
    data.humidity    = bme.readHumidity();
    data.pressure    = bme.readPressure() / 100.0F;  // Pa → hPa
    data.lux         = lightMeter.readLightLevel();

    // Basic validity check (NaN means the sensor read failed)
    data.valid = !isnan(data.temperature) &&
                 !isnan(data.humidity)    &&
                 !isnan(data.pressure)    &&
                 (data.lux >= 0);

    if (!data.valid) {
        Serial.println("[SENSOR] Warning: one or more readings invalid");
    }

    return data;
}
