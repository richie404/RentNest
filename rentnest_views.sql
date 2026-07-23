-- ==============================================================================
-- RentNest Platform: Production SQL Views Suite (MySQL 8)
-- Architecture: 10 Enterprise Views for React API & Analytics
-- ==============================================================================

USE `rentnest`;

-- ------------------------------------------------------------------------------
-- 1. VIEW: vw_available_properties_units
-- Purpose: Public search view combining available vacant units, property address,
-- owner details, and primary media for frontend listing cards.
-- ------------------------------------------------------------------------------
DROP VIEW IF EXISTS `vw_available_properties_units`;
CREATE VIEW `vw_available_properties_units` AS
SELECT 
    u.unit_id,
    u.unit_number,
    u.bedrooms,
    u.bathrooms,
    u.square_feet,
    u.target_rent,
    u.security_deposit_target,
    u.status AS unit_status,
    p.property_id,
    p.property_name,
    p.property_type,
    p.street_address,
    p.city,
    p.state_province,
    p.postal_code,
    p.country,
    up.first_name AS owner_first_name,
    up.last_name AS owner_last_name,
    usr.email AS owner_email,
    pm.media_url AS primary_photo_url
FROM `units` u
JOIN `properties` p ON u.property_id = p.property_id
JOIN `users` usr ON p.owner_id = usr.user_id
LEFT JOIN `user_profiles` up ON usr.user_id = up.user_id
LEFT JOIN `property_media` pm ON (
    (pm.unit_id = u.unit_id OR (pm.property_id = p.property_id AND pm.unit_id IS NULL))
    AND pm.is_primary = TRUE
)
WHERE u.status = 'VACANT';

-- ------------------------------------------------------------------------------
-- 2. VIEW: vw_active_leases
-- Purpose: Overview of currently active legal lease contracts, including tenant
-- names, property details, agreed monthly rent, and contract end dates.
-- ------------------------------------------------------------------------------
DROP VIEW IF EXISTS `vw_active_leases`;
CREATE VIEW `vw_active_leases` AS
SELECT 
    l.lease_id,
    l.unit_id,
    u.unit_number,
    p.property_id,
    p.property_name,
    p.street_address,
    p.city,
    l.monthly_base_rent,
    l.due_day_of_month,
    l.grace_period_days,
    l.start_date,
    l.end_date,
    DATEDIFF(l.end_date, CURRENT_DATE) AS days_remaining,
    usr.user_id AS primary_tenant_id,
    up.first_name AS tenant_first_name,
    up.last_name AS tenant_last_name,
    usr.email AS tenant_email,
    usr.phone_number AS tenant_phone
FROM `leases` l
JOIN `units` u ON l.unit_id = u.unit_id
JOIN `properties` p ON u.property_id = p.property_id
JOIN `lease_signers` ls ON l.lease_id = ls.lease_id AND ls.signer_role = 'PRIMARY_TENANT'
JOIN `users` usr ON ls.user_id = usr.user_id
LEFT JOIN `user_profiles` up ON usr.user_id = up.user_id
WHERE l.status = 'ACTIVE';

-- ------------------------------------------------------------------------------
-- 3. VIEW: vw_monthly_revenue_summary
-- Purpose: Aggregates total billed invoices vs settled payments by month for 
-- platform financial accounting and profit/loss reporting.
-- ------------------------------------------------------------------------------
DROP VIEW IF EXISTS `vw_monthly_revenue_summary`;
CREATE VIEW `vw_monthly_revenue_summary` AS
SELECT 
    DATE_FORMAT(li.billing_period_start, '%Y-%m') AS billing_month,
    COUNT(DISTINCT li.invoice_id) AS total_invoices_issued,
    SUM(li.total_amount_due) AS total_billed_amount,
    COALESCE(SUM(CASE WHEN li.payment_status = 'PAID' THEN li.total_amount_due ELSE 0 END), 0.00) AS total_paid_amount,
    COALESCE(SUM(CASE WHEN li.payment_status IN ('UNPAID', 'OVERDUE') THEN li.total_amount_due ELSE 0 END), 0.00) AS total_outstanding_amount,
    ROUND(
        (SUM(CASE WHEN li.payment_status = 'PAID' THEN li.total_amount_due ELSE 0 END) / NULLIF(SUM(li.total_amount_due), 0)) * 100, 
        2
    ) AS collection_efficiency_percentage
FROM `lease_invoices` li
GROUP BY DATE_FORMAT(li.billing_period_start, '%Y-%m');

-- ------------------------------------------------------------------------------
-- 4. VIEW: vw_owner_dashboard_summary
-- Purpose: High-level executive KPI summary view for Landlords detailing owned
-- properties, vacancy rates, net collected revenue, and open maintenance tickets.
-- ------------------------------------------------------------------------------
DROP VIEW IF EXISTS `vw_owner_dashboard_summary`;
CREATE VIEW `vw_owner_dashboard_summary` AS
SELECT 
    p.owner_id,
    COUNT(DISTINCT p.property_id) AS total_properties_owned,
    COUNT(DISTINCT u.unit_id) AS total_units_managed,
    COUNT(DISTINCT CASE WHEN u.status = 'VACANT' THEN u.unit_id END) AS vacant_units_count,
    COUNT(DISTINCT CASE WHEN u.status = 'OCCUPIED' THEN u.unit_id END) AS occupied_units_count,
    ROUND(
        (COUNT(DISTINCT CASE WHEN u.status = 'OCCUPIED' THEN u.unit_id END) / NULLIF(COUNT(DISTINCT u.unit_id), 0)) * 100,
        2
    ) AS portfolio_occupancy_rate,
    COALESCE(SUM(op.net_payout_amount), 0.00) AS total_net_payouts_received,
    COUNT(DISTINCT CASE WHEN mr.status IN ('OPEN', 'ASSIGNED', 'IN_PROGRESS') THEN mr.request_id END) AS open_maintenance_requests_count
FROM `properties` p
LEFT JOIN `units` u ON p.property_id = u.property_id
LEFT JOIN `owner_payouts` op ON p.property_id = op.property_id AND op.payout_status = 'DISBURSED'
LEFT JOIN `maintenance_requests` mr ON u.unit_id = mr.unit_id
GROUP BY p.owner_id;

-- ------------------------------------------------------------------------------
-- 5. VIEW: vw_tenant_dashboard_hub
-- Purpose: Personalized dashboard view for active tenants showing current unit,
-- upcoming rent due date, unpaid invoices balance, and open work orders.
-- ------------------------------------------------------------------------------
DROP VIEW IF EXISTS `vw_tenant_dashboard_hub`;
CREATE VIEW `vw_tenant_dashboard_hub` AS
SELECT 
    ls.user_id AS tenant_user_id,
    l.lease_id,
    l.status AS lease_status,
    u.unit_id,
    u.unit_number,
    p.property_name,
    p.street_address,
    p.city,
    l.monthly_base_rent,
    l.due_day_of_month,
    COALESCE(SUM(CASE WHEN li.payment_status IN ('UNPAID', 'OVERDUE', 'PARTIALLY_PAID') THEN li.total_amount_due ELSE 0 END), 0.00) AS total_balance_due,
    COUNT(DISTINCT CASE WHEN mr.status IN ('OPEN', 'ASSIGNED', 'IN_PROGRESS') THEN mr.request_id END) AS open_work_orders_count
FROM `lease_signers` ls
JOIN `leases` l ON ls.lease_id = l.lease_id
JOIN `units` u ON l.unit_id = u.unit_id
JOIN `properties` p ON u.property_id = p.property_id
LEFT JOIN `lease_invoices` li ON l.lease_id = li.lease_id
LEFT JOIN `maintenance_requests` mr ON u.unit_id = mr.unit_id AND mr.reporter_user_id = ls.user_id
WHERE l.status = 'ACTIVE'
GROUP BY ls.user_id, l.lease_id, u.unit_id, p.property_id;

-- ------------------------------------------------------------------------------
-- 6. VIEW: vw_property_ratings_reviews
-- Purpose: Aggregates double-blind post-tenancy review scores and calculates
-- average rating scores per property and landlord.
-- ------------------------------------------------------------------------------
DROP VIEW IF EXISTS `vw_property_ratings_reviews`;
CREATE VIEW `vw_property_ratings_reviews` AS
SELECT 
    p.property_id,
    p.property_name,
    p.owner_id,
    COUNT(r.review_id) AS total_reviews_count,
    ROUND(AVG(r.rating), 2) AS average_rating_score,
    SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END) AS five_star_count,
    SUM(CASE WHEN r.rating = 1 THEN 1 ELSE 0 END) AS one_star_count
FROM `properties` p
JOIN `units` u ON p.property_id = u.property_id
JOIN `leases` l ON u.unit_id = l.unit_id
JOIN `reviews` r ON l.lease_id = r.lease_id
WHERE r.is_published = TRUE AND r.reviewee_user_id = p.owner_id
GROUP BY p.property_id;

-- ------------------------------------------------------------------------------
-- 7. VIEW: vw_maintenance_summary_dispatch
-- Purpose: Operational work order dispatch summary grouping maintenance tickets
-- by priority, status, vendor assignment, and cumulative repair costs.
-- ------------------------------------------------------------------------------
DROP VIEW IF EXISTS `vw_maintenance_summary_dispatch`;
CREATE VIEW `vw_maintenance_summary_dispatch` AS
SELECT 
    mr.request_id,
    mr.issue_category,
    mr.priority_level,
    mr.status AS ticket_status,
    mr.permission_to_enter,
    mr.created_at AS reported_at,
    u.unit_number,
    p.property_name,
    p.street_address,
    v.company_name AS vendor_company_name,
    v.trade_specialty AS vendor_trade,
    COALESCE(SUM(me.total_cost), 0.00) AS total_repair_expense
FROM `maintenance_requests` mr
JOIN `units` u ON mr.unit_id = u.unit_id
JOIN `properties` p ON u.property_id = p.property_id
LEFT JOIN `vendors` v ON mr.assigned_vendor_id = v.vendor_id
LEFT JOIN `maintenance_expenses` me ON mr.request_id = me.request_id
GROUP BY mr.request_id;

-- ------------------------------------------------------------------------------
-- 8. VIEW: vw_recent_notifications_queue
-- Purpose: Active notifications inbox view for user dashboards filtering 
-- unread and pending messages across Email, SMS, and In-App channels.
-- ------------------------------------------------------------------------------
DROP VIEW IF EXISTS `vw_recent_notifications_queue`;
CREATE VIEW `vw_recent_notifications_queue` AS
SELECT 
    n.notification_id,
    n.recipient_user_id,
    u.email AS recipient_email,
    n.channel_type,
    n.title,
    n.message_body,
    n.delivery_status,
    n.sent_at
FROM `notifications` n
JOIN `users` u ON n.recipient_user_id = u.user_id
WHERE n.delivery_status IN ('PENDING', 'SENT')
ORDER BY n.notification_id DESC;

-- ------------------------------------------------------------------------------
-- 9. VIEW: vw_overdue_invoices_report
-- Purpose: Property management delinquency report tracking unpaid invoices past
-- due date with calculated days overdue and tenant contact info.
-- ------------------------------------------------------------------------------
DROP VIEW IF EXISTS `vw_overdue_invoices_report`;
CREATE VIEW `vw_overdue_invoices_report` AS
SELECT 
    li.invoice_id,
    li.lease_id,
    li.billing_period_start,
    li.billing_period_end,
    li.due_date,
    li.total_amount_due,
    DATEDIFF(CURRENT_DATE, li.due_date) AS days_overdue,
    u.unit_number,
    p.property_name,
    usr.user_id AS tenant_user_id,
    up.first_name AS tenant_first_name,
    up.last_name AS tenant_last_name,
    usr.email AS tenant_email,
    usr.phone_number AS tenant_phone
FROM `lease_invoices` li
JOIN `leases` l ON li.lease_id = l.lease_id
JOIN `units` u ON l.unit_id = u.unit_id
JOIN `properties` p ON u.property_id = p.property_id
JOIN `lease_signers` ls ON l.lease_id = ls.lease_id AND ls.signer_role = 'PRIMARY_TENANT'
JOIN `users` usr ON ls.user_id = usr.user_id
LEFT JOIN `user_profiles` up ON usr.user_id = up.user_id
WHERE li.payment_status IN ('UNPAID', 'OVERDUE', 'PARTIALLY_PAID')
  AND li.due_date < CURRENT_DATE;

-- ------------------------------------------------------------------------------
-- 10. VIEW: vw_vendor_performance_summary
-- Purpose: Analyzes vendor metrics including completed work orders, average star
-- rating, labor vs parts cost breakdowns, and cumulative payout receipts.
-- ------------------------------------------------------------------------------
DROP VIEW IF EXISTS `vw_vendor_performance_summary`;
CREATE VIEW `vw_vendor_performance_summary` AS
SELECT 
    v.vendor_id,
    v.company_name,
    v.trade_specialty,
    v.license_number,
    v.average_rating,
    COUNT(DISTINCT mr.request_id) AS total_assigned_requests,
    COUNT(DISTINCT CASE WHEN mr.status = 'COMPLETED' THEN mr.request_id END) AS completed_requests_count,
    COALESCE(SUM(me.labor_cost), 0.00) AS total_labor_billed,
    COALESCE(SUM(me.parts_cost), 0.00) AS total_parts_billed,
    COALESCE(SUM(me.total_cost), 0.00) AS total_gross_billed
FROM `vendors` v
LEFT JOIN `maintenance_requests` mr ON v.vendor_id = mr.assigned_vendor_id
LEFT JOIN `maintenance_expenses` me ON mr.request_id = me.request_id
GROUP BY v.vendor_id;
