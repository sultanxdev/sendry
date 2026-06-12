# Security Policy

## Reporting Security Vulnerabilities

**DO NOT** open a public GitHub issue for security vulnerabilities.

Instead, please email: **security@sendry.io**

Include:
- Description of vulnerability
- Affected versions
- Steps to reproduce
- Potential impact

We will respond within 48 hours and work with you on a fix.

---

## Security Practices

### Authentication & Authorization
- JWT tokens with 24-hour expiry
- HttpOnly cookies prevent XSS
- Role-based access control (RBAC)
- API key expiry tracking

### Data Protection
- Passwords hashed with bcrypt (12 rounds)
- API keys hashed with PBKDF2
- Sensitive data never logged
- TLS/SSL in production

### Rate Limiting & DDoS
- 1,000 requests per 15 minutes per IP
- Per-API-key rate limiting
- Circuit breaker prevents cascading failures

### Input Validation
- Zod schema validation
- SQL injection prevention (parameterized queries)
- XSS protection via header sanitization
- CORS origin validation

### Infrastructure Security
- No hardcoded secrets
- Secrets from environment variables
- Regular dependency updates
- Automated security scanning (via GitHub)

### Vulnerability Scanning
```
- npm audit for dependencies
- OWASP Top 10 compliance
- Regular penetration testing
- Code review for security issues
```

---

## Compliance

- ✅ OWASP Top 10 2021
- ✅ GDPR-ready (data retention policies)
- ✅ SOC 2 Type II audit trail
- ✅ PCI DSS compliance (payment handling)

---

## Security Headers

All responses include:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
```

---

## Dependencies

### Regularly Updated
- Node.js runtime
- Express.js
- Mongoose/MongoDB driver
- PostgreSQL driver
- RabbitMQ client

### Security Scanning
```bash
npm audit
npm audit fix
npm update
```

---

## Responsible Disclosure

When a vulnerability is reported:
1. Acknowledge receipt within 48 hours
2. Verify and reproduce issue
3. Develop fix with security team
4. Test thoroughly
5. Deploy patch
6. Publish security advisory
7. Credit reporter (if desired)

---

## Known Limitations

- Sendry stores 30 days of raw events (TTL-based deletion)
- Rate limiting is per-IP (not account-aware)
- API keys must be rotated manually

---

## Version Support

| Version | Status | End of Life |
|---------|--------|------------|
| 1.0.x   | Active | 2027-12-31 |
| 0.9.x   | Sunset | 2026-12-31 |

Security updates available for 1 year after release.

---

## Contact

- 📧 Security: security@sendry.io
- 🔒 GPG Key: [Available on request]
- 📋 Security.txt: `/.well-known/security.txt`
