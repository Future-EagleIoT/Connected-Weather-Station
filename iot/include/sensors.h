#pragma once

#include <Adafruit_BME280.h>
#include <BH1750.h>

// Holds one snapshot of all sensor readings
struct SensorData {
    float temperature;  // °C
    float humidity;     // %
    float pressure;     // hPa
    float lux;          // lx
    bool  valid;        // false if any read failed
};

// Initialise I2C bus, BME280 and BH1750.
// Returns true if both sensors were found.
bool initSensors();

// Read all sensors and return a SensorData struct.
SensorData readSensors();
