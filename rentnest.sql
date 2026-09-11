SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+06:00";

CREATE DATABASE IF NOT EXISTS `rentnest`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_520_ci;

USE `rentnest`;

START TRANSACTION;

CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `password_hash` CHAR(64) NOT NULL,
  `role` ENUM('RENTER','OWNER','ADMIN') NOT NULL DEFAULT 'RENTER',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('ACTIVE','BANNED') NOT NULL DEFAULT 'ACTIVE',
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `role`, `created_at`, `status`, `active`) VALUES
(1, 'Admin', 'admin@rentnest.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'ADMIN', '2025-10-09 21:17:18', 'ACTIVE', 1),
(2, 'Alice', 'alice@gmail.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'OWNER', '2025-10-16 21:17:18', 'ACTIVE', 1),
(3, 'Bob', 'bob@gmail.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'OWNER', '2025-10-16 21:17:18', 'ACTIVE', 1),
(4, 'Charlie', 'charlie@gmail.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'RENTER', '2025-10-16 21:17:18', 'ACTIVE', 1),
(5, 'Alam', 'alam@gmail.com', 'fa7aa2ec12d43c41b00934841fc4324bf1dc7c0973185c404e3a8ebe8b0b9164', 'RENTER', '2025-10-16 21:17:18', 'ACTIVE', 1),
(6, 'alam', 'alam@mail.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'OWNER', '2025-10-16 21:29:18', 'ACTIVE', 1),
(7, 'ammu', 'ammu@gmail.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'OWNER', '2025-10-16 22:54:35', 'ACTIVE', 1),
(8, 'abbu', 'abbu@gmail.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'OWNER', '2025-10-16 23:29:58', 'ACTIVE', 1),
(9, 'papa', 'papa@gmail.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'RENTER', '2025-10-16 23:31:51', 'ACTIVE', 1),
(10, 'renter', 'renter@gmail.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'RENTER', '2025-10-16 23:57:39', 'ACTIVE', 1),
(11, 'chacha', 'chacha@gmail.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'RENTER', '2025-10-17 15:52:30', 'ACTIVE', 1),
(12, 'khala', 'khala@mail.com', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 'RENTER', '2025-10-23 21:16:22', 'ACTIVE', 1),
(13, 'mama', 'mama@mail.com', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', 'RENTER', '2025-10-24 13:21:11', 'ACTIVE', 1);

ALTER TABLE `users` AUTO_INCREMENT = 14;

CREATE TABLE `listings` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `owner_id` INT DEFAULT NULL,
  `title` VARCHAR(120) NOT NULL,
  `listing_type` ENUM('ROOM','FLAT','APARTMENT','OFFICE','PARKING') DEFAULT NULL,
  `location` VARCHAR(200) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `price_month` DECIMAL(10,2) NOT NULL,
  `deposit` DECIMAL(10,2) DEFAULT NULL,
  `size_sqft` INT UNSIGNED DEFAULT NULL,
  `bedrooms` TINYINT UNSIGNED DEFAULT NULL,
  `bathrooms` TINYINT UNSIGNED DEFAULT NULL,
  `furnished` TINYINT(1) DEFAULT NULL,
  `bachelor_allowed` TINYINT(1) DEFAULT NULL,
  `family_allowed` TINYINT(1) DEFAULT NULL,
  `approval_status` ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `is_available` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),

  KEY `idx_listings_owner` (`owner_id`),
  KEY `idx_listings_public` (`approval_status`, `is_available`),
  KEY `idx_listings_type` (`listing_type`),
  KEY `idx_listings_price` (`price_month`),

  CONSTRAINT `fk_listings_owner`
    FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`)
    ON DELETE SET NULL,

  CONSTRAINT `chk_listings_price`
    CHECK (`price_month` >= 0),

  CONSTRAINT `chk_listings_deposit`
    CHECK (`deposit` IS NULL OR `deposit` >= 0),

  CONSTRAINT `chk_listings_size`
    CHECK (`size_sqft` IS NULL OR `size_sqft` > 0),

  CONSTRAINT `chk_listings_furnished`
    CHECK (`furnished` IS NULL OR `furnished` IN (0,1)),

  CONSTRAINT `chk_listings_bachelor`
    CHECK (`bachelor_allowed` IS NULL OR `bachelor_allowed` IN (0,1)),

  CONSTRAINT `chk_listings_family`
    CHECK (`family_allowed` IS NULL OR `family_allowed` IN (0,1)),

  CONSTRAINT `chk_listings_available`
    CHECK (`is_available` IN (0,1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

INSERT INTO `listings`
(`id`, `owner_id`, `title`, `listing_type`, `location`, `description`,
 `price_month`, `deposit`, `size_sqft`, `bedrooms`, `bathrooms`,
 `furnished`, `bachelor_allowed`, `family_allowed`,
 `approval_status`, `is_available`, `created_at`, `updated_at`)
VALUES
(1, 2, 'Cozy Studio in Gulshan', NULL, 'Gulshan 2, Dhaka', NULL, 12000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'APPROVED', 1, '2025-10-14 21:17:18', '2025-10-14 21:17:18'),
(2, 2, 'Luxury Flat with Balcony', NULL, 'Banani, Dhaka', NULL, 25000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'APPROVED', 1, '2025-10-12 21:17:18', '2025-10-12 21:17:18'),
(3, 2, 'Family Apartment', NULL, 'Uttara Sector 7, Dhaka', NULL, 18000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'APPROVED', 1, '2025-10-11 21:17:18', '2025-10-11 21:17:18'),
(4, 2, 'Single Room Apartment', NULL, 'Mirpur DOHS, Dhaka', NULL, 9000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'APPROVED', 1, '2025-10-15 21:17:18', '2025-10-15 21:17:18'),
(5, 2, 'Furnished Duplex', NULL, 'Bashundhara R/A, Dhaka', NULL, 32000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'REJECTED', 1, '2025-10-10 21:17:18', '2025-10-10 21:17:18'),
(6, 2, 'Budget Studio', NULL, 'Mohakhali DOHS, Dhaka', NULL, 8500.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'APPROVED', 1, '2025-10-08 21:17:18', '2025-10-08 21:17:18'),
(7, 3, 'Corner View Apartment', NULL, 'Dhanmondi 10, Dhaka', NULL, 22000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'APPROVED', 1, '2025-10-13 21:17:18', '2025-10-13 21:17:18'),
(8, 2, 'Modern 2BHK', NULL, 'Badda, Dhaka', NULL, 17000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'APPROVED', 1, '2025-10-09 21:17:18', '2025-10-09 21:17:18'),
(9, 2, 'Compact Studio', NULL, 'Shyamoli, Dhaka', NULL, 9500.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'APPROVED', 1, '2025-10-07 21:17:18', '2025-10-07 21:17:18'),
(10, 2, 'Sunny Apartment', NULL, 'Malibagh, Dhaka', NULL, 15000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'APPROVED', 1, '2025-10-06 21:17:18', '2025-10-06 21:17:18'),
(11, 2, 'Elegant Apartment in Uttara', NULL, 'Uttara Sector 11, Dhaka', NULL, 26000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'APPROVED', 1, '2025-10-05 21:17:18', '2025-10-05 21:17:18'),
(12, 2, 'Luxury Penthouse in Banani', NULL, 'Banani Block E, Dhaka', NULL, 48000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'APPROVED', 1, '2025-10-04 21:17:18', '2025-10-04 21:17:18'),
(13, 2, 'Modern Family Flat', NULL, 'Bashundhara R/A, Dhaka', NULL, 30000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'APPROVED', 1, '2025-10-03 21:17:18', '2025-10-03 21:17:18'),
(14, 3, 'Affordable Studio', NULL, 'Mirpur 10, Dhaka', NULL, 9500.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'APPROVED', 1, '2025-10-02 21:17:18', '2025-10-02 21:17:18'),
(15, 3, 'City View Apartment', NULL, 'Khilgaon, Dhaka', NULL, 20000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'APPROVED', 1, '2025-10-01 21:17:18', '2025-10-01 21:17:18'),
(16, 3, 'Elegant Duplex', NULL, 'Nikunja 2, Dhaka', NULL, 42000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'APPROVED', 1, '2025-09-30 21:17:18', '2025-09-30 21:17:18'),
(17, 3, 'Classic Apartment', NULL, 'Tejgaon, Dhaka', NULL, 17000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'APPROVED', 1, '2025-09-29 21:17:18', '2025-09-29 21:17:18'),
(18, 3, 'Luxury Condo', NULL, 'Gulshan Avenue, Dhaka', NULL, 55000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'APPROVED', 1, '2025-09-28 21:17:18', '2025-09-28 21:17:18'),
(19, 2, 'Peaceful Flat', NULL, 'Rampura, Dhaka', NULL, 14000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'APPROVED', 1, '2025-09-27 21:17:18', '2025-09-27 21:17:18'),
(20, 2, 'Stylish Apartment', NULL, 'Wari, Dhaka', NULL, 22000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'APPROVED', 1, '2025-09-26 21:17:18', '2025-09-26 21:17:18'),
(21, 7, 'Bepari Tower', NULL, 'Badda', NULL, 25000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'APPROVED', 1, '2025-10-17 21:24:03', '2025-10-17 21:24:03');

ALTER TABLE `listings` AUTO_INCREMENT = 27;

CREATE TABLE `listing_photos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `listing_id` INT NOT NULL,
  `url` VARCHAR(500) NOT NULL,
  `is_primary` TINYINT(1) NOT NULL DEFAULT 0,
  `sort_order` INT UNSIGNED NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_listing_photos_listing` (`listing_id`),
  KEY `idx_listing_photos_primary` (`listing_id`, `is_primary`, `sort_order`),

  CONSTRAINT `fk_listing_photos_listing`
    FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`)
    ON DELETE CASCADE,

  CONSTRAINT `chk_listing_photos_primary`
    CHECK (`is_primary` IN (0,1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

INSERT INTO `listing_photos`
(`id`, `listing_id`, `url`, `is_primary`, `sort_order`, `created_at`)
VALUES
(1, 1, 'http://localhost/rentnest_photos/1.jpg', 1, 1, CURRENT_TIMESTAMP),
(2, 2, 'http://localhost/rentnest_photos/2.jpg', 1, 1, CURRENT_TIMESTAMP),
(3, 3, 'http://localhost/rentnest_photos/3.jpg', 1, 1, CURRENT_TIMESTAMP),
(4, 4, 'http://localhost/rentnest_photos/4.jpg', 1, 1, CURRENT_TIMESTAMP),
(5, 5, 'http://localhost/rentnest_photos/5.jpg', 1, 1, CURRENT_TIMESTAMP),
(6, 6, 'http://localhost/rentnest_photos/6.jpg', 1, 1, CURRENT_TIMESTAMP),
(7, 7, 'http://localhost/rentnest_photos/7.jpg', 1, 1, CURRENT_TIMESTAMP),
(8, 8, 'http://localhost/rentnest_photos/8.jpg', 1, 1, CURRENT_TIMESTAMP),
(9, 9, 'http://localhost/rentnest_photos/9.jpg', 1, 1, CURRENT_TIMESTAMP),
(10, 10, 'http://localhost/rentnest_photos/10.jpg', 1, 1, CURRENT_TIMESTAMP),
(11, 11, 'http://localhost/rentnest_photos/11.jpg', 1, 1, CURRENT_TIMESTAMP),
(12, 12, 'http://localhost/rentnest_photos/12.jpg', 1, 1, CURRENT_TIMESTAMP),
(13, 13, 'http://localhost/rentnest_photos/13.jpg', 1, 1, CURRENT_TIMESTAMP),
(14, 14, 'http://localhost/rentnest_photos/14.jpg', 1, 1, CURRENT_TIMESTAMP),
(15, 15, 'http://localhost/rentnest_photos/15.jpg', 1, 1, CURRENT_TIMESTAMP),
(16, 16, 'http://localhost/rentnest_photos/16.jpg', 1, 1, CURRENT_TIMESTAMP),
(17, 17, 'http://localhost/rentnest_photos/17.jpg', 1, 1, CURRENT_TIMESTAMP),
(18, 18, 'http://localhost/rentnest_photos/18.jpg', 1, 1, CURRENT_TIMESTAMP),
(19, 19, 'http://localhost/rentnest_photos/19.jpg', 1, 1, CURRENT_TIMESTAMP),
(20, 20, 'http://localhost/rentnest_photos/20.jpg', 1, 1, CURRENT_TIMESTAMP),
(21, 21, 'http://localhost/rentnest_photos/21.jpg', 1, 1, CURRENT_TIMESTAMP);

ALTER TABLE `listing_photos` AUTO_INCREMENT = 34;

CREATE TABLE `amenities` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_amenities_code` (`code`),
  UNIQUE KEY `uq_amenities_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

INSERT INTO `amenities` (`id`, `code`, `name`) VALUES
(1, 'WIFI', 'Wi-Fi'),
(2, 'PARKING', 'Parking'),
(3, 'PETS_ALLOWED', 'Pets Allowed'),
(4, 'LIFT', 'Lift'),
(5, 'SECURITY', 'Security');

ALTER TABLE `amenities` AUTO_INCREMENT = 6;

CREATE TABLE `listing_amenities` (
  `listing_id` INT NOT NULL,
  `amenity_id` INT NOT NULL,

  PRIMARY KEY (`listing_id`, `amenity_id`),
  KEY `idx_listing_amenities_amenity` (`amenity_id`),

  CONSTRAINT `fk_listing_amenities_listing`
    FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`)
    ON DELETE CASCADE,

  CONSTRAINT `fk_listing_amenities_amenity`
    FOREIGN KEY (`amenity_id`) REFERENCES `amenities` (`id`)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

CREATE TABLE `bookings` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `listing_id` INT NOT NULL,
  `renter_id` INT NOT NULL,
  `owner_id` INT DEFAULT NULL,
  `start_date` DATE DEFAULT NULL,
  `end_date` DATE DEFAULT NULL,
  `total_amount` DECIMAL(10,2) DEFAULT 0.00,
  `status` ENUM('PENDING','PENDING_OWNER_APPROVAL','CONFIRMED','CANCELLED','APPROVED','REJECTED') DEFAULT 'PENDING',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_bookings_listing` (`listing_id`),
  KEY `idx_bookings_renter` (`renter_id`),
  KEY `idx_bookings_owner` (`owner_id`),

  CONSTRAINT `fk_bookings_listing`
    FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`)
    ON DELETE CASCADE,

  CONSTRAINT `fk_bookings_renter`
    FOREIGN KEY (`renter_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE,

  CONSTRAINT `fk_bookings_owner`
    FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

INSERT INTO `bookings` (`id`, `listing_id`, `renter_id`, `owner_id`, `start_date`, `end_date`, `total_amount`, `status`, `created_at`) VALUES
(21, 1, 12, 2, '2025-09-01', '2025-10-01', 10000.00, 'PENDING', '2025-10-22 18:58:28'),
(23, 1, 3, 2, '2025-10-25', '2025-11-25', 20000.00, 'CONFIRMED', '2025-10-23 16:46:21'),
(24, 2, 4, 2, '2025-10-23', '2025-11-23', 18000.00, 'CONFIRMED', '2025-10-23 16:46:21'),
(25, 3, 5, 2, '2025-10-28', '2025-11-28', 22000.00, 'CANCELLED', '2025-10-23 16:46:21'),
(26, 21, 12, 7, '2026-11-01', '2026-12-01', 25000.00, 'CONFIRMED', '2025-10-23 21:17:33'),
(27, 4, 13, 2, '2025-10-10', '2025-11-10', 9000.00, 'CONFIRMED', '2025-10-24 13:21:57');

ALTER TABLE `bookings` AUTO_INCREMENT = 28;

CREATE TABLE `favorites` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `listing_id` INT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_favorites_user_listing` (`user_id`, `listing_id`),
  KEY `idx_favorites_listing` (`listing_id`),

  CONSTRAINT `fk_favorites_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE,

  CONSTRAINT `fk_favorites_listing`
    FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

INSERT INTO `favorites` (`id`, `user_id`, `listing_id`, `created_at`) VALUES
(1, 12, 1, '2025-10-23 16:46:55'),
(2, 5, 2, '2025-10-23 16:46:55'),
(3, 4, 3, '2025-10-23 16:46:55');

ALTER TABLE `favorites` AUTO_INCREMENT = 4;

CREATE TABLE `inquiries` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `listing_id` INT NOT NULL,
  `renter_id` INT NOT NULL,
  `message` TEXT DEFAULT NULL,
  `contact` VARCHAR(150) DEFAULT NULL,
  `status` ENUM('Pending','Replied','Closed') DEFAULT 'Pending',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_inquiries_listing` (`listing_id`),
  KEY `idx_inquiries_renter` (`renter_id`),

  CONSTRAINT `fk_inquiries_listing`
    FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`)
    ON DELETE CASCADE,

  CONSTRAINT `fk_inquiries_renter`
    FOREIGN KEY (`renter_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

CREATE TABLE `messages` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `listing_id` INT DEFAULT NULL,
  `sender_id` INT NOT NULL,
  `receiver_id` INT NOT NULL,
  `message_text` TEXT NOT NULL,
  `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_messages_receiver` (`receiver_id`),
  KEY `idx_messages_sender_receiver` (`sender_id`, `receiver_id`),
  KEY `idx_messages_listing` (`listing_id`),

  CONSTRAINT `fk_messages_listing`
    FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`)
    ON DELETE SET NULL,

  CONSTRAINT `fk_messages_sender`
    FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE,

  CONSTRAINT `fk_messages_receiver`
    FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

INSERT INTO `messages` (`id`, `listing_id`, `sender_id`, `receiver_id`, `message_text`, `timestamp`) VALUES
(1, 1, 3, 2, 'Hi! Is this studio still available?', '2025-10-17 20:40:29'),
(2, 1, 2, 4, 'Yes, it’s still available! When would you like to visit?', '2025-10-17 20:40:29'),
(3, 2, 3, 2, 'Can you share more pictures of the balcony?', '2025-10-17 20:40:29'),
(4, 2, 2, 3, 'Sure! I’ll upload them shortly.', '2025-10-17 20:40:29'),
(5, 12, 3, 7, 'Hi! I saw your Banani penthouse listing — is it still open?', '2025-10-15 09:20:00'),
(6, 12, 7, 3, 'Hello! Yes, it’s still available. Are you interested in a visit?', '2025-10-15 09:25:00'),
(7, 12, 3, 7, 'Absolutely! Tomorrow at 4 PM works?', '2025-10-15 09:28:00'),
(8, 12, 7, 3, 'That’s perfect. I’ll send you the location shortly.', '2025-10-15 09:32:00'),
(9, 14, 5, 8, 'Hey, is this studio pet-friendly?', '2025-10-16 11:10:00'),
(10, 14, 8, 5, 'Hi there! Yes, small pets are allowed.', '2025-10-16 11:15:00'),
(11, 14, 5, 8, 'Nice! I have a cat. Hope that’s okay.', '2025-10-16 11:17:00'),
(12, 14, 8, 5, 'Cats are fine! Would you like to visit the place?', '2025-10-16 11:22:00'),
(13, 18, 9, 10, 'Hello, I’m interested in the parking space. Is it still available?', '2025-10-17 13:00:00'),
(14, 18, 10, 9, 'Yes! Still available. Are you looking for long-term rental?', '2025-10-17 13:05:00'),
(15, 18, 9, 10, 'Yes, I’d prefer 6 months or more.', '2025-10-17 13:08:00'),
(16, 18, 10, 9, 'Perfect. Let’s meet tomorrow to finalize!', '2025-10-17 13:10:00'),
(17, 21, 7, 7, 'lebu', '2025-10-19 12:31:22'),
(18, 21, 11, 7, 'lebu khabo', '2025-10-19 12:32:07'),
(19, 21, 11, 7, 'hi', '2025-10-19 13:39:01'),
(20, 21, 7, 11, 'hello', '2025-10-19 15:25:58'),
(21, 21, 11, 7, 'ammu????', '2025-10-19 15:26:54'),
(22, 21, 7, 11, 'chacha', '2025-10-19 15:27:30'),
(23, 21, 11, 11, 'ammu', '2025-10-19 15:28:07'),
(24, 21, 12, 7, 'hello', '2025-10-24 03:17:02'),
(25, 21, 1, 7, 'yow', '2025-10-25 19:50:12');

ALTER TABLE `messages` AUTO_INCREMENT = 26;

CREATE TABLE `payments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `booking_id` INT NOT NULL,
  `amount` DOUBLE NOT NULL,
  `payment_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_payments_booking` (`booking_id`),

  CONSTRAINT `fk_payments_booking`
    FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

CREATE TABLE `admin_actions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `admin_id` INT NOT NULL,
  `action_type` VARCHAR(100) NOT NULL,
  `target_id` INT NOT NULL,
  `details` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_admin_actions_admin` (`admin_id`),

  CONSTRAINT `fk_admin_actions_admin`
    FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

COMMIT;

SHOW CREATE TABLE `listings`;
SHOW CREATE TABLE `listing_photos`;
SHOW CREATE TABLE `amenities`;
SHOW CREATE TABLE `listing_amenities`;

SELECT COUNT(*) AS listing_count FROM `listings`;
SELECT `approval_status`, COUNT(*) AS total
FROM `listings`
GROUP BY `approval_status`;

SELECT `id`, `title`, `price_month`, `approval_status`, `is_available`
FROM `listings`
WHERE `approval_status` = 'APPROVED'
  AND `is_available` = 1
ORDER BY `id`;

SELECT * FROM `amenities` ORDER BY `id`;

SELECT lp.*
FROM `listing_photos` lp
LEFT JOIN `listings` l ON l.id = lp.listing_id
WHERE l.id IS NULL;

SELECT f.*
FROM `favorites` f
LEFT JOIN `listings` l ON l.id = f.listing_id
WHERE l.id IS NULL;

SELECT b.*
FROM `bookings` b
LEFT JOIN `listings` l ON l.id = b.listing_id
WHERE l.id IS NULL;

SELECT m.*
FROM `messages` m
LEFT JOIN `listings` l ON l.id = m.listing_id
WHERE m.listing_id IS NOT NULL
  AND l.id IS NULL;

SELECT i.*
FROM `inquiries` i
LEFT JOIN `listings` l ON l.id = i.listing_id
WHERE l.id IS NULL;
