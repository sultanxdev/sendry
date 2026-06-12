# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com),
and this project adheres to [Semantic Versioning](https://semver.org).

---

## [Unreleased]

### Added
- Documentation for FAANG/YC-ready project structure
- Architecture decision records

### Changed
- TBD

### Fixed
- TBD

---

## [1.0.0] - 2026-05-18

### Added
- ✅ Event ingestion API with rate limiting
- ✅ Real-time analytics service
- ✅ User authentication with JWT
- ✅ API key management
- ✅ Role-based access control
- ✅ MongoDB for raw events storage
- ✅ PostgreSQL for aggregated metrics
- ✅ RabbitMQ for reliable event queuing
- ✅ Circuit breaker pattern for resilience
- ✅ Retry logic with exponential backoff
- ✅ Dead-letter queue for failed events
- ✅ Redis caching layer
- ✅ Comprehensive API documentation
- ✅ Docker Compose for local development
- ✅ Structured logging with Winston

### Features

#### Ingest Service
- POST /api/v1/ingest endpoint
- API key validation
- Rate limiting (1000 req/15min)
- Circuit breaker protection

#### Analytics Service
- GET /api/v1/analytics/stats
- GET /api/v1/analytics/top-endpoints
- GET /api/v1/analytics/error-trends
- GET /api/v1/analytics/latency-percentiles
- Time range filtering

#### Auth Service
- User registration and login
- Super admin onboarding
- Role-based access control
- JWT token generation

#### Payment Service
- Razorpay order creation
- Payment verification
- Plan management

#### Processor Service
- Event consumption and aggregation
- Metrics aggregation
- MongoDB storage
- PostgreSQL upserts

---

## Coming Soon

### Phase 2
- [ ] Next.js 16 frontend
- [ ] Landing page
- [ ] Admin dashboard
- [ ] Payment gateway UI
- [ ] API key management UI
- [ ] Integration documentation

### Phase 3
- [ ] Docker + GitHub Actions CI/CD
- [ ] AWS deployment guide
- [ ] Kubernetes manifests
- [ ] Monitoring dashboards

### Future
- [ ] Webhooks
- [ ] Custom alerts
- [ ] Data export
- [ ] Real-time WebSocket updates
- [ ] Advanced anomaly detection
- [ ] Multi-region deployment
- [ ] Enterprise SSO

---

## Version History

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | 2026-05-18 | Initial release |
| 0.9.0 | 2026-05-01 | Beta release |
| 0.1.0 | 2026-04-01 | Alpha release |

---

## Support

- For bugs: [Create an issue](https://github.com/sultanxdev/sendry/issues)
- For features: [Discuss on GitHub](https://github.com/sultanxdev/sendry/discussions)
- Questions: hello@sendry.io
