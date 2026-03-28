<p align="center">
  <img src="https://img.shields.io/badge/ESP32-IoT-blue?style=for-the-badge&logo=espressif&logoColor=white" alt="ESP32" />
  <img src="https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-Dashboard-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
</p>

<h1 align="center">🌦️ Connected Weather Station</h1>

<p align="center">
  <strong>A production-ready IoT environmental monitoring system</strong><br/>
  ESP32 sensors capture temperature, humidity, pressure & light — transmitted securely via HTTPS to a FastAPI backend, stored in PostgreSQL, and visualized on a real-time React dashboard.
</p>

<p align="center">
  <a href="docs/setup.md">📖 Setup Guide</a> •
  <a href="docs/api.md">📡 API Reference</a> •
  <a href="#quick-start">🚀 Quick Start</a> •
  <a href="#security">🔐 Security</a>
</p>

---

## 📐 Architecture

```
╔══════════════════╗     HTTPS + API Key     ╔══════════════════╗     SQL      ╔══════════════════╗
║    ESP32 + I2C   ║ ──────────────────────▶ ║   FastAPI REST   ║ ──────────▶ ║   PostgreSQL 16  ║
║   BME280 + BH1750║     POST /api/v1/data   ║   (Uvicorn)      ║             ║   (sensor_data,  ║
╚══════════════════╝                         ╚══════════╤═══════╝             ║    devices,      ║
                                                        │                     ║    users)        ║
                                                   JWT Auth                   ╚══════════════════╝
                                                        │
                                             ╔══════════╧═══════╗
                                             ║   React + Vite   ║
                                             ║   (Nginx / SPA)  ║
                                             ╚══════════════════╝
                                                  Dashboard
```

---

## ⚡ Tech Stack

| Layer | Technology | Purpose |
|:------|:-----------|:--------|
| **IoT Firmware** | ESP32 · Arduino · PlatformIO | Sensor reading + HTTPS transmission |
| **Sensors** | BME280 · BH1750 | Temperature, humidity, pressure, ambient light |
| **Backend** | FastAPI · SQLAlchemy (async) · Pydantic | REST API, validation, business logic |
| **Database** | PostgreSQL 16 · Alembic | Time-series storage, migrations |
| **Frontend** | React 19 · Vite · TailwindCSS v4 · Recharts | Real-time dashboard with charts |
| **Auth** | JWT (HS256) · bcrypt · API Keys | User + device authentication |
| **Infrastructure** | Docker Compose · Nginx · GCP Cloud Run | Container orchestration + deployment |

---

## ✨ Features

- 🔐 **End-to-end security** — TLS encryption, API key auth for devices, JWT for users, bcrypt hashing
- 📊 **Real-time dashboard** — Auto-refreshing charts (30s), trend indicators, device status
- 📡 **Multi-device support** — Register unlimited ESP32 stations, each with unique API keys
- ⚡ **Rate limiting** — Per-device and per-user throttling to prevent abuse
- 🛡️ **Input validation** — Pydantic schemas enforce physical sensor ranges (-40…85°C, 0…100%, etc.)
- 📱 **Responsive UI** — Premium dark theme with glassmorphism, works on mobile and desktop
- 🐳 **One-command deploy** — Full stack up in seconds with `docker compose up`
- ☁️ **Cloud-ready** — GCP Cloud Run configs and deploy script included
- 👤 **Role-based access** — Admin users can manage devices and create accounts

---

## 🚀 Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose v2+
- [PlatformIO](https://platformio.org/install) (for ESP32 firmware)

### 1. Clone & Configure

```bash
git clone https://github.com/EagleIoT/Connected-Weather-Station.git
cd Connected-Weather-Station

# Create environment file
cp .env.example .env
```

Edit `.env` with secure values:

```env
DB_PASSWORD=your_secure_database_password
JWT_SECRET_KEY=your_jwt_secret_here    # Generate: openssl rand -hex 32
DEBUG=false
```

### 2. Start the Stack

```bash
docker compose up --build
```

### 3. Access

| Service | URL |
|---------|-----|
| 🖥️ **Dashboard** | [http://localhost](http://localhost) |
| 📡 **API Docs** (Swagger) | [http://localhost:8000/docs](http://localhost:8000/docs) |
| 📘 **API Docs** (ReDoc) | [http://localhost:8000/redoc](http://localhost:8000/redoc) |
| ❤️ **Health Check** | [http://localhost:8000/health](http://localhost:8000/health) |

> **Default login:** `admin@eagle-iot.com` / `admin123`
>
> ⚠️ Change the default password after first login in production.

### 4. Flash the ESP32

```bash
cd iot

# Create secrets file
cp include/secrets.h.example include/secrets.h
# Edit secrets.h → set WiFi, API URL, and device API key

# Build and upload
pio run --target upload

# Monitor output
pio device monitor
```

---

## 📂 Project Structure

```
Connected-Weather-Station/
│
├── iot/                            # 🔌 ESP32 Firmware
│   ├── include/
│   │   ├── config.h                #    Build config (pins, timing, ranges)
│   │   ├── secrets.h.example       #    Credential template (WiFi, API key)
│   │   ├── sensors.h               #    Sensor interface
│   │   ├── wifi_manager.h          #    WiFi connection manager
│   │   └── api_client.h            #    HTTPS API client
│   ├── src/
│   │   ├── main.cpp                #    Entry point (watchdog, loop)
│   │   ├── sensors.cpp             #    BME280 + BH1750 with range validation
│   │   ├── wifi_manager.cpp        #    WiFi connect / reconnect
│   │   └── api_client.cpp          #    HTTPS POST with API key auth
│   ├── docs/                       #    Hardware diagrams
│   └── platformio.ini              #    PlatformIO build config
│
├── backend/                        # ⚙️ FastAPI REST API
│   ├── app/
│   │   ├── main.py                 #    App assembly, CORS, admin seed
│   │   ├── config.py               #    Settings from env vars
│   │   ├── database.py             #    Async SQLAlchemy engine
│   │   ├── models/                 #    ORM: Device, SensorReading, User
│   │   ├── schemas/                #    Pydantic validation schemas
│   │   ├── routers/
│   │   │   ├── data.py             #    POST (ingest) + GET (query) /data
│   │   │   ├── auth.py             #    Login, register, /me
│   │   │   └── devices.py          #    Device CRUD + API key generation
│   │   ├── middleware/
│   │   │   └── rate_limiter.py     #    Sliding window rate limiter
│   │   └── utils/
│   │       ├── security.py         #    JWT, bcrypt, API key validation
│   │       └── logging_config.py   #    Structured logging
│   ├── alembic/                    #    Database migration framework
│   ├── Dockerfile                  #    Python 3.12, non-root user
│   ├── requirements.txt            #    Pinned dependencies
│   └── .env.example                #    ENV template
│
├── frontend/                       # 🎨 React Dashboard
│   ├── src/
│   │   ├── api/client.js           #    Axios + JWT interceptor
│   │   ├── context/AuthContext.jsx  #    Auth state management
│   │   ├── components/
│   │   │   ├── Layout.jsx          #    Sidebar + header shell
│   │   │   ├── StatsCard.jsx       #    Metric card with trend
│   │   │   └── Charts/
│   │   │       └── WeatherChart.jsx #   Reusable area chart
│   │   ├── pages/
│   │   │   ├── Login.jsx           #    Glassmorphic login form
│   │   │   ├── Dashboard.jsx       #    Stats + 4 live charts
│   │   │   └── Devices.jsx         #    Device management
│   │   └── App.jsx                 #    Routes + auth protection
│   ├── Dockerfile                  #    Multi-stage: Node → Nginx
│   ├── nginx.conf                  #    SPA routing + API proxy
│   └── index.html                  #    SEO meta tags
│
├── infra/                          # ☁️ Cloud Deployment
│   └── cloud-run/
│       ├── backend-service.yaml    #    GCP Cloud Run config
│       └── deploy.sh               #    One-command GCP deploy
│
├── docs/                           # 📖 Documentation
│   ├── setup.md                    #    Full setup & config guide
│   └── api.md                      #    Complete API reference
│
├── docker-compose.yml              # 🐳 Full stack orchestration
├── .env.example                    #    Root env template
├── .gitignore                      #    Comprehensive ignore rules
└── README.md                       #    You are here
```

---

## 🔌 Hardware

### Components

| Component | Model | Measures |
|:----------|:------|:---------|
| Microcontroller | ESP32 DevKit v1 | — |
| Environmental sensor | BME280 | Temperature (°C), Humidity (%), Pressure (hPa) |
| Light sensor | BH1750 | Ambient light (lux) |

### Wiring Diagram

```
 ESP32 DevKit v1
 ┌──────────────────┐
 │                  │
 │  GPIO 21 (SDA) ──┼──── BME280 SDA ──── BH1750 SDA
 │  GPIO 22 (SCL) ──┼──── BME280 SCL ──── BH1750 SCL
 │  3.3V ───────────┼──── BME280 VCC ──── BH1750 VCC
 │  GND ────────────┼──── BME280 GND ──── BH1750 GND
 │                  │
 └──────────────────┘
```

> Both sensors share the I2C bus. No pull-up resistors needed — the BME280 breakout board includes them.

---

## 📡 API Overview

Full reference → [docs/api.md](docs/api.md)

### Device Data Ingestion (ESP32)

```bash
curl -X POST http://localhost:8000/api/v1/data \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_DEVICE_API_KEY" \
  -d '{
    "device_id": "station_01",
    "temperature": 23.5,
    "humidity": 45.2,
    "pressure": 1013.25,
    "lux": 350.0
  }'
# → {"status": "ok", "id": 1}
```

### Dashboard Authentication

```bash
# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@eagle-iot.com", "password": "admin123"}'
# → {"access_token": "eyJ...", "token_type": "bearer"}

# Query data
curl http://localhost:8000/api/v1/data?limit=10 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔐 Security

| Layer | Mechanism |
|:------|:----------|
| **Data in transit** | TLS/HTTPS for all ESP32 → backend communication |
| **Device auth** | Unique API key per station (`X-API-Key` header) |
| **User auth** | JWT tokens (HS256) with configurable expiry |
| **Passwords** | bcrypt hashing (never stored in plain text) |
| **Rate limiting** | 100 req/min per device, 30 req/min per dashboard user |
| **Input validation** | Pydantic schemas enforce physical sensor ranges |
| **Secrets** | Environment variables — never committed to git |
| **Container security** | Non-root user in Docker, minimal base images |
| **HTTP headers** | X-Frame-Options, X-Content-Type-Options, Referrer-Policy |

---

## ☁️ Cloud Deployment (GCP)

A one-command deployment script is provided for GCP Cloud Run:

```bash
./infra/cloud-run/deploy.sh YOUR_GCP_PROJECT_ID
```

This will:
1. Enable required GCP APIs
2. Build and push Docker images
3. Deploy backend and frontend to Cloud Run
4. Print the live URLs

> You'll also need to create a Cloud SQL PostgreSQL instance and set the `DATABASE_URL` secret.

See [docs/setup.md](docs/setup.md) for full production deployment instructions.

---

## 🛠️ Development

### Backend (FastAPI)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Configure DATABASE_URL
uvicorn app.main:app --reload --port 8000
```

### Frontend (React)

```bash
cd frontend
npm install
npm run dev  # Proxies /api → localhost:8000
```

### ESP32 Firmware

```bash
cd iot
cp include/secrets.h.example include/secrets.h  # Configure credentials
pio run --target upload
pio device monitor
```

---

## 📊 Database Schema

```sql
-- Registered ESP32 weather stations
CREATE TABLE devices (
    id          UUID PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    api_key     VARCHAR(64) UNIQUE NOT NULL,  -- Auth token
    location    VARCHAR(255),
    is_active   BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ,
    updated_at  TIMESTAMPTZ
);

-- Time-series sensor readings
CREATE TABLE sensor_data (
    id          BIGSERIAL PRIMARY KEY,
    device_id   UUID REFERENCES devices(id),
    temperature REAL NOT NULL,    -- °C  (-40 to 85)
    humidity    REAL NOT NULL,    -- %   (0 to 100)
    pressure    REAL NOT NULL,    -- hPa (300 to 1100)
    lux         REAL NOT NULL,    -- lx  (0 to 65535)
    recorded_at TIMESTAMPTZ,
    received_at TIMESTAMPTZ
);
-- Indexes: (device_id, recorded_at DESC), (recorded_at DESC)

-- Dashboard users
CREATE TABLE users (
    id              UUID PRIMARY KEY,
    email           VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_admin        BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ
);
```

---

## 📄 Environment Variables

| Variable | Where | Default | Description |
|:---------|:------|:--------|:------------|
| `DB_PASSWORD` | Root `.env` | `postgres` | PostgreSQL password |
| `JWT_SECRET_KEY` | Root `.env` | — | HMAC key for JWT signing |
| `DEBUG` | Root `.env` | `false` | Enable debug logging |
| `DATABASE_URL` | Backend | `...@db:5432/weather_station` | Connection string |
| `CORS_ORIGINS` | Backend | `["http://localhost:5173"]` | Allowed CORS origins |
| `RATE_LIMIT_DATA_PER_MIN` | Backend | `100` | ESP32 rate limit |
| `RATE_LIMIT_API_PER_MIN` | Backend | `30` | Dashboard rate limit |

---

## 🗺️ Roadmap

- [ ] WebSocket support for true real-time dashboard updates
- [ ] MQTT bridge service for legacy device compatibility
- [ ] Alert system (email/webhook when thresholds exceeded)
- [ ] Data export (CSV/JSON download)
- [ ] Multi-tenant support with organization management
- [ ] OTA firmware updates via the dashboard
- [ ] Grafana integration for advanced analytics

---

## 📖 Documentation

| Document | Description |
|:---------|:------------|
| [Setup Guide](docs/setup.md) | Installation, configuration, deployment instructions |
| [API Reference](docs/api.md) | All endpoints with request/response examples |

---

<p align="center">
  Built with ❤️ by <strong>Eagle IoT</strong>
</p>
