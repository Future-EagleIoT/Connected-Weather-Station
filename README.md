# Connected Weather Station 🌦️

A production-ready IoT environmental monitoring system. ESP32 sensors capture temperature, humidity, pressure, and light data, transmit securely via HTTPS to a FastAPI backend, store in PostgreSQL, and visualize on a real-time React dashboard.

## Architecture

```
ESP32 + BME280 + BH1750
    │
    └──HTTPS POST (TLS + API Key)──▶ FastAPI Backend ──▶ PostgreSQL
                                          │
                                     JWT Auth
                                          │
                                     React Dashboard ◀── Nginx
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **IoT** | ESP32 · BME280 · BH1750 · Arduino (PlatformIO) |
| **Backend** | FastAPI · SQLAlchemy (async) · Pydantic · PostgreSQL |
| **Frontend** | React · Vite · TailwindCSS · Recharts |
| **Security** | JWT · bcrypt · API Keys · TLS · Rate Limiting |
| **Infrastructure** | Docker Compose · Nginx · GCP Cloud Run ready |

## Features

- 🔐 **Secure data ingestion** — API key auth + HTTPS from ESP32
- 📊 **Real-time dashboard** — Auto-refreshing charts with trend indicators
- 🛡️ **JWT authentication** — Protected dashboard with admin roles
- ⚡ **Rate limiting** — Per-device and per-user request throttling
- 📱 **Responsive design** — Mobile-friendly dark-mode UI
- 🐳 **One-command deploy** — Full stack with `docker compose up`
- 📡 **Device management** — Register/deactivate stations from the dashboard

## Quick Start

```bash
# Clone and start
git clone https://github.com/EagleIoT/Connected-Weather-Station.git
cd Connected-Weather-Station
cp .env.example .env
docker compose up --build

# Access
# Dashboard: http://localhost
# API Docs:  http://localhost:8000/docs
# Login:     admin@eagle-iot.com / admin123
```

## Project Structure

```
├── iot/                    # ESP32 firmware (PlatformIO)
│   ├── include/            # Headers + config
│   ├── src/                # Source code
│   └── platformio.ini      # Build config
├── backend/                # FastAPI REST API
│   ├── app/
│   │   ├── models/         # SQLAlchemy ORM models
│   │   ├── schemas/        # Pydantic validation
│   │   ├── routers/        # API endpoints
│   │   ├── middleware/      # Rate limiting
│   │   └── utils/          # JWT, hashing, logging
│   ├── alembic/            # Database migrations
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/               # React dashboard
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Login, Dashboard, Devices
│   │   ├── context/        # Auth state management
│   │   └── api/            # Axios API client
│   ├── Dockerfile
│   └── nginx.conf
├── docs/                   # Documentation
│   ├── setup.md            # Full setup guide
│   └── api.md              # API reference
├── docker-compose.yml      # Full stack orchestration
└── .env.example            # Environment template
```

## Hardware

| Component | Purpose |
|-----------|---------|
| ESP32 DevKit v1 | Microcontroller |
| BME280 | Temperature, humidity, pressure |
| BH1750 | Ambient light intensity |

### Wiring

| ESP32 Pin | Connects To |
|-----------|-------------|
| GPIO 21 (SDA) | BME280 SDA, BH1750 SDA |
| GPIO 22 (SCL) | BME280 SCL, BH1750 SCL |
| 3.3V | VCC |
| GND | GND |

## Documentation

- [Setup Guide](docs/setup.md) — Installation, configuration, deployment
- [API Reference](docs/api.md) — All endpoints with examples

## Security

- **Data in transit**: TLS/HTTPS for all communication
- **Device auth**: Unique API keys per ESP32 station
- **User auth**: JWT tokens with bcrypt password hashing
- **Rate limiting**: Prevents abuse (100 req/min devices, 30 req/min dashboard)
- **Input validation**: Pydantic schemas with physical range checks
- **Secrets management**: Environment variables, never committed to git

## License

Eagle IoT — Connected Weather Station
