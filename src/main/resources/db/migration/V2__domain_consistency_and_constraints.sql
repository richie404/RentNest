-- V2: Phase 2 constraints and indexes; preserves all existing rows.
-- Guards also support installations that previously applied Phase 2 manually.
-- Flyway history/checksums provide once-only execution. Do not edit after deployment.
DELIMITER $$
DROP PROCEDURE IF EXISTS rentnest_phase2_consistency$$
CREATE PROCEDURE rentnest_phase2_consistency()
BEGIN
  DECLARE version_number INT;
  SET version_number = CAST(SUBSTRING_INDEX(VERSION(), '.', 1) AS UNSIGNED)*10000
    + CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(VERSION(), '.', 2), '.', -1) AS UNSIGNED)*100
    + CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(SUBSTRING_INDEX(VERSION(), '-', 1), '.', 3), '.', -1) AS UNSIGNED);
  IF DATABASE() IS NULL OR @@foreign_key_checks <> 1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Select the target database and enable foreign_key_checks first';
  END IF;
  IF (VERSION() LIKE '%MariaDB%' AND version_number < 100201)
     OR (VERSION() NOT LIKE '%MariaDB%' AND version_number < 80016) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='An engine that enforces CHECK constraints is required';
  END IF;
  IF (SELECT COUNT(*) FROM information_schema.TABLES
      WHERE TABLE_SCHEMA=DATABASE() AND ENGINE='InnoDB' AND TABLE_NAME IN
      ('users','listings','listing_photos','amenities','listing_amenities','bookings',
       'favorites','inquiries','messages','payments','admin_actions')) <> 11 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Expected eleven canonical InnoDB tables; review schema first';
  END IF;
  IF EXISTS (SELECT 1 FROM bookings WHERE start_date IS NULL OR end_date IS NULL
      OR start_date < '1000-01-01' OR end_date < start_date OR total_amount IS NULL
      OR total_amount < 0 OR status IS NULL OR status='')
     OR EXISTS (SELECT 1 FROM inquiries WHERE status IS NULL OR status='')
     OR EXISTS (SELECT 1 FROM users WHERE role='' OR active NOT IN (0,1)
       OR NOT ((active=1 AND status='ACTIVE') OR (active=0 AND status='BANNED')))
     OR EXISTS (SELECT 1 FROM listings WHERE listing_type='' OR approval_status='')
     OR EXISTS (SELECT 1 FROM payments WHERE amount < 0)
     OR EXISTS (SELECT listing_id FROM listing_photos WHERE is_primary=1
                GROUP BY listing_id HAVING COUNT(*)>1) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Existing data violates Phase 2 rules; inspect diagnostics in phase2-consistency.md';
  END IF;
  -- Refuse unexpected enum definitions instead of silently dropping/reinterpreting values.
  IF (SELECT COLUMN_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE()
       AND TABLE_NAME='bookings' AND COLUMN_NAME='status') <>
       'enum(''PENDING'',''PENDING_OWNER_APPROVAL'',''CONFIRMED'',''CANCELLED'',''APPROVED'',''REJECTED'')'
     OR (SELECT COLUMN_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE()
       AND TABLE_NAME='inquiries' AND COLUMN_NAME='status') <> 'enum(''Pending'',''Replied'',''Closed'')' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Unexpected booking/inquiry enum definition; review before migration';
  END IF;

  ALTER TABLE bookings
    MODIFY start_date DATE NOT NULL,
    MODIFY end_date DATE NOT NULL,
    MODIFY total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    MODIFY status ENUM('PENDING','PENDING_OWNER_APPROVAL','CONFIRMED','CANCELLED','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING';
  ALTER TABLE inquiries MODIFY status ENUM('Pending','Replied','Closed') NOT NULL DEFAULT 'Pending';

  IF NOT EXISTS (SELECT 1 FROM information_schema.TABLE_CONSTRAINTS
      WHERE CONSTRAINT_SCHEMA=DATABASE() AND TABLE_NAME='users' AND CONSTRAINT_NAME='chk_users_role') THEN
    ALTER TABLE users ADD CONSTRAINT chk_users_role CHECK (role <> '');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.TABLE_CONSTRAINTS
      WHERE CONSTRAINT_SCHEMA=DATABASE() AND TABLE_NAME='users' AND CONSTRAINT_NAME='chk_users_account_state') THEN
    ALTER TABLE users ADD CONSTRAINT chk_users_account_state CHECK (active IN (0,1) AND ((active=1 AND status='ACTIVE') OR (active=0 AND status='BANNED')));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.TABLE_CONSTRAINTS
      WHERE CONSTRAINT_SCHEMA=DATABASE() AND TABLE_NAME='listings' AND CONSTRAINT_NAME='chk_listings_type_value') THEN
    ALTER TABLE listings ADD CONSTRAINT chk_listings_type_value CHECK (listing_type IS NULL OR listing_type <> '');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.TABLE_CONSTRAINTS
      WHERE CONSTRAINT_SCHEMA=DATABASE() AND TABLE_NAME='listings' AND CONSTRAINT_NAME='chk_listings_approval_value') THEN
    ALTER TABLE listings ADD CONSTRAINT chk_listings_approval_value CHECK (approval_status <> '');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.TABLE_CONSTRAINTS
      WHERE CONSTRAINT_SCHEMA=DATABASE() AND TABLE_NAME='bookings' AND CONSTRAINT_NAME='chk_bookings_status_value') THEN
    ALTER TABLE bookings ADD CONSTRAINT chk_bookings_status_value CHECK (status <> '');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.TABLE_CONSTRAINTS
      WHERE CONSTRAINT_SCHEMA=DATABASE() AND TABLE_NAME='bookings' AND CONSTRAINT_NAME='chk_bookings_dates') THEN
    ALTER TABLE bookings ADD CONSTRAINT chk_bookings_dates CHECK (start_date >= '1000-01-01' AND end_date >= start_date);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.TABLE_CONSTRAINTS
      WHERE CONSTRAINT_SCHEMA=DATABASE() AND TABLE_NAME='bookings' AND CONSTRAINT_NAME='chk_bookings_amount') THEN
    ALTER TABLE bookings ADD CONSTRAINT chk_bookings_amount CHECK (total_amount >= 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.TABLE_CONSTRAINTS
      WHERE CONSTRAINT_SCHEMA=DATABASE() AND TABLE_NAME='inquiries' AND CONSTRAINT_NAME='chk_inquiries_status_value') THEN
    ALTER TABLE inquiries ADD CONSTRAINT chk_inquiries_status_value CHECK (status <> '');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.TABLE_CONSTRAINTS
      WHERE CONSTRAINT_SCHEMA=DATABASE() AND TABLE_NAME='payments' AND CONSTRAINT_NAME='chk_payments_amount') THEN
    ALTER TABLE payments ADD CONSTRAINT chk_payments_amount CHECK (amount >= 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='listing_photos' AND COLUMN_NAME='primary_listing_id') THEN
    ALTER TABLE listing_photos ADD COLUMN primary_listing_id INT
      GENERATED ALWAYS AS (CASE WHEN is_primary=1 THEN listing_id ELSE NULL END) VIRTUAL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='listing_photos' AND INDEX_NAME='uq_listing_photos_one_primary') THEN
    ALTER TABLE listing_photos ADD UNIQUE INDEX uq_listing_photos_one_primary (primary_listing_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='bookings' AND INDEX_NAME='idx_bookings_availability') THEN
    ALTER TABLE bookings ADD INDEX idx_bookings_availability (listing_id, status, start_date, end_date);
  END IF;
  -- The composite retains the old index's left prefix, including FK support.
  IF EXISTS (SELECT 1 FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='bookings' AND INDEX_NAME='idx_bookings_listing') THEN
    ALTER TABLE bookings DROP INDEX idx_bookings_listing;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='bookings' AND INDEX_NAME='idx_bookings_renter_created') THEN
    ALTER TABLE bookings ADD INDEX idx_bookings_renter_created (renter_id, created_at);
  END IF;
  -- The composite retains the old index's left prefix, including FK support.
  IF EXISTS (SELECT 1 FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='bookings' AND INDEX_NAME='idx_bookings_renter') THEN
    ALTER TABLE bookings DROP INDEX idx_bookings_renter;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='bookings' AND INDEX_NAME='idx_bookings_owner_created') THEN
    ALTER TABLE bookings ADD INDEX idx_bookings_owner_created (owner_id, created_at);
  END IF;
  -- The composite retains the old index's left prefix, including FK support.
  IF EXISTS (SELECT 1 FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='bookings' AND INDEX_NAME='idx_bookings_owner') THEN
    ALTER TABLE bookings DROP INDEX idx_bookings_owner;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='messages' AND INDEX_NAME='idx_messages_conversation') THEN
    ALTER TABLE messages ADD INDEX idx_messages_conversation (sender_id, receiver_id, listing_id, timestamp);
  END IF;
  -- The composite retains the old index's left prefix, including FK support.
  IF EXISTS (SELECT 1 FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='messages' AND INDEX_NAME='idx_messages_sender_receiver') THEN
    ALTER TABLE messages DROP INDEX idx_messages_sender_receiver;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='messages' AND INDEX_NAME='idx_messages_receiver_time') THEN
    ALTER TABLE messages ADD INDEX idx_messages_receiver_time (receiver_id, timestamp);
  END IF;
  -- The composite retains the old index's left prefix, including FK support.
  IF EXISTS (SELECT 1 FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='messages' AND INDEX_NAME='idx_messages_receiver') THEN
    ALTER TABLE messages DROP INDEX idx_messages_receiver;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='inquiries' AND INDEX_NAME='idx_inquiries_listing_status') THEN
    ALTER TABLE inquiries ADD INDEX idx_inquiries_listing_status (listing_id, status);
  END IF;
  -- The composite retains the old index's left prefix, including FK support.
  IF EXISTS (SELECT 1 FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='inquiries' AND INDEX_NAME='idx_inquiries_listing') THEN
    ALTER TABLE inquiries DROP INDEX idx_inquiries_listing;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='inquiries' AND INDEX_NAME='idx_inquiries_renter_created') THEN
    ALTER TABLE inquiries ADD INDEX idx_inquiries_renter_created (renter_id, created_at);
  END IF;
  -- The composite retains the old index's left prefix, including FK support.
  IF EXISTS (SELECT 1 FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='inquiries' AND INDEX_NAME='idx_inquiries_renter') THEN
    ALTER TABLE inquiries DROP INDEX idx_inquiries_renter;
  END IF;
END$$
CALL rentnest_phase2_consistency()$$
DROP PROCEDURE rentnest_phase2_consistency$$
DELIMITER ;
