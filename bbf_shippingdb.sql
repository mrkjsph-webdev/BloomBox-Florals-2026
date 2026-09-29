-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 29, 2026 at 09:28 AM
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
-- Database: `bbf_shippingdb`
--

-- --------------------------------------------------------

--
-- Table structure for table `delivery_orders`
--

CREATE TABLE `delivery_orders` (
  `delivery_id` int(11) NOT NULL,
  `rider_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `delivery_status` enum('pending','picked_up','in_transit','delivered','cancelled') NOT NULL DEFAULT 'pending',
  `assigned_at` datetime DEFAULT current_timestamp(),
  `picked_up_at` datetime DEFAULT NULL,
  `delivered_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `delivery_orders`
--

INSERT INTO `delivery_orders` (`delivery_id`, `rider_id`, `order_id`, `delivery_status`, `assigned_at`, `picked_up_at`, `delivered_at`) VALUES
(1, 2, 7, 'delivered', '2026-09-29 13:05:53', '2026-09-29 13:29:40', '2026-09-29 13:29:43'),
(2, 2, 9, 'delivered', '2026-09-29 13:05:59', '2026-09-29 13:29:43', '2026-09-29 13:29:46'),
(3, 2, 5, 'delivered', '2026-09-29 13:11:40', '2026-09-29 13:29:57', '2026-09-29 13:30:04'),
(4, 2, 6, 'delivered', '2026-09-29 13:16:26', '2026-09-29 13:33:50', '2026-09-29 13:34:59'),
(5, 2, 10, 'delivered', '2026-09-29 13:16:43', '2026-09-29 14:18:48', '2026-09-29 14:20:29'),
(6, 2, 8, 'delivered', '2026-09-29 14:21:43', '2026-09-29 14:21:53', '2026-09-29 14:24:58'),
(7, 2, 22, 'delivered', '2026-09-29 14:36:27', '2026-09-29 14:36:37', '2026-09-29 14:36:44');

-- --------------------------------------------------------

--
-- Table structure for table `delivery_rider`
--

CREATE TABLE `delivery_rider` (
  `rider_id` int(11) NOT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `firebase_uid` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `hash_password` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `pfp` varchar(255) DEFAULT NULL,
  `contact_number` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `last_login` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `delivery_rider`
--

INSERT INTO `delivery_rider` (`rider_id`, `google_id`, `firebase_uid`, `name`, `hash_password`, `email`, `pfp`, `contact_number`, `created_at`, `last_login`) VALUES
(1, NULL, NULL, 'Jane Smith', '$2y$10$FZLgh.uKlrQAX08RlLO2p.KI8Ujk.f1JixE0I6HvF/EgWsYEodgye', 'janesmith@gmail.com', NULL, NULL, '2026-09-25 18:38:23', '2026-09-29 14:49:27'),
(2, '107249032175830184497', 'HM7fPKSWfmMyRo7EfCB4GoiqFX22', 'lemon', NULL, 'lemon249512@gmail.com', 'https://lh3.googleusercontent.com/a/ACg8ocLKGvhQcjhxQHL6DsTnTujbYjcHr2Py8CAd-WfNfZme_CdF7xQ=s96-c', NULL, '2026-09-25 18:57:31', '2026-09-29 15:23:16');

-- --------------------------------------------------------

--
-- Table structure for table `review_order`
--

CREATE TABLE `review_order` (
  `review_id` int(11) NOT NULL,
  `rider_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `rating` int(1) NOT NULL,
  `review_comment` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `review_order`
--

INSERT INTO `review_order` (`review_id`, `rider_id`, `order_id`, `rating`, `review_comment`, `created_at`) VALUES
(1, 2, 22, 4, 'Amazing!!!', '2026-09-29 14:45:54');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `delivery_orders`
--
ALTER TABLE `delivery_orders`
  ADD PRIMARY KEY (`delivery_id`),
  ADD KEY `rider_id` (`rider_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `delivery_rider`
--
ALTER TABLE `delivery_rider`
  ADD PRIMARY KEY (`rider_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `google_id` (`google_id`),
  ADD UNIQUE KEY `firebase_uid` (`firebase_uid`);

--
-- Indexes for table `review_order`
--
ALTER TABLE `review_order`
  ADD PRIMARY KEY (`review_id`),
  ADD KEY `rider_id` (`rider_id`),
  ADD KEY `order_id` (`order_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `delivery_orders`
--
ALTER TABLE `delivery_orders`
  MODIFY `delivery_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `delivery_rider`
--
ALTER TABLE `delivery_rider`
  MODIFY `rider_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `review_order`
--
ALTER TABLE `review_order`
  MODIFY `review_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `delivery_orders`
--
ALTER TABLE `delivery_orders`
  ADD CONSTRAINT `fk_delivery_rider` FOREIGN KEY (`rider_id`) REFERENCES `delivery_rider` (`rider_id`) ON DELETE CASCADE;

--
-- Constraints for table `review_order`
--
ALTER TABLE `review_order`
  ADD CONSTRAINT `fk_review_rider` FOREIGN KEY (`rider_id`) REFERENCES `delivery_rider` (`rider_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
