-- Adoption guard: baseline 1 only after recognizing the canonical existing schema.
-- This callback does not modify application tables or rows.
DELIMITER $$
DROP PROCEDURE IF EXISTS rentnest_check_flyway_baseline$$
CREATE PROCEDURE rentnest_check_flyway_baseline()
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.TABLES
      WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='socket_messages') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Legacy socket_messages exists; review and consolidate chat data before baselining';
  END IF;
  IF (SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE()
      AND ENGINE='InnoDB' AND TABLE_NAME IN ('users','listings','listing_photos',
      'amenities','listing_amenities','bookings','favorites','inquiries','messages',
      'payments','admin_actions')) <> 11 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Baseline requires the eleven existing canonical RentNest tables';
  END IF;
  IF EXISTS (
    SELECT 1 FROM (
      SELECT 'users' AS table_name, 'id' AS column_name, 'int' AS data_type
      UNION ALL SELECT 'users' AS table_name, 'username' AS column_name, 'varchar' AS data_type
      UNION ALL SELECT 'users' AS table_name, 'email' AS column_name, 'varchar' AS data_type
      UNION ALL SELECT 'users' AS table_name, 'password_hash' AS column_name, 'char' AS data_type
      UNION ALL SELECT 'users' AS table_name, 'role' AS column_name, 'enum' AS data_type
      UNION ALL SELECT 'users' AS table_name, 'created_at' AS column_name, 'timestamp' AS data_type
      UNION ALL SELECT 'users' AS table_name, 'status' AS column_name, 'enum' AS data_type
      UNION ALL SELECT 'users' AS table_name, 'active' AS column_name, 'tinyint' AS data_type
      UNION ALL SELECT 'listings' AS table_name, 'id' AS column_name, 'int' AS data_type
      UNION ALL SELECT 'listings' AS table_name, 'owner_id' AS column_name, 'int' AS data_type
      UNION ALL SELECT 'listings' AS table_name, 'title' AS column_name, 'varchar' AS data_type
      UNION ALL SELECT 'listings' AS table_name, 'listing_type' AS column_name, 'enum' AS data_type
      UNION ALL SELECT 'listings' AS table_name, 'location' AS column_name, 'varchar' AS data_type
      UNION ALL SELECT 'listings' AS table_name, 'description' AS column_name, 'text' AS data_type
      UNION ALL SELECT 'listings' AS table_name, 'price_month' AS column_name, 'decimal' AS data_type
      UNION ALL SELECT 'listings' AS table_name, 'deposit' AS column_name, 'decimal' AS data_type
      UNION ALL SELECT 'listings' AS table_name, 'size_sqft' AS column_name, 'int' AS data_type
      UNION ALL SELECT 'listings' AS table_name, 'bedrooms' AS column_name, 'tinyint' AS data_type
      UNION ALL SELECT 'listings' AS table_name, 'bathrooms' AS column_name, 'tinyint' AS data_type
      UNION ALL SELECT 'listings' AS table_name, 'furnished' AS column_name, 'tinyint' AS data_type
      UNION ALL SELECT 'listings' AS table_name, 'bachelor_allowed' AS column_name, 'tinyint' AS data_type
      UNION ALL SELECT 'listings' AS table_name, 'family_allowed' AS column_name, 'tinyint' AS data_type
      UNION ALL SELECT 'listings' AS table_name, 'approval_status' AS column_name, 'enum' AS data_type
      UNION ALL SELECT 'listings' AS table_name, 'is_available' AS column_name, 'tinyint' AS data_type
      UNION ALL SELECT 'listings' AS table_name, 'created_at' AS column_name, 'timestamp' AS data_type
      UNION ALL SELECT 'listings' AS table_name, 'updated_at' AS column_name, 'timestamp' AS data_type
      UNION ALL SELECT 'listing_photos' AS table_name, 'id' AS column_name, 'int' AS data_type
      UNION ALL SELECT 'listing_photos' AS table_name, 'listing_id' AS column_name, 'int' AS data_type
      UNION ALL SELECT 'listing_photos' AS table_name, 'url' AS column_name, 'varchar' AS data_type
      UNION ALL SELECT 'listing_photos' AS table_name, 'is_primary' AS column_name, 'tinyint' AS data_type
      UNION ALL SELECT 'listing_photos' AS table_name, 'sort_order' AS column_name, 'int' AS data_type
      UNION ALL SELECT 'listing_photos' AS table_name, 'created_at' AS column_name, 'timestamp' AS data_type
      UNION ALL SELECT 'amenities' AS table_name, 'id' AS column_name, 'int' AS data_type
      UNION ALL SELECT 'amenities' AS table_name, 'code' AS column_name, 'varchar' AS data_type
      UNION ALL SELECT 'amenities' AS table_name, 'name' AS column_name, 'varchar' AS data_type
      UNION ALL SELECT 'listing_amenities' AS table_name, 'listing_id' AS column_name, 'int' AS data_type
      UNION ALL SELECT 'listing_amenities' AS table_name, 'amenity_id' AS column_name, 'int' AS data_type
      UNION ALL SELECT 'bookings' AS table_name, 'id' AS column_name, 'int' AS data_type
      UNION ALL SELECT 'bookings' AS table_name, 'listing_id' AS column_name, 'int' AS data_type
      UNION ALL SELECT 'bookings' AS table_name, 'renter_id' AS column_name, 'int' AS data_type
      UNION ALL SELECT 'bookings' AS table_name, 'owner_id' AS column_name, 'int' AS data_type
      UNION ALL SELECT 'bookings' AS table_name, 'start_date' AS column_name, 'date' AS data_type
      UNION ALL SELECT 'bookings' AS table_name, 'end_date' AS column_name, 'date' AS data_type
      UNION ALL SELECT 'bookings' AS table_name, 'total_amount' AS column_name, 'decimal' AS data_type
      UNION ALL SELECT 'bookings' AS table_name, 'status' AS column_name, 'enum' AS data_type
      UNION ALL SELECT 'bookings' AS table_name, 'created_at' AS column_name, 'timestamp' AS data_type
      UNION ALL SELECT 'favorites' AS table_name, 'id' AS column_name, 'int' AS data_type
      UNION ALL SELECT 'favorites' AS table_name, 'user_id' AS column_name, 'int' AS data_type
      UNION ALL SELECT 'favorites' AS table_name, 'listing_id' AS column_name, 'int' AS data_type
      UNION ALL SELECT 'favorites' AS table_name, 'created_at' AS column_name, 'timestamp' AS data_type
      UNION ALL SELECT 'inquiries' AS table_name, 'id' AS column_name, 'int' AS data_type
      UNION ALL SELECT 'inquiries' AS table_name, 'listing_id' AS column_name, 'int' AS data_type
      UNION ALL SELECT 'inquiries' AS table_name, 'renter_id' AS column_name, 'int' AS data_type
      UNION ALL SELECT 'inquiries' AS table_name, 'message' AS column_name, 'text' AS data_type
      UNION ALL SELECT 'inquiries' AS table_name, 'contact' AS column_name, 'varchar' AS data_type
      UNION ALL SELECT 'inquiries' AS table_name, 'status' AS column_name, 'enum' AS data_type
      UNION ALL SELECT 'inquiries' AS table_name, 'created_at' AS column_name, 'timestamp' AS data_type
      UNION ALL SELECT 'messages' AS table_name, 'id' AS column_name, 'int' AS data_type
      UNION ALL SELECT 'messages' AS table_name, 'listing_id' AS column_name, 'int' AS data_type
      UNION ALL SELECT 'messages' AS table_name, 'sender_id' AS column_name, 'int' AS data_type
      UNION ALL SELECT 'messages' AS table_name, 'receiver_id' AS column_name, 'int' AS data_type
      UNION ALL SELECT 'messages' AS table_name, 'message_text' AS column_name, 'text' AS data_type
      UNION ALL SELECT 'messages' AS table_name, 'timestamp' AS column_name, 'datetime' AS data_type
      UNION ALL SELECT 'payments' AS table_name, 'id' AS column_name, 'int' AS data_type
      UNION ALL SELECT 'payments' AS table_name, 'booking_id' AS column_name, 'int' AS data_type
      UNION ALL SELECT 'payments' AS table_name, 'amount' AS column_name, 'double' AS data_type
      UNION ALL SELECT 'payments' AS table_name, 'payment_date' AS column_name, 'timestamp' AS data_type
      UNION ALL SELECT 'admin_actions' AS table_name, 'id' AS column_name, 'int' AS data_type
      UNION ALL SELECT 'admin_actions' AS table_name, 'admin_id' AS column_name, 'int' AS data_type
      UNION ALL SELECT 'admin_actions' AS table_name, 'action_type' AS column_name, 'varchar' AS data_type
      UNION ALL SELECT 'admin_actions' AS table_name, 'target_id' AS column_name, 'int' AS data_type
      UNION ALL SELECT 'admin_actions' AS table_name, 'details' AS column_name, 'text' AS data_type
      UNION ALL SELECT 'admin_actions' AS table_name, 'created_at' AS column_name, 'timestamp' AS data_type
    ) expected LEFT JOIN information_schema.COLUMNS actual
      ON actual.TABLE_SCHEMA=DATABASE() AND actual.TABLE_NAME=expected.table_name
      AND actual.COLUMN_NAME=expected.column_name AND actual.DATA_TYPE=expected.data_type
    WHERE actual.COLUMN_NAME IS NULL
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Baseline column names/types differ from V1; compare schema before adoption';
  END IF;
  IF (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND (
       (TABLE_NAME='users' AND COLUMN_NAME='role' AND BINARY COLUMN_TYPE='enum(''RENTER'',''OWNER'',''ADMIN'')')
    OR (TABLE_NAME='users' AND COLUMN_NAME='status' AND BINARY COLUMN_TYPE='enum(''ACTIVE'',''BANNED'')')
    OR (TABLE_NAME='listings' AND COLUMN_NAME='listing_type' AND BINARY COLUMN_TYPE='enum(''ROOM'',''FLAT'',''APARTMENT'',''OFFICE'',''PARKING'')')
    OR (TABLE_NAME='listings' AND COLUMN_NAME='approval_status' AND BINARY COLUMN_TYPE='enum(''PENDING'',''APPROVED'',''REJECTED'')')
    OR (TABLE_NAME='bookings' AND COLUMN_NAME='status' AND BINARY COLUMN_TYPE='enum(''PENDING'',''PENDING_OWNER_APPROVAL'',''CONFIRMED'',''CANCELLED'',''APPROVED'',''REJECTED'')')
    OR (TABLE_NAME='inquiries' AND COLUMN_NAME='status' AND BINARY COLUMN_TYPE='enum(''Pending'',''Replied'',''Closed'')')
  )) <> 6 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Baseline enum values differ from the canonical schema; review first';
  END IF;
END$$
CALL rentnest_check_flyway_baseline()$$
DROP PROCEDURE rentnest_check_flyway_baseline$$
DELIMITER ;