-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 28, 2025 at 03:48 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `rentnest`
--

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `listing_id` int(11) NOT NULL,
  `renter_id` int(11) NOT NULL,
  `owner_id` int(11) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT 0.00,
  `status` enum('PENDING','PENDING_OWNER_APPROVAL','CONFIRMED','CANCELLED','APPROVED','REJECTED') DEFAULT 'PENDING',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `listing_id`, `renter_id`, `owner_id`, `start_date`, `end_date`, `total_amount`, `status`, `created_at`) VALUES
(21, 1, 12, 2, '2025-09-01', '2025-10-01', 10000.00, 'PENDING', '2025-10-22 18:58:28'),
(23, 1, 3, 2, '2025-10-25', '2025-11-25', 20000.00, 'CONFIRMED', '2025-10-23 16:46:21'),
(24, 2, 4, 2, '2025-10-23', '2025-11-23', 18000.00, 'CONFIRMED', '2025-10-23 16:46:21'),
(25, 3, 5, 2, '2025-10-28', '2025-11-28', 22000.00, 'CANCELLED', '2025-10-23 16:46:21'),
(26, 21, 12, 7, '2026-11-01', '2026-12-01', 25000.00, 'CONFIRMED', '2025-10-23 21:17:33'),
(27, 4, 13, 2, '2025-10-10', '2025-11-10', 9000.00, 'CONFIRMED', '2025-10-24 13:21:57');

-- --------------------------------------------------------

--
-- Table structure for table `favorites`
--

CREATE TABLE `favorites` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `listing_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

--
-- Dumping data for table `favorites`
--

INSERT INTO `favorites` (`id`, `user_id`, `listing_id`, `created_at`) VALUES
(1, 12, 1, '2025-10-23 16:46:55'),
(2, 5, 2, '2025-10-23 16:46:55'),
(3, 4, 3, '2025-10-23 16:46:55');

-- --------------------------------------------------------

--
-- Table structure for table `inquiries`
--

CREATE TABLE `inquiries` (
  `id` int(11) NOT NULL,
  `listing_id` int(11) NOT NULL,
  `renter_id` int(11) NOT NULL,
  `message` text DEFAULT NULL,
  `contact` varchar(150) DEFAULT NULL,
  `status` enum('Pending','Replied','Closed') DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

-- --------------------------------------------------------

--
-- Table structure for table `listings`
--

CREATE TABLE `listings` (
  `id` int(11) NOT NULL,
  `name` varchar(120) NOT NULL,
  `location` varchar(200) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `owner_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `approval_status` enum('PENDING','APPROVED','REJECTED') DEFAULT 'APPROVED',
  `is_available` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

--
-- Dumping data for table `listings`
--

INSERT INTO `listings` (`id`, `name`, `location`, `price`, `owner_id`, `created_at`, `approval_status`, `is_available`) VALUES
(1, 'Cozy Studio in Gulshan', 'Gulshan 2, Dhaka', 12000.00, 2, '2025-10-14 21:17:18', 'APPROVED', 1),
(2, 'Luxury Flat with Balcony', 'Banani, Dhaka', 25000.00, 2, '2025-10-12 21:17:18', 'APPROVED', 1),
(3, 'Family Apartment', 'Uttara Sector 7, Dhaka', 18000.00, 2, '2025-10-11 21:17:18', 'APPROVED', 1),
(4, 'Single Room Apartment', 'Mirpur DOHS, Dhaka', 9000.00, 2, '2025-10-15 21:17:18', 'APPROVED', 1),
(5, 'Furnished Duplex', 'Bashundhara R/A, Dhaka', 32000.00, 2, '2025-10-10 21:17:18', 'REJECTED', 1),
(6, 'Budget Studio', 'Mohakhali DOHS, Dhaka', 8500.00, 2, '2025-10-08 21:17:18', 'APPROVED', 1),
(7, 'Corner View Apartment', 'Dhanmondi 10, Dhaka', 22000.00, 3, '2025-10-13 21:17:18', 'APPROVED', 1),
(8, 'Modern 2BHK', 'Badda, Dhaka', 17000.00, 2, '2025-10-09 21:17:18', 'APPROVED', 1),
(9, 'Compact Studio', 'Shyamoli, Dhaka', 9500.00, 2, '2025-10-07 21:17:18', 'APPROVED', 1),
(10, 'Sunny Apartment', 'Malibagh, Dhaka', 15000.00, 2, '2025-10-06 21:17:18', 'APPROVED', 1),
(11, 'Elegant Apartment in Uttara', 'Uttara Sector 11, Dhaka', 26000.00, 2, '2025-10-05 21:17:18', 'APPROVED', 1),
(12, 'Luxury Penthouse in Banani', 'Banani Block E, Dhaka', 48000.00, 2, '2025-10-04 21:17:18', 'APPROVED', 1),
(13, 'Modern Family Flat', 'Bashundhara R/A, Dhaka', 30000.00, 2, '2025-10-03 21:17:18', 'APPROVED', 1),
(14, 'Affordable Studio', 'Mirpur 10, Dhaka', 9500.00, 3, '2025-10-02 21:17:18', 'APPROVED', 1),
(15, 'City View Apartment', 'Khilgaon, Dhaka', 20000.00, 3, '2025-10-01 21:17:18', 'APPROVED', 1),
(16, 'Elegant Duplex', 'Nikunja 2, Dhaka', 42000.00, 3, '2025-09-30 21:17:18', 'APPROVED', 1),
(17, 'Classic Apartment', 'Tejgaon, Dhaka', 17000.00, 3, '2025-09-29 21:17:18', 'APPROVED', 1),
(18, 'Luxury Condo', 'Gulshan Avenue, Dhaka', 55000.00, 3, '2025-09-28 21:17:18', 'APPROVED', 1),
(19, 'Peaceful Flat', 'Rampura, Dhaka', 14000.00, 2, '2025-09-27 21:17:18', 'APPROVED', 1),
(20, 'Stylish Apartment', 'Wari, Dhaka', 22000.00, 2, '2025-09-26 21:17:18', 'APPROVED', 1),
(21, 'Bepari Tower', 'Badda', 25000.00, 7, '2025-10-17 21:24:03', 'APPROVED', 1);

-- --------------------------------------------------------

--
-- Table structure for table `listing_photos`
--

CREATE TABLE `listing_photos` (
  `id` int(11) NOT NULL,
  `listing_id` int(11) NOT NULL,
  `url` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

--
-- Dumping data for table `listing_photos`
--

INSERT INTO `listing_photos` (`id`, `listing_id`, `url`) VALUES
(1, 1, 'http://localhost/rentnest_photos/1.jpg'),
(2, 2, 'http://localhost/rentnest_photos/2.jpg'),
(3, 3, 'http://localhost/rentnest_photos/3.jpg'),
(4, 4, 'http://localhost/rentnest_photos/4.jpg'),
(5, 5, 'http://localhost/rentnest_photos/5.jpg'),
(6, 6, 'http://localhost/rentnest_photos/6.jpg'),
(7, 7, 'http://localhost/rentnest_photos/7.jpg'),
(8, 8, 'http://localhost/rentnest_photos/8.jpg'),
(9, 9, 'http://localhost/rentnest_photos/9.jpg'),
(10, 10, 'http://localhost/rentnest_photos/10.jpg'),
(11, 11, 'http://localhost/rentnest_photos/11.jpg'),
(12, 12, 'http://localhost/rentnest_photos/12.jpg'),
(13, 13, 'http://localhost/rentnest_photos/13.jpg'),
(14, 14, 'http://localhost/rentnest_photos/14.jpg'),
(15, 15, 'http://localhost/rentnest_photos/15.jpg'),
(16, 16, 'http://localhost/rentnest_photos/16.jpg'),
(17, 17, 'http://localhost/rentnest_photos/17.jpg'),
(18, 18, 'http://localhost/rentnest_photos/18.jpg'),
(19, 19, 'http://localhost/rentnest_photos/19.jpg'),
(20, 20, 'http://localhost/rentnest_photos/20.jpg'),
(21, 21, 'http://localhost/rentnest_photos/21.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `listing_id` int(11) DEFAULT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `message_text` text NOT NULL,
  `timestamp` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `messages`
--

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

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `amount` double NOT NULL,
  `payment_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `socket_messages`
--

CREATE TABLE `socket_messages` (
  `id` int(11) NOT NULL,
  `listing_id` int(11) DEFAULT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `message_text` text NOT NULL,
  `timestamp` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` char(64) NOT NULL,
  `role` enum('RENTER','OWNER','ADMIN') DEFAULT 'RENTER',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('ACTIVE','BANNED') DEFAULT 'ACTIVE',
  `active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

--
-- Dumping data for table `users`
--

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

-- --------------------------------------------------------
--
-- Table structure for table `admin_actions`
--

CREATE TABLE `admin_actions` (
  `id` int(11) NOT NULL,
  `admin_id` int(11) NOT NULL,
  `action_type` varchar(100) NOT NULL,
  `target_id` int(11) NOT NULL,
  `details` text,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

--
-- Dumping data for table `admin_actions`
--

-- No seed data for admin actions

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `listing_id` (`listing_id`),
  ADD KEY `renter_id` (`renter_id`),
  ADD KEY `fk_bookings_owner` (`owner_id`);

--
-- Indexes for table `favorites`
--
ALTER TABLE `favorites`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`,`listing_id`),
  ADD KEY `listing_id` (`listing_id`);

--
-- Indexes for table `inquiries`
--
ALTER TABLE `inquiries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `listing_id` (`listing_id`),
  ADD KEY `renter_id` (`renter_id`);

--
-- Indexes for table `listings`
--
ALTER TABLE `listings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `owner_id` (`owner_id`);

--
-- Indexes for table `listing_photos`
--
ALTER TABLE `listing_photos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `listing_id` (`listing_id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_receiver` (`receiver_id`),
  ADD KEY `idx_sender_receiver` (`sender_id`,`receiver_id`),
  ADD KEY `idx_listing` (`listing_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `booking_id` (`booking_id`);

--
-- Indexes for table `socket_messages`
--
ALTER TABLE `socket_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_socket_listing` (`listing_id`),
  ADD KEY `fk_socket_sender` (`sender_id`),
  ADD KEY `fk_socket_receiver` (`receiver_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `admin_actions`
--
ALTER TABLE `admin_actions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `admin_id` (`admin_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `favorites`
--
ALTER TABLE `favorites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `inquiries`
--
ALTER TABLE `inquiries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `listings`
--
ALTER TABLE `listings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `listing_photos`
--
ALTER TABLE `listing_photos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `socket_messages`
--
ALTER TABLE `socket_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `admin_actions`
--
ALTER TABLE `admin_actions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`renter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_bookings_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `favorites`
--
ALTER TABLE `favorites`
  ADD CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `inquiries`
--
ALTER TABLE `inquiries`
  ADD CONSTRAINT `inquiries_ibfk_1` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `inquiries_ibfk_2` FOREIGN KEY (`renter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `listings`
--
ALTER TABLE `listings`
  ADD CONSTRAINT `listings_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `listing_photos`
--
ALTER TABLE `listing_photos`
  ADD CONSTRAINT `listing_photos_ibfk_1` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `fk_listing` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_receiver` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `socket_messages`
--
ALTER TABLE `socket_messages`
  ADD CONSTRAINT `fk_socket_listing` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_socket_receiver` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_socket_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `admin_actions`
--
ALTER TABLE `admin_actions`
  ADD CONSTRAINT `admin_actions_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
