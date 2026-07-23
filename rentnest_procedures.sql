-- ==============================================================================
-- RentNest Platform: Enterprise Stored Procedures Suite (MySQL 8)
-- Architecture: Transactional Business Logic & Security Enforcers
-- ==============================================================================

USE `rentnest`;

DELIMITER //

-- ------------------------------------------------------------------------------
-- 1. PROCEDURE: sp_RegisterUser
-- Purpose: Atomically creates a user credential record, profile details, and role assignment.
-- ------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS `sp_RegisterUser`//
CREATE PROCEDURE `sp_RegisterUser`(
    IN p_email VARCHAR(255),
    IN p_password_hash VARCHAR(255),
    IN p_phone_number VARCHAR(30),
    IN p_role_name VARCHAR(50),
    IN p_first_name VARCHAR(100),
    IN p_last_name VARCHAR(100),
    IN p_date_of_birth DATE,
    OUT p_user_id BIGINT UNSIGNED,
    OUT p_status_message VARCHAR(255)
)
BEGIN
    DECLARE v_role_id INT UNSIGNED;
    DECLARE v_existing_count INT DEFAULT 0;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_user_id = 0;
        SET p_status_message = 'ERROR: Transaction failed. Registration aborted.';
    END;

    START TRANSACTION;

    -- Validation 1: Email uniqueness check
    SELECT COUNT(*) INTO v_existing_count FROM `users` WHERE `email` = p_email;
    IF v_existing_count > 0 THEN
        SET p_user_id = 0;
        SET p_status_message = 'ERROR: Email address already registered.';
        ROLLBACK;
    ELSE
        -- Validation 2: Role existence check
        SELECT `role_id` INTO v_role_id FROM `roles` WHERE `role_name` = p_role_name;
        IF v_role_id IS NULL THEN
            SET p_user_id = 0;
            SET p_status_message = 'ERROR: Invalid system role specified.';
            ROLLBACK;
        ELSE
            -- Insert core user
            INSERT INTO `users` (`email`, `password_hash`, `phone_number`, `account_status`)
            VALUES (p_email, p_password_hash, p_phone_number, 'ACTIVE');
            
            SET p_user_id = LAST_INSERT_ID();

            -- Insert user profile
            INSERT INTO `user_profiles` (`user_id`, `first_name`, `last_name`, `date_of_birth`)
            VALUES (p_user_id, p_first_name, p_last_name, p_date_of_birth);

            -- Assign RBAC role
            INSERT INTO `user_roles` (`user_id`, `role_id`)
            VALUES (p_user_id, v_role_id);

            SET p_status_message = 'SUCCESS: User identity and profile created successfully.';
            COMMIT;
        END IF;
    END IF;
END//

-- ------------------------------------------------------------------------------
-- 2. PROCEDURE: sp_CreateProperty
-- Purpose: Creates a new property building and initializes its primary unit asset.
-- ------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS `sp_CreateProperty`//
CREATE PROCEDURE `sp_CreateProperty`(
    IN p_owner_id BIGINT UNSIGNED,
    IN p_property_name VARCHAR(150),
    IN p_property_type VARCHAR(50),
    IN p_street_address VARCHAR(255),
    IN p_city VARCHAR(100),
    IN p_state_province VARCHAR(100),
    IN p_postal_code VARCHAR(20),
    IN p_unit_number VARCHAR(30),
    IN p_bedrooms INT,
    IN p_bathrooms DECIMAL(3,1),
    IN p_target_rent DECIMAL(10,2),
    IN p_deposit DECIMAL(10,2),
    OUT p_property_id BIGINT UNSIGNED,
    OUT p_unit_id BIGINT UNSIGNED,
    OUT p_status_message VARCHAR(255)
)
BEGIN
    DECLARE v_owner_exists INT DEFAULT 0;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_property_id = 0;
        SET p_unit_id = 0;
        SET p_status_message = 'ERROR: Property creation failed.';
    END;

    START TRANSACTION;

    -- Validation: Owner existence check
    SELECT COUNT(*) INTO v_owner_exists FROM `users` WHERE `user_id` = p_owner_id;
    IF v_owner_exists = 0 THEN
        SET p_property_id = 0;
        SET p_unit_id = 0;
        SET p_status_message = 'ERROR: Owner user ID does not exist.';
        ROLLBACK;
    ELSE
        -- Insert property
        INSERT INTO `properties` (
            `owner_id`, `property_name`, `property_type`, `street_address`, `city`, `state_province`, `postal_code`
        ) VALUES (
            p_owner_id, p_property_name, p_property_type, p_street_address, p_city, p_state_province, p_postal_code
        );

        SET p_property_id = LAST_INSERT_ID();

        -- Insert primary unit
        INSERT INTO `units` (
            `property_id`, `unit_number`, `bedrooms`, `bathrooms`, `target_rent`, `security_deposit_target`, `status`
        ) VALUES (
            p_property_id, p_unit_number, p_bedrooms, p_bathrooms, p_target_rent, p_deposit, 'VACANT'
        );

        SET p_unit_id = LAST_INSERT_ID();
        SET p_status_message = 'SUCCESS: Property and unit initialized successfully.';
        COMMIT;
    END IF;
END//

-- ------------------------------------------------------------------------------
-- 3. PROCEDURE: sp_BookProperty (Lease Contract Execution)
-- Purpose: Atomically executes a legal lease agreement and binds the tenant.
-- ------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS `sp_BookProperty`//
CREATE PROCEDURE `sp_BookProperty`(
    IN p_unit_id BIGINT UNSIGNED,
    IN p_tenant_user_id BIGINT UNSIGNED,
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_monthly_rent DECIMAL(10,2),
    OUT p_lease_id BIGINT UNSIGNED,
    OUT p_status_message VARCHAR(255)
)
BEGIN
    DECLARE v_unit_status VARCHAR(30);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_lease_id = 0;
        SET p_status_message = 'ERROR: Lease execution failed.';
    END;

    START TRANSACTION;

    -- Validation 1: Check unit availability
    SELECT `status` INTO v_unit_status FROM `units` WHERE `unit_id` = p_unit_id FOR UPDATE;

    IF v_unit_status IS NULL THEN
        SET p_lease_id = 0;
        SET p_status_message = 'ERROR: Target unit does not exist.';
        ROLLBACK;
    ELSEIF v_unit_status != 'VACANT' THEN
        SET p_lease_id = 0;
        SET p_status_message = 'ERROR: Unit is not vacant for lease booking.';
        ROLLBACK;
    ELSEIF p_end_date <= p_start_date THEN
        SET p_lease_id = 0;
        SET p_status_message = 'ERROR: Lease end date must succeed start date.';
        ROLLBACK;
    ELSE
        -- Insert lease contract
        INSERT INTO `leases` (
            `unit_id`, `start_date`, `end_date`, `monthly_base_rent`, `due_day_of_month`, `status`
        ) VALUES (
            p_unit_id, p_start_date, p_end_date, p_monthly_rent, 1, 'ACTIVE'
        );

        SET p_lease_id = LAST_INSERT_ID();

        -- Bind primary tenant
        INSERT INTO `lease_signers` (`lease_id`, `user_id`, `signer_role`, `signed_at`)
        VALUES (p_lease_id, p_tenant_user_id, 'PRIMARY_TENANT', NOW());

        -- Update unit status to OCCUPIED
        UPDATE `units` SET `status` = 'OCCUPIED' WHERE `unit_id` = p_unit_id;

        SET p_status_message = 'SUCCESS: Lease executed and unit occupied.';
        COMMIT;
    END IF;
END//

-- ------------------------------------------------------------------------------
-- 4. PROCEDURE: sp_CancelBooking (Early Lease Termination)
-- Purpose: Terminates an active lease early and returns unit to VACANT status.
-- ------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS `sp_CancelBooking`//
CREATE PROCEDURE `sp_CancelBooking`(
    IN p_lease_id BIGINT UNSIGNED,
    IN p_reason VARCHAR(255),
    OUT p_status_message VARCHAR(255)
)
BEGIN
    DECLARE v_unit_id BIGINT UNSIGNED;
    DECLARE v_lease_status VARCHAR(30);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_message = 'ERROR: Lease termination failed.';
    END;

    START TRANSACTION;

    SELECT `unit_id`, `status` INTO v_unit_id, v_lease_status 
    FROM `leases` WHERE `lease_id` = p_lease_id FOR UPDATE;

    IF v_lease_status IS NULL THEN
        SET p_status_message = 'ERROR: Specified lease does not exist.';
        ROLLBACK;
    ELSEIF v_lease_status = 'TERMINATED' OR v_lease_status = 'EXPIRED' THEN
        SET p_status_message = 'ERROR: Lease is already inactive.';
        ROLLBACK;
    ELSE
        -- Update lease status to TERMINATED
        UPDATE `leases` SET `status` = 'TERMINATED' WHERE `lease_id` = p_lease_id;

        -- Return unit to VACANT state
        UPDATE `units` SET `status` = 'VACANT' WHERE `unit_id` = v_unit_id;

        -- Log audit trail entry
        INSERT INTO `audit_logs` (`actor_user_id`, `action_type`, `target_table`, `record_key`, `post_image_json`)
        VALUES (NULL, 'UPDATE', 'leases', CAST(p_lease_id AS CHAR), JSON_OBJECT('reason', p_reason, 'status', 'TERMINATED'));

        SET p_status_message = 'SUCCESS: Lease terminated and unit restored to VACANT status.';
        COMMIT;
    END IF;
END//

-- ------------------------------------------------------------------------------
-- 5. PROCEDURE: sp_ApproveProperty
-- Purpose: Verifies property compliance and activates units for search indexing.
-- ------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS `sp_ApproveProperty`//
CREATE PROCEDURE `sp_ApproveProperty`(
    IN p_property_id BIGINT UNSIGNED,
    IN p_admin_user_id BIGINT UNSIGNED,
    OUT p_status_message VARCHAR(255)
)
BEGIN
    DECLARE v_prop_exists INT DEFAULT 0;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_message = 'ERROR: Property approval failed.';
    END;

    START TRANSACTION;

    SELECT COUNT(*) INTO v_prop_exists FROM `properties` WHERE `property_id` = p_property_id;

    IF v_prop_exists = 0 THEN
        SET p_status_message = 'ERROR: Property ID not found.';
        ROLLBACK;
    ELSE
        -- Mark units as VACANT and ready
        UPDATE `units` SET `status` = 'VACANT' WHERE `property_id` = p_property_id AND `status` = 'RESERVED';

        -- Log administrative audit
        INSERT INTO `audit_logs` (`actor_user_id`, `action_type`, `target_table`, `record_key`, `post_image_json`)
        VALUES (p_admin_user_id, 'OVERRIDE', 'properties', CAST(p_property_id AS CHAR), JSON_OBJECT('approval_status', 'APPROVED'));

        SET p_status_message = 'SUCCESS: Property approved for tenant search listings.';
        COMMIT;
    END IF;
END//

-- ------------------------------------------------------------------------------
-- 6. PROCEDURE: sp_GenerateInvoice
-- Purpose: Generates monthly lease invoice header and base rent line item.
-- ------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS `sp_GenerateInvoice`//
CREATE PROCEDURE `sp_GenerateInvoice`(
    IN p_lease_id BIGINT UNSIGNED,
    IN p_billing_start DATE,
    IN p_billing_end DATE,
    IN p_due_date DATE,
    OUT p_invoice_id BIGINT UNSIGNED,
    OUT p_status_message VARCHAR(255)
)
BEGIN
    DECLARE v_rent_amount DECIMAL(10,2);
    DECLARE v_lease_status VARCHAR(30);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_invoice_id = 0;
        SET p_status_message = 'ERROR: Invoice generation failed.';
    END;

    START TRANSACTION;

    SELECT `monthly_base_rent`, `status` INTO v_rent_amount, v_lease_status 
    FROM `leases` WHERE `lease_id` = p_lease_id;

    IF v_lease_status IS NULL OR v_lease_status != 'ACTIVE' THEN
        SET p_invoice_id = 0;
        SET p_status_message = 'ERROR: Cannot issue invoice for inactive lease.';
        ROLLBACK;
    ELSE
        -- Create invoice header
        INSERT INTO `lease_invoices` (
            `lease_id`, `billing_period_start`, `billing_period_end`, `due_date`, `total_amount_due`, `payment_status`
        ) VALUES (
            p_lease_id, p_billing_start, p_billing_end, p_due_date, v_rent_amount, 'UNPAID'
        );

        SET p_invoice_id = LAST_INSERT_ID();

        -- Create itemized base rent charge
        INSERT INTO `invoice_items` (`invoice_id`, `charge_type`, `description`, `amount`)
        VALUES (p_invoice_id, 'BASE_RENT', 'Monthly Base Rental Fee', v_rent_amount);

        SET p_status_message = 'SUCCESS: Invoice generated successfully.';
        COMMIT;
    END IF;
END//

-- ------------------------------------------------------------------------------
-- 7. PROCEDURE: sp_CreatePayment
-- Purpose: Atomically records a payment transaction and allocates funds to invoice.
-- ------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS `sp_CreatePayment`//
CREATE PROCEDURE `sp_CreatePayment`(
    IN p_payer_id BIGINT UNSIGNED,
    IN p_invoice_id BIGINT UNSIGNED,
    IN p_amount DECIMAL(10,2),
    IN p_channel VARCHAR(30),
    IN p_token VARCHAR(255),
    OUT p_payment_id BIGINT UNSIGNED,
    OUT p_status_message VARCHAR(255)
)
BEGIN
    DECLARE v_item_id BIGINT UNSIGNED;
    DECLARE v_total_due DECIMAL(10,2);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_payment_id = 0;
        SET p_status_message = 'ERROR: Payment processing failed.';
    END;

    START TRANSACTION;

    SELECT `total_amount_due` INTO v_total_due FROM `lease_invoices` WHERE `invoice_id` = p_invoice_id FOR UPDATE;

    IF v_total_due IS NULL THEN
        SET p_payment_id = 0;
        SET p_status_message = 'ERROR: Target invoice not found.';
        ROLLBACK;
    ELSE
        -- Insert payment record
        INSERT INTO `payments` (`payer_user_id`, `payment_channel`, `amount`, `gateway_transaction_token`, `payment_status`)
        VALUES (p_payer_id, p_channel, p_amount, p_token, 'SETTLED');

        SET p_payment_id = LAST_INSERT_ID();

        -- Fetch primary invoice item
        SELECT `item_id` INTO v_item_id FROM `invoice_items` WHERE `invoice_id` = p_invoice_id LIMIT 1;

        -- Create payment allocation
        IF v_item_id IS NOT NULL THEN
            INSERT INTO `payment_allocations` (`payment_id`, `item_id`, `allocated_amount`)
            VALUES (p_payment_id, v_item_id, p_amount);
        END IF;

        -- Update invoice payment status
        IF p_amount >= v_total_due THEN
            UPDATE `lease_invoices` SET `payment_status` = 'PAID' WHERE `invoice_id` = p_invoice_id;
        ELSE
            UPDATE `lease_invoices` SET `payment_status` = 'PARTIALLY_PAID' WHERE `invoice_id` = p_invoice_id;
        END IF;

        SET p_status_message = 'SUCCESS: Payment settled and invoice updated.';
        COMMIT;
    END IF;
END//

-- ------------------------------------------------------------------------------
-- 8. PROCEDURE: sp_SubmitReview
-- Purpose: Inserts a post-tenancy review after verifying lease participation.
-- ------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS `sp_SubmitReview`//
CREATE PROCEDURE `sp_SubmitReview`(
    IN p_lease_id BIGINT UNSIGNED,
    IN p_reviewer_id BIGINT UNSIGNED,
    IN p_reviewee_id BIGINT UNSIGNED,
    IN p_rating INT,
    IN p_text TEXT,
    OUT p_status_message VARCHAR(255)
)
BEGIN
    DECLARE v_signer_count INT DEFAULT 0;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_message = 'ERROR: Review submission failed.';
    END;

    START TRANSACTION;

    -- Validate reviewer was a signer on the lease
    SELECT COUNT(*) INTO v_signer_count FROM `lease_signers` WHERE `lease_id` = p_lease_id AND `user_id` = p_reviewer_id;

    IF v_signer_count = 0 THEN
        SET p_status_message = 'ERROR: Reviewer was not a party to this lease contract.';
        ROLLBACK;
    ELSE
        INSERT INTO `reviews` (`lease_id`, `reviewer_user_id`, `reviewee_user_id`, `rating`, `review_text`, `is_published`)
        VALUES (p_lease_id, p_reviewer_id, p_reviewee_id, p_rating, p_text, TRUE);

        SET p_status_message = 'SUCCESS: Review submitted successfully.';
        COMMIT;
    END IF;
END//

-- ------------------------------------------------------------------------------
-- 9. PROCEDURE: sp_AssignMaintenanceRequest
-- Purpose: Assigns an open repair ticket to a vendor and logs progress update.
-- ------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS `sp_AssignMaintenanceRequest`//
CREATE PROCEDURE `sp_AssignMaintenanceRequest`(
    IN p_request_id BIGINT UNSIGNED,
    IN p_vendor_id BIGINT UNSIGNED,
    IN p_manager_user_id BIGINT UNSIGNED,
    OUT p_status_message VARCHAR(255)
)
BEGIN
    DECLARE v_ticket_status VARCHAR(30);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_message = 'ERROR: Work order assignment failed.';
    END;

    START TRANSACTION;

    SELECT `status` INTO v_ticket_status FROM `maintenance_requests` WHERE `request_id` = p_request_id FOR UPDATE;

    IF v_ticket_status IS NULL THEN
        SET p_status_message = 'ERROR: Maintenance ticket does not exist.';
        ROLLBACK;
    ELSE
        -- Update ticket status and assigned vendor
        UPDATE `maintenance_requests` 
        SET `assigned_vendor_id` = p_vendor_id, `status` = 'ASSIGNED' 
        WHERE `request_id` = p_request_id;

        -- Insert update timeline note
        INSERT INTO `maintenance_updates` (`request_id`, `user_id`, `update_note`, `status_changed_to`)
        VALUES (p_request_id, p_manager_user_id, 'Ticket assigned to contractor.', 'ASSIGNED');

        SET p_status_message = 'SUCCESS: Maintenance request assigned to vendor.';
        COMMIT;
    END IF;
END//

-- ------------------------------------------------------------------------------
-- 10. PROCEDURE: sp_GenerateMonthlyReport
-- Purpose: Financial aggregate statement report for platform administrative users.
-- ------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS `sp_GenerateMonthlyReport`//
CREATE PROCEDURE `sp_GenerateMonthlyReport`(
    IN p_year_month VARCHAR(7)
)
BEGIN
    SELECT 
        p_year_month AS reporting_period,
        COUNT(DISTINCT p.property_id) AS active_properties,
        COUNT(DISTINCT u.unit_id) AS total_units,
        COUNT(DISTINCT l.lease_id) AS active_leases,
        COALESCE(SUM(li.total_amount_due), 0.00) AS gross_billed_revenue,
        COALESCE(SUM(CASE WHEN li.payment_status = 'PAID' THEN li.total_amount_due ELSE 0 END), 0.00) AS net_collected_revenue,
        COALESCE(SUM(me.total_cost), 0.00) AS total_maintenance_expenses
    FROM `properties` p
    JOIN `units` u ON p.property_id = u.property_id
    LEFT JOIN `leases` l ON u.unit_id = l.unit_id AND l.status = 'ACTIVE'
    LEFT JOIN `lease_invoices` li ON l.lease_id = li.lease_id AND DATE_FORMAT(li.billing_period_start, '%Y-%m') = p_year_month
    LEFT JOIN `maintenance_requests` mr ON u.unit_id = mr.unit_id
    LEFT JOIN `maintenance_expenses` me ON mr.request_id = me.request_id AND DATE_FORMAT(me.created_at, '%Y-%m') = p_year_month;
END//

DELIMITER ;
