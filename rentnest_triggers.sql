-- ==============================================================================
-- RentNest Platform: Enterprise Triggers Suite (MySQL 8) - Refined
-- Architecture: Automated Event Handlers, Temporal Overlap Protection & Auditing
-- ==============================================================================

USE `rentnest`;

DELIMITER //

-- ------------------------------------------------------------------------------
-- 1. TRIGGER: trg_leases_before_insert_check_overlap
-- Timing: BEFORE INSERT ON leases
-- Purpose: Prevents temporal overlapping active lease contracts for the same unit.
-- ------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS `trg_leases_before_insert_check_overlap`//
CREATE TRIGGER `trg_leases_before_insert_check_overlap`
BEFORE INSERT ON `leases`
FOR EACH ROW
BEGIN
    DECLARE v_overlap_count INT DEFAULT 0;

    IF NEW.status = 'ACTIVE' THEN
        SELECT COUNT(*) INTO v_overlap_count
        FROM `leases`
        WHERE `unit_id` = NEW.unit_id
          AND `status` = 'ACTIVE'
          AND (`start_date` <= NEW.end_date AND `end_date` >= NEW.start_date);

        IF v_overlap_count > 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'TEMPORAL LEASE OVERLAP DETECTED: Unit is already bound to an active lease contract during the requested date range.';
        END IF;
    END IF;
END//

-- ------------------------------------------------------------------------------
-- 2. TRIGGER: trg_reviews_after_insert_update_rating
-- Timing: AFTER INSERT ON reviews
-- Purpose: Recalculates and updates vendors.average_rating when a new review is published.
-- ------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS `trg_reviews_after_insert_update_rating`//
CREATE TRIGGER `trg_reviews_after_insert_update_rating`
AFTER INSERT ON `reviews`
FOR EACH ROW
BEGIN
    DECLARE v_avg_rating DECIMAL(3,2);
    DECLARE v_vendor_id BIGINT UNSIGNED;

    IF NEW.is_published = TRUE THEN
        SELECT `vendor_id` INTO v_vendor_id FROM `vendors` WHERE `user_id` = NEW.reviewee_user_id;

        IF v_vendor_id IS NOT NULL THEN
            SELECT ROUND(AVG(`rating`), 2) INTO v_avg_rating 
            FROM `reviews` 
            WHERE `reviewee_user_id` = NEW.reviewee_user_id AND `is_published` = TRUE;

            UPDATE `vendors` 
            SET `average_rating` = v_avg_rating 
            WHERE `vendor_id` = v_vendor_id;
        END IF;
    END IF;
END//

-- ------------------------------------------------------------------------------
-- 3. TRIGGER: trg_maintenance_after_update_notify
-- Timing: AFTER UPDATE ON maintenance_requests
-- Purpose: Queues an automated notification when a maintenance ticket status changes.
-- ------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS `trg_maintenance_after_update_notify`//
CREATE TRIGGER `trg_maintenance_after_update_notify`
AFTER UPDATE ON `maintenance_requests`
FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO `notifications` (
            `recipient_user_id`, `channel_type`, `title`, `message_body`, `delivery_status`
        ) VALUES (
            NEW.reporter_user_id,
            'IN_APP',
            CONCAT('Maintenance Request Update: Ticket #', NEW.request_id),
            CONCAT('Your maintenance ticket status has been updated to: ', NEW.status),
            'PENDING'
        );
    END IF;
END//

-- ------------------------------------------------------------------------------
-- 4. TRIGGER: trg_users_after_update_audit
-- Timing: AFTER UPDATE ON users
-- Purpose: Captures pre-image and post-image JSON snapshots in audit_logs for account changes.
-- ------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS `trg_users_after_update_audit`//
CREATE TRIGGER `trg_users_after_update_audit`
AFTER UPDATE ON `users`
FOR EACH ROW
BEGIN
    IF OLD.account_status <> NEW.account_status OR OLD.email <> NEW.email THEN
        INSERT INTO `audit_logs` (
            `actor_user_id`,
            `action_type`,
            `target_table`,
            `record_key`,
            `pre_image_json`,
            `post_image_json`
        ) VALUES (
            NEW.user_id,
            'UPDATE',
            'users',
            CAST(NEW.user_id AS CHAR),
            JSON_OBJECT('email', OLD.email, 'status', OLD.account_status),
            JSON_OBJECT('email', NEW.email, 'status', NEW.account_status)
        );
    END IF;
END//

-- ------------------------------------------------------------------------------
-- 5. TRIGGER: trg_leases_after_insert_occupy_unit
-- Timing: AFTER INSERT ON leases
-- Purpose: Automatically transitions target unit status to OCCUPIED when an ACTIVE lease is created.
-- ------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS `trg_leases_after_insert_occupy_unit`//
CREATE TRIGGER `trg_leases_after_insert_occupy_unit`
AFTER INSERT ON `leases`
FOR EACH ROW
BEGIN
    IF NEW.status = 'ACTIVE' THEN
        UPDATE `units` 
        SET `status` = 'OCCUPIED' 
        WHERE `unit_id` = NEW.unit_id;
    END IF;
END//

-- ------------------------------------------------------------------------------
-- 6. TRIGGER: trg_leases_after_update_vacate_unit
-- Timing: AFTER UPDATE ON leases
-- Purpose: Automatically returns unit status to VACANT when a lease becomes EXPIRED or TERMINATED.
-- ------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS `trg_leases_after_update_vacate_unit`//
CREATE TRIGGER `trg_leases_after_update_vacate_unit`
AFTER UPDATE ON `leases`
FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status AND NEW.status IN ('EXPIRED', 'TERMINATED') THEN
        UPDATE `units` 
        SET `status` = 'VACANT' 
        WHERE `unit_id` = NEW.unit_id;
    END IF;
END//

-- ------------------------------------------------------------------------------
-- 7. TRIGGER: trg_payment_allocations_after_insert_update_invoice
-- Timing: AFTER INSERT ON payment_allocations
-- Purpose: Recalculates total paid amount and updates invoice payment status.
-- ------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS `trg_payment_allocations_after_insert_update_invoice`//
CREATE TRIGGER `trg_payment_allocations_after_insert_update_invoice`
AFTER INSERT ON `payment_allocations`
FOR EACH ROW
BEGIN
    DECLARE v_invoice_id BIGINT UNSIGNED;
    DECLARE v_total_billed DECIMAL(10,2);
    DECLARE v_total_allocated DECIMAL(10,2);

    SELECT `invoice_id` INTO v_invoice_id 
    FROM `invoice_items` 
    WHERE `item_id` = NEW.item_id 
    LIMIT 1;

    IF v_invoice_id IS NOT NULL THEN
        SELECT `total_amount_due` INTO v_total_billed 
        FROM `lease_invoices` 
        WHERE `invoice_id` = v_invoice_id;

        SELECT COALESCE(SUM(pa.allocated_amount), 0.00) INTO v_total_allocated
        FROM `payment_allocations` pa
        JOIN `invoice_items` ii ON pa.item_id = ii.item_id
        WHERE ii.invoice_id = v_invoice_id;

        IF v_total_allocated >= v_total_billed THEN
            UPDATE `lease_invoices` SET `payment_status` = 'PAID' WHERE `invoice_id` = v_invoice_id;
        ELSEIF v_total_allocated > 0.00 THEN
            UPDATE `lease_invoices` SET `payment_status` = 'PARTIALLY_PAID' WHERE `invoice_id` = v_invoice_id;
        END IF;
    END IF;
END//

-- ------------------------------------------------------------------------------
-- 8. TRIGGER: trg_users_before_delete_prevent
-- Timing: BEFORE DELETE ON users
-- Purpose: Prevents hard-deleting users with active leases or pending invoices.
-- ------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS `trg_users_before_delete_prevent`//
CREATE TRIGGER `trg_users_before_delete_prevent`
BEFORE DELETE ON `users`
FOR EACH ROW
BEGIN
    DECLARE v_active_leases_count INT DEFAULT 0;

    SELECT COUNT(*) INTO v_active_leases_count
    FROM `lease_signers` ls
    JOIN `leases` l ON ls.lease_id = l.lease_id
    WHERE ls.user_id = OLD.user_id AND l.status = 'ACTIVE';

    IF v_active_leases_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'CANNOT DELETE USER: User is bound to one or more active lease agreements.';
    END IF;
END//

DELIMITER ;
