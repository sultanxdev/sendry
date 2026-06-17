# 🚀 Sendry — Complete Deployment Guide (Vercel + Render)

> This guide covers deploying all three components of Sendry for **free** using:
> - **Vercel** → React Dashboard (static)
> - **Render** → API Server + Consumer (Node.js)
> - **MongoDB Atlas** → Raw event storage
> - **Render PostgreSQL** → Aggregated metrics
> - **CloudAMQP** → RabbitMQ message queue

---

## 📋 Pre-Deployment Checklist

- [ ] GitHub account with the Sendry repo pushed
- [ ] MongoDB Atlas account (free)
- [ ] Render account (free)
- [ ] Vercel account (free)
- [ ] CloudAMQP account (free)
- [ ] Node.js 18+ locally installed

---

## STEP 1 — Set Up External Services

### 1A. MongoDB Atlas (Database for Raw Events)

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → **Create account**
2. Create a **Free Shared Cluster** (M0 — 512MB free)
3. **Database Access** → Add a new database user:
   - Username: `sendry_user`
   - Password: generate a secure password, **save it**
   - Built-in Role: `Read and write to any database`
4. **Network Access** → Add IP Address → **Allow access from anywhere** (`0.0.0.0/0`) for Render
5. **Connect** → Connect your application → Node.js driver → Copy the connection string:
   ```
   mongodb+srv://sendry_user:<password>@cluster0.xxxxx.mongodb.net/api_monitoring?retryWrites=true&w=majority
   ```
   Replace `<password>` with your actual password.

---

### 1B. CloudAMQP — RabbitMQ

1. Go to [cloudamqp.com](https://www.cloudamqp.com) → **Create account**
2. Create a new instance:
   - Plan: **Little Lemur** (free — 1M messages/month)
   - Region: Choose closest to your Render region (e.g., US East)
   - Name: `sendry-mq`
3. Open the instance → Copy the **AMQP URL**:
   ```
   amqps://user:password@host.cloudamqp.com/vhost
   ```
   > ⚠️ Note the `amqps://` (TLS) — important for production

---

## STEP 2 — Deploy API Server on Render

### 2A. Create PostgreSQL Database on Render

1. [render.com](https://render.com) → **New** → **PostgreSQL**
2. Settings:
   - **Name**: `sendry-postgres`
   - **Database**: `api_monitoring`
   - **User**: `sendry`
   - **Region**: Oregon (US West)
   - **Plan**: Free
3. After creation, note down:
   - **Internal Database URL** (for use within Render)
   - **External Database URL** (for local testing)
   - The individual values: Host, Port, Database, Username, Password

---

### 2B. Deploy the API Server

1. **Render Dashboard** → **New** → **Web Service**
2. Connect your GitHub repository: `sendry`
3. Configure:
   - **Name**: `sendry-api`
   - **Region**: Oregon (US West) — same as Postgres
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   - **Plan**: Free

4. **Environment Variables** — add all of these:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGO_URI` | Your MongoDB Atlas URI |
| `MONGO_DB_NAME` | `api_monitoring` |
| `PG_HOST` | Render Postgres Internal Host |
| `PG_PORT` | `5432` |
| `PG_DATABASE` | `api_monitoring` |
| `PG_USER` | `sendry` |
| `PG_PASSWORD` | Render Postgres password |
| `RABBITMQ_URL` | CloudAMQP AMQP URL |
| `RABBITMQ_QUEUE` | `api_hits` |
| `RABBITMQ_RETRY_ATTEMPTS` | `3` |
| `RABBITMQ_RETRY_DELAY` | `1000` |
| `JWT_SECRET` | Generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_EXPIRES_IN` | `24h` |
| `RATE_LIMIT_WINDOW_MS` | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | `1000` |
| `API_KEY_EXPIRY_DAYS` | `365` |

5. Click **Create Web Service**

6. Wait for the first deploy. Once live, note the URL:
   ```
   https://sendry-api.onrender.com
   ```

7. **Initialize PostgreSQL schema** — after the API server is running, trigger schema creation by visiting the health endpoint:
   ```
   GET https://sendry-api.onrender.com/health
   ```
   > The PostgreSQL schema (`endpoint_metrics` table) is created automatically via the init script when Postgres connects.
   
   > ⚠️ If you're using docker-compose locally, the `init-postgres.sql` script runs automatically. On Render, you need to run it manually:
   
   **Option A** — Use Render's shell (dashboard → your service → Shell tab):
   ```bash
   node -e "
   import postgres from './src/shared/config/postgres.js';
   import { readFileSync } from 'fs';
   const sql = readFileSync('./scripts/init-postgres.sql', 'utf8');
   const client = await postgres.pool.connect();
   await client.query(sql);
   client.release();
   console.log('Schema created!');
   "
   ```
   
   **Option B** — Connect via psql with the External Database URL and run the script:
   ```bash
   psql "postgres://sendry:password@host.render.com/api_monitoring" -f server/scripts/init-postgres.sql
   ```

---

### 2C. Deploy the Consumer (Background Worker)

The consumer is a **separate process** that reads from RabbitMQ and writes to databases.

1. **Render Dashboard** → **New** → **Background Worker**
2. Connect same GitHub repository
3. Configure:
   - **Name**: `sendry-consumer`
   - **Region**: Oregon (same as API server)
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node src/services/processor/consumer.js`
   - **Plan**: Free

4. **Environment Variables** — same as the API server (copy all):

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `MONGO_URI` | Your MongoDB Atlas URI |
| `MONGO_DB_NAME` | `api_monitoring` |
| `PG_HOST` | Render Postgres Internal Host |
| `PG_PORT` | `5432` |
| `PG_DATABASE` | `api_monitoring` |
| `PG_USER` | `sendry` |
| `PG_PASSWORD` | Render Postgres password |
| `RABBITMQ_URL` | CloudAMQP AMQP URL |
| `RABBITMQ_QUEUE` | `api_hits` |
| `JWT_SECRET` | Same JWT secret as API server |

5. Click **Create Background Worker**

---

## STEP 3 — Deploy Dashboard on Vercel

### 3A. Configure Vite for Production

Before deploying, update `dashboard/vite.config.js` to remove the proxy (since we'll use the full API URL):

```js
// dashboard/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // No proxy needed for production — use VITE_API_BASE_URL env var
});
```

### 3B. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repository: `sendry`
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `dashboard`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Environment Variables**:

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `https://sendry-api.onrender.com/api` |
| `VITE_ERROR_REPORT_URL` | *(leave empty)* |

5. Click **Deploy**

6. Your dashboard will be live at:
   ```
   https://sendry.vercel.app
   ```

### 3C. Configure CORS on API Server

Update the CORS configuration in `server/src/server.js` to allow your Vercel domain:

```js
app.use(cors({
    origin: [
        'https://sendry.vercel.app',     // Your Vercel domain
        'http://localhost:5173',           // Local dev
    ],
    credentials: true
}));
```

Then add this as an environment variable on Render:
```
CORS_ORIGIN=https://sendry.vercel.app
```

And update `server.js` to read it:
```js
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || true,
    credentials: true
}));
```

---

## STEP 4 — First Login & Setup

### 4A. Create Super Admin

```bash
curl -X POST https://sendry-api.onrender.com/api/auth/onboard \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@yourdomain.com",
    "password": "SecurePassword123!"
  }'
```

### 4B. Login to Dashboard

1. Visit `https://sendry.vercel.app`
2. Login with the credentials you just created
3. You'll see the empty dashboard

### 4C. Create a Client & API Key

1. Dashboard → **Settings** → Create a new client (e.g., `my-app`)
2. Create an API key for that client
3. Copy the API key — you'll only see it once!

### 4D. Add Monitoring to Your App

```bash
npm install axios  # if not already installed
```

Copy the `demo/demo/monitoring.js` file into your project and add:

```js
// In your Express app
const monitoringMiddleware = require('./monitoring');

app.use(monitoringMiddleware({
  serviceName: 'my-service',
  enableLogging: false,  // disable in production
}));
```

Add to your `.env`:
```env
MONITORING_API_KEY=your-api-key-from-dashboard
MONITORING_ENDPOINT=https://sendry-api.onrender.com/api/hit
SERVICE_NAME=my-service
```

---

## STEP 5 — Verify Everything Works

### Health Checks

```bash
# API server health
curl https://sendry-api.onrender.com/health

# Expected response:
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-06-12T...",
    "uptime": 1234.5
  }
}
```

### Test Ingest Endpoint

```bash
curl -X POST https://sendry-api.onrender.com/api/hit \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "serviceName": "test-service",
    "endpoint": "/api/test",
    "method": "GET",
    "statusCode": 200,
    "latencyMs": 45.3
  }'

# Expected: 202 Accepted
{
  "success": true,
  "data": {
    "eventId": "...",
    "status": "queued",
    "timestamp": "..."
  }
}
```

### Verify in Dashboard

1. Open `https://sendry.vercel.app`
2. Login → you should see the hit in the Overview page within a few seconds

---

## ⚠️ Free Tier Limitations & Workarounds

| Service | Free Limit | Impact | Workaround |
|---------|-----------|--------|-----------|
| **Render Web Service** | Spins down after 15 min inactivity | API cold start (~30s) | Upgrade to Starter ($7/mo) or use a cron to ping `/health` every 14 min |
| **Render Background Worker** | 750 hrs/month | ~31 days — may sleep | Upgrade to keep consumer running 24/7 |
| **MongoDB Atlas** | 512 MB storage | ~3M raw hits | TTL index auto-deletes hits older than 30 days |
| **CloudAMQP** | 1M messages/month | ~33K hits/day | Sufficient for demo; upgrade for production |
| **Render PostgreSQL** | 1 GB, expires after 90 days | — | Upgrade or recreate database |

---

## 🔧 Troubleshooting

### Consumer not processing messages
- Check Render logs: Dashboard → `sendry-consumer` → Logs
- Verify `RABBITMQ_URL` environment variable is correct
- CloudAMQP → check the queue `api_hits` for messages piling up

### Dashboard showing "Failed to load" 
- Check browser Network tab — is the API returning 401/403?
- Verify `VITE_API_BASE_URL` in Vercel environment variables
- Check CORS settings — your Vercel domain must be whitelisted

### PostgreSQL schema not created
- Connect with External DB URL and run the SQL script manually:
  ```bash
  psql "postgresql://..." -f server/scripts/init-postgres.sql
  ```

### Render cold start causing monitoring timeouts
- The monitoring middleware has a 3-second timeout — increase it:
  ```js
  monitoringMiddleware({ timeout: 10000 })
  ```

---

## 📊 Production Architecture (Paid Tiers)

For production workloads, the recommended setup is:

```
Dashboard     → Vercel Pro ($20/mo) — CDN, instant deploy
API Server    → Render Starter ($7/mo) — no sleep
Consumer      → Render Starter ($7/mo) — always-on worker  
PostgreSQL    → Render PostgreSQL Pro ($20/mo) — no expiry
MongoDB       → Atlas M10 ($57/mo) — dedicated cluster
RabbitMQ      → CloudAMQP Bunny ($19/mo) — 5M messages
                                    Total: ~$130/mo
```

---

## 🎉 You're Live!

Your Sendry monitoring stack is now deployed. Share the dashboard URL with your team and start monitoring your APIs in real-time.

**Next steps:**
1. Add the monitoring middleware to all your services
2. Create separate API keys per service for granular tracking
3. Set up Render's notification alerts for service downtime
4. Consider upgrading Render services to avoid cold starts
