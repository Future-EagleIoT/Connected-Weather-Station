#pragma once

#include "sensors.h"

// Initialise HTTPS client.
void initAPIClient();

// Send sensor data to the backend via HTTPS POST.
// Returns true on successful delivery (HTTP 2xx).
bool postSensorData(const SensorData& data);
