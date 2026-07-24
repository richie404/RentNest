# RentNest SaaS Platform — System Administrator Guide

> **Target Audience**: System Administrators, DevOps Engineers & Site Reliability Engineers (SREs)  
> **Target Access Level**: `ROLE_ADMIN` & Infrastructure Superuser  
> **Platform Version**: 1.0.0-PROD  
> **Document Version**: 1.0.0-ADMIN  

---

## Executive Summary

This **System Administrator Guide** provides exhaustive technical procedures for deploying, configuring, securing, monitoring, upgrading, and troubleshooting the **RentNest SaaS Platform** backend infrastructure.

---

## 1. Server Setup & System Requirements

### Operating System & Minimum Specs
- **Recommended OS**: Ubuntu 22.04 LTS (Jammy Jellyfish) or RHEL 9 Enterprise Linux.
- **CPU**: 8 vCPUs (Minimum 4 vCPUs).
- **Memory**: 32 GB RAM (16 GB Minimum for non-production).
- **Disk Storage**: NVMe SSD with 100 GB+ provisioned storage (3,000 IOPS minimum).

### System Initialization CLI Commands
```bash
# 1. Update system packages and dependencies
sudo apt update && sudo apt upgrade -y
sudo apt install -y build-essential curl git unzip jq ufw fail2ban

# 2. Install Node.js 20 LTS Runtime via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Install Global Process Manager (PM2)
sudo npm install -g pm2
```

---

## 2. Database Setup (MySQL 8.0 & Redis)

### MySQL 8.0 Provisioning
```bash
# Install MySQL 8.0 Server
sudo apt install -y mysql-server-8.0

# Create Database and Dedicated Application User
sudo mysql -e "
CREATE DATABASE IF NOT EXISTS rentnest CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER IF NOT EXISTS 'rentnest_app'@'localhost' IDENTIFIED BY 'STRONG_PRODUCTION_DB_PASSWORD';
GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE ON rentnest.* TO 'rentnest_app'@'localhost';
FLUSH PRIVILEGES;
"

# Apply Database Schema & Stored Procedures
mysql -u root -p rentnest < /path/to/rentnest_schema.sql
mysql -u root -p rentnest < /path/to/rentnest_procedures.sql
```

### Redis Cache & Session Setup
```bash
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

---

## 3. Environment Configuration

The application reads system runtime settings from `backend/.env`.

```ini
# Production Environment Configuration Matrix
NODE_ENV=production
PORT=5000
API_PREFIX=/api/v1

# Database Settings
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=rentnest_app
DB_PASSWORD=STRONG_PRODUCTION_DB_PASSWORD
DB_NAME=rentnest
DB_CONNECTION_LIMIT=25

# Cache & Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=STRONG_REDIS_PASSWORD

# Security & JWT Tokens
JWT_SECRET=SUPER_SECURE_PRODUCTION_JWT_SECRET_KEY_MIN_32_BYTES
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# File Storage
UPLOAD_PATH=uploads
MAX_FILE_SIZE_MB=10
```

---

## 4. Role Management & 5. Permissions (RBAC Engine)

RentNest enforces Role-Based Access Control using 6 predefined roles and permission codes (`module:action` format).

### Role Taxonomy Matrix

| Role Code | Description | Key Permissions Granted |
| :--- | :--- | :--- |
| `ROLE_ADMIN` | Platform Superuser | All permissions (`*:*`). Can manage users, RBAC matrix, and feature flags. |
| `ROLE_PROPERTY_MANAGER` | Portfolio Manager | Property, unit, tenant application approval, and maintenance dispatching. |
| `ROLE_PROPERTY_OWNER` | Landlord / Investor | Property viewing, financial earnings review, payout disbursements. |
| `ROLE_TENANT` | Resident Tenant | Unit discovery, lease applications, ACH/Card rent payments, maintenance requests. |
| `ROLE_VENDOR` | Maintenance Contractor | Work order queue view, ticket status updates (`IN_PROGRESS`), expense logging. |
| `ROLE_FINANCE_OFFICER` | Financial Accountant | Invoicing, payment allocations, owner payout auditing, tax report export. |

### Dynamic RBAC Updates via API
```bash
# Assigning a role to a user via API
curl -X POST https://api.rentnest.com/api/v1/rbac/users/102/roles \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"roleId": 3}'
```

---

## 6. System Monitoring & Health Checks

- **Health Check Endpoint**: `GET /api/v1/health`
- **Uptime Monitoring**: Configure Uptime Kuma or Datadog to ping `https://api.rentnest.com/api/v1/health` every 30s. Alert if HTTP != 200.
- **PM2 Monitoring Command**: `pm2 monit` or `pm2 status`

---

## 7. Backup & Recovery Operations

### Automated Nightly Backup Script (`/etc/cron.daily/rentnest_backup`)
```bash
#!/usr/bin/env bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/rentnest"
mkdir -p "${BACKUP_DIR}"

mysqldump --single-transaction --quick rentnest -u rentnest_app -p"${DB_PASSWORD}" | gzip > "${BACKUP_DIR}/db_${TIMESTAMP}.sql.gz"

# Sync with Amazon S3 Bucket
aws s3 cp "${BACKUP_DIR}/db_${TIMESTAMP}.sql.gz" "s3://rentnest-db-backups-prod/"
find "${BACKUP_DIR}" -type f -name "*.sql.gz" -mtime +7 -delete
```

---

## 8. Log Management & Audit Logs

- **Application Logs**: Generated via Winston logger in `/var/log/rentnest/combined.log` and `/var/log/rentnest/error.log`.
- **Audit Logs Table**: All security-critical updates are saved in the `audit_logs` SQL table with full JSON pre-image and post-image diffs.

---

## 9. Security Hardening

1. **Firewall (UFW)**: Allow ports `80`, `443`, `22` only. Block port `3306` and `6379` from public exposure.
2. **Fail2ban**: Enable fail2ban on SSH (`/etc/fail2ban/jail.local`).
3. **Helmet CSP & Rate Limiting**: Managed centrally in Express middleware (`app.ts`).

---

## 10. Feature Flags Management

Feature toggles stored in `platform_settings` table:
- `MAINTENANCE_AUTO_DISPATCH`: Enable/disable AI auto-dispatching.
- `COMMISSION_FEE_PERCENTAGE`: Dynamically adjust platform commission rates.

---

## 11. Maintenance & 12. Upgrades

### Zero-Downtime Deployment Upgrade
```bash
cd /var/www/rentnest/backend
git pull origin main
npm ci --only=production
npm run build
pm2 reload ecosystem.config.js --env production
```

---

## 13. System Troubleshooting Guide

| Issue | Root Cause | Resolution |
| :--- | :--- | :--- |
| **500 Internal Error on DB Operations** | Connection Pool Exhaustion | Increase `DB_CONNECTION_LIMIT` in `.env` and verify idle timeouts. |
| **401 Unauthorized Everywhere** | Expired `JWT_SECRET` mismatch | Ensure `JWT_SECRET` is consistent across all PM2 cluster workers. |
| **High Memory / PM2 Restarts** | Node.js Memory Leak | Run heap dump inspection; verify PM2 `max_memory_restart: "1G"` trigger. |
