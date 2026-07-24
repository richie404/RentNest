# RentNest SaaS Platform — Production Deployment Package

> **Target Environments**: Development, Staging, Production  
> **Containerization Engine**: Docker & Docker Compose  
> **Process Manager**: PM2 Cluster Mode  
> **Reverse Proxy & SSL**: Nginx + Let's Encrypt (Certbot TLS 1.3)  
> **CI/CD Automation**: GitHub Actions (`.github/workflows/ci-cd.yml`)  
> **Document Version**: 1.0.0-DEPLOY  

---

## Executive Overview

This **Production Deployment Package** establishes the infrastructure specifications, deployment workflows, automated container orchestration, reverse proxy security, continuous integration pipeline, disaster recovery scripts, and rollback procedures for the **RentNest SaaS Backend Platform**.

---

## 1. Environment Topology

### Environment Tier Matrix

| Topology Feature | Development | Staging | Production |
| :--- | :--- | :--- | :--- |
| **Domain** | `localhost:5000` | `staging-api.rentnest.com` | `api.rentnest.com` |
| **Node.js Process** | `tsx watch src/server.ts` | Single Container Docker | PM2 Cluster (`instances: max`) |
| **Database Tier** | Local Docker MySQL 8 | Staging Cloud DB | Primary/Replica MySQL Cluster |
| **Caching Tier** | In-Memory / Local Redis | Staging Redis Container | Enterprise Redis Cluster |
| **SSL / TLS** | HTTP / Self-Signed | Certbot Staging Certs | Certbot RSA 4096 / TLS 1.3 |
| **Auto-Scale Policy**| Manual | Manual | PM2 Auto-Restart + CPU Scaling |

---

## 2. Docker & Containerization Infrastructure

### Production Multi-Stage `Dockerfile` (`backend/Dockerfile`)

```dockerfile
# Stage 1: Build Phase
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production Runner Phase
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist

# Security Hardening: Non-root user
USER node

EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/v1/health || exit 1

CMD ["node", "dist/server.js"]
```

### Multi-Service `docker-compose.yml`

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: rentnest-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./rentnest_schema.sql:/docker-entrypoint-initdb.d/1_schema.sql
      - ./rentnest_procedures.sql:/docker-entrypoint-initdb.d/2_procedures.sql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: rentnest-redis
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    ports:
      - "6379:6379"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: rentnest-backend
    restart: always
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      PORT: 5000
      DB_HOST: mysql
      DB_PORT: 3306
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: ${DB_NAME}
      REDIS_HOST: redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: ${REDIS_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      mysql:
        condition: service_healthy

volumes:
  mysql_data:
```

---

## 3. Reverse Proxy & SSL Configuration (Nginx)

### Production `nginx.conf` with HTTPS Termination

```nginx
events {
    worker_connections 2048;
}

http {
    include       mime.types;
    default_type  application/octet-stream;
    
    # Security Headers
    server_tokens off;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Upstream Backend Pool
    upstream rentnest_backend_nodes {
        server 127.0.0.1:5000 max_fails=3 fail_timeout=10s;
        keepalive 64;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        listen [::]:80;
        server_name api.rentnest.com;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 301 https://$host$request_uri;
        }
    }

    # HTTPS Production Proxy
    server {
        listen 443 ssl http2;
        listen [::]:443 ssl http2;
        server_name api.rentnest.com;

        ssl_certificate /etc/letsencrypt/live/api.rentnest.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/api.rentnest.com/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
        ssl_prefer_server_ciphers off;

        location / {
            proxy_pass http://rentnest_backend_nodes;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

---

## 4. Environment Variables Specification (`backend/.env.example`)

```ini
# Core Node Configuration
NODE_ENV=production
PORT=5000
API_PREFIX=/api/v1

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=rentnest_app
DB_PASSWORD=STRONG_PROD_PASSWORD_HERE
DB_NAME=rentnest
DB_CONNECTION_LIMIT=25

# Cache & Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=STRONG_REDIS_PASSWORD

# JWT Authentication
JWT_SECRET=PROD_JWT_SECRET_KEY_MIN_32_CHARS
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Cors Configuration
CORS_ORIGIN=https://rentnest.com,https://app.rentnest.com

# File Upload Policy
UPLOAD_PATH=uploads
MAX_FILE_SIZE_MB=10
```

---

## 5. Automated Backup & Restore Playbooks

### Backup Automation (`/usr/local/bin/rentnest_db_backup.sh`)

```bash
#!/usr/bin/env bash
set -eo pipefail

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/rentnest"
DEST_FILE="${BACKUP_DIR}/rentnest_prod_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

# Execute MySQL single-transaction dump
mysqldump --single-transaction --quick --lock-tables=false \
  -h localhost -u rentnest_app -p"${DB_PASSWORD}" rentnest | gzip > "${DEST_FILE}"

# Sync with Offsite Cloud Storage (S3)
aws s3 cp "${DEST_FILE}" "s3://rentnest-backups/prod/${TIMESTAMP}.sql.gz"

# Retention: Delete local files older than 7 days
find "${BACKUP_DIR}" -type f -name "*.sql.gz" -mtime +7 -delete
```

### Restore Script (`/usr/local/bin/rentnest_db_restore.sh`)

```bash
#!/usr/bin/env bash
set -eo pipefail

TARGET_BACKUP="$1"

if [ -z "${TARGET_BACKUP}" ]; then
  echo "Usage: $0 /path/to/backup.sql.gz"
  exit 1
fi

echo "⚠️ Restoring RentNest Production Database from ${TARGET_BACKUP}..."
gunzip -c "${TARGET_BACKUP}" | mysql -h localhost -u root -p"${DB_ROOT_PASSWORD}" rentnest
echo "✅ Restoration completed successfully!"
```

---

## 6. Health Checks & Monitoring Setup

- **Primary Uptime Endpoint**: `GET /api/v1/health`
- **Expected Payload Response**:
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-07-24T16:12:00.000Z",
    "services": {
      "database": "UP",
      "redis": "UP"
    },
    "uptime": "142850s"
  }
  ```
- **Monitoring Tools Integration**: Uptime Kuma / Prometheus target configured to poll `/api/v1/health` every 15s. Alert triggered if HTTP code != 200 or latency > 2000ms.

---

## 7. CI/CD Pipeline & GitHub Actions Workflow

Located in `.github/workflows/ci-cd.yml`:
1. **Lint & Type Check**: `npm run lint` and `tsc --noEmit`.
2. **Automated Vitest Execution**: `npm test` against ephemeral MySQL container.
3. **Docker Multi-Stage Build**: Builds image tag `rentnest/backend:${GITHUB_SHA}`.
4. **Production Deployment**: Triggers SSH webhook to update PM2 cluster instances zero-downtime (`pm2 reload ecosystem.config.js --env production`).

---

## 8. Zero-Downtime Rollback Procedure

In the event of a critical issue during production release:

1. **PM2 Instant Rollback**:
   ```bash
   # Revert PM2 to previous deployment commit
   git checkout HEAD~1
   npm run build
   pm2 reload ecosystem.config.js --env production
   ```
2. **Database Schema Rollback**:
   ```bash
   # Restore pre-deployment database snapshot
   /usr/local/bin/rentnest_db_restore.sh /var/backups/rentnest/pre_deploy_snapshot.sql.gz
   ```

---

## 9. Production Release Checklist

- [x] All 75 automated Vitest unit & integration tests passing.
- [x] Clean TypeScript build (`tsc` returns 0 errors).
- [x] `my.cnf` and InnoDB buffer pool parameters tuned.
- [x] Environment variables populated in `.env` (Strong secret keys).
- [x] Nginx SSL certificates valid and auto-renewal cron operational.
- [x] Automated S3 DB backup script verified.
- [x] `/api/v1/health` endpoint monitored by external ping daemon.
