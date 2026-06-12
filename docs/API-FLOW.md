# 📡 API Flow & Integration Guide

## API Overview

**Base URL**: `https://api.sendry.io/api/v1`

**Authentication Methods**:
1. JWT (for user-facing endpoints)
2. API Keys (for external clients)

---

## Authentication

### User Authentication (JWT)

#### 1. Register

```http
POST /auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "client_admin"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "statusCode": 201,
  "message": "User created successfully",
  "data": {
    "userId": "user_123",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "client_admin",
    "clientId": "client_456"
  }
}
```

**Set-Cookie**: `authToken=eyJhbGciOiJIUzI1NiIs...; HttpOnly; Secure; SameSite=Strict`

---

#### 2. Login

```http
POST /auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "SecurePass123!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User LoggedIn successfully",
  "data": {
    "userId": "user_123",
    "username": "john_doe",
    "role": "client_admin",
    "clientId": "client_456"
  }
}
```

---

#### 3. Get Profile

```http
GET /auth/profile
Cookie: authToken=eyJhbGciOiJIUzI1NiIs...
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "client_admin",
    "clientId": "client_456",
    "permissions": {
      "canCreateApiKeys": true,
      "canManageUsers": true,
      "canViewAnalytics": true,
      "canExportData": false
    }
  }
}
```

---

#### 4. Logout

```http
POST /auth/logout
Cookie: authToken=eyJhbGciOiJIUzI1NiIs...
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### API Key Authentication

#### 1. Create API Key

```http
POST /api-keys
Cookie: authToken=eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "name": "Production API Key",
  "description": "For production environment",
  "environment": "production",
  "permissions": {
    "canIngest": true,
    "canReadAnalytics": false,
    "allowedServices": []
  },
  "security": {
    "allowedIPs": ["203.0.113.0/24"],
    "allowedOrigins": ["https://app.example.com"]
  },
  "expiresAt": "2027-05-18T00:00:00Z"
}
```

**Response** (201 Created):
```json

```

**⚠️ Note**: `keyValue` is only shown once. Store it securely!

---

#### 2. List API Keys

```http
GET /api-keys
Cookie: authToken=eyJhbGciOiJIUzI1NiIs...
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "keys": [
      {
        "keyId": "sk_live_abc123xyz789",
        "name": "Production API Key",
        "environment": "production",
        "isActive": true,
        "lastUsed": "2026-05-18T10:25:00Z",
        "expiresAt": "2027-05-18T00:00:00Z",
        "createdAt": "2026-05-18T10:30:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

---

#### 3. Rotate API Key

```http
POST /api-keys/{keyId}/rotate
Cookie: authToken=eyJhbGciOiJIUzI1NiIs...
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "API key rotated successfully",
  "data": {
    "keyId": "sk_live_newkey123...",
    "keyValue": "sk_live_newkey123...",
    "rotatedAt": "2026-05-18T10:35:00Z"
  }
}
```

---

## Event Ingestion

### Post API Hit

```http
POST /ingest
X-API-Key: sk_live_abc123xyz789
Content-Type: application/json

{
  "serviceName": "user-service",
  "endpoint": "/api/users",
  "method": "GET",
  "statusCode": 200,
  "latencyMs": 45.2,
  "ip": "203.0.113.42",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
}
```

**Response** (202 Accepted):
```json
{
  "success": true,
  "statusCode": 202,
  "message": "API hit queued for processing",
  "data": {
    "eventId": "evt_550e8400e29b41d4a716446655440000",
    "status": "queued",
    "timestamp": "2026-05-18T10:30:45.123Z"
  }
}
```

### Response Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 202 | Accepted | Event queued for processing |
| 400 | Bad Request | Invalid data (missing fields) |
| 401 | Unauthorized | Missing/invalid API key |
| 403 | Forbidden | API key expired or inactive |
| 429 | Too Many Requests | Rate limit exceeded |
| 503 | Service Unavailable | Circuit breaker open |

### Error Response Example

```json
{
  "success": false,
  "statusCode": 429,
  "message": "Too many requests, please try again later",
  "requestId": "req_550e8400e29b41d4a716446655440000"
}
```

---

## Analytics

### Get Overall Statistics

```http
GET /analytics/stats?startTime=2026-05-17T00:00:00Z&endTime=2026-05-18T23:59:59Z
Cookie: authToken=eyJhbGciOiJIUzI1NiIs...
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "totalHits": 1250000,
    "successHits": 1220000,
    "errorHits": 30000,
    "errorRate": 2.4,
    "avgLatency": 48.5,
    "uniqueServices": 15,
    "uniqueEndpoints": 127,
    "timeRange": {
      "start": "2026-05-17T00:00:00Z",
      "end": "2026-05-18T23:59:59Z"
    }
  }
}
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `startTime` | ISO 8601 | Start of time range (default: 24h ago) |
| `endTime` | ISO 8601 | End of time range (default: now) |
| `clientId` | UUID | Filter by client (only super_admin) |

---

### Get Top Endpoints

```http
GET /analytics/top-endpoints?limit=10&startTime=2026-05-17T00:00:00Z
Cookie: authToken=eyJhbGciOiJIUzI1NiIs...
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "endpoints": [
      {
        "serviceName": "user-service",
        "endpoint": "/api/users",
        "method": "GET",
        "totalHits": 450000,
        "avgLatency": 35.2,
        "errorHits": 5000,
        "errorRate": 1.11,
        "p95Latency": 125.3,
        "p99Latency": 250.5
      },
      {
        "serviceName": "order-service",
        "endpoint": "/api/orders",
        "method": "POST",
        "totalHits": 380000,
        "avgLatency": 120.5,
        "errorHits": 12000,
        "errorRate": 3.16,
        "p95Latency": 450.2,
        "p99Latency": 890.1
      }
    ],
    "totalEndpoints": 127,
    "timeRange": {
      "start": "2026-05-17T00:00:00Z",
      "end": "2026-05-18T10:30:00Z"
    }
  }
}
```

---

### Get Error Trends

```http
GET /analytics/error-trends?interval=1h&startTime=2026-05-17T00:00:00Z
Cookie: authToken=eyJhbGciOiJIUzI1NiIs...
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "trends": [
      {
        "timestamp": "2026-05-17T00:00:00Z",
        "errorRate": 2.1,
        "errorCount": 25000,
        "totalHits": 1200000,
        "topErrors": [
          {
            "statusCode": 500,
            "count": 15000,
            "percentage": 60
          },
          {
            "statusCode": 503,
            "count": 8000,
            "percentage": 32
          },
          {
            "statusCode": 429,
            "count": 2000,
            "percentage": 8
          }
        ]
      }
    ]
  }
}
```

---

### Get Latency Percentiles

```http
GET /analytics/latency-percentiles?interval=1h
Cookie: authToken=eyJhbGciOiJIUzI1NiIs...
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "distribution": [
      {
        "timestamp": "2026-05-18T10:00:00Z",
        "p50": 32.5,
        "p75": 65.3,
        "p95": 125.8,
        "p99": 250.2,
        "min": 5.1,
        "max": 2450.5,
        "avg": 48.5
      }
    ]
  }
}
```

---

## Payment Integration

### Create Payment Order

```http
POST /payment/create-order
Cookie: authToken=eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "plan": "pro"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": "order_123abc456def",
    "amount": 99900,
    "currency": "INR",
    "plan": "pro",
    "clientId": "client_456",
    "createdAt": "2026-05-18T10:30:00Z"
  }
}
```

### Verify Payment

```http
POST /payment/verify
Cookie: authToken=eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "plan": "pro",
  "razorpay_order_id": "order_123abc456def",
  "razorpay_payment_id": "pay_abc123xyz789",
  "razorpay_signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "status": "success",
    "plan": "pro",
    "validUntil": "2027-05-18T00:00:00Z",
    "clientId": "client_456",
    "verifiedAt": "2026-05-18T10:35:00Z"
  }
}
```

---

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "message": "Invalid API key",
  "statusCode": 403,
  "errors": [
    {
      "field": "x-api-key",
      "message": "API key not found or expired"
    }
  ],
  "requestId": "req_550e8400e29b41d4a716446655440000"
}
```

### Common HTTP Status Codes

| Code | Scenario |
|------|----------|
| 200 | Successful GET/PUT/PATCH |
| 201 | Successful POST (resource created) |
| 202 | Accepted for async processing |
| 400 | Validation error or bad request |
| 401 | Missing/invalid authentication |
| 403 | Valid auth but insufficient permissions |
| 404 | Resource not found |
| 429 | Rate limit exceeded |
| 500 | Server error |
| 503 | Service unavailable (circuit breaker open) |

---

## Rate Limiting

### Rate Limit Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 857
X-RateLimit-Reset: 1683871145
```

### Rate Limit Rules

```
Ingest Endpoint:
- 1,000 requests per 15 minutes per IP
- Per API key limits (configurable in settings)

Analytics Endpoint:
- 100 requests per minute per user
```

### Handling Rate Limits

```javascript
// Client-side handling
if (response.status === 429) {
  const retryAfter = response.headers['X-RateLimit-Reset'];
  const now = Math.floor(Date.now() / 1000);
  const waitTime = retryAfter - now;
  
  setTimeout(() => {
    // Retry request
  }, waitTime * 1000);
}
```

---

## Pagination

### Request

```http
GET /analytics/events?page=2&limit=50
```

### Response

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 2,
      "limit": 50,
      "total": 5000,
      "totalPages": 100,
      "hasNext": true,
      "hasPrev": true
    }
  }
}
```

---

## Webhooks (Future)

### Event Types

```
- hit.ingested
- client.created
- apikey.rotated
- payment.successful
- alert.triggered
```

### Webhook Request

```http
POST https://your-webhook-endpoint.com/
X-Sendry-Signature: sha256=abc123...
Content-Type: application/json

{
  "event": "hit.ingested",
  "timestamp": "2026-05-18T10:30:45.123Z",
  "data": {
    "eventId": "evt_...",
    "serviceName": "user-service",
    "endpoint": "/api/users",
    "statusCode": 200,
    "latencyMs": 45.2
  }
}
```

---

## Integration Examples

### cURL

```bash
# Create API key
curl -X POST https://api.sendry.io/api/v1/api-keys \
  -H "Cookie: authToken=eyJhbGci..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My API Key",
    "environment": "production",
    "permissions": {"canIngest": true}
  }'

# Send API hit
curl -X POST https://api.sendry.io/api/v1/ingest \
  -H "X-API-Key: sk_live_abc123..." \
  -H "Content-Type: application/json" \
  -d '{
    "serviceName": "user-service",
    "endpoint": "/api/users",
    "method": "GET",
    "statusCode": 200,
    "latencyMs": 45.2
  }'
```

### JavaScript/Node.js

```javascript
const axios = require('axios');

// Send API hit
const hitData = {
  serviceName: 'user-service',
  endpoint: '/api/users',
  method: 'GET',
  statusCode: 200,
  latencyMs: 45.2
};

try {
  const response = await axios.post(
    'https://api.sendry.io/api/v1/ingest',
    hitData,
    {
      headers: {
        'X-API-Key': 'sk_live_abc123...',
        'Content-Type': 'application/json'
      }
    }
  );
  
  console.log('Event queued:', response.data.data.eventId);
} catch (error) {
  console.error('Error:', error.response.data);
}
```

### Python

```python
import requests

api_key = 'sk_live_abc123...'
headers = {
    'X-API-Key': api_key,
    'Content-Type': 'application/json'
}

hit_data = {
    'serviceName': 'user-service',
    'endpoint': '/api/users',
    'method': 'GET',
    'statusCode': 200,
    'latencyMs': 45.2
}

response = requests.post(
    'https://api.sendry.io/api/v1/ingest',
    json=hit_data,
    headers=headers
)

print(response.json())
```

---

## SDK Libraries (Planned)

- JavaScript/TypeScript
- Python
- Go
- Java
- PHP
- Ruby

---

## Testing Your Integration

### 1. Test API Key

```http
GET /health
X-API-Key: sk_live_abc123...
```

### 2. Send Test Event

```http
POST /ingest
X-API-Key: sk_live_abc123...

{
  "serviceName": "test",
  "endpoint": "/test",
  "method": "GET",
  "statusCode": 200,
  "latencyMs": 10
}
```

### 3. Verify in Dashboard

Check dashboard → Analytics → Recent Events

---

## References

- REST API Best Practices: https://restfulapi.net/
- Semantic Versioning: https://semver.org/
- HTTP Status Codes: https://httpwg.org/specs/rfc7231.html#status.codes
