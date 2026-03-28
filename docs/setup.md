# Setup Guide

## Prerequisites

- **Docker** and **Docker Compose** (v2+)
- **PlatformIO** (for ESP32 firmware)
- **Node.js 20+** (for frontend development)
- **Python 3.12+** (for backend development)

---

## Quick Start (Docker)

The fastest way to run the full stack:

```bash
# 1. Clone the repository
git clone https://github.com/EagleIoT/Connected-Weather-Station.git
cd Connected-Weather-Station

# 2. Create environment file
cp .env.example .env
# Edit .env with your secrets (DB password, JWT key)

# 3. Start all services
docker compose up --build

# 4. Access the dashboard
# Frontend: http://localhost
# Backend API: http://localhost:8000/docs
# Default login: admin@eagle-iot.com / admin123
```

---

## Development Setup

### Backend

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env
cp .env.example .env
# Update DATABASE_URL to point to your local PostgreSQL

# Run the server
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server (proxies /api to localhost:8000)
npm run dev
```

### ESP32 Firmware

```bash
cd iot

# 1. Create your secrets file
cp include/secrets.h.example include/secrets.h
# Edit secrets.h with your WiFi credentials, API URL, and device API key

# 2. Build and upload
pio run --target upload

# 3. Monitor serial output
pio device monitor
```

---

## Registering an ESP32 Device

1. Log into the dashboard as admin
2. Go to **Devices** → **Add Device**
3. Enter a name and optional location
4. Copy the generated **API key** (shown only once!)
5. Paste the API key into your ESP32's `secrets.h`:
   ```cpp
   #define DEVICE_API_KEY "your_generated_key_here"
   ```
6. Flash the firmware — data will appear on the dashboard within 60 seconds

---

## Environment Variables

### Root `.env` (Docker Compose)

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_PASSWORD` | PostgreSQL password | `postgres` |
| `JWT_SECRET_KEY` | JWT signing key | — |
| `DEBUG` | Enable debug logging | `false` |

### Backend `.env`

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `...@db:5432/weather_station` |
| `JWT_SECRET_KEY` | HMAC signing key for JWT tokens | — |
| `JWT_ALGORITHM` | JWT algorithm | `HS256` |
| `JWT_EXPIRE_MINUTES` | Token expiry | `60` |
| `RATE_LIMIT_DATA_PER_MIN` | ESP32 rate limit | `100` |
| `RATE_LIMIT_API_PER_MIN` | Dashboard rate limit | `30` |
| `CORS_ORIGINS` | Allowed origins (JSON array) | `["http://localhost:5173"]` |

---

## Production Deployment (GCP Cloud Run)

```bash
# 1. Build and push backend
cd backend
gcloud builds submit --tag gcr.io/YOUR_PROJECT/weather-backend
gcloud run deploy weather-backend --image gcr.io/YOUR_PROJECT/weather-backend \
  --set-env-vars "DATABASE_URL=..." \
  --allow-unauthenticated

# 2. Build and push frontend
cd ../frontend
gcloud builds submit --tag gcr.io/YOUR_PROJECT/weather-frontend
gcloud run deploy weather-frontend --image gcr.io/YOUR_PROJECT/weather-frontend \
  --allow-unauthenticated

# 3. Set up Cloud SQL for PostgreSQL
gcloud sql instances create weather-db --database-version=POSTGRES_16 \
  --tier=db-f1-micro --region=europe-west1
```
