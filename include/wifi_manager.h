#pragma once

// Connect to WiFi using credentials from config.h.
// Returns true if connected within the timeout window.
bool initWiFi();

// Re-connect if the WiFi link has dropped.
// Returns true if currently connected.
bool ensureWiFiConnected();
