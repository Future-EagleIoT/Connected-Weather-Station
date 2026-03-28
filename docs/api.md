# API Reference

Base URL: `http://localhost:8000` (dev) or `https://your-domain.run.app` (prod)

Interactive docs: `GET /docs` (Swagger UI) | `GET /redoc` (ReDoc)

---

## Authentication

### Dashboard Users (JWT)

All dashboard endpoints require a `Bearer` token in the `Authorization` header.

```
Authorization: Bearer <jwt_token>
```

### ESP32 Devices (API Key)

The data ingestion endpoint uses API key authentication via the `X-API-Key` header.

```
X-API-Key: <device_api_key>
```

---

## Endpoints

### Health Check

```
GET /health
```

Returns service status. No auth required.

**Response:**
```json
{ "status": "healthy", "service": "Connected Weather Station API" }
```

---

### Auth

#### Login

```
POST /api/v1/auth/login
```

**Body:**
```json
{
  "email": "admin@eagle-iot.com",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

#### Get Current User

```
GET /api/v1/auth/me
```

**Auth:** JWT Bearer

**Response (200):**
```json
{
  "email": "admin@eagle-iot.com",
  "is_admin": true
}
```

#### Register User (Admin Only)

```
POST /api/v1/auth/register
```

**Auth:** JWT Bearer (admin)

**Body:**
```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

---

### Sensor Data

#### Ingest Data (ESP32)

```
POST /api/v1/data
```

**Auth:** `X-API-Key` header

**Body:**
```json
{
  "device_id": "station_01",
  "temperature": 23.5,
  "humidity": 45.2,
  "pressure": 1013.25,
  "lux": 350.0,
  "timestamp": 3600
}
```

**Validation:**
| Field | Type | Range |
|-------|------|-------|
| `temperature` | float | -40 to 85 °C |
| `humidity` | float | 0 to 100 % |
| `pressure` | float | 300 to 1100 hPa |
| `lux` | float | 0 to 65535 lx |

**Response (201):**
```json
{ "status": "ok", "id": 42 }
```

**Rate Limit:** 100 requests/minute per device.

#### Get Historical Data

```
GET /api/v1/data?device_id=<uuid>&start=<iso>&end=<iso>&limit=100&offset=0
```

**Auth:** JWT Bearer

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `device_id` | UUID | No | Filter by device |
| `start` | ISO 8601 | No | Start of time range |
| `end` | ISO 8601 | No | End of time range |
| `limit` | int | No | Max results (1-1000, default 100) |
| `offset` | int | No | Pagination offset |

**Response (200):** Array of sensor readings (newest first).

#### Get Latest Readings

```
GET /api/v1/data/latest
```

**Auth:** JWT Bearer

Returns the most recent reading from each active device.

---

### Devices

#### List Devices

```
GET /api/v1/devices
```

**Auth:** JWT Bearer

**Response (200):** Array of device objects.

#### Create Device (Admin Only)

```
POST /api/v1/devices
```

**Auth:** JWT Bearer (admin)

**Body:**
```json
{
  "name": "Station Alpha",
  "location": "Rooftop, Building A"
}
```

**Response (201):** Device object including the generated `api_key`.

> ⚠️ The API key is only returned on creation. Save it immediately.

#### Deactivate Device (Admin Only)

```
PATCH /api/v1/devices/{device_id}/deactivate
```

**Auth:** JWT Bearer (admin)

---

## Error Responses

| Status | Meaning |
|--------|---------|
| `401` | Invalid/expired token or API key |
| `403` | Insufficient permissions (not admin) |
| `409` | Conflict (duplicate email) |
| `422` | Validation error (invalid data) |
| `429` | Rate limit exceeded |
