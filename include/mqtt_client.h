#pragma once

#include "sensors.h"

// Configure the MQTT client (server, port).
void initMQTT();

// Ensure the MQTT client is connected; reconnect if needed.
// Returns true if connected.
bool ensureMQTTConnected();

// Serialise sensor data to JSON and publish to the configured topic.
// Returns true on successful publish.
bool publishSensorData(const SensorData& data);

// Must be called in loop() to keep the MQTT client alive.
void mqttLoop();
