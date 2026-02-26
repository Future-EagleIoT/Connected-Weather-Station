# Connected Weather Station — Architecture

## System Overview

```mermaid
graph LR
    subgraph "Edge — ESP32"
        BME280["BME280<br/>Temp / Humidity / Pressure"]
        BH1750["BH1750<br/>Light Level"]
        ESP32["ESP32<br/>Microcontroller"]
    end

    MQTT["MQTT Broker<br/>(HiveMQ)"]
    DASH["Dashboard /<br/>Subscriber"]

    BME280 -->|I2C| ESP32
    BH1750 -->|I2C| ESP32
    ESP32  -->|WiFi · MQTT| MQTT
    MQTT   --> DASH
```

## Software Module Diagram

```mermaid
graph TD
    MAIN["main.cpp<br/>Entry point"]
    CFG["config.h<br/>All constants"]
    SENS["sensors.h / .cpp<br/>BME280 + BH1750"]
    WIFI["wifi_manager.h / .cpp<br/>WiFi connect & reconnect"]
    MQTTC["mqtt_client.h / .cpp<br/>MQTT connect & publish"]

    MAIN --> CFG
    MAIN --> SENS
    MAIN --> WIFI
    MAIN --> MQTTC
    SENS --> CFG
    WIFI --> CFG
    MQTTC --> CFG
    MQTTC --> SENS
```

## Data Flow

```mermaid
sequenceDiagram
    participant S as Sensors
    participant E as ESP32
    participant B as MQTT Broker
    participant D as Dashboard

    loop Every 60 s
        E->>S: readSensors()
        S-->>E: SensorData (T, H, P, Lux)
        E->>E: Validate readings
        alt valid
            E->>E: Serialize to JSON
            E->>B: PUBLISH "iot/station_meteo/data"
            B-->>D: Forward message
        else invalid
            E->>E: Log warning, skip publish
        end
    end
```

## Project Structure

```
Connected-Weather-Station/
├── platformio.ini          # Build config & library deps
├── include/
│   ├── config.h            # WiFi, MQTT, pin & timing constants
│   ├── sensors.h           # Sensor interface (SensorData struct)
│   ├── wifi_manager.h      # WiFi connect / reconnect
│   └── mqtt_client.h       # MQTT connect / publish
├── src/
│   ├── main.cpp            # setup() + loop()
│   ├── sensors.cpp         # BME280 & BH1750 implementation
│   ├── wifi_manager.cpp    # WiFi implementation
│   └── mqtt_client.cpp     # MQTT implementation
├── docs/
│   ├── architecture.md     # This file
│   └── wiring_diagram.png  # Hardware wiring schematic
└── README.md
```

## Hardware

| Component    | Role                            | Interface        | Address |
| ------------ | ------------------------------- | ---------------- | ------- |
| ESP32 DevKit | Microcontroller                 | —                | —       |
| BME280       | Temperature, Humidity, Pressure | I2C (GPIO 21/22) | 0x76    |
| BH1750       | Ambient Light                   | I2C (GPIO 21/22) | 0x23    |

## MQTT Payload

```json
{
  "temperature": 23.5,
  "humidity": 45.2,
  "pressure": 1013.25,
  "lux": 350.0
}
```

Topic: `iot/station_meteo/data`
