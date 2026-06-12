# 🤝 Contributing Guide

## How to Contribute

We appreciate your interest in contributing to Sendry! This document outlines our development process, coding standards, and submission guidelines.

---

## Development Setup

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Git
- PostgreSQL 14+
- MongoDB 5+
- RabbitMQ 3.12+

### Local Development Environment

```bash
# Clone repository
git clone https://github.com/sultanxdev/sendry.git
cd sendry

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local

# Start services with Docker Compose
docker-compose -f docker-compose.yml up -d

# Run migrations
npm run migrate

# Start development server
npm run dev
```

### Environment Variables

Create `.env.local`:

```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB
MONGO_URI=mongodb://localhost:27017/sendry_dev
MONGO_DB_NAME=sendry_dev

# PostgreSQL
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=sendry_dev
PG_USER=sendry
PG_PASSWORD=sendry_password

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@localhost:5672

# JWT
JWT_SECRET=dev_secret_key_change_in_production
JWT_EXPIRES_IN=24h

# Razorpay (for testing)
RAZORPAY_KEY_ID=test_key_123
RAZORPAY_KEY_SECRET=test_secret_456

# Redis
REDIS_URL=redis://localhost:6379
```

---

## Git Workflow

### Branch Naming Convention

```
feature/*     → New features
bugfix/*      → Bug fixes
refactor/*    → Code refactoring
hotfix/*      → Production hotfixes
docs/*        → Documentation only
tests/*       → Test improvements
chore/*       → Dependencies, configs
```

### Example Branches

```
feature/add-webhooks
bugfix/fix-race-condition
refactor/extract-service-layer
hotfix/critical-security-patch
docs/api-documentation
```

### Creating a Branch

```bash
# Update main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name

# Or if working on an issue
git checkout -b feature/issue-123-your-feature
```

---

## Commit Guidelines

### Commit Message Format

```
<type>: <subject>

<body>

<footer>
```

### Type

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Test additions/changes
- `chore`: Dependencies, config changes

### Subject

- Imperative mood ("add" not "added" or "adds")
- Don't capitalize first letter
- No period at end
- Max 50 characters

### Body

- Explain what and why, not how
- Wrap at 72 characters
- Separate from subject with blank line

### Footer

```
Fixes #123
Relates to #456
Breaking Change: describe...
```

### Good Commit Examples

```
feat: add circuit breaker to event producer

Implement circuit breaker pattern to prevent cascading
failures when RabbitMQ is unavailable. Transitions between
CLOSED, OPEN, and HALF_OPEN states based on failure
threshold and cooldown period.

Fixes #123
```

```
fix: prevent duplicate event processing

Add idempotency key tracking to processor service.
Events with duplicate eventId are now skipped instead
of being re-processed, ensuring exactly-once semantics.

Relates to #456
```

---

## Code Style

### JavaScript/Node.js

We use ESLint + Prettier for code formatting.

```bash
# Format code
npm run format

# Lint
npm run lint

# Lint and fix
npm run lint:fix
```

### Naming Conventions

```javascript
// Constants
const MAX_RETRIES = 3;
const CIRCUIT_BREAKER_THRESHOLD = 5;

// Classes
class EventProducer {
  // ...
}

// Functions
function calculateErrorRate(errors, total) {
  // ...
}
const getRateLimitKey = (ip) => {};

// Variables
let attemptCount = 0;
const isRetryable = false;
```

### File Organization

```
service/
├── controller/
│   └── myController.js      // HTTP handlers
├── service/
│   └── myService.js         // Business logic
├── repository/
│   └── myRepository.js      // Data access
├── Dependencies/
│   └── dependencies.js      // DI container
└── routes/
    └── myRoutes.js          // Express routes
```

### Error Handling

```javascript
// ❌ Don't
try {
  // ...
} catch (err) {
  console.log(err); // Bad
}

// ✅ Do
try {
  // ...
} catch (error) {
  logger.error('Operation failed', {
    message: error.message,
    stack: error.stack,
    context: { userId, orderId }
  });
  throw new AppError('Failed to process', 500);
}
```

### Async/Await

```javascript
// ✅ Use async/await
async function fetchUser(id) {
  const user = await User.findById(id);
  return user;
}

// ❌ Avoid callback hell
function fetchUser(id, callback) {
  User.findById(id, (err, user) => {
    callback(err, user);
  });
}
```

---

## Testing

### Test Structure

```
tests/
├── unit/
│   ├── services/
│   ├── repositories/
│   └── utils/
├── integration/
│   ├── api/
│   └── services/
└── e2e/
    └── flows/
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- services/auth.test.js

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Writing Tests

```javascript
describe('EventProducer', () => {
  let producer;
  let mockChannel;

  beforeEach(() => {
    mockChannel = {
      sendToQueue: jest.fn(),
    };
    producer = new EventProducer({ channelManager: mockChannel });
  });

  describe('publishApiHit', () => {
    it('should publish event when circuit breaker is closed', async () => {
      const event = { eventId: '123', endpoint: '/api' };

      const result = await producer.publishApiHit(event);

      expect(result).toBe(true);
      expect(mockChannel.sendToQueue).toHaveBeenCalled();
    });

    it('should reject when circuit breaker is open', async () => {
      // Simulate failures to open circuit
      for (let i = 0; i < 5; i++) {
        mockChannel.sendToQueue.mockRejectedValue(new Error('Failed'));
        await producer.publishApiHit({ eventId: `${i}` }).catch(() => {});
      }

      const result = await producer.publishApiHit({ eventId: '999' });

      expect(result).toBe(false);
    });
  });
});
```

### Test Coverage Requirements

- Services: 80%+
- Controllers: 60%+
- Utils: 90%+

---

## Pull Request Process

### Before Creating PR

1. ✅ Create feature branch
2. ✅ Write code following style guide
3. ✅ Write tests (aim for 80% coverage)
4. ✅ Run `npm run lint:fix`
5. ✅ Run `npm test`
6. ✅ Run `npm run build` to verify compilation
7. ✅ Commit with clear messages

### PR Template

```markdown
## Description
Brief summary of changes

## Related Issue
Fixes #123

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation

## Changes Made
- Point 1
- Point 2

## Testing
Describe tests added/modified

## Screenshots (if UI change)
Include relevant screenshots

## Checklist
- [ ] Code follows style guide
- [ ] Tests added/updated
- [ ] Docs updated
- [ ] No breaking changes
- [ ] All tests pass
```

### PR Guidelines

- Keep PRs focused (max 400 lines ideally)
- Link to related issues
- Add descriptive title: `feat: add webhooks for api hits`
- Request 1-2 reviewers
- Address feedback within 24 hours

### PR Title Format

```
<type>: <description>

feat: add webhook support for api events
fix: prevent duplicate payment processing
docs: update integration guide
refactor: extract service layer
```

---

## Code Review

### What We Look For

✅ **Correctness**
- Logic is correct
- Error cases handled
- No off-by-one errors

✅ **Performance**
- No N+1 queries
- Proper indexing
- Efficient algorithms

✅ **Maintainability**
- Clear variable names
- Follows patterns
- Well-documented

✅ **Testing**
- Edge cases covered
- Happy path + error path
- Integration tests

✅ **Security**
- Input validation
- No SQL injection
- No XSS vulnerabilities
- Secrets not exposed

### Reviewer Responsibilities

```
- Approve when ready
- Request changes with explanations
- Suggest improvements, don't demand
- Test locally if possible
- Check for security issues
```

### Author Responsibilities

```
- Respond to feedback quickly
- Push new commits, don't force-push
- Mark conversations resolved when addressed
- Re-request review when done
```

---

## Release Process

### Versioning

We follow Semantic Versioning: `MAJOR.MINOR.PATCH`

- `MAJOR`: Breaking changes
- `MINOR`: New features (backward compatible)
- `PATCH`: Bug fixes

### Release Workflow

```
1. Create release branch: git checkout -b release/v1.2.0
2. Update CHANGELOG.md
3. Bump version in package.json
4. Create PR to main
5. Merge after approval
6. Tag release: git tag v1.2.0
7. Push tags: git push origin v1.2.0
8. GitHub Actions builds + deploys
```

---

## Documentation

### When to Document

- New features → Add to API-FLOW.md
- Architecture changes → Update ARCHITECTURE.md
- Database changes → Update DB-SCHEMA.md
- Operational changes → Update DEPLOYMENT.md

### Documentation Standards

- Use clear, simple language
- Include code examples
- Explain the "why" not just "how"
- Keep up-to-date with code changes
- Use diagrams for complex concepts

---

## Performance Guidelines

### Do's

✅ Use indexes on frequently queried fields
✅ Batch operations when possible
✅ Cache expensive computations
✅ Use connection pooling
✅ Monitor query performance

### Don'ts

❌ N+1 queries
❌ Unbounded result sets
❌ Synchronous operations for I/O
❌ Large transactions
❌ Complex joins without indexes

### Performance Checklist

```bash
# Before committing
npm run perf-test
npm run analyze-bundle
```

---

## Security Guidelines

### Required

- Validate all inputs
- Use parameterized queries (never concat SQL)
- Hash passwords with bcrypt
- Sanitize error messages (no stack traces to client)
- Use HTTPS in production
- Implement rate limiting
- Validate JWT tokens

### Secrets Management

```
# ❌ Never commit
RAZORPAY_SECRET=xyz123...
DATABASE_PASSWORD=securepass

# ✅ Use environment variables
process.env.RAZORPAY_SECRET
process.env.DATABASE_PASSWORD
```

### Security Checklist

- [ ] No hardcoded secrets
- [ ] Input validation on all endpoints
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS protection enabled
- [ ] CORS configured properly
- [ ] Rate limiting in place
- [ ] Sensitive data not logged

---

## Common Issues

### Issue: Tests Failing Locally

```bash
# Ensure services are running
docker-compose ps

# Reset database
npm run db:reset

# Clear cache
npm run clean
```

### Issue: Port Already in Use

```bash
# Find and kill process
lsof -i :5000
kill -9 <PID>
```

### Issue: Git Merge Conflicts

```bash
# Resolve locally
git fetch
git rebase origin/develop
# Resolve conflicts in editor
git add .
git rebase --continue
```

---

## Getting Help

- 📧 Email: hello@sendry.io
- 💬 Discord: https://discord.gg/sendry
- 🐛 Issues: GitHub Issues
- 📚 Docs: https://docs.sendry.io

---

## Code of Conduct

- Be respectful and inclusive
- No harassment or discrimination
- Constructive feedback only
- Report violations to hello@sendry.io

---

## Recognition

Contributors are recognized in:
- CHANGELOG.md
- GitHub contributors page
- Special mentions in releases

Thank you for contributing! 🙏
