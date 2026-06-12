# 🚀 Sendry - Real-Time API Monitoring SaaS

**Production-grade API monitoring and analytics platform for teams building at scale.**

Build with Sendry and get real-time insights into your API performance, reliability, and errors.

[![GitHub](https://img.shields.io/badge/github-sendry-black)](https://github.com/sultanxdev/sendry)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org)

---

## 🎯 What is Sendry?

Sendry is a **real-time API monitoring SaaS** that helps teams:

✅ **Monitor API Performance** - Track latency, throughput, error rates in real-time
✅ **Detect Issues Early** - Get alerts before users are impacted
✅ **Understand Patterns** - Drill down into trends and anomalies
✅ **Scale Confidently** - Built for millions of events per second

### Used by
- 🏢 FAANG-scale teams
- 🚀 YC startups
- 🌍 Enterprise companies

---

## 🏗️ Architecture

```
External APIs
    ↓
Ingest Service (Rate Limited)
    ↓
RabbitMQ (Reliable Queue)
    ↓
Processor Service (Aggregation)
    ↓
MongoDB (Raw Data) + PostgreSQL (Metrics)
    ↓
Analytics Service (Queries)
    ↓
Dashboard + API
```

**Key Features**:
- ⚡ Event-driven architecture for decoupled services
- 🔄 Circuit breaker pattern for resilience
- 📦 Dead-letter queues for failed events
- 🔐 Multi-tenant with complete data isolation
- 🚀 Horizontal scaling for each service
- 📊 Real-time aggregation pipeline

**See detailed architecture**: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Databases**: MongoDB + PostgreSQL
- **Message Queue**: RabbitMQ
- **Cache**: Redis
- **Authentication**: JWT + API Keys
- **Validation**: Zod

### Frontend (Coming)
- **Framework**: Next.js 16
- **Styling**: Tailwind CSS
- **Language**: TypeScript/JavaScript
- **Payment**: Razorpay

### DevOps
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Deployment**: DigitalOcean/AWS/Vercel

---

## 📋 Features

### Core
- ✅ API hit ingestion with automatic retry + circuit breaker
- ✅ Real-time analytics and dashboards
- ✅ Role-based access control (3 levels)
- ✅ API key management with security controls
- ✅ Subscription-based pricing (Razorpay)

### Analytics
- ✅ Top endpoints by traffic
- ✅ Error rate trends
- ✅ Latency percentiles (p50, p95, p99)
- ✅ Service-level breakdowns
- ✅ Time-range filtering

### Operations
- ✅ Structured logging
- ✅ Request tracing (request IDs)
- ✅ Circuit breaker monitoring
- ✅ Queue depth tracking
- ✅ Database metrics

### Security
- ✅ JWT authentication
- ✅ API key authentication with expiry
- ✅ IP whitelist + CORS origin restrictions
- ✅ Rate limiting (per IP, per API key)
- ✅ Bcrypt password hashing
- ✅ Request validation with Zod

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Git

### Development Setup

```bash
# Clone repository
git clone https://github.com/sultanxdev/sendry.git
cd sendry

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local

# Start services
docker-compose up -d

# Run migrations
npm run migrate

# Start dev server
npm run dev
```

**Access**:
- Backend: http://localhost:5000
- API Docs: http://localhost:5000/api/docs
- Frontend: http://localhost:3000 (coming soon)

### First Steps

```bash
# 1. Create super admin
curl -X POST http://localhost:5000/api/v1/auth/onboard-super-admin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "SecurePass123!"
  }'

# 2. Create API key (see docs/API-FLOW.md)
# 3. Send test event
# 4. View in dashboard
```

---

## 📚 Documentation

### Getting Started
- [Installation & Setup](docs/SETUP.md)
- [Quick Start Guide](docs/QUICKSTART.md)
- [API Integration Guide](docs/API-FLOW.md)

### Architecture
- [System Architecture](docs/ARCHITECTURE.md)
- [Database Schema](docs/DB-SCHEMA.md)
- [API Specification](docs/API-FLOW.md)
- [Scaling Strategy](docs/SCALING-PLAN.md)

### Development
- [Contributing Guide](CONTRIBUTING.md)
- [Architecture Decision Records](docs/DECISIONS.md)
- [Testing Guide](docs/TESTING.md)

### Operations
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Monitoring & Alerts](docs/MONITORING.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

---

## 🔌 API Examples

### Send API Hit

```javascript
const apiKey = 'sk_live_abc123...';

const response = await fetch('https://api.sendry.io/api/v1/ingest', {
  method: 'POST',
  headers: {
    'X-API-Key': apiKey,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    serviceName: 'user-service',
    endpoint: '/api/users',
    method: 'GET',
    statusCode: 200,
    latencyMs: 45.2
  })
});

const data = await response.json();
console.log('Event queued:', data.data.eventId);
```

### Get Analytics

```javascript
const token = 'your_jwt_token';

const response = await fetch(
  'https://api.sendry.io/api/v1/analytics/stats?startTime=2026-05-17T00:00:00Z',
  {
    headers: {
      'Cookie': `authToken=${token}`
    }
  }
);

const stats = await response.json();
console.log('Total hits:', stats.data.totalHits);
console.log('Error rate:', stats.data.errorRate + '%');
```

**Full API docs**: [`docs/API-FLOW.md`](docs/API-FLOW.md)

---

## 🏗️ Project Structure

```
sendry/
├── server/
│   ├── services/
│   │   ├── auth/              # User authentication
│   │   ├── ingest/            # Event ingestion
│   │   ├── analytics/         # Data queries
│   │   ├── processor/         # Event processing
│   │   ├── payment/           # Razorpay integration
│   │   └── client/            # Client management
│   │
│   ├── shared/
│   │   ├── config/            # App configuration
│   │   ├── middlewares/       # Express middlewares
│   │   ├── models/            # MongoDB schemas
│   │   ├── utils/             # Helper functions
│   │   └── events/            # Event system
│   │
│   └── server.js              # Entry point
│
├── client/                    # Next.js frontend (coming)
│
├── docs/
│   ├── ARCHITECTURE.md        # System design
│   ├── DB-SCHEMA.md           # Database design
│   ├── API-FLOW.md            # API documentation
│   ├── SCALING-PLAN.md        # Scaling strategy
│   └── ...
│
├── tests/                     # Test suite
├── docker-compose.yml         # Local dev environment
├── Dockerfile                 # Production image
└── package.json
```

---

## 📊 Performance Benchmarks

**Event Ingestion** (target: 10K events/sec)
```
Latency: p50 < 50ms, p95 < 200ms, p99 < 500ms
Throughput: 10,000 events/second
Circuit breaker: Open after 5 failures
```

**Analytics Queries** (target: sub-second)
```
Top endpoints: < 100ms (with Redis cache)
Error trends: < 500ms
Latency percentiles: < 200ms
```

**Data Storage**
```
Raw events: 1.7GB per day (30-day retention)
Aggregated metrics: ~500MB
Compression: 90% reduction with gzip
```

---

## 🔒 Security

- ✅ **Authentication**: JWT with httpOnly cookies
- ✅ **Authorization**: Role-based access control
- ✅ **API Keys**: Secure, expiring, IP-whitelisted
- ✅ **Validation**: Zod schema validation
- ✅ **Rate Limiting**: 1000 req/15min per IP
- ✅ **Encryption**: Bcrypt for passwords, TLS in transit
- ✅ **Headers**: Helmet.js for security headers

**Security audit**: [SECURITY.md](SECURITY.md)

---

## 📈 Scaling

Sendry is designed to scale horizontally:

**Phase 1** (Current):
- 1,000 events/sec
- Single region
- $650/month

**Phase 2** (Growth):
- 10,000 events/sec
- Multi-node databases
- $2,600/month

**Phase 3** (Scale):
- 100,000 events/sec
- Multi-region active-active
- $15,000+/month

See [`docs/SCALING-PLAN.md`](docs/SCALING-PLAN.md) for details.

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

**Coverage targets**:
- Services: 80%+
- Controllers: 60%+
- Utils: 90%+

---

## 📦 Deployment

### Docker Compose (Development)

```bash
docker-compose up -d
```

### Production Deployment

```bash
# Build image
docker build -t sendry:latest .

# Push to registry
docker push sendry:latest

# Deploy with Kubernetes / Docker Swarm / etc
kubectl apply -f k8s/
```

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for full guide.

---

## 🤝 Contributing

We welcome contributions! See [`CONTRIBUTING.md`](CONTRIBUTING.md) for:

- Development setup
- Commit guidelines
- Pull request process
- Code style
- Testing requirements

### Good Issues for Newcomers

- 🐛 [Issues labeled "good first issue"](https://github.com/sultanxdev/sendry/issues?q=label:"good+first+issue")
- 📚 [Documentation improvements](https://github.com/sultanxdev/sendry/issues?q=label:"documentation")

---

## 📝 Roadmap

### Q2 2026
- ✅ Core API + Analytics
- ⏳ Next.js frontend
- ⏳ Razorpay integration
- ⏳ Docker + CI/CD

### Q3 2026
- ⏳ Webhooks
- ⏳ Custom alerts
- ⏳ Data export
- ⏳ API keys dashboard

### Q4 2026
- ⏳ Real-time WebSocket updates
- ⏳ Advanced anomaly detection
- ⏳ Multi-region deployment
- ⏳ Enterprise SSO

---

## 📞 Support

- 📧 **Email**: hello@sendry.io
- 💬 **Discord**: [Join Community](https://discord.gg/sendry)
- 🐛 **Issues**: [GitHub Issues](https://github.com/sultanxdev/sendry/issues)
- 📚 **Docs**: [https://docs.sendry.io](https://docs.sendry.io)

---

## 📄 License

MIT License - see [`LICENSE`](LICENSE) for details

---

## 🙏 Acknowledgments

Built by engineers who understand the pain of API monitoring at scale.

Inspired by:
- Datadog APM
- New Relic
- Segment
- AWS X-Ray

---

## ⭐ Show Your Support

If Sendry helps you, please:
- ⭐ Star this repository
- 🐦 Share on Twitter
- 💬 Join our community
- 🔗 Refer a friend

---

**Made with ❤️ by the Sendry Team**
