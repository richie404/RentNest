-- ==============================================================================
-- RentNest Platform: Enterprise Extended Schema (MySQL 8)
-- Architecture: 41 Base Entities + 22 Enterprise Module Extension Tables (63 Total)
-- Fully Backward-Compatible Extension Preserving All Existing Schema Definitions
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- ==============================================================================
-- 1. BASE REFERENCE & LOOKUP TABLES
-- ==============================================================================

DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
    `role_id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `role_name` VARCHAR(50) NOT NULL,
    `description` VARCHAR(255) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `unq_roles_name` UNIQUE (`role_name`),
    CONSTRAINT `chk_roles_name` CHECK (`role_name` IN ('ROLE_TENANT', 'ROLE_PROPERTY_OWNER', 'ROLE_PROPERTY_MANAGER', 'ROLE_VENDOR', 'ROLE_ADMIN'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions` (
    `permission_id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `permission_code` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `unq_permissions_code` UNIQUE (`permission_code`),
    CONSTRAINT `chk_permissions_format` CHECK (`permission_code` REGEXP '^[a-z0-9_]+:[a-z0-9_]+$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `amenities`;
CREATE TABLE `amenities` (
    `amenity_id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `amenity_name` VARCHAR(100) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `icon_url` VARCHAR(255) NULL,
    CONSTRAINT `unq_amenities_name` UNIQUE (`amenity_name`),
    CONSTRAINT `chk_amenities_category` CHECK (`category` IN ('BUILDING', 'UNIT', 'SAFETY', 'OUTDOOR')),
    INDEX `idx_amenities_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `platform_settings`;
CREATE TABLE `platform_settings` (
    `setting_key` VARCHAR(100) PRIMARY KEY,
    `setting_value` TEXT NOT NULL,
    `data_type` VARCHAR(20) NOT NULL DEFAULT 'STRING',
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `chk_settings_datatype` CHECK (`data_type` IN ('STRING', 'INT', 'DECIMAL', 'BOOLEAN'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ==============================================================================
-- 2. USER IDENTITY & RBAC SUB-DOMAIN
-- ==============================================================================

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `user_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `phone_number` VARCHAR(30) NULL,
    `account_status` VARCHAR(20) NOT NULL DEFAULT 'UNVERIFIED',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `unq_users_email` UNIQUE (`email`),
    CONSTRAINT `chk_users_email_format` CHECK (`email` REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
    CONSTRAINT `chk_users_phone_format` CHECK (`phone_number` IS NULL OR `phone_number` REGEXP '^[+]?[0-9]{7,15}$'),
    CONSTRAINT `chk_users_status` CHECK (`account_status` IN ('ACTIVE', 'SUSPENDED', 'UNVERIFIED')),
    INDEX `idx_users_status` (`account_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `user_profiles`;
CREATE TABLE `user_profiles` (
    `profile_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `date_of_birth` DATE NULL,
    `ssn_tax_id_hash` VARCHAR(255) NULL,
    `avatar_url` VARCHAR(512) NULL,
    `emergency_contact_json` JSON NULL,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `unq_user_profiles_user_id` UNIQUE (`user_id`),
    CONSTRAINT `unq_user_profiles_ssn` UNIQUE (`ssn_tax_id_hash`),
    CONSTRAINT `chk_user_profiles_dob` CHECK (`date_of_birth` IS NULL OR `date_of_birth` <= CURRENT_DATE),
    CONSTRAINT `fk_user_profiles_user` FOREIGN KEY (`user_id`) 
        REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX `idx_profiles_name` (`last_name`, `first_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `user_roles`;
CREATE TABLE `user_roles` (
    `user_id` BIGINT UNSIGNED NOT NULL,
    `role_id` INT UNSIGNED NOT NULL,
    `assigned_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`, `role_id`),
    CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`) 
        REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_user_roles_role` FOREIGN KEY (`role_id`) 
        REFERENCES `roles` (`role_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_user_roles_role` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `role_permissions`;
CREATE TABLE `role_permissions` (
    `role_id` INT UNSIGNED NOT NULL,
    `permission_id` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`role_id`, `permission_id`),
    CONSTRAINT `fk_role_permissions_role` FOREIGN KEY (`role_id`) 
        REFERENCES `roles` (`role_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_role_permissions_permission` FOREIGN KEY (`permission_id`) 
        REFERENCES `permissions` (`permission_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX `idx_role_permissions_permission` (`permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ==============================================================================
-- 3. PROPERTY & UNIT PORTFOLIO SUB-DOMAIN
-- ==============================================================================

DROP TABLE IF EXISTS `properties`;
CREATE TABLE `properties` (
    `property_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `owner_id` BIGINT UNSIGNED NOT NULL,
    `property_name` VARCHAR(150) NOT NULL,
    `property_type` VARCHAR(50) NOT NULL,
    `street_address` VARCHAR(255) NOT NULL,
    `city` VARCHAR(100) NOT NULL,
    `state_province` VARCHAR(100) NOT NULL,
    `postal_code` VARCHAR(20) NOT NULL,
    `country` VARCHAR(100) NOT NULL DEFAULT 'USA',
    `year_built` INT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `unq_properties_address` UNIQUE (`street_address`, `postal_code`),
    CONSTRAINT `chk_properties_type` CHECK (`property_type` IN ('SINGLE_FAMILY', 'MULTI_FAMILY', 'APARTMENT_COMPLEX', 'COMMERCIAL')),
    CONSTRAINT `chk_properties_year` CHECK (`year_built` IS NULL OR (`year_built` BETWEEN 1700 AND YEAR(CURRENT_DATE))),
    CONSTRAINT `fk_properties_owner` FOREIGN KEY (`owner_id`) 
        REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_properties_owner` (`owner_id`),
    INDEX `idx_properties_location` (`city`, `state_province`),
    FULLTEXT INDEX `ft_properties_search` (`property_name`, `street_address`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `units`;
CREATE TABLE `units` (
    `unit_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `property_id` BIGINT UNSIGNED NOT NULL,
    `unit_number` VARCHAR(30) NOT NULL,
    `square_feet` DECIMAL(8,2) NULL,
    `bedrooms` INT NOT NULL DEFAULT 1,
    `bathrooms` DECIMAL(3,1) NOT NULL DEFAULT 1.0,
    `max_occupancy` INT NOT NULL DEFAULT 2,
    `floor_level` INT NULL,
    `target_rent` DECIMAL(10,2) NOT NULL,
    `security_deposit_target` DECIMAL(10,2) NOT NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'USD',
    `status` VARCHAR(30) NOT NULL DEFAULT 'VACANT',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `unq_units_property_number` UNIQUE (`property_id`, `unit_number`),
    CONSTRAINT `chk_units_rent` CHECK (`target_rent` > 0.00),
    CONSTRAINT `chk_units_deposit` CHECK (`security_deposit_target` >= 0.00),
    CONSTRAINT `chk_units_sqft` CHECK (`square_feet` IS NULL OR `square_feet` > 0.00),
    CONSTRAINT `chk_units_beds` CHECK (`bedrooms` >= 0),
    CONSTRAINT `chk_units_baths` CHECK (`bathrooms` >= 0.0),
    CONSTRAINT `chk_units_occupancy` CHECK (`max_occupancy` >= 1 AND `max_occupancy` >= `bedrooms`),
    CONSTRAINT `chk_units_currency` CHECK (`currency` IN ('USD', 'EUR', 'GBP', 'CAD', 'AUD')),
    CONSTRAINT `chk_units_status` CHECK (`status` IN ('VACANT', 'OCCUPIED', 'UNDER_MAINTENANCE', 'RESERVED')),
    CONSTRAINT `fk_units_property` FOREIGN KEY (`property_id`) 
        REFERENCES `properties` (`property_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_units_property_status` (`property_id`, `status`),
    INDEX `idx_units_search` (`status`, `target_rent`, `bedrooms`, `bathrooms`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `property_amenities`;
CREATE TABLE `property_amenities` (
    `property_id` BIGINT UNSIGNED NOT NULL,
    `amenity_id` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`property_id`, `amenity_id`),
    CONSTRAINT `fk_prop_amenities_property` FOREIGN KEY (`property_id`) 
        REFERENCES `properties` (`property_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_prop_amenities_amenity` FOREIGN KEY (`amenity_id`) 
        REFERENCES `amenities` (`amenity_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_prop_amenities_amenity` (`amenity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `unit_amenities`;
CREATE TABLE `unit_amenities` (
    `unit_id` BIGINT UNSIGNED NOT NULL,
    `amenity_id` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`unit_id`, `amenity_id`),
    CONSTRAINT `fk_unit_amenities_unit` FOREIGN KEY (`unit_id`) 
        REFERENCES `units` (`unit_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_unit_amenities_amenity` FOREIGN KEY (`amenity_id`) 
        REFERENCES `amenities` (`amenity_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_unit_amenities_amenity` (`amenity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `property_media`;
CREATE TABLE `property_media` (
    `media_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `property_id` BIGINT UNSIGNED NULL,
    `unit_id` BIGINT UNSIGNED NULL,
    `media_type` VARCHAR(30) NOT NULL,
    `media_url` VARCHAR(512) NOT NULL,
    `display_order` INT NOT NULL DEFAULT 0,
    `is_primary` BOOLEAN NOT NULL DEFAULT FALSE,
    `uploaded_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `chk_media_type` CHECK (`media_type` IN ('IMAGE', 'FLOOR_PLAN', 'VIDEO_3D')),
    CONSTRAINT `chk_media_parent` CHECK (
        (`property_id` IS NOT NULL AND `unit_id` IS NULL) OR 
        (`property_id` IS NULL AND `unit_id` IS NOT NULL)
    ),
    CONSTRAINT `chk_media_order` CHECK (`display_order` >= 0),
    CONSTRAINT `fk_media_property` FOREIGN KEY (`property_id`) 
        REFERENCES `properties` (`property_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_media_unit` FOREIGN KEY (`unit_id`) 
        REFERENCES `units` (`unit_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX `idx_media_property` (`property_id`, `display_order`),
    INDEX `idx_media_unit` (`unit_id`, `display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `property_documents`;
CREATE TABLE `property_documents` (
    `document_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `property_id` BIGINT UNSIGNED NOT NULL,
    `document_type` VARCHAR(50) NOT NULL,
    `file_url` VARCHAR(512) NOT NULL,
    `uploaded_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `chk_doc_type` CHECK (`document_type` IN ('DEED', 'TAX_RECORD', 'OCCUPANCY_PERMIT', 'INSURANCE_POLICY')),
    CONSTRAINT `fk_documents_property` FOREIGN KEY (`property_id`) 
        REFERENCES `properties` (`property_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_documents_property` (`property_id`, `document_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ==============================================================================
-- 4. TENANT APPLICATION & SCREENING SUB-DOMAIN
-- ==============================================================================

DROP TABLE IF EXISTS `rental_applications`;
CREATE TABLE `rental_applications` (
    `application_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `unit_id` BIGINT UNSIGNED NOT NULL,
    `applicant_user_id` BIGINT UNSIGNED NOT NULL,
    `desired_move_in_date` DATE NOT NULL,
    `proposed_lease_months` INT NOT NULL DEFAULT 12,
    `declared_occupants_count` INT NOT NULL DEFAULT 1,
    `status` VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    `submitted_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `chk_app_status` CHECK (`status` IN ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'WITHDRAWN')),
    CONSTRAINT `chk_app_lease_months` CHECK (`proposed_lease_months` BETWEEN 1 AND 36),
    CONSTRAINT `chk_app_occupants` CHECK (`declared_occupants_count` >= 1),
    CONSTRAINT `chk_app_move_in` CHECK (`desired_move_in_date` >= CURRENT_DATE),
    CONSTRAINT `fk_app_unit` FOREIGN KEY (`unit_id`) 
        REFERENCES `units` (`unit_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_app_applicant` FOREIGN KEY (`applicant_user_id`) 
        REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_app_unit_status` (`unit_id`, `status`),
    INDEX `idx_app_applicant` (`applicant_user_id`, `submitted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `applicant_details`;
CREATE TABLE `applicant_details` (
    `applicant_detail_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `application_id` BIGINT UNSIGNED NOT NULL,
    `employer_name` VARCHAR(150) NULL,
    `job_title` VARCHAR(100) NULL,
    `verified_monthly_income` DECIMAL(10,2) NOT NULL,
    `declared_pets_count` INT NOT NULL DEFAULT 0,
    `vehicles_json` JSON NULL,
    CONSTRAINT `unq_applicant_details_app_id` UNIQUE (`application_id`),
    CONSTRAINT `chk_applicant_income` CHECK (`verified_monthly_income` >= 0.00),
    CONSTRAINT `chk_applicant_pets` CHECK (`declared_pets_count` >= 0),
    CONSTRAINT `fk_applicant_details_app` FOREIGN KEY (`application_id`) 
        REFERENCES `rental_applications` (`application_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `screening_reports`;
CREATE TABLE `screening_reports` (
    `screening_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `application_id` BIGINT UNSIGNED NOT NULL,
    `credit_score` INT NOT NULL,
    `credit_score_tier` VARCHAR(30) NOT NULL,
    `criminal_clearance` BOOLEAN NOT NULL DEFAULT TRUE,
    `eviction_history_flag` BOOLEAN NOT NULL DEFAULT FALSE,
    `third_party_reference_code` VARCHAR(100) NULL,
    `generated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `unq_screening_app_id` UNIQUE (`application_id`),
    CONSTRAINT `chk_screening_credit` CHECK (`credit_score` BETWEEN 300 AND 850),
    CONSTRAINT `chk_screening_tier` CHECK (`credit_score_tier` IN ('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'VERY_POOR')),
    CONSTRAINT `fk_screening_app` FOREIGN KEY (`application_id`) 
        REFERENCES `rental_applications` (`application_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `application_references`;
CREATE TABLE `application_references` (
    `reference_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `application_id` BIGINT UNSIGNED NOT NULL,
    `reference_type` VARCHAR(30) NOT NULL,
    `full_name` VARCHAR(150) NOT NULL,
    `contact_phone` VARCHAR(30) NULL,
    `contact_email` VARCHAR(255) NULL,
    `verification_status` VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    CONSTRAINT `chk_ref_type` CHECK (`reference_type` IN ('PAST_LANDLORD', 'EMPLOYER', 'PERSONAL')),
    CONSTRAINT `chk_ref_status` CHECK (`verification_status` IN ('PENDING', 'VERIFIED', 'FAILED')),
    CONSTRAINT `chk_ref_email_format` CHECK (`contact_email` IS NULL OR `contact_email` REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
    CONSTRAINT `chk_ref_phone_format` CHECK (`contact_phone` IS NULL OR `contact_phone` REGEXP '^[+]?[0-9]{7,15}$'),
    CONSTRAINT `fk_references_app` FOREIGN KEY (`application_id`) 
        REFERENCES `rental_applications` (`application_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX `idx_app_references_app` (`application_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ==============================================================================
-- 5. LEASE LIFECYCLE & INSPECTIONS SUB-DOMAIN
-- ==============================================================================

DROP TABLE IF EXISTS `leases`;
CREATE TABLE `leases` (
    `lease_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `unit_id` BIGINT UNSIGNED NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `monthly_base_rent` DECIMAL(10,2) NOT NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'USD',
    `due_day_of_month` INT NOT NULL DEFAULT 1,
    `grace_period_days` INT NOT NULL DEFAULT 5,
    `late_fee_type` VARCHAR(20) NOT NULL DEFAULT 'PERCENTAGE',
    `late_fee_value` DECIMAL(10,2) NOT NULL DEFAULT 5.00,
    `status` VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `chk_lease_dates` CHECK (`end_date` > `start_date`),
    CONSTRAINT `chk_lease_rent` CHECK (`monthly_base_rent` > 0.00),
    CONSTRAINT `chk_lease_currency` CHECK (`currency` IN ('USD', 'EUR', 'GBP', 'CAD', 'AUD')),
    CONSTRAINT `chk_lease_due_day` CHECK (`due_day_of_month` BETWEEN 1 AND 28),
    CONSTRAINT `chk_lease_grace_days` CHECK (`grace_period_days` BETWEEN 0 AND 15),
    CONSTRAINT `chk_lease_late_fee_type` CHECK (`late_fee_type` IN ('FLAT_FEE', 'PERCENTAGE')),
    CONSTRAINT `chk_lease_late_fee_val` CHECK (`late_fee_value` >= 0.00),
    CONSTRAINT `chk_lease_status` CHECK (`status` IN ('DRAFT', 'PENDING_SIGNATURE', 'ACTIVE', 'EXPIRED', 'TERMINATED')),
    CONSTRAINT `fk_leases_unit` FOREIGN KEY (`unit_id`) 
        REFERENCES `units` (`unit_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_leases_unit_status_dates` (`unit_id`, `status`, `start_date`, `end_date`),
    INDEX `idx_leases_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `lease_signers`;
CREATE TABLE `lease_signers` (
    `lease_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `signer_role` VARCHAR(30) NOT NULL DEFAULT 'PRIMARY_TENANT',
    `signed_at` TIMESTAMP NULL,
    PRIMARY KEY (`lease_id`, `user_id`),
    CONSTRAINT `chk_signer_role` CHECK (`signer_role` IN ('PRIMARY_TENANT', 'CO_TENANT', 'GUARANTOR')),
    CONSTRAINT `fk_lease_signers_lease` FOREIGN KEY (`lease_id`) 
        REFERENCES `leases` (`lease_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_lease_signers_user` FOREIGN KEY (`user_id`) 
        REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_lease_signers_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `lease_clauses`;
CREATE TABLE `lease_clauses` (
    `clause_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `lease_id` BIGINT UNSIGNED NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `clause_text` TEXT NOT NULL,
    CONSTRAINT `fk_clauses_lease` FOREIGN KEY (`lease_id`) 
        REFERENCES `leases` (`lease_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX `idx_clauses_lease` (`lease_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `lease_renewals`;
CREATE TABLE `lease_renewals` (
    `renewal_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `lease_id` BIGINT UNSIGNED NOT NULL,
    `offered_monthly_rent` DECIMAL(10,2) NOT NULL,
    `proposed_start_date` DATE NOT NULL,
    `proposed_end_date` DATE NOT NULL,
    `response_deadline` DATE NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'OFFERED',
    CONSTRAINT `chk_renewal_rent` CHECK (`offered_monthly_rent` > 0.00),
    CONSTRAINT `chk_renewal_dates` CHECK (`proposed_end_date` > `proposed_start_date`),
    CONSTRAINT `chk_renewal_deadline` CHECK (`response_deadline` <= `proposed_start_date`),
    CONSTRAINT `chk_renewal_status` CHECK (`status` IN ('OFFERED', 'ACCEPTED', 'DECLINED', 'COUNTERED')),
    CONSTRAINT `fk_renewals_lease` FOREIGN KEY (`lease_id`) 
        REFERENCES `leases` (`lease_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_renewals_lease_status` (`lease_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `move_inspections`;
CREATE TABLE `move_inspections` (
    `inspection_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `lease_id` BIGINT UNSIGNED NOT NULL,
    `inspector_user_id` BIGINT UNSIGNED NOT NULL,
    `inspection_type` VARCHAR(30) NOT NULL,
    `inspection_date` DATE NOT NULL,
    `condition_summary_json` JSON NOT NULL,
    `passed_flag` BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT `chk_inspection_type` CHECK (`inspection_type` IN ('MOVE_IN', 'MOVE_OUT', 'MID_TERM')),
    CONSTRAINT `fk_inspections_lease` FOREIGN KEY (`lease_id`) 
        REFERENCES `leases` (`lease_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_inspections_inspector` FOREIGN KEY (`inspector_user_id`) 
        REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_inspections_lease` (`lease_id`, `inspection_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ==============================================================================
-- 6. FINANCIAL LEDGER & BILLING SUB-DOMAIN
-- ==============================================================================

DROP TABLE IF EXISTS `lease_invoices`;
CREATE TABLE `lease_invoices` (
    `invoice_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `lease_id` BIGINT UNSIGNED NOT NULL,
    `billing_period_start` DATE NOT NULL,
    `billing_period_end` DATE NOT NULL,
    `due_date` DATE NOT NULL,
    `total_amount_due` DECIMAL(10,2) NOT NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'USD',
    `payment_status` VARCHAR(30) NOT NULL DEFAULT 'UNPAID',
    `generated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `billing_month` VARCHAR(7) GENERATED ALWAYS AS (DATE_FORMAT(`billing_period_start`, '%Y-%m')) STORED,
    CONSTRAINT `chk_invoice_period` CHECK (`billing_period_end` >= `billing_period_start`),
    CONSTRAINT `chk_invoice_due` CHECK (`due_date` >= `billing_period_start`),
    CONSTRAINT `chk_invoice_amount` CHECK (`total_amount_due` >= 0.00),
    CONSTRAINT `chk_invoice_currency` CHECK (`currency` IN ('USD', 'EUR', 'GBP', 'CAD', 'AUD')),
    CONSTRAINT `chk_invoice_status` CHECK (`payment_status` IN ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'VOID')),
    CONSTRAINT `fk_invoices_lease` FOREIGN KEY (`lease_id`) 
        REFERENCES `leases` (`lease_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_invoices_lease_status_due` (`lease_id`, `payment_status`, `due_date`),
    INDEX `idx_invoices_status_due` (`payment_status`, `due_date`),
    INDEX `idx_invoices_billing_month` (`billing_month`, `payment_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `invoice_items`;
CREATE TABLE `invoice_items` (
    `item_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `invoice_id` BIGINT UNSIGNED NOT NULL,
    `charge_type` VARCHAR(50) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `amount` DECIMAL(10,2) NOT NULL,
    CONSTRAINT `chk_item_type` CHECK (`charge_type` IN ('BASE_RENT', 'UTILITY_WATER', 'UTILITY_ELECTRIC', 'PARKING', 'LATE_FEE', 'MAINTENANCE')),
    CONSTRAINT `chk_item_amount` CHECK (`amount` >= 0.00),
    CONSTRAINT `fk_invoice_items_invoice` FOREIGN KEY (`invoice_id`) 
        REFERENCES `lease_invoices` (`invoice_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_invoice_items_invoice` (`invoice_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
    `payment_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `payer_user_id` BIGINT UNSIGNED NOT NULL,
    `payment_channel` VARCHAR(30) NOT NULL,
    `amount` DECIMAL(10,2) NOT NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'USD',
    `gateway_transaction_token` VARCHAR(255) NULL,
    `payment_status` VARCHAR(30) NOT NULL DEFAULT 'PROCESSING',
    `payment_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `unq_payments_gateway_token` UNIQUE (`gateway_transaction_token`),
    CONSTRAINT `chk_payment_channel` CHECK (`payment_channel` IN ('ACH', 'CREDIT_CARD', 'CHECK', 'WIRE')),
    CONSTRAINT `chk_payment_amount` CHECK (`amount` > 0.00),
    CONSTRAINT `chk_payment_currency` CHECK (`currency` IN ('USD', 'EUR', 'GBP', 'CAD', 'AUD')),
    CONSTRAINT `chk_payment_status` CHECK (`payment_status` IN ('PROCESSING', 'SETTLED', 'FAILED', 'REFUNDED')),
    CONSTRAINT `fk_payments_payer` FOREIGN KEY (`payer_user_id`) 
        REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_payments_payer_date` (`payer_user_id`, `payment_date`),
    INDEX `idx_payments_status` (`payment_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `payment_allocations`;
CREATE TABLE `payment_allocations` (
    `payment_id` BIGINT UNSIGNED NOT NULL,
    `item_id` BIGINT UNSIGNED NOT NULL,
    `allocated_amount` DECIMAL(10,2) NOT NULL,
    `allocated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`payment_id`, `item_id`),
    CONSTRAINT `chk_allocation_amount` CHECK (`allocated_amount` > 0.00),
    CONSTRAINT `fk_allocations_payment` FOREIGN KEY (`payment_id`) 
        REFERENCES `payments` (`payment_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_allocations_item` FOREIGN KEY (`item_id`) 
        REFERENCES `invoice_items` (`item_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_allocations_item` (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `security_deposits`;
CREATE TABLE `security_deposits` (
    `deposit_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `lease_id` BIGINT UNSIGNED NOT NULL,
    `inspection_id` BIGINT UNSIGNED NULL,
    `initial_deposit_amount` DECIMAL(10,2) NOT NULL,
    `deduction_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `refund_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `currency` CHAR(3) NOT NULL DEFAULT 'USD',
    `escrow_account_ref` VARCHAR(100) NULL,
    `settled_at` TIMESTAMP NULL,
    CONSTRAINT `chk_deposit_initial` CHECK (`initial_deposit_amount` >= 0.00),
    CONSTRAINT `chk_deposit_deduction` CHECK (`deduction_amount` >= 0.00),
    CONSTRAINT `chk_deposit_refund` CHECK (`refund_amount` >= 0.00),
    CONSTRAINT `chk_deposit_currency` CHECK (`currency` IN ('USD', 'EUR', 'GBP', 'CAD', 'AUD')),
    CONSTRAINT `chk_deposit_math` CHECK ((`deduction_amount` + `refund_amount`) <= `initial_deposit_amount`),
    CONSTRAINT `fk_deposits_lease` FOREIGN KEY (`lease_id`) 
        REFERENCES `leases` (`lease_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_deposits_inspection` FOREIGN KEY (`inspection_id`) 
        REFERENCES `move_inspections` (`inspection_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_deposits_lease` (`lease_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `owner_payouts`;
CREATE TABLE `owner_payouts` (
    `payout_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `owner_user_id` BIGINT UNSIGNED NOT NULL,
    `property_id` BIGINT UNSIGNED NOT NULL,
    `gross_revenue_collected` DECIMAL(12,2) NOT NULL,
    `management_fees_deducted` DECIMAL(10,2) NOT NULL,
    `maintenance_expenses_deducted` DECIMAL(10,2) NOT NULL,
    `net_payout_amount` DECIMAL(12,2) NOT NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'USD',
    `payout_status` VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    `payout_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `chk_payout_gross` CHECK (`gross_revenue_collected` >= 0.00),
    CONSTRAINT `chk_payout_mgmt_fee` CHECK (`management_fees_deducted` >= 0.00),
    CONSTRAINT `chk_payout_maint_exp` CHECK (`maintenance_expenses_deducted` >= 0.00),
    CONSTRAINT `chk_payout_currency` CHECK (`currency` IN ('USD', 'EUR', 'GBP', 'CAD', 'AUD')),
    CONSTRAINT `chk_payout_net` CHECK (`net_payout_amount` = (`gross_revenue_collected` - `management_fees_deducted` - `maintenance_expenses_deducted`)),
    CONSTRAINT `chk_payout_status` CHECK (`payout_status` IN ('PENDING', 'PROCESSING', 'DISBURSED', 'FAILED')),
    CONSTRAINT `fk_payouts_owner` FOREIGN KEY (`owner_user_id`) 
        REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_payouts_property` FOREIGN KEY (`property_id`) 
        REFERENCES `properties` (`property_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_payouts_owner_date` (`owner_user_id`, `payout_date`),
    INDEX `idx_payouts_property` (`property_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ==============================================================================
-- 7. MAINTENANCE WORK ORDERS & VENDOR SUB-DOMAIN
-- ==============================================================================

DROP TABLE IF EXISTS `vendors`;
CREATE TABLE `vendors` (
    `vendor_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `company_name` VARCHAR(150) NOT NULL,
    `trade_specialty` VARCHAR(100) NOT NULL,
    `license_number` VARCHAR(100) NULL,
    `insurance_expiry_date` DATE NULL,
    `average_rating` DECIMAL(3,2) NOT NULL DEFAULT 5.00,
    CONSTRAINT `unq_vendors_user_id` UNIQUE (`user_id`),
    CONSTRAINT `chk_vendor_rating` CHECK (`average_rating` BETWEEN 1.00 AND 5.00),
    CONSTRAINT `fk_vendors_user` FOREIGN KEY (`user_id`) 
        REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_vendors_specialty` (`trade_specialty`, `average_rating`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `maintenance_requests`;
CREATE TABLE `maintenance_requests` (
    `request_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `unit_id` BIGINT UNSIGNED NOT NULL,
    `reporter_user_id` BIGINT UNSIGNED NOT NULL,
    `assigned_vendor_id` BIGINT UNSIGNED NULL,
    `issue_category` VARCHAR(50) NOT NULL,
    `priority_level` VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    `permission_to_enter` BOOLEAN NOT NULL DEFAULT TRUE,
    `description` TEXT NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `chk_maint_priority` CHECK (`priority_level` IN ('LOW', 'MEDIUM', 'HIGH', 'EMERGENCY')),
    CONSTRAINT `chk_maint_status` CHECK (`status` IN ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    CONSTRAINT `fk_maint_unit` FOREIGN KEY (`unit_id`) 
        REFERENCES `units` (`unit_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_maint_reporter` FOREIGN KEY (`reporter_user_id`) 
        REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_maint_vendor` FOREIGN KEY (`assigned_vendor_id`) 
        REFERENCES `vendors` (`vendor_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_maint_vendor_status_priority` (`assigned_vendor_id`, `status`, `priority_level`),
    INDEX `idx_maint_unit_status` (`unit_id`, `status`),
    INDEX `idx_maint_reporter` (`reporter_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `maintenance_updates`;
CREATE TABLE `maintenance_updates` (
    `update_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `request_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `update_note` TEXT NOT NULL,
    `status_changed_to` VARCHAR(30) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_maint_updates_request` FOREIGN KEY (`request_id`) 
        REFERENCES `maintenance_requests` (`request_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_maint_updates_user` FOREIGN KEY (`user_id`) 
        REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_maint_updates_request` (`request_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `maintenance_expenses`;
CREATE TABLE `maintenance_expenses` (
    `expense_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `request_id` BIGINT UNSIGNED NOT NULL,
    `vendor_id` BIGINT UNSIGNED NOT NULL,
    `labor_cost` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `parts_cost` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `total_cost` DECIMAL(10,2) NOT NULL,
    `invoice_ref_url` VARCHAR(512) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `chk_expense_labor` CHECK (`labor_cost` >= 0.00),
    CONSTRAINT `chk_expense_parts` CHECK (`parts_cost` >= 0.00),
    CONSTRAINT `chk_expense_total` CHECK (`total_cost` = (`labor_cost` + `parts_cost`)),
    CONSTRAINT `fk_expenses_request` FOREIGN KEY (`request_id`) 
        REFERENCES `maintenance_requests` (`request_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_expenses_vendor` FOREIGN KEY (`vendor_id`) 
        REFERENCES `vendors` (`vendor_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_expenses_request` (`request_id`),
    INDEX `idx_expenses_vendor` (`vendor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ==============================================================================
-- 8. COMMUNICATION & QUALITY ASSURANCE SUB-DOMAIN
-- ==============================================================================

DROP TABLE IF EXISTS `conversations`;
CREATE TABLE `conversations` (
    `conversation_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `context_type` VARCHAR(50) NOT NULL,
    `context_id` BIGINT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `chk_conv_context` CHECK (`context_type` IN ('LEASE', 'APPLICATION', 'MAINTENANCE')),
    INDEX `idx_conversations_context` (`context_type`, `context_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
    `message_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `conversation_id` BIGINT UNSIGNED NOT NULL,
    `sender_user_id` BIGINT UNSIGNED NOT NULL,
    `message_body` TEXT NOT NULL,
    `attachment_url` VARCHAR(512) NULL,
    `sent_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_messages_conversation` FOREIGN KEY (`conversation_id`) 
        REFERENCES `conversations` (`conversation_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_messages_sender` FOREIGN KEY (`sender_user_id`) 
        REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_messages_conv_sent` (`conversation_id`, `sent_at`),
    FULLTEXT INDEX `ft_messages_body` (`message_body`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
    `review_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `lease_id` BIGINT UNSIGNED NOT NULL,
    `reviewer_user_id` BIGINT UNSIGNED NOT NULL,
    `reviewee_user_id` BIGINT UNSIGNED NOT NULL,
    `rating` INT NOT NULL,
    `review_text` TEXT NULL,
    `is_published` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `unq_reviews_lease_reviewer` UNIQUE (`lease_id`, `reviewer_user_id`),
    CONSTRAINT `chk_reviews_rating` CHECK (`rating` BETWEEN 1 AND 5),
    CONSTRAINT `chk_reviews_self` CHECK (`reviewer_user_id` <> `reviewee_user_id`),
    CONSTRAINT `fk_reviews_lease` FOREIGN KEY (`lease_id`) 
        REFERENCES `leases` (`lease_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_reviews_reviewer` FOREIGN KEY (`reviewer_user_id`) 
        REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_reviews_reviewee` FOREIGN KEY (`reviewee_user_id`) 
        REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_reviews_reviewee` (`reviewee_user_id`, `is_published`),
    FULLTEXT INDEX `ft_reviews_text` (`review_text`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `favorites`;
CREATE TABLE `favorites` (
    `user_id` BIGINT UNSIGNED NOT NULL,
    `unit_id` BIGINT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`, `unit_id`),
    CONSTRAINT `fk_favorites_user` FOREIGN KEY (`user_id`) 
        REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_favorites_unit` FOREIGN KEY (`unit_id`) 
        REFERENCES `units` (`unit_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX `idx_favorites_unit` (`unit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ==============================================================================
-- 9. GOVERNANCE & AI EXTENSIONS SUB-DOMAIN
-- ==============================================================================

DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
    `audit_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `actor_user_id` BIGINT UNSIGNED NULL,
    `action_type` VARCHAR(50) NOT NULL,
    `target_table` VARCHAR(100) NOT NULL,
    `record_key` VARCHAR(100) NOT NULL,
    `correlation_id` VARCHAR(64) NULL,
    `user_agent` VARCHAR(255) NULL,
    `pre_image_json` JSON NULL,
    `post_image_json` JSON NULL,
    `ip_address` VARCHAR(45) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `chk_audit_action` CHECK (`action_type` IN ('INSERT', 'UPDATE', 'DELETE', 'OVERRIDE')),
    CONSTRAINT `chk_audit_ip` CHECK (`ip_address` IS NULL OR `ip_address` REGEXP '^[0-9a-fA-F:.]+$'),
    CONSTRAINT `fk_audit_actor` FOREIGN KEY (`actor_user_id`) 
        REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX `idx_audit_actor_date` (`actor_user_id`, `created_at`),
    INDEX `idx_audit_target` (`target_table`, `record_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
    `notification_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `recipient_user_id` BIGINT UNSIGNED NOT NULL,
    `channel_type` VARCHAR(30) NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `message_body` TEXT NOT NULL,
    `delivery_status` VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    `sent_at` TIMESTAMP NULL,
    CONSTRAINT `chk_notification_channel` CHECK (`channel_type` IN ('EMAIL', 'SMS', 'IN_APP', 'PUSH')),
    CONSTRAINT `chk_notification_status` CHECK (`delivery_status` IN ('PENDING', 'SENT', 'FAILED')),
    CONSTRAINT `fk_notifications_recipient` FOREIGN KEY (`recipient_user_id`) 
        REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX `idx_notifications_user_status` (`recipient_user_id`, `delivery_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `ai_pricing_models`;
CREATE TABLE `ai_pricing_models` (
    `model_run_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `unit_id` BIGINT UNSIGNED NOT NULL,
    `demand_score` DECIMAL(5,2) NOT NULL,
    `suggested_monthly_rent` DECIMAL(10,2) NOT NULL,
    `confidence_score` DECIMAL(3,2) NOT NULL,
    `accepted_by_owner` BOOLEAN NOT NULL DEFAULT FALSE,
    `executed_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `chk_pricing_rent` CHECK (`suggested_monthly_rent` > 0.00),
    CONSTRAINT `chk_pricing_confidence` CHECK (`confidence_score` BETWEEN 0.00 AND 1.00),
    CONSTRAINT `fk_ai_pricing_unit` FOREIGN KEY (`unit_id`) 
        REFERENCES `units` (`unit_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX `idx_ai_pricing_unit_date` (`unit_id`, `executed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `ai_maintenance_triage`;
CREATE TABLE `ai_maintenance_triage` (
    `triage_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `request_id` BIGINT UNSIGNED NOT NULL,
    `predicted_category` VARCHAR(50) NOT NULL,
    `predicted_urgency` VARCHAR(20) NOT NULL,
    `nlp_confidence_rating` DECIMAL(3,2) NOT NULL,
    `evaluated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `unq_ai_triage_request_id` UNIQUE (`request_id`),
    CONSTRAINT `chk_triage_urgency` CHECK (`predicted_urgency` IN ('LOW', 'MEDIUM', 'HIGH', 'EMERGENCY')),
    CONSTRAINT `chk_triage_confidence` CHECK (`nlp_confidence_rating` BETWEEN 0.00 AND 1.00),
    CONSTRAINT `fk_ai_triage_request` FOREIGN KEY (`request_id`) 
        REFERENCES `maintenance_requests` (`request_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ==============================================================================
-- 10. NEW ENTERPRISE EXTENSION MODULES (22 NEW TABLES)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- MODULE 1: MULTIPLE PROPERTY OWNERSHIP & EQUITY TRANSFERS
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `property_owners`;
CREATE TABLE `property_owners` (
    `property_id` BIGINT UNSIGNED NOT NULL,
    `owner_user_id` BIGINT UNSIGNED NOT NULL,
    `ownership_percentage` DECIMAL(5,2) NOT NULL,
    `effective_start_date` DATE NOT NULL,
    `effective_end_date` DATE NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (`property_id`, `owner_user_id`, `effective_start_date`),
    CONSTRAINT `chk_ownership_pct` CHECK (`ownership_percentage` > 0.00 AND `ownership_percentage` <= 100.00),
    CONSTRAINT `fk_prop_owners_prop` FOREIGN KEY (`property_id`) 
        REFERENCES `properties` (`property_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_prop_owners_user` FOREIGN KEY (`owner_user_id`) 
        REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_prop_owners_active` (`owner_user_id`, `is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `property_ownership_transfers`;
CREATE TABLE `property_ownership_transfers` (
    `transfer_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `property_id` BIGINT UNSIGNED NOT NULL,
    `seller_user_id` BIGINT UNSIGNED NOT NULL,
    `buyer_user_id` BIGINT UNSIGNED NOT NULL,
    `percentage_transferred` DECIMAL(5,2) NOT NULL,
    `transfer_price` DECIMAL(12,2) NOT NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'USD',
    `transfer_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `chk_transfer_pct` CHECK (`percentage_transferred` > 0.00 AND `percentage_transferred` <= 100.00),
    CONSTRAINT `chk_transfer_price` CHECK (`transfer_price` >= 0.00),
    CONSTRAINT `chk_transfer_users` CHECK (`seller_user_id` <> `buyer_user_id`),
    CONSTRAINT `fk_transfers_prop` FOREIGN KEY (`property_id`) 
        REFERENCES `properties` (`property_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_transfers_seller` FOREIGN KEY (`seller_user_id`) 
        REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_transfers_buyer` FOREIGN KEY (`buyer_user_id`) 
        REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------------------------
-- MODULE 2: TENANT WAITLISTS & QUEUE AUTOMATION
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `unit_waitlists`;
CREATE TABLE `unit_waitlists` (
    `waitlist_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `unit_id` BIGINT UNSIGNED NOT NULL,
    `tenant_user_id` BIGINT UNSIGNED NOT NULL,
    `priority_level` VARCHAR(20) NOT NULL DEFAULT 'STANDARD',
    `queue_position` INT NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'WAITING',
    `expires_at` TIMESTAMP NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `unq_waitlist_unit_tenant` UNIQUE (`unit_id`, `tenant_user_id`),
    CONSTRAINT `chk_waitlist_priority` CHECK (`priority_level` IN ('STANDARD', 'VIP', 'URGENT')),
    CONSTRAINT `chk_waitlist_status` CHECK (`status` IN ('WAITING', 'NOTIFIED', 'PROMOTED', 'EXPIRED', 'CANCELLED')),
    CONSTRAINT `chk_waitlist_pos` CHECK (`queue_position` >= 1),
    CONSTRAINT `fk_waitlist_unit` FOREIGN KEY (`unit_id`) 
        REFERENCES `units` (`unit_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_waitlist_tenant` FOREIGN KEY (`tenant_user_id`) 
        REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX `idx_waitlist_queue` (`unit_id`, `status`, `queue_position`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------------------------
-- MODULE 3: RENTAL APPLICATION APPROVAL WORKFLOWS
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `application_approval_workflows`;
CREATE TABLE `application_approval_workflows` (
    `workflow_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `application_id` BIGINT UNSIGNED NOT NULL,
    `step_name` VARCHAR(50) NOT NULL,
    `reviewer_user_id` BIGINT UNSIGNED NOT NULL,
    `decision` VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    `decision_notes` TEXT NULL,
    `decided_at` TIMESTAMP NULL,
    CONSTRAINT `chk_workflow_step` CHECK (`step_name` IN ('INCOME_VERIFICATION', 'BACKGROUND_CHECK', 'LANDLORD_REFERENCE', 'FINAL_APPROVAL')),
    CONSTRAINT `chk_workflow_decision` CHECK (`decision` IN ('PENDING', 'APPROVED', 'REJECTED', 'CONDITIONAL')),
    CONSTRAINT `fk_workflow_app` FOREIGN KEY (`application_id`) 
        REFERENCES `rental_applications` (`application_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_workflow_reviewer` FOREIGN KEY (`reviewer_user_id`) 
        REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_workflow_app_step` (`application_id`, `step_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------------------------
-- MODULE 4: DIGITAL LEASE SIGNATURE AUDITS
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `lease_signature_audits`;
CREATE TABLE `lease_signature_audits` (
    `signature_audit_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `lease_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `signer_ip` VARCHAR(45) NOT NULL,
    `user_agent` VARCHAR(255) NOT NULL,
    `signature_hash` VARCHAR(255) NOT NULL,
    `signed_timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `unq_lease_signature_hash` UNIQUE (`signature_hash`),
    CONSTRAINT `fk_sig_audit_lease` FOREIGN KEY (`lease_id`) 
        REFERENCES `leases` (`lease_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_sig_audit_user` FOREIGN KEY (`user_id`) 
        REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_sig_audit_lease_user` (`lease_id`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------------------------
-- MODULE 5: ENHANCED PROPERTY INSPECTION PHOTOS & DAMAGE ASSESSMENTS
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `inspection_photos`;
CREATE TABLE `inspection_photos` (
    `photo_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `inspection_id` BIGINT UNSIGNED NOT NULL,
    `area_name` VARCHAR(100) NOT NULL,
    `photo_url` VARCHAR(512) NOT NULL,
    `damage_severity` VARCHAR(20) NOT NULL DEFAULT 'NONE',
    `uploaded_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `chk_inspection_photo_severity` CHECK (`damage_severity` IN ('NONE', 'MINOR', 'MODERATE', 'SEVERE')),
    CONSTRAINT `fk_inspection_photos_insp` FOREIGN KEY (`inspection_id`) 
        REFERENCES `move_inspections` (`inspection_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX `idx_inspection_photos_insp` (`inspection_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `inspection_damage_assessments`;
CREATE TABLE `inspection_damage_assessments` (
    `damage_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `inspection_id` BIGINT UNSIGNED NOT NULL,
    `area_name` VARCHAR(100) NOT NULL,
    `damage_description` TEXT NOT NULL,
    `estimated_repair_cost` DECIMAL(10,2) NOT NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'USD',
    `billable_to_tenant` BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT `chk_damage_cost` CHECK (`estimated_repair_cost` >= 0.00),
    CONSTRAINT `fk_damage_inspection` FOREIGN KEY (`inspection_id`) 
        REFERENCES `move_inspections` (`inspection_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX `idx_damage_inspection` (`inspection_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------------------------
-- MODULE 6: VENDOR CERTIFICATIONS & CONTRACTS
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `vendor_certifications`;
CREATE TABLE `vendor_certifications` (
    `certification_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `vendor_id` BIGINT UNSIGNED NOT NULL,
    `cert_name` VARCHAR(150) NOT NULL,
    `issuing_authority` VARCHAR(150) NOT NULL,
    `expiry_date` DATE NOT NULL,
    `document_url` VARCHAR(512) NULL,
    CONSTRAINT `fk_vendor_certs_vendor` FOREIGN KEY (`vendor_id`) 
        REFERENCES `vendors` (`vendor_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX `idx_vendor_certs_vendor_expiry` (`vendor_id`, `expiry_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `vendor_contracts`;
CREATE TABLE `vendor_contracts` (
    `contract_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `vendor_id` BIGINT UNSIGNED NOT NULL,
    `property_id` BIGINT UNSIGNED NULL,
    `contract_type` VARCHAR(50) NOT NULL,
    `hourly_rate` DECIMAL(10,2) NOT NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'USD',
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT `chk_vendor_contract_dates` CHECK (`end_date` > `start_date`),
    CONSTRAINT `chk_vendor_contract_rate` CHECK (`hourly_rate` >= 0.00),
    CONSTRAINT `chk_vendor_contract_status` CHECK (`status` IN ('DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED')),
    CONSTRAINT `fk_vendor_contracts_vendor` FOREIGN KEY (`vendor_id`) 
        REFERENCES `vendors` (`vendor_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_vendor_contracts_property` FOREIGN KEY (`property_id`) 
        REFERENCES `properties` (`property_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_vendor_contracts_vendor` (`vendor_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------------------------
-- MODULE 7: COUPONS & PROMOTIONAL CAMPAIGNS
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `promotions`;
CREATE TABLE `promotions` (
    `promo_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `promo_code` VARCHAR(50) NOT NULL,
    `discount_type` VARCHAR(30) NOT NULL,
    `discount_value` DECIMAL(10,2) NOT NULL,
    `min_lease_months` INT NOT NULL DEFAULT 6,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `max_uses` INT NOT NULL DEFAULT 100,
    `current_uses` INT NOT NULL DEFAULT 0,
    CONSTRAINT `unq_promotions_code` UNIQUE (`promo_code`),
    CONSTRAINT `chk_promo_type` CHECK (`discount_type` IN ('FLAT_AMOUNT', 'PERCENTAGE')),
    CONSTRAINT `chk_promo_value` CHECK (`discount_value` > 0.00),
    CONSTRAINT `chk_promo_dates` CHECK (`end_date` >= `start_date`),
    INDEX `idx_promotions_code_dates` (`promo_code`, `start_date`, `end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `lease_promotions`;
CREATE TABLE `lease_promotions` (
    `lease_id` BIGINT UNSIGNED NOT NULL,
    `promo_id` BIGINT UNSIGNED NOT NULL,
    `applied_discount_amount` DECIMAL(10,2) NOT NULL,
    `applied_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`lease_id`, `promo_id`),
    CONSTRAINT `chk_lease_promo_discount` CHECK (`applied_discount_amount` > 0.00),
    CONSTRAINT `fk_lease_promos_lease` FOREIGN KEY (`lease_id`) 
        REFERENCES `leases` (`lease_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_lease_promos_promo` FOREIGN KEY (`promo_id`) 
        REFERENCES `promotions` (`promo_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------------------------
-- MODULE 8: TENANT & LANDLORD REFERRAL PROGRAM
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `referral_programs`;
CREATE TABLE `referral_programs` (
    `referral_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `referrer_user_id` BIGINT UNSIGNED NOT NULL,
    `referred_email` VARCHAR(255) NOT NULL,
    `referral_code` VARCHAR(50) NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    `reward_amount` DECIMAL(10,2) NOT NULL DEFAULT 100.00,
    `currency` CHAR(3) NOT NULL DEFAULT 'USD',
    `payout_status` VARCHAR(30) NOT NULL DEFAULT 'UNPAID',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `chk_referral_status` CHECK (`status` IN ('PENDING', 'QUALIFIED', 'REJECTED')),
    CONSTRAINT `chk_referral_payout` CHECK (`payout_status` IN ('UNPAID', 'PAID')),
    CONSTRAINT `chk_referral_reward` CHECK (`reward_amount` >= 0.00),
    CONSTRAINT `chk_referral_email_fmt` CHECK (`referred_email` REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
    CONSTRAINT `fk_referrals_referrer` FOREIGN KEY (`referrer_user_id`) 
        REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX `idx_referrals_code` (`referral_code`),
    INDEX `idx_referrals_referrer` (`referrer_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------------------------
-- MODULE 9: MULTI-LANGUAGE LISTINGS TRANSLATION
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `property_translations`;
CREATE TABLE `property_translations` (
    `translation_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `property_id` BIGINT UNSIGNED NULL,
    `unit_id` BIGINT UNSIGNED NULL,
    `language_code` CHAR(5) NOT NULL,
    `title_translated` VARCHAR(255) NOT NULL,
    `description_translated` TEXT NOT NULL,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `unq_prop_trans_lang` UNIQUE (`property_id`, `unit_id`, `language_code`),
    CONSTRAINT `chk_trans_parent` CHECK (
        (`property_id` IS NOT NULL AND `unit_id` IS NULL) OR 
        (`property_id` IS NULL AND `unit_id` IS NOT NULL)
    ),
    CONSTRAINT `fk_trans_property` FOREIGN KEY (`property_id`) 
        REFERENCES `properties` (`property_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_trans_unit` FOREIGN KEY (`unit_id`) 
        REFERENCES `units` (`unit_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------------------------
-- MODULE 10: SAVED SEARCH ALERTS & NOTIFICATION SCHEDULE
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `saved_searches`;
CREATE TABLE `saved_searches` (
    `search_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `search_name` VARCHAR(100) NOT NULL,
    `criteria_json` JSON NOT NULL,
    `notification_frequency` VARCHAR(20) NOT NULL DEFAULT 'DAILY',
    `last_notified_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `chk_search_freq` CHECK (`notification_frequency` IN ('INSTANT', 'DAILY', 'WEEKLY')),
    CONSTRAINT `fk_saved_searches_user` FOREIGN KEY (`user_id`) 
        REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX `idx_saved_searches_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `saved_search_alert_history`;
CREATE TABLE `saved_search_alert_history` (
    `alert_history_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `search_id` BIGINT UNSIGNED NOT NULL,
    `matched_unit_id` BIGINT UNSIGNED NOT NULL,
    `sent_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_alert_hist_search` FOREIGN KEY (`search_id`) 
        REFERENCES `saved_searches` (`search_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_alert_hist_unit` FOREIGN KEY (`matched_unit_id`) 
        REFERENCES `units` (`unit_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX `idx_alert_hist_search` (`search_id`, `sent_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------------------------
-- MODULE 11: PROPERTY & RENTERS INSURANCE MANAGEMENT
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `insurance_policies`;
CREATE TABLE `insurance_policies` (
    `policy_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `policy_type` VARCHAR(30) NOT NULL,
    `policy_number` VARCHAR(100) NOT NULL,
    `provider_name` VARCHAR(150) NOT NULL,
    `user_id` BIGINT UNSIGNED NULL,
    `property_id` BIGINT UNSIGNED NULL,
    `coverage_amount` DECIMAL(12,2) NOT NULL,
    `premium_amount` DECIMAL(10,2) NOT NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'USD',
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT `unq_policy_number` UNIQUE (`policy_number`),
    CONSTRAINT `chk_policy_type` CHECK (`policy_type` IN ('PROPERTY_INSURANCE', 'RENTERS_INSURANCE', 'LIABILITY')),
    CONSTRAINT `chk_policy_dates` CHECK (`end_date` > `start_date`),
    CONSTRAINT `chk_policy_status` CHECK (`status` IN ('ACTIVE', 'EXPIRED', 'CANCELLED')),
    CONSTRAINT `fk_policies_user` FOREIGN KEY (`user_id`) 
        REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_policies_property` FOREIGN KEY (`property_id`) 
        REFERENCES `properties` (`property_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_policies_user_status` (`user_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `insurance_claims`;
CREATE TABLE `insurance_claims` (
    `claim_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `policy_id` BIGINT UNSIGNED NOT NULL,
    `claim_number` VARCHAR(100) NOT NULL,
    `incident_date` DATE NOT NULL,
    `claim_amount` DECIMAL(12,2) NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    `description` TEXT NOT NULL,
    `submitted_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `unq_claim_number` UNIQUE (`claim_number`),
    CONSTRAINT `chk_claim_status` CHECK (`status` IN ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PAID_OUT')),
    CONSTRAINT `fk_claims_policy` FOREIGN KEY (`policy_id`) 
        REFERENCES `insurance_policies` (`policy_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_claims_policy` (`policy_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------------------------
-- MODULE 12: VISITOR & VIEWING SCHEDULER
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `viewing_appointments`;
CREATE TABLE `viewing_appointments` (
    `appointment_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `unit_id` BIGINT UNSIGNED NOT NULL,
    `visitor_user_id` BIGINT UNSIGNED NOT NULL,
    `agent_user_id` BIGINT UNSIGNED NULL,
    `scheduled_start` DATETIME NOT NULL,
    `scheduled_end` DATETIME NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    `attendance_flag` BOOLEAN NOT NULL DEFAULT FALSE,
    `feedback_rating` INT NULL,
    `feedback_comments` TEXT NULL,
    CONSTRAINT `chk_appt_dates` CHECK (`scheduled_end` > `scheduled_start`),
    CONSTRAINT `chk_appt_status` CHECK (`status` IN ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
    CONSTRAINT `chk_appt_rating` CHECK (`feedback_rating` IS NULL OR (`feedback_rating` BETWEEN 1 AND 5)),
    CONSTRAINT `fk_appts_unit` FOREIGN KEY (`unit_id`) 
        REFERENCES `units` (`unit_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_appts_visitor` FOREIGN KEY (`visitor_user_id`) 
        REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_appts_agent` FOREIGN KEY (`agent_user_id`) 
        REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_appts_unit_time` (`unit_id`, `scheduled_start`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------------------------
-- MODULE 13: MULTI-CURRENCY EXCHANGE RATES
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `currencies`;
CREATE TABLE `currencies` (
    `currency_code` CHAR(3) PRIMARY KEY,
    `currency_symbol` VARCHAR(10) NOT NULL,
    `currency_name` VARCHAR(50) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `exchange_rates`;
CREATE TABLE `exchange_rates` (
    `rate_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `base_currency` CHAR(3) NOT NULL,
    `target_currency` CHAR(3) NOT NULL,
    `exchange_rate` DECIMAL(12,6) NOT NULL,
    `effective_date` DATE NOT NULL,
    CONSTRAINT `unq_exchange_rate_pair_date` UNIQUE (`base_currency`, `target_currency`, `effective_date`),
    CONSTRAINT `chk_exchange_rate_val` CHECK (`exchange_rate` > 0.000000),
    CONSTRAINT `fk_rates_base` FOREIGN KEY (`base_currency`) 
        REFERENCES `currencies` (`currency_code`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_rates_target` FOREIGN KEY (`target_currency`) 
        REFERENCES `currencies` (`currency_code`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------------------------
-- MODULE 14: REGIONAL TAX CONFIGURATION & INVOICE LINE TAXES
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `tax_rules`;
CREATE TABLE `tax_rules` (
    `tax_rule_id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `jurisdiction_code` VARCHAR(50) NOT NULL,
    `tax_name` VARCHAR(100) NOT NULL,
    `tax_rate_percent` DECIMAL(5,3) NOT NULL,
    `applies_to_charge_type` VARCHAR(50) NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NULL,
    CONSTRAINT `chk_tax_rate` CHECK (`tax_rate_percent` >= 0.000),
    INDEX `idx_tax_rules_jurisdiction` (`jurisdiction_code`, `applies_to_charge_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `invoice_tax_line_items`;
CREATE TABLE `invoice_tax_line_items` (
    `tax_item_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `invoice_id` BIGINT UNSIGNED NOT NULL,
    `tax_rule_id` INT UNSIGNED NOT NULL,
    `calculated_tax_amount` DECIMAL(10,2) NOT NULL,
    CONSTRAINT `chk_tax_amount` CHECK (`calculated_tax_amount` >= 0.00),
    CONSTRAINT `fk_tax_items_invoice` FOREIGN KEY (`invoice_id`) 
        REFERENCES `lease_invoices` (`invoice_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_tax_items_rule` FOREIGN KEY (`tax_rule_id`) 
        REFERENCES `tax_rules` (`tax_rule_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------------------------
-- MODULE 15: EMERGENCY CONTACTS & AUTHORIZATIONS
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `emergency_contacts`;
CREATE TABLE `emergency_contacts` (
    `contact_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `contact_name` VARCHAR(150) NOT NULL,
    `relationship` VARCHAR(50) NOT NULL,
    `primary_phone` VARCHAR(30) NOT NULL,
    `secondary_phone` VARCHAR(30) NULL,
    `medical_notes` TEXT NULL,
    `entry_authorization_flag` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `chk_emergency_phone_fmt` CHECK (`primary_phone` REGEXP '^[+]?[0-9]{7,15}$'),
    CONSTRAINT `fk_emergency_contacts_user` FOREIGN KEY (`user_id`) 
        REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX `idx_emergency_contacts_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET FOREIGN_KEY_CHECKS = 1;
