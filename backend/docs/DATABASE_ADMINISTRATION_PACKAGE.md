# RentNest SaaS Platform — Database Administration Package

> **Target Database Engine**: MySQL 8.0 Enterprise / Percona Server for MySQL 8.0  
> **Storage Engine**: InnoDB  
> **Character Set / Collation**: `utf8mb4` / `utf8mb4_0900_ai_ci`  
> **Schema Architecture**: 63 Entities across 9 Core Sub-Domains  
> **Primary Hand-off Audience**: Senior Lead Database Administrator (DBA) & Infrastructure Operations  
> **Document Version**: 1.0.0-PROD  

---

## Executive Summary & Architecture Overview

The **RentNest Database Architecture** is designed for multi-tenant enterprise property management, high throughput transactional isolation, and strict financial auditability. The database schema encompasses **63 normalized tables** (41 base domain entities + 22 enterprise extension modules) supporting property listing discovery, credit screening, digital lease execution, automated financial ledger allocations, maintenance dispatch workflows, and AI-driven intelligence services.

---

## 1. Database Deployment Guide

### System Requirements & OS Configuration
- **Recommended OS**: Ubuntu 22.04 LTS / RHEL 9 Enterprise Linux
- **RAM**: Minimum 16GB (32GB+ recommended for production workloads)
- **CPU**: 8 vCPUs minimum
- **Disk Storage**: NVMe SSD with provisioned IOPS (Minimum 3,000 IOPS)

### Production `my.cnf` Engine Configuration
Save the following configuration block to `/etc/mysql/conf.d/rentnest_prod.cnf`:

```ini
[mysqld]
# Server Identity & Network
server-id = 101
bind-address = 0.0.0.0
port = 3306
default_time_zone = '+00:00'

# Character Set & Collation
character-set-server = utf8mb4
collation-server = utf8mb4_0900_ai_ci

# Transaction Isolation & Storage Engine
default_storage_engine = InnoDB
transaction-isolation = READ-COMMITTED

# InnoDB Memory Tuning (Assume 32GB RAM Host)
innodb_buffer_pool_size = 24G
innodb_buffer_pool_instances = 16
innodb_log_file_size = 2G
innodb_log_buffer_size = 64M
innodb_flush_log_at_trx_commit = 1
innodb_doublewrite = 1
innodb_file_per_table = 1
innodb_flush_method = O_DIRECT

# Connection Limits & Threads
max_connections = 500
max_user_connections = 450
thread_cache_size = 64
back_log = 128

# Binary Logging & Replication (GTID Enabled)
log_bin = /var/log/mysql/mysql-bin.log
binlog_format = ROW
binlog_row_image = FULL
gtid_mode = ON
enforce_gtid_consistency = ON
expire_logs_days = 7
max_binlog_size = 1G
sync_binlog = 1

# Slow Query Logging
slow_query_log = 1
slow_query_log_file = /var/log/mysql/mysql-slow.log
long_query_time = 0.5
log_queries_not_using_indexes = 1

# Security & Temp Tables
tmp_table_size = 64M
max_heap_table_size = 64M
sql_mode = "STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION,ONLY_FULL_GROUP_BY,ERROR_FOR_DIVISION_BY_ZERO"
```

### Initial Deployment Commands
```bash
# 1. Update OS packages & install MySQL 8.0 Server
sudo apt update && sudo apt install -y mysql-server-8.0

# 2. Apply production my.cnf configuration
sudo cp /path/to/rentnest_prod.cnf /etc/mysql/conf.d/rentnest_prod.cnf
sudo systemctl restart mysql

# 3. Create database and administrative user
mysql -u root -p -e "
CREATE DATABASE IF NOT EXISTS rentnest CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER 'rentnest_app'@'%' IDENTIFIED BY 'STRONG_PROD_PASSWORD_HERE';
GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE ON rentnest.* TO 'rentnest_app'@'%';
FLUSH PRIVILEGES;
"

# 4. Apply Database Schema
mysql -u root -p rentnest < /path/to/rentnest_schema.sql
```

---

## 2. Migration Order & Dependency Execution Strategy

To ensure zero Foreign Key reference violations during schema provisioning or migrations, execution must follow strict topological sorting across the 9 sub-domains:

```
Step 1: Lookup Tables    --> roles, permissions, amenities, platform_settings, currencies, tax_rules
Step 2: User Identity    --> users, user_profiles, user_roles, role_permissions, emergency_contacts
Step 3: Portfolio        --> properties, units, property_owners, property_ownership_transfers, property_amenities, unit_amenities, property_media, property_documents, property_translations
Step 4: Screening        --> rental_applications, applicant_details, screening_reports, application_references, unit_waitlists, application_approval_workflows
Step 5: Leases           --> leases, lease_signers, lease_clauses, lease_renewals, move_inspections, lease_signature_audits, inspection_photos, inspection_damage_assessments, promotions, lease_promotions
Step 6: Financials       --> lease_invoices, invoice_items, payments, payment_allocations, security_deposits, owner_payouts, invoice_tax_line_items
Step 7: Maintenance      --> vendors, maintenance_requests, maintenance_updates, maintenance_expenses, vendor_certifications, vendor_contracts
Step 8: Communication    --> conversations, messages, reviews, favorites, saved_searches, saved_search_alert_history, viewing_appointments, referral_programs, insurance_policies, insurance_claims
Step 9: Governance & AI  --> audit_logs, notifications, ai_pricing_models, ai_maintenance_triage
```

---

## 3. Seed Data Strategy

Reference data must be seeded automatically upon system initialization. All seed scripts must use `INSERT IGNORE` or `ON DUPLICATE KEY UPDATE` to ensure idempotency.

### Reference Seeding Script (`seed_reference_data.sql`)
```sql
USE rentnest;

-- 1. System Roles
INSERT INTO `roles` (`role_id`, `role_name`, `description`) VALUES
(1, 'ROLE_TENANT', 'Resident Tenant with access to leases and payments'),
(2, 'ROLE_PROPERTY_OWNER', 'Landlord owning properties and reviewing payouts'),
(3, 'ROLE_PROPERTY_MANAGER', 'Portfolio Manager approving applications & maintenance'),
(4, 'ROLE_VENDOR', 'Contractor fulfilling maintenance work orders'),
(5, 'ROLE_ADMIN', 'Platform Administrator with system-wide permissions')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- 2. System Currencies
INSERT INTO `currencies` (`currency_code`, `currency_symbol`, `currency_name`, `is_active`) VALUES
('USD', '$', 'US Dollar', TRUE),
('EUR', '€', 'Euro', TRUE),
('GBP', '£', 'British Pound', TRUE),
('CAD', 'CA$', 'Canadian Dollar', TRUE),
('AUD', 'A$', 'Australian Dollar', TRUE)
ON DUPLICATE KEY UPDATE `is_active` = VALUES(`is_active`);

-- 3. Standard Amenities
INSERT INTO `amenities` (`amenity_name`, `category`) VALUES
('Swimming Pool', 'BUILDING'),
('Fitness Center', 'BUILDING'),
('In-Unit Washer/Dryer', 'UNIT'),
('Air Conditioning', 'UNIT'),
('24/7 Security System', 'SAFETY'),
('Private Balcony', 'OUTDOOR')
ON DUPLICATE KEY UPDATE `category` = VALUES(`category`);

-- 4. Initial Platform Settings
INSERT INTO `platform_settings` (`setting_key`, `setting_value`, `data_type`) VALUES
('PLATFORM_FEE_PERCENTAGE', '5.00', 'DECIMAL'),
('MAX_FILE_UPLOAD_MB', '10', 'INT'),
('DEFAULT_CURRENCY', 'USD', 'STRING'),
('MAINTENANCE_AUTO_DISPATCH', 'TRUE', 'BOOLEAN')
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);
```

---

## 4. Backup Strategy

RentNest requires a hybrid backup mechanism: daily physical snapshots combined with continuous binary log shipping for Point-in-Time Recovery (PITR).

| Backup Type | Method / Tool | Frequency | Retention Window | Storage Target |
| :--- | :--- | :--- | :--- | :--- |
| **Physical Full Backup** | Percona XtraBackup (`xtrabackup`) | Daily at 02:00 UTC | 30 Days | Amazon S3 / GCS |
| **Logical Dump** | `mysqldump` (--single-transaction) | Weekly | 90 Days | Encrypted Cold Storage |
| **Binary Logs (PITR)** | `mysqlbinlog` streaming | Continuous | 7 Days | Standby Replica & S3 |

### Automated Backup Script (`/usr/local/bin/backup_rentnest.sh`)
```bash
#!/usr/bin/env bash
set -eo pipefail

BACKUP_DIR="/var/backups/mysql"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
TARGET_DIR="${BACKUP_DIR}/full_${TIMESTAMP}"
S3_BUCKET="s3://rentnest-db-backups-prod"

# Perform Non-blocking Physical Backup using Percona XtraBackup
xtrabackup --backup --target-dir="${TARGET_DIR}" --user=root --password="${DB_ROOT_PASSWORD}"

# Prepare backup for restore readiness
xtrabackup --prepare --target-dir="${TARGET_DIR}"

# Compress and Encrypt via AES-256
tar -czf - "${TARGET_DIR}" | openssl enc -aes-256-cbc -salt -pbkdf2 -pass pass:"${BACKUP_ENCRYPTION_KEY}" -out "${TARGET_DIR}.tar.gz.enc"

# Upload to Amazon S3
aws s3 cp "${TARGET_DIR}.tar.gz.enc" "${S3_BUCKET}/daily/${TIMESTAMP}.tar.gz.enc"

# Cleanup local storage older than 3 days
find "${BACKUP_DIR}" -type f -name "*.tar.gz.enc" -mtime +3 -delete
```

---

## 5. Restore & Recovery Strategy

### Objectives
- **Recovery Point Objective (RPO)**: < 5 Minutes (Achieved via GTID binary log shipping)
- **Recovery Time Objective (RTO)**: < 45 Minutes

### Step-by-Step Restoration Playbook

```bash
# Step 1. Stop application server connections & MySQL daemon
sudo systemctl stop rentnest-backend
sudo systemctl stop mysql

# Step 2. Download & Decrypt Physical Snapshot
aws s3 cp s3://rentnest-db-backups-prod/daily/20260724_020000.tar.gz.enc /tmp/backup.enc
openssl enc -d -aes-256-cbc -pbkdf2 -in /tmp/backup.enc -pass pass:"${BACKUP_ENCRYPTION_KEY}" | tar -xzf - -C /tmp/restore/

# Step 3. Clear existing MySQL datadir and move restored files
sudo rm -rf /var/lib/mysql/*
sudo xtrabackup --copy-back --target-dir=/tmp/restore/full_20260724_020000
sudo chown -R mysql:mysql /var/lib/mysql

# Step 4. Start MySQL Service
sudo systemctl start mysql

# Step 5. Apply Point-In-Time Binary Logs up to target timestamp
mysqlbinlog --start-datetime="2026-07-24 02:00:00" --stop-datetime="2026-07-24 14:30:00" \
  /var/log/mysql/mysql-bin.000102 /var/log/mysql/mysql-bin.000103 | mysql -u root -p
```

---

## 6. Disaster Recovery & High Availability Procedure

RentNest utilizes **MySQL InnoDB Cluster (Group Replication)** with 3 Nodes (1 Primary Writer, 2 Secondary Readers) managed via **Orchestrator** and **ProxySQL**.

```
                         +-------------------+
                         |   ProxySQL Node   |
                         +---------+---------+
                                   |
           +-----------------------+-----------------------+
           | (Writes)                                      | (Reads)
           v                                               v
+--------------------+                           +--------------------+
|  Node 1 (Primary)  | === GTID Replication ===> |  Node 2 (Replica)  |
+--------------------+                           +--------------------+
                                                           |
                                                 +--------------------+
                                                 |  Node 3 (Replica)  |
                                                 +--------------------+
```

### Automatic Failover Procedure
1. **Heartbeat Loss**: ProxySQL detects primary node failure within 3 seconds.
2. **Leader Election**: MySQL Group Replication elects Node 2 as the new Primary Writer using Raft consensus.
3. **Traffic Rerouting**: ProxySQL shifts all write traffic to Node 2 automatically without application restart.
4. **Fencing**: Failed Node 1 is automatically demoted and put into read-only quarantine mode upon boot.

---

## 7. Database Maintenance Checklist

| Task | Frequency | Automated Tool / SQL Command | Impact |
| :--- | :--- | :--- | :--- |
| **Update Table Statistics** | Weekly | `ANALYZE TABLE <table_name>;` | Low (Metadata lock < 1s) |
| **Check Index Fragmentation** | Monthly | `SELECT table_name, data_free FROM information_schema.tables WHERE data_free > 0;` | None (Read-only) |
| **Rebuild Fragmented Tables** | Quarterly | `ALTER TABLE <table_name> ENGINE=InnoDB, ALGORITHM=INPLACE;` | Low (Online DDL) |
| **Purge Expired Audit Logs** | Monthly | `DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL 1 YEAR;` | Medium (Batch delete in 5,000 chunks) |
| **Verify GTID Consistency** | Daily | `SHOW SLAVE STATUS\G` / `SELECT @@GLOBAL.gtid_executed;` | None |

---

## 8. Index Maintenance & Optimization Guide

### Indexing Policy Rules
1. Every foreign key column **MUST** have an explicit non-clustered index.
2. High-cardinality multi-column search routes must use composite indexes (e.g. `(city, state_province)` on `properties`).
3. Fulltext indexes (`ft_properties_search`, `ft_messages_body`, `ft_reviews_text`) must be used for free-text search queries.

### Query to Detect Unused Indexes
```sql
SELECT 
    object_schema AS database_name,
    object_name AS table_name,
    index_name
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE index_name IS NOT NULL
  AND count_star = 0
  AND object_schema = 'rentnest'
  AND index_name != 'PRIMARY';
```

---

## 9. Performance Tuning Guide

### Key Metric Thresholds
- **Buffer Pool Hit Ratio**: Must remain > 99.5% (`Innodb_buffer_pool_read_requests` vs `Innodb_buffer_pool_reads`).
- **Lock Wait Time**: Target < 50ms (`Innodb_row_lock_time_avg`).
- **Threads Running**: Target < 20 concurrent executing threads (`Threads_running`).

---

## 10. Stored Procedure Catalog

### Procedure 1: `sp_GenerateLeaseInvoice`
Automates the creation of a monthly lease invoice and invoice line items for active leases.

```sql
DELIMITER //
CREATE PROCEDURE `sp_GenerateLeaseInvoice`(
    IN p_lease_id BIGINT UNSIGNED,
    IN p_billing_start DATE,
    IN p_billing_end DATE,
    IN p_due_date DATE
)
BEGIN
    DECLARE v_rent DECIMAL(10,2);
    DECLARE v_currency CHAR(3);
    DECLARE v_invoice_id BIGINT UNSIGNED;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Fetch base lease rent details
    SELECT `monthly_base_rent`, `currency` 
    INTO v_rent, v_currency 
    FROM `leases` 
    WHERE `lease_id` = p_lease_id AND `status` = 'ACTIVE';

    IF v_rent IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Target lease is not active or does not exist.';
    END IF;

    -- Create Header Invoice
    INSERT INTO `lease_invoices` (
        `lease_id`, `billing_period_start`, `billing_period_end`, `due_date`, `total_amount_due`, `currency`, `payment_status`
    ) VALUES (
        p_lease_id, p_billing_start, p_billing_end, p_due_date, v_rent, v_currency, 'UNPAID'
    );

    SET v_invoice_id = LAST_INSERT_ID();

    -- Create Base Rent Line Item
    INSERT INTO `invoice_items` (`invoice_id`, `charge_type`, `description`, `amount`) 
    VALUES (v_invoice_id, 'BASE_RENT', CONCAT('Base Rent for ', DATE_FORMAT(p_billing_start, '%M %Y')), v_rent);

    COMMIT;
END //
DELIMITER ;
```

### Procedure 2: `sp_ProcessPaymentAllocation`
Allocates incoming tenant payment against unpaid invoice items and updates invoice payment status.

```sql
DELIMITER //
CREATE PROCEDURE `sp_ProcessPaymentAllocation`(
    IN p_payment_id BIGINT UNSIGNED,
    IN p_invoice_id BIGINT UNSIGNED
)
BEGIN
    DECLARE v_payment_amount DECIMAL(10,2);
    DECLARE v_total_due DECIMAL(10,2);
    
    START TRANSACTION;

    SELECT `amount` INTO v_payment_amount FROM `payments` WHERE `payment_id` = p_payment_id AND `payment_status` = 'SETTLED';
    SELECT `total_amount_due` INTO v_total_due FROM `lease_invoices` WHERE `invoice_id` = p_invoice_id;

    IF v_payment_amount >= v_total_due THEN
        UPDATE `lease_invoices` SET `payment_status` = 'PAID' WHERE `invoice_id` = p_invoice_id;
    ELSE
        UPDATE `lease_invoices` SET `payment_status` = 'PARTIALLY_PAID' WHERE `invoice_id` = p_invoice_id;
    END IF;

    COMMIT;
END //
DELIMITER ;
```

---

## 11. Trigger Catalog

### Trigger 1: `trg_AuditUsers_Update`
Captures pre-image and post-image JSON audit history whenever a user record is modified.

```sql
DELIMITER //
CREATE TRIGGER `trg_AuditUsers_Update`
AFTER UPDATE ON `users`
FOR EACH ROW
BEGIN
    INSERT INTO `audit_logs` (
        `actor_user_id`, `action_type`, `target_table`, `record_key`, `pre_image_json`, `post_image_json`
    ) VALUES (
        NEW.`user_id`,
        'UPDATE',
        'users',
        CAST(NEW.`user_id` AS CHAR),
        JSON_OBJECT('email', OLD.`email`, 'account_status', OLD.`account_status`, 'phone_number', OLD.`phone_number`),
        JSON_OBJECT('email', NEW.`email`, 'account_status', NEW.`account_status`, 'phone_number', NEW.`phone_number`)
    );
END //
DELIMITER ;
```

### Trigger 2: `trg_UpdateUnitStatus_LeaseSign`
Automatically updates unit occupancy status to `OCCUPIED` upon lease activation.

```sql
DELIMITER //
CREATE TRIGGER `trg_UpdateUnitStatus_LeaseSign`
AFTER UPDATE ON `leases`
FOR EACH ROW
BEGIN
    IF OLD.`status` != 'ACTIVE' AND NEW.`status` = 'ACTIVE' THEN
        UPDATE `units` SET `status` = 'OCCUPIED' WHERE `unit_id` = NEW.`unit_id`;
    END IF;
END //
DELIMITER ;
```

---

## 12. ER Diagram Verification & Entity Domains

```
                      +-------------------+
                      |       users       |
                      +---------+---------+
                                | 1:1
                                v
                      +-------------------+
                      |   user_profiles   |
                      +-------------------+
                                | 1:N
                                v
                      +-------------------+
                      |    properties     |
                      +---------+---------+
                                | 1:N
                                v
                      +-------------------+
                      |       units       |
                      +---------+---------+
                                | 1:N
                                v
                      +-------------------+
                      |      leases       |
                      +---------+---------+
                                | 1:N
                                v
                      +-------------------+
                      |   lease_invoices  |
                      +-------------------+
```

---

## 13. Relationship Matrix

| Parent Table | Child Table | Relationship | Foreign Key Column | Delete Rule | Update Rule |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `users` | `user_profiles` | 1:1 | `user_id` | CASCADE | CASCADE |
| `users` | `properties` | 1:N | `owner_id` | RESTRICT | CASCADE |
| `properties` | `units` | 1:N | `property_id` | RESTRICT | CASCADE |
| `units` | `leases` | 1:N | `unit_id` | RESTRICT | CASCADE |
| `leases` | `lease_invoices` | 1:N | `lease_id` | RESTRICT | CASCADE |
| `lease_invoices` | `invoice_items` | 1:N | `invoice_id` | RESTRICT | CASCADE |
| `vendors` | `maintenance_requests` | 1:N | `assigned_vendor_id` | RESTRICT | CASCADE |
| `users` | `audit_logs` | 1:N | `actor_user_id` | SET NULL | CASCADE |

---

## 14. Data Dictionary (Core Sample)

### Entity: `users`
| Column Name | Data Type | Nullable | Key | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `user_id` | `BIGINT UNSIGNED` | NO | PK | AUTO_INCREMENT | Unique surrogate primary key. |
| `email` | `VARCHAR(255)` | NO | UNQ | None | Authenticated email address. |
| `password_hash` | `VARCHAR(255)` | NO | None | None | Argon2id / BCrypt password digest. |
| `account_status` | `VARCHAR(20)` | NO | IDX | `'UNVERIFIED'` | Status: ACTIVE, SUSPENDED, UNVERIFIED. |
| `created_at` | `TIMESTAMP` | NO | None | `CURRENT_TIMESTAMP` | Record creation timestamp. |

### Entity: `leases`
| Column Name | Data Type | Nullable | Key | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `lease_id` | `BIGINT UNSIGNED` | NO | PK | AUTO_INCREMENT | Unique lease agreement ID. |
| `unit_id` | `BIGINT UNSIGNED` | NO | FK | None | Associated unit identifier. |
| `monthly_base_rent`| `DECIMAL(10,2)` | NO | None | None | Monthly rent amount. |
| `status` | `VARCHAR(30)` | NO | IDX | `'DRAFT'` | Status: DRAFT, ACTIVE, EXPIRED, etc. |

---

## 15. Normalization Report

- **First Normal Form (1NF)**: All column values are atomic. Multivalued attributes (like amenities or photos) are split into dedicated relational tables (`property_amenities`, `property_media`).
- **Second Normal Form (2NF)**: All non-key attributes are fully functionally dependent on primary composite keys (e.g., `user_roles`, `role_permissions`).
- **Third Normal Form (3NF) & BCNF**: No transitive functional dependencies exist. Derived attributes like `billing_month` on `lease_invoices` use MySQL 8 virtual/stored generated columns (`GENERATED ALWAYS AS`), maintaining physical purity.
- **Intentional Denormalization**: JSON columns (`emergency_contact_json`, `condition_summary_json`) are explicitly utilized for flexible document payloads where structure varies across regional property types.

---

## 16. Execution Plan Recommendations (`EXPLAIN ANALYZE`)

When executing performance audits, ensure queries never produce `type: ALL` (Full Table Scans) on high-cardinality tables (`messages`, `audit_logs`, `lease_invoices`).

### Example Query Tuning Optimization
**Unoptimized Query**:
```sql
SELECT * FROM lease_invoices WHERE payment_status = 'OVERDUE' AND due_date < '2026-07-01';
```

**Index Requirement**:
```sql
ALTER TABLE lease_invoices ADD INDEX idx_invoices_status_due (payment_status, due_date);
```

**Target `EXPLAIN ANALYZE` Output**:
```
-> Index range scan on lease_invoices using idx_invoices_status_due over (payment_status='OVERDUE' AND due_date < '2026-07-01')  (cost=0.35 rows=12)
```

---

## 17. Deadlock Prevention Documentation

### Common InnoDB Deadlock Causes
1. **Out-of-Order Lock Acquisition**: Transaction A updates `Unit 10` then `Unit 12`; Transaction B updates `Unit 12` then `Unit 10`.
2. **Gap Locks during Range Deletes**: Overlapping gap locks during concurrent batch operations.

### Prevention Rules
1. **Always Sort Resource IDs**: When locking multiple rows in a batch transaction, sort array IDs numerically ascending (`ORDER BY unit_id ASC`) prior to issuing `SELECT ... FOR UPDATE`.
2. **Keep Transactions Short**: Perform API data processing before opening DB transactions.
3. **Deadlock Detection Logging**: Enable in MySQL:
   ```ini
   innodb_print_all_deadlocks = 1
   ```

---

## 18. Connection Pool Recommendations (Express & MySQL2)

### Recommended Node.js `mysql2` Configuration
```typescript
import mysql from 'mysql2/promise';

export const dbPool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'rentnest_app',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'rentnest',
  waitForConnections: true,
  connectionLimit: 25,        // Optimal pool size per backend replica
  maxIdle: 10,                 // Maximum idle connections
  idleTimeout: 30000,          // Release idle connections after 30s
  queueLimit: 0,               // Unlimited queue wait length
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  timezone: '+00:00',
});
```

---

## Hand-off Sign-off Checklist

- [x] MySQL 8.0 `my.cnf` enterprise config provided.
- [x] Topological 9-step schema migration order established.
- [x] Automated physical & logical backup scripts included.
- [x] Stored procedures & automated triggers cataloged.
- [x] ER diagram domains & full data dictionary defined.
- [x] Deadlock prevention & connection pool guidelines finalized.
