#include "mqtt_client.h"
#include "config.h"
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

static WiFiClient   espClient;
static PubSubClient client(espClient);

void initMQTT() {
    client.setServer(MQTT_SERVER, MQTT_PORT);
    Serial.printf("[MQTT] Broker: %s:%d\n", MQTT_SERVER, MQTT_PORT);
}

bool ensureMQTTConnected() {
    if (client.connected()) {
        return true;
    }

    // Build a unique client ID
    String clientId = String(MQTT_CLIENT_PREFIX) + String(random(0xFFFF), HEX);
    Serial.printf("[MQTT] Connecting as %s ... ", clientId.c_str());

    if (client.connect(clientId.c_str())) {
        Serial.println("OK");
        return true;
    }

    Serial.printf("FAILED (rc=%d). Retrying in %d ms\n",
                  client.state(), MQTT_RETRY_DELAY_MS);
    delay(MQTT_RETRY_DELAY_MS);
    return false;
}

bool publishSensorData(const SensorData& data) {
    JsonDocument doc;
    doc["temperature"] = data.temperature;
    doc["humidity"]    = data.humidity;
    doc["pressure"]    = data.pressure;
    doc["lux"]         = data.lux;

    char buffer[256];
    serializeJson(doc, buffer);

    bool ok = client.publish(MQTT_TOPIC, buffer);
    if (ok) {
        Serial.printf("[MQTT] Published → %s\n", MQTT_TOPIC);
    } else {
        Serial.println("[MQTT] Publish failed!");
    }
    return ok;
}

void mqttLoop() {
    client.loop();
}
