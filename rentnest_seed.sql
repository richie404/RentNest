-- ==============================================================================
-- RentNest Platform: Comprehensive Production Seed Data Script (MySQL 8)
-- Architecture: Populates all 41 Entities with Realistic SaaS Operational Data
-- ==============================================================================

USE `rentnest`;

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- 1. LOOKUP & REFERENCE SEEDS
-- ------------------------------------------------------------------------------
TRUNCATE TABLE `roles`;
INSERT INTO `roles` (`role_id`, `role_name`, `description`) VALUES
(1, 'ROLE_ADMIN', 'Platform System Administrator'),
(2, 'ROLE_PROPERTY_OWNER', 'Landlord / Property Investor'),
(3, 'ROLE_PROPERTY_MANAGER', 'Licensed Property Manager'),
(4, 'ROLE_TENANT', 'Residential Tenant / Lease Holder'),
(5, 'ROLE_VENDOR', 'Contractor / Maintenance Service Provider');

TRUNCATE TABLE `permissions`;
INSERT INTO `permissions` (`permission_id`, `permission_code`, `description`) VALUES
(1, 'property:create', 'Can register new real estate properties'),
(2, 'property:read', 'Can view property details and listings'),
(3, 'lease:create', 'Can execute legal lease agreements'),
(4, 'payment:process', 'Can submit and process rental payments'),
(5, 'maintenance:assign', 'Can assign work orders to contractors');

TRUNCATE TABLE `amenities`;
INSERT INTO `amenities` (`amenity_id`, `amenity_name`, `category`, `icon_url`) VALUES
(1, 'Swimming Pool', 'BUILDING', 'https://assets.rentnest.com/icons/pool.svg'),
(2, 'Fitness Center & Gym', 'BUILDING', 'https://assets.rentnest.com/icons/gym.svg'),
(3, 'In-Unit Washer & Dryer', 'UNIT', 'https://assets.rentnest.com/icons/laundry.svg'),
(4, 'Central Air Conditioning', 'UNIT', 'https://assets.rentnest.com/icons/ac.svg'),
(5, 'Covered Garage Parking', 'BUILDING', 'https://assets.rentnest.com/icons/parking.svg'),
(6, 'Pet Friendly', 'UNIT', 'https://assets.rentnest.com/icons/pet.svg'),
(7, '24/7 Security & CCTV', 'SAFETY', 'https://assets.rentnest.com/icons/security.svg'),
(8, 'Private Balcony', 'OUTDOOR', 'https://assets.rentnest.com/icons/balcony.svg');

TRUNCATE TABLE `platform_settings`;
INSERT INTO `platform_settings` (`setting_key`, `setting_value`, `data_type`) VALUES
('system.platform_fee_percent', '5.00', 'DECIMAL'),
('system.default_grace_days', '5', 'INT'),
('system.maintenance_auto_dispatch', 'true', 'BOOLEAN');

-- ------------------------------------------------------------------------------
-- 2. USER IDENTITY & RBAC SEEDS
-- ------------------------------------------------------------------------------
TRUNCATE TABLE `users`;
INSERT INTO `users` (`user_id`, `email`, `password_hash`, `phone_number`, `account_status`) VALUES
(1, 'admin@rentnest.com', '$2a$12$e9qO2q4J7L2Qn.V8uO8O7eK2B8u2n7Q8O7eK2B8u2n7Q8O7eK2B8u', '+15125550100', 'ACTIVE'),
(2, 'owner.johnson@apexproperties.com', '$2a$12$e9qO2q4J7L2Qn.V8uO8O7eK2B8u2n7Q8O7eK2B8u2n7Q8O7eK2B8u', '+15125550101', 'ACTIVE'),
(3, 'manager.sarah@horizonpm.com', '$2a$12$e9qO2q4J7L2Qn.V8uO8O7eK2B8u2n7Q8O7eK2B8u2n7Q8O7eK2B8u', '+15125550102', 'ACTIVE'),
(4, 'tenant.michael@gmail.com', '$2a$12$e9qO2q4J7L2Qn.V8uO8O7eK2B8u2n7Q8O7eK2B8u2n7Q8O7eK2B8u', '+15125550103', 'ACTIVE'),
(5, 'tenant.emily@yahoo.com', '$2a$12$e9qO2q4J7L2Qn.V8uO8O7eK2B8u2n7Q8O7eK2B8u2n7Q8O7eK2B8u', '+15125550104', 'ACTIVE'),
(6, 'vendor.robert@expressplumbing.com', '$2a$12$e9qO2q4J7L2Qn.V8uO8O7eK2B8u2n7Q8O7eK2B8u2n7Q8O7eK2B8u', '+15125550105', 'ACTIVE'),
(7, 'vendor.david@voltagehvac.com', '$2a$12$e9qO2q4J7L2Qn.V8uO8O7eK2B8u2n7Q8O7eK2B8u2n7Q8O7eK2B8u', '+15125550106', 'ACTIVE');

TRUNCATE TABLE `user_profiles`;
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `first_name`, `last_name`, `date_of_birth`, `ssn_tax_id_hash`) VALUES
(1, 1, 'System', 'Admin', '1985-04-12', 'hash_ssn_admin_000'),
(2, 2, 'Robert', 'Johnson', '1974-11-20', 'hash_ssn_owner_101'),
(3, 3, 'Sarah', 'Jenkins', '1988-07-15', 'hash_ssn_mgr_102'),
(4, 4, 'Michael', 'Miller', '1992-03-25', 'hash_ssn_tnt_103'),
(5, 5, 'Emily', 'Davis', '1995-09-08', 'hash_ssn_tnt_104'),
(6, 6, 'Robert', 'Taylor', '1980-01-30', 'hash_ssn_vnd_105'),
(7, 7, 'David', 'Clark', '1983-06-18', 'hash_ssn_vnd_106');

TRUNCATE TABLE `user_roles`;
INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 4),
(6, 5),
(7, 5);

-- ------------------------------------------------------------------------------
-- 3. PROPERTY & UNIT PORTFOLIO SEEDS
-- ------------------------------------------------------------------------------
TRUNCATE TABLE `properties`;
INSERT INTO `properties` (`property_id`, `owner_id`, `property_name`, `property_type`, `street_address`, `city`, `state_province`, `postal_code`, `year_built`) VALUES
(1, 2, 'Apex Luxury Heights', 'APARTMENT_COMPLEX', '450 Congress Ave', 'Austin', 'TX', '78701', 2021),
(2, 2, 'Oakridge Executive Townhomes', 'MULTI_FAMILY', '1200 Barton Springs Rd', 'Austin', 'TX', '78704', 2019),
(3, 2, 'Silicon Hills Residence', 'SINGLE_FAMILY', '8900 Research Blvd', 'Austin', 'TX', '78758', 2022);

TRUNCATE TABLE `units`;
INSERT INTO `units` (`unit_id`, `property_id`, `unit_number`, `square_feet`, `bedrooms`, `bathrooms`, `max_occupancy`, `target_rent`, `security_deposit_target`, `status`) VALUES
(1, 1, 'Apt 402', 850.00, 1, 1.0, 2, 1850.00, 1850.00, 'OCCUPIED'),
(2, 1, 'Apt 403', 1150.00, 2, 2.0, 4, 2450.00, 2450.00, 'VACANT'),
(3, 2, 'Unit B1', 1400.00, 3, 2.5, 5, 3100.00, 3100.00, 'OCCUPIED'),
(4, 3, 'Main House', 2200.00, 4, 3.0, 6, 4200.00, 4200.00, 'VACANT');

TRUNCATE TABLE `property_amenities`;
INSERT INTO `property_amenities` (`property_id`, `amenity_id`) VALUES
(1, 1), (1, 2), (1, 5), (1, 7),
(2, 5), (2, 7);

TRUNCATE TABLE `unit_amenities`;
INSERT INTO `unit_amenities` (`unit_id`, `amenity_id`) VALUES
(1, 3), (1, 4), (1, 8),
(2, 3), (2, 4), (2, 6), (2, 8),
(3, 3), (3, 4), (3, 5), (3, 8);

TRUNCATE TABLE `property_media`;
INSERT INTO `property_media` (`media_id`, `property_id`, `unit_id`, `media_type`, `media_url`, `display_order`, `is_primary`) VALUES
(1, 1, NULL, 'IMAGE', 'https://assets.rentnest.com/properties/apex_exterior.jpg', 1, TRUE),
(2, NULL, 1, 'IMAGE', 'https://assets.rentnest.com/units/apt_402_living.jpg', 1, TRUE),
(3, NULL, 2, 'FLOOR_PLAN', 'https://assets.rentnest.com/units/apt_403_plan.pdf', 1, FALSE);

-- ------------------------------------------------------------------------------
-- 4. APPLICATION & SCREENING SEEDS
-- ------------------------------------------------------------------------------
TRUNCATE TABLE `rental_applications`;
INSERT INTO `rental_applications` (`application_id`, `unit_id`, `applicant_user_id`, `desired_move_in_date`, `proposed_lease_months`, `declared_occupants_count`, `status`) VALUES
(1, 1, 4, '2026-01-01', 12, 1, 'APPROVED'),
(2, 3, 5, '2026-02-01', 12, 2, 'APPROVED');

TRUNCATE TABLE `applicant_details`;
INSERT INTO `applicant_details` (`applicant_detail_id`, `application_id`, `employer_name`, `job_title`, `verified_monthly_income`, `declared_pets_count`) VALUES
(1, 1, 'Dell Technologies', 'Senior Software Engineer', 9500.00, 0),
(2, 2, 'Whole Foods Market HQ', 'Marketing Manager', 7800.00, 1);

TRUNCATE TABLE `screening_reports`;
INSERT INTO `screening_reports` (`screening_id`, `application_id`, `credit_score`, `credit_score_tier`, `criminal_clearance`, `eviction_history_flag`, `third_party_reference_code`) VALUES
(1, 1, 780, 'EXCELLENT', TRUE, FALSE, 'REF_TRANSUNION_88901'),
(2, 2, 740, 'GOOD', TRUE, FALSE, 'REF_EXPERIAN_77209');

-- ------------------------------------------------------------------------------
-- 5. LEASE LIFECYCLE & INSPECTION SEEDS
-- ------------------------------------------------------------------------------
TRUNCATE TABLE `leases`;
INSERT INTO `leases` (`lease_id`, `unit_id`, `start_date`, `end_date`, `monthly_base_rent`, `due_day_of_month`, `grace_period_days`, `status`) VALUES
(1, 1, '2026-01-01', '2026-12-31', 1850.00, 1, 5, 'ACTIVE'),
(2, 3, '2026-02-01', '2027-01-31', 3100.00, 1, 5, 'ACTIVE');

TRUNCATE TABLE `lease_signers`;
INSERT INTO `lease_signers` (`lease_id`, `user_id`, `signer_role`, `signed_at`) VALUES
(1, 4, 'PRIMARY_TENANT', '2025-12-28 10:15:00'),
(2, 5, 'PRIMARY_TENANT', '2026-01-25 14:30:00');

TRUNCATE TABLE `move_inspections`;
INSERT INTO `move_inspections` (`inspection_id`, `lease_id`, `inspector_user_id`, `inspection_type`, `inspection_date`, `condition_summary_json`, `passed_flag`) VALUES
(1, 1, 3, 'MOVE_IN', '2025-12-31', '{"walls": "EXCELLENT", "floors": "GOOD", "appliances": "NEW"}', TRUE),
(2, 2, 3, 'MOVE_IN', '2026-01-31', '{"walls": "GOOD", "floors": "EXCELLENT", "appliances": "GOOD"}', TRUE);

-- ------------------------------------------------------------------------------
-- 6. FINANCIAL LEDGER SEEDS
-- ------------------------------------------------------------------------------
TRUNCATE TABLE `lease_invoices`;
INSERT INTO `lease_invoices` (`invoice_id`, `lease_id`, `billing_period_start`, `billing_period_end`, `due_date`, `total_amount_due`, `payment_status`) VALUES
(1, 1, '2026-07-01', '2026-07-31', '2026-07-01', 1850.00, 'PAID'),
(2, 2, '2026-07-01', '2026-07-31', '2026-07-01', 3100.00, 'PAID');

TRUNCATE TABLE `invoice_items`;
INSERT INTO `invoice_items` (`item_id`, `invoice_id`, `charge_type`, `description`, `amount`) VALUES
(1, 1, 'BASE_RENT', 'July 2026 Monthly Base Rent', 1850.00),
(2, 2, 'BASE_RENT', 'July 2026 Monthly Base Rent', 3100.00);

TRUNCATE TABLE `payments`;
INSERT INTO `payments` (`payment_id`, `payer_user_id`, `payment_channel`, `amount`, `gateway_transaction_token`, `payment_status`) VALUES
(1, 4, 'ACH', 1850.00, 'ch_stripe_pay_788910021', 'SETTLED'),
(2, 5, 'CREDIT_CARD', 3100.00, 'ch_stripe_pay_788910022', 'SETTLED');

TRUNCATE TABLE `payment_allocations`;
INSERT INTO `payment_allocations` (`payment_id`, `item_id`, `allocated_amount`) VALUES
(1, 1, 1850.00),
(2, 2, 3100.00);

TRUNCATE TABLE `security_deposits`;
INSERT INTO `security_deposits` (`deposit_id`, `lease_id`, `inspection_id`, `initial_deposit_amount`, `deduction_amount`, `refund_amount`, `escrow_account_ref`) VALUES
(1, 1, 1, 1850.00, 0.00, 0.00, 'ESCROW_CHASE_88901'),
(2, 2, 2, 3100.00, 0.00, 0.00, 'ESCROW_CHASE_88902');

TRUNCATE TABLE `owner_payouts`;
INSERT INTO `owner_payouts` (`payout_id`, `owner_user_id`, `property_id`, `gross_revenue_collected`, `management_fees_deducted`, `maintenance_expenses_deducted`, `net_payout_amount`, `payout_status`) VALUES
(1, 2, 1, 1850.00, 92.50, 0.00, 1757.50, 'DISBURSED');

-- ------------------------------------------------------------------------------
-- 7. MAINTENANCE & VENDOR SEEDS
-- ------------------------------------------------------------------------------
TRUNCATE TABLE `vendors`;
INSERT INTO `vendors` (`vendor_id`, `user_id`, `company_name`, `trade_specialty`, `license_number`, `average_rating`) VALUES
(1, 6, 'Express Plumbing Solutions', 'Plumbing & Water Lines', 'LIC_PLUMB_55401', 4.90),
(2, 7, 'Voltage HVAC & Electric', 'HVAC & Electrical', 'LIC_ELEC_99210', 4.85);

TRUNCATE TABLE `maintenance_requests`;
INSERT INTO `maintenance_requests` (`request_id`, `unit_id`, `reporter_user_id`, `assigned_vendor_id`, `issue_category`, `priority_level`, `permission_to_enter`, `description`, `status`) VALUES
(1, 1, 4, 1, 'PLUMBING', 'HIGH', TRUE, 'Kitchen sink drain line backup and slow leakage.', 'IN_PROGRESS'),
(2, 3, 5, 2, 'HVAC', 'MEDIUM', TRUE, 'Air conditioning blowing warm air during peak heat.', 'ASSIGNED');

TRUNCATE TABLE `maintenance_updates`;
INSERT INTO `maintenance_updates` (`update_id`, `request_id`, `user_id`, `update_note`, `status_changed_to`) VALUES
(1, 1, 6, 'Inspected kitchen drain. Parts ordered for P-trap replacement.', 'IN_PROGRESS');

TRUNCATE TABLE `maintenance_expenses`;
INSERT INTO `maintenance_expenses` (`expense_id`, `request_id`, `vendor_id`, `labor_cost`, `parts_cost`, `total_cost`) VALUES
(1, 1, 1, 120.00, 45.00, 165.00);

-- ------------------------------------------------------------------------------
-- 8. COMMUNICATION, REVIEWS & FAVORITES SEEDS
-- ------------------------------------------------------------------------------
TRUNCATE TABLE `conversations`;
INSERT INTO `conversations` (`conversation_id`, `context_type`, `context_id`) VALUES
(1, 'LEASE', 1),
(2, 'MAINTENANCE', 1);

TRUNCATE TABLE `messages`;
INSERT INTO `messages` (`message_id`, `conversation_id`, `sender_user_id`, `message_body`) VALUES
(1, 1, 4, 'Hi Sarah, confirming that the monthly rent ACH transfer has been submitted.'),
(2, 1, 3, 'Thank you Michael! Received and processed.'),
(3, 2, 4, 'Hello Robert, what time will the plumber arrive tomorrow?');

TRUNCATE TABLE `reviews`;
INSERT INTO `reviews` (`review_id`, `lease_id`, `reviewer_user_id`, `reviewee_user_id`, `rating`, `review_text`, `is_published`) VALUES
(1, 1, 4, 2, 5, 'Excellent apartment property management! Highly responsive team.', TRUE);

TRUNCATE TABLE `favorites`;
INSERT INTO `favorites` (`user_id`, `unit_id`) VALUES
(4, 2),
(5, 4);

-- ------------------------------------------------------------------------------
-- 9. AUDIT & AI EXTENSION SEEDS
-- ------------------------------------------------------------------------------
TRUNCATE TABLE `audit_logs`;
INSERT INTO `audit_logs` (`audit_id`, `actor_user_id`, `action_type`, `target_table`, `record_key`, `pre_image_json`, `post_image_json`, `ip_address`) VALUES
(1, 1, 'INSERT', 'leases', '1', NULL, '{"unit_id": 1, "tenant_id": 4, "status": "ACTIVE"}', '192.168.1.100');

TRUNCATE TABLE `notifications`;
INSERT INTO `notifications` (`notification_id`, `recipient_user_id`, `channel_type`, `title`, `message_body`, `delivery_status`) VALUES
(1, 4, 'EMAIL', 'Payment Received', 'Your July 2026 rent payment of $1,850.00 has settled successfully.', 'SENT');

TRUNCATE TABLE `ai_pricing_models`;
INSERT INTO `ai_pricing_models` (`model_run_id`, `unit_id`, `demand_score`, `suggested_monthly_rent`, `confidence_score`, `accepted_by_owner`) VALUES
(1, 2, 88.50, 2450.00, 0.94, TRUE);

TRUNCATE TABLE `ai_maintenance_triage`;
INSERT INTO `ai_maintenance_triage` (`triage_id`, `request_id`, `predicted_category`, `predicted_urgency`, `nlp_confidence_rating`) VALUES
(1, 1, 'PLUMBING', 'HIGH', 0.96);

SET FOREIGN_KEY_CHECKS = 1;
