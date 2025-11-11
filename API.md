# API Documentation

## Base URL

```
http://localhost:3001/api
```

## Authentication

Currently no authentication required. Future versions will implement JWT tokens.

## Response Format

All responses follow this format:

```typescript
{
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}
```

## Endpoints

### Health Check

**GET** `/health`

Check if the API is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-11T12:00:00Z"
}
```

---

### Get All Incidents

**GET** `/api/incidents`

Retrieve all incidents with optional filtering.

**Query Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `types` | string | Comma-separated incident types | `road_closure,flood` |
| `severity` | string | Comma-separated severity levels (1-5) | `3,4,5` |
| `status` | string | Comma-separated statuses | `active,monitoring` |
| `startDate` | string | ISO date string | `2025-11-01T00:00:00Z` |
| `endDate` | string | ISO date string | `2025-11-11T23:59:59Z` |

**Example Request:**
```bash
curl "http://localhost:3001/api/incidents?types=road_closure,flood&severity=3,4,5"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "nt-123",
      "type": "road_closure",
      "severity": 4,
      "status": "active",
      "location": {
        "latitude": -12.4634,
        "longitude": 130.8456
      },
      "title": "Stuart Highway Closure",
      "description": "Road closed due to flooding",
      "reportedAt": "2025-11-11T08:00:00Z",
      "updatedAt": "2025-11-11T10:00:00Z",
      "source": "api",
      "metadata": {}
    }
  ],
  "timestamp": "2025-11-11T12:00:00Z"
}
```

---

### Get Incident by ID

**GET** `/api/incidents/:id`

Get a specific incident by its ID.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Incident ID |

**Example Request:**
```bash
curl "http://localhost:3001/api/incidents/nt-123"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "nt-123",
    "type": "road_closure",
    "severity": 4,
    "status": "active",
    "location": {
      "latitude": -12.4634,
      "longitude": 130.8456
    },
    "title": "Stuart Highway Closure",
    "description": "Road closed due to flooding",
    "reportedAt": "2025-11-11T08:00:00Z",
    "updatedAt": "2025-11-11T10:00:00Z",
    "source": "api"
  },
  "timestamp": "2025-11-11T12:00:00Z"
}
```

---

### Calculate Safe Route

**POST** `/api/routes/safe`

Calculate the safest route between two points.

**Request Body:**
```json
{
  "origin": {
    "latitude": -12.4634,
    "longitude": 130.8456
  },
  "destination": {
    "latitude": -12.8010,
    "longitude": 131.1318
  },
  "waypoints": []
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:3001/api/routes/safe" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": {"latitude": -12.4634, "longitude": 130.8456},
    "destination": {"latitude": -12.8010, "longitude": 131.1318}
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "origin": {
      "latitude": -12.4634,
      "longitude": 130.8456
    },
    "destination": {
      "latitude": -12.8010,
      "longitude": 131.1318
    },
    "waypoints": [],
    "distance": 75432,
    "safetyScore": 85,
    "safetyDetails": {
      "overall": 85,
      "factors": {
        "incidentDensity": 90,
        "severityWeight": 85,
        "routeLength": 88,
        "weatherConditions": 85
      },
      "recommendation": "safe"
    },
    "incidents": [],
    "recommendation": "safe"
  },
  "timestamp": "2025-11-11T12:00:00Z"
}
```

---

### Submit User Report

**POST** `/api/reports`

Submit a new incident report from a user.

**Request Body:**
```json
{
  "type": "accident",
  "location": {
    "latitude": -12.4634,
    "longitude": 130.8456
  },
  "description": "Vehicle accident blocking left lane",
  "photos": [],
  "userId": "user-123"
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:3001/api/reports" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "accident",
    "location": {"latitude": -12.4634, "longitude": 130.8456},
    "description": "Vehicle accident blocking left lane"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-1699876543210-abc123",
    "type": "accident",
    "location": {
      "latitude": -12.4634,
      "longitude": 130.8456
    },
    "description": "Vehicle accident blocking left lane",
    "reportedAt": "2025-11-11T12:00:00Z",
    "verified": false
  },
  "timestamp": "2025-11-11T12:00:00Z"
}
```

---

### Get All User Reports

**GET** `/api/reports`

Retrieve all user-submitted reports.

**Example Request:**
```bash
curl "http://localhost:3001/api/reports"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user-1699876543210-abc123",
      "type": "accident",
      "location": {
        "latitude": -12.4634,
        "longitude": 130.8456
      },
      "description": "Vehicle accident blocking left lane",
      "reportedAt": "2025-11-11T12:00:00Z",
      "verified": false
    }
  ],
  "timestamp": "2025-11-11T12:00:00Z"
}
```

---

### Verify Report (Authority Only)

**POST** `/api/reports/:id/verify`

Verify a user-submitted report (for authorities).

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Report ID |

**Request Body:**
```json
{
  "verifiedBy": "NT Police"
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:3001/api/reports/user-1699876543210-abc123/verify" \
  -H "Content-Type: application/json" \
  -d '{"verifiedBy": "NT Police"}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-1699876543210-abc123",
    "verified": true,
    "verifiedBy": "NT Police",
    "verifiedAt": "2025-11-11T12:30:00Z"
  },
  "timestamp": "2025-11-11T12:30:00Z"
}
```

---

### Get Statistics

**GET** `/api/stats`

Get statistics about incidents.

**Example Request:**
```bash
curl "http://localhost:3001/api/stats"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 45,
    "byType": {
      "road_closure": 12,
      "flood": 8,
      "accident": 15,
      "bushfire": 3,
      "construction": 5,
      "hazard": 2
    },
    "bySeverity": {
      "1": 5,
      "2": 18,
      "3": 15,
      "4": 5,
      "5": 2
    },
    "byStatus": {
      "active": 35,
      "monitoring": 8,
      "resolved": 2
    },
    "totalUserReports": 12,
    "verifiedReports": 8
  },
  "timestamp": "2025-11-11T12:00:00Z"
}
```

---

### Refresh Incidents

**POST** `/api/incidents/refresh`

Manually trigger a refresh of incident data from external sources.

**Example Request:**
```bash
curl -X POST "http://localhost:3001/api/incidents/refresh"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 45
  },
  "timestamp": "2025-11-11T12:00:00Z"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong",
  "timestamp": "2025-11-11T12:00:00Z"
}
```

**Common HTTP Status Codes:**
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

---

## Rate Limiting

- **Window**: 15 minutes
- **Max Requests**: 100 per window
- **Per**: IP address

When rate limit is exceeded:
```json
{
  "success": false,
  "error": "Too many requests from this IP, please try again later.",
  "timestamp": "2025-11-11T12:00:00Z"
}
```

---

## Data Types

### IncidentType
```
road_closure | flood | accident | bushfire | construction | hazard | weather | traffic | other
```

### SeverityLevel
```
1 (Low) | 2 (Moderate) | 3 (High) | 4 (Critical) | 5 (Extreme)
```

### IncidentStatus
```
active | monitoring | resolved | unverified
```

### SafetyRecommendation
```
safe | caution | avoid
```
