# Connected Weather Station 🌦️

An ESP32-based environmental monitoring station that reads temperature, humidity, pressure, and light data from BME280 and BH1750 sensors, then publishes readings over MQTT in real time.

## Architecture

See the full architecture documentation with diagrams → [docs/architecture.md](docs/architecture.md)

```
ESP32 ──I2C──▶ BME280 (Temp / Humidity / Pressure)
  │            BH1750 (Light)
  │
  └──WiFi / MQTT──▶ Broker (HiveMQ) ──▶ Dashboard / Subscriber
```

## Hardware

| Component       | Purpose                                |
| --------------- | -------------------------------------- |
| ESP32 DevKit v1 | Microcontroller                        |
| BME280          | Temperature, humidity, pressure sensor |
| BH1750          | Ambient light sensor                   |

### Wiring

| ESP32 Pin     | Connects To            |
| ------------- | ---------------------- |
| GPIO 21 (SDA) | BME280 SDA, BH1750 SDA |
| GPIO 22 (SCL) | BME280 SCL, BH1750 SCL |
| 3.3V          | BME280 VCC, BH1750 VCC |
| GND           | BME280 GND, BH1750 GND |

## Project Structure

```
├── platformio.ini          # Build config & library deps
├── include/
│   ├── config.h            # WiFi, MQTT, pin & timing constants
│   ├── sensors.h           # Sensor interface
│   ├── wifi_manager.h      # WiFi functions
│   └── mqtt_client.h       # MQTT functions
├── src/
│   ├── main.cpp            # Entry point
│   ├── sensors.cpp         # BME280 & BH1750 logic
│   ├── wifi_manager.cpp    # WiFi connect / reconnect
│   └── mqtt_client.cpp     # MQTT connect / publish
└── docs/
    ├── architecture.md     # Architecture diagrams
    └── wiring_diagram.png  # Hardware wiring schematic
```

## Quick Start

### Prerequisites

- [PlatformIO](https://platformio.org/install) (CLI or VS Code extension)

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/EagleIoT/Connected-Weather-Station.git
   cd Connected-Weather-Station
   ```

2. **Configure credentials** — edit `include/config.h`

   ```cpp
   #define WIFI_SSID     "your_network"
   #define WIFI_PASSWORD "your_password"
   ```

3. **Build & upload**

   ```bash
   pio run --target upload
   ```

4. **Monitor serial output**

   ```bash
   pio device monitor
   ```

## MQTT Payload

Published to `iot/station_meteo/data` every 60 seconds:

```json
{
  "temperature": 23.5,
  "humidity": 45.2,
  "pressure": 1013.25,
  "lux": 350.0
}
```

## License

Eagle IoT — Connected Weather Station
