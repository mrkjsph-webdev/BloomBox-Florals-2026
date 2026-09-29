-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 29, 2026 at 08:43 AM
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
-- Database: `bbf_clientdb`
--

-- --------------------------------------------------------

--
-- Table structure for table `client`
--

CREATE TABLE `client` (
  `client_id` int(11) NOT NULL,
  `firebase_uid` varchar(255) DEFAULT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `hash_password` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `pfp` varchar(255) DEFAULT NULL,
  `contact_number` varchar(50) DEFAULT NULL,
  `gender` enum('Female','Male','Prefer not to say') DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `last_login` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `client`
--

INSERT INTO `client` (`client_id`, `firebase_uid`, `google_id`, `name`, `hash_password`, `email`, `pfp`, `contact_number`, `gender`, `address`, `created_at`, `last_login`) VALUES
(1, NULL, NULL, 'John Doe', '$2y$10$hecvoK.j2YePU4VmZGjF2u6ywi6JURz2yA0RuW.7imf.KwJAgVsKa', 'johndoe@gmail.com', NULL, NULL, NULL, NULL, '2026-09-16 09:24:43', '2026-09-23 13:49:46'),
(2, 'VWF0xwrZCYNR9qlIpwKSIhlBdhZ2', '110009424948891624332', 'Rai Lumiere', NULL, 'lumiere2080@gmail.com', 'https://lh3.googleusercontent.com/a/ACg8ocI8p18SHhfTklx3cOTA7WwMHUiHeuOuclKZQ32TZlp81ViNLxo=s96-c', '09684228231', 'Female', 'Malagasang 1-E Imus Cavite, Imus City, 4103, Cavite, Philippines', '2026-09-16 09:35:06', '2026-09-29 13:36:10'),
(34, NULL, NULL, 'John Pork Jr.', '$2y$10$bUF3Gp2E9UktFS2z4K92u.CBR8cVDYbmNqbwwBPFcUsLTlj6RejfO', 'johnporkjr@gmail.com', NULL, NULL, NULL, NULL, '2026-09-22 18:25:18', '2026-09-29 12:46:18');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `notification_type` enum('unread','seen') NOT NULL DEFAULT 'unread',
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`notification_id`, `client_id`, `order_id`, `title`, `message`, `notification_type`, `created_at`) VALUES
(1, 2, 14, 'Your Order Is Out for Delivery', 'Your order #0014 is now out for delivery.', 'seen', '2026-09-26 09:45:09'),
(2, 2, 21, 'Order Confirmed', 'Your order #0021 has been successfully placed.', 'seen', '2026-09-26 10:52:27'),
(3, 2, 15, 'Order Delivered', 'Your order #0015 has been delivered.', 'seen', '2026-09-26 10:53:54'),
(4, 2, 13, 'Your Order Is Out for Delivery', 'Your order #0013 is now out for delivery.', 'seen', '2026-09-26 10:58:15'),
(5, 2, 13, 'Order Delivered', 'Your order #0013 has been delivered.', 'seen', '2026-09-29 13:37:14'),
(6, 2, 22, 'Order Confirmed', 'Your order #0022 has been successfully placed.', 'unread', '2026-09-29 14:09:38'),
(7, 2, 21, 'Order Delivered', 'Your order #0021 has been delivered.', 'unread', '2026-09-29 14:10:37'),
(8, 2, 8, 'Order Status Updated', 'Your order #8 is now Delivered.', 'unread', '2026-09-29 14:24:58'),
(9, 2, 22, 'Order Status Updated', 'Your order #22 is now Out for Delivery.', 'unread', '2026-09-29 14:36:37'),
(10, 2, 22, 'Order Status Updated', 'Your order #22 is now Delivered.', 'unread', '2026-09-29 14:36:44');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `order_id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `payment_id` int(11) DEFAULT NULL,
  `order_date` datetime DEFAULT current_timestamp(),
  `order_status` enum('pending','out for delivery','completed','cancelled') DEFAULT 'pending',
  `delivery_method` enum('standard','express') NOT NULL DEFAULT 'standard',
  `unit_price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`order_id`, `client_id`, `payment_id`, `order_date`, `order_status`, `delivery_method`, `unit_price`) VALUES
(1, 2, 2, '2026-09-23 11:36:59', 'cancelled', 'standard', 2190.00),
(2, 2, 1, '2026-09-23 11:45:18', 'completed', 'standard', 2020.00),
(3, 2, 2, '2026-09-23 13:28:51', 'completed', 'standard', 910.00),
(4, 2, 2, '2026-09-23 13:29:37', 'out for delivery', 'standard', 770.00),
(5, 2, 2, '2026-09-23 13:43:17', 'completed', 'standard', 1510.00),
(6, 2, 2, '2026-09-23 13:45:33', 'completed', 'standard', 1250.00),
(7, 2, 2, '2026-09-23 14:10:09', 'completed', 'standard', 1180.00),
(8, 2, 1, '2026-09-26 07:26:26', 'completed', 'standard', 2790.00),
(9, 2, 2, '2026-09-26 07:27:38', 'completed', 'standard', 1640.00),
(10, 2, 1, '2026-09-26 07:47:59', 'completed', 'express', 1390.00),
(11, 2, 1, '2026-09-26 08:02:00', 'pending', 'express', 1370.00),
(12, 2, 1, '2026-09-26 08:15:46', 'pending', 'standard', 1370.00),
(13, 2, 1, '2026-09-26 08:23:40', 'completed', 'standard', 920.00),
(14, 2, 1, '2026-09-26 08:30:55', 'out for delivery', 'standard', 1230.00),
(15, 2, 2, '2026-09-26 08:53:10', 'completed', 'express', 2750.00),
(21, 2, 1, '2026-09-26 10:52:27', 'completed', 'standard', 700.00),
(22, 2, 1, '2026-09-29 14:09:38', 'completed', 'standard', 1470.00);

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `item_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `item_image` varchar(500) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `unit_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `customization` longtext DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`item_id`, `order_id`, `item_name`, `item_image`, `quantity`, `unit_price`, `customization`, `created_at`) VALUES
(1, 8, 'Blush Garden', NULL, 1, 1450.00, '{\"template\":{\"id\":\"blush\",\"name\":\"Blush Garden\",\"price\":580},\"paper_size\":{\"name\":\"Small\",\"price\":0},\"wrapper\":{\"name\":\"Kraft Paper\",\"price\":20},\"flowers\":[{\"id\":1,\"name\":\"Rose\",\"quantity\":5,\"unit_price\":80}],\"greeting_card\":false,\"plush_toy\":false,\"bouquet_id\":\"bouquet_6ab6f9ab522001.50923205\"}', '2026-09-26 07:26:26'),
(2, 8, 'Wildflower Meadow', NULL, 1, 1290.00, '{\"template\":{\"id\":\"wildflower\",\"name\":\"Wildflower Meadow\",\"price\":670},\"paper_size\":{\"name\":\"Small\",\"price\":0},\"wrapper\":{\"name\":\"Tissue Paper\",\"price\":30},\"flowers\":[{\"id\":1,\"name\":\"Rose\",\"quantity\":3,\"unit_price\":80}],\"greeting_card\":true,\"plush_toy\":true,\"bouquet_id\":\"bouquet_6ab6f9cadc74b3.94017361\"}', '2026-09-26 07:26:26'),
(3, 9, 'Blush Garden', NULL, 1, 1590.00, '{\"template\":{\"id\":\"blush\",\"name\":\"Blush Garden\",\"price\":580},\"paper_size\":{\"name\":\"Small\",\"price\":0},\"wrapper\":{\"name\":\"Tissue Paper\",\"price\":30},\"flowers\":[{\"id\":1,\"name\":\"Rose\",\"quantity\":5,\"unit_price\":80}],\"greeting_card\":false,\"plush_toy\":true,\"bouquet_id\":\"bouquet_6ab703647cea04.18786429\"}', '2026-09-26 07:27:38'),
(4, 10, 'Golden Sunshine', NULL, 1, 1290.00, '{\"template\":{\"id\":\"sunshine\",\"name\":\"Golden Sunshine\",\"price\":490},\"paper_size\":{\"name\":\"Small\",\"price\":0},\"wrapper\":{\"name\":\"Kraft Paper\",\"price\":20},\"flowers\":[{\"id\":1,\"name\":\"Rose\",\"quantity\":3,\"unit_price\":80}],\"greeting_card\":true,\"plush_toy\":true,\"bouquet_id\":\"bouquet_6ab7060f8aea34.70893454\"}', '2026-09-26 07:47:59'),
(5, 11, 'Golden Sunshine', NULL, 1, 1270.00, '{\"template\":{\"id\":\"sunshine\",\"name\":\"Golden Sunshine\",\"price\":490},\"paper_size\":{\"name\":\"Large\",\"price\":60},\"wrapper\":{\"name\":\"Wrapping Paper\",\"price\":40},\"flowers\":[{\"id\":3,\"name\":\"Sunflower\",\"quantity\":3,\"unit_price\":70}],\"greeting_card\":false,\"plush_toy\":false,\"bouquet_id\":\"bouquet_6ab70b6f899461.70550758\"}', '2026-09-26 08:02:00'),
(6, 12, 'Golden Sunshine', NULL, 1, 1320.00, '{\"template\":{\"id\":\"sunshine\",\"name\":\"Golden Sunshine\",\"price\":490},\"paper_size\":{\"name\":\"Small\",\"price\":0},\"wrapper\":{\"name\":\"Wrapping Paper\",\"price\":40},\"flowers\":[{\"id\":1,\"name\":\"Rose\",\"quantity\":3,\"unit_price\":80}],\"greeting_card\":false,\"plush_toy\":false,\"bouquet_id\":\"bouquet_6ab70ead1faf87.90666416\"}', '2026-09-26 08:15:46'),
(7, 13, 'Blush Garden', NULL, 1, 870.00, '{\"template\":{\"id\":\"blush\",\"name\":\"Blush Garden\",\"price\":580},\"paper_size\":{\"name\":\"Small\",\"price\":0},\"wrapper\":{\"name\":\"Kraft Paper\",\"price\":20},\"flowers\":[{\"id\":1,\"name\":\"Rose\",\"quantity\":1,\"unit_price\":80}],\"greeting_card\":false,\"plush_toy\":true,\"bouquet_id\":\"bouquet_6ab710884ec580.67337518\"}', '2026-09-26 08:23:40'),
(8, 14, 'Wildflower Meadow', NULL, 1, 1180.00, '{\"template\":{\"id\":\"wildflower\",\"name\":\"Wildflower Meadow\",\"price\":670},\"paper_size\":{\"name\":\"Small\",\"price\":0},\"wrapper\":{\"name\":\"Tissue Paper\",\"price\":30},\"flowers\":[{\"id\":6,\"name\":\"Orchid\",\"quantity\":3,\"unit_price\":90}],\"greeting_card\":false,\"plush_toy\":false,\"bouquet_id\":\"bouquet_6ab7123bc3c002.16258809\"}', '2026-09-26 08:30:55'),
(9, 15, 'Blush Garden', NULL, 1, 910.00, '{\"template\":{\"id\":\"blush\",\"name\":\"Blush Garden\",\"price\":580},\"paper_size\":{\"name\":\"Small\",\"price\":0},\"wrapper\":{\"name\":\"Kraft Paper\",\"price\":20},\"flowers\":[{\"id\":8,\"name\":\"Peony\",\"quantity\":1,\"unit_price\":90}],\"greeting_card\":false,\"plush_toy\":false,\"bouquet_id\":\"bouquet_6ab716fde9ed40.50491835\"}', '2026-09-26 08:53:10'),
(10, 15, 'Golden Sunshine', NULL, 1, 730.00, '{\"template\":{\"id\":\"sunshine\",\"name\":\"Golden Sunshine\",\"price\":490},\"paper_size\":{\"name\":\"Small\",\"price\":0},\"wrapper\":{\"name\":\"Kraft Paper\",\"price\":20},\"flowers\":[{\"id\":3,\"name\":\"Sunflower\",\"quantity\":1,\"unit_price\":70}],\"greeting_card\":false,\"plush_toy\":false,\"bouquet_id\":\"bouquet_6ab717086572d0.20903421\"}', '2026-09-26 08:53:10'),
(11, 15, 'Wildflower Meadow', NULL, 1, 1010.00, '{\"template\":{\"id\":\"wildflower\",\"name\":\"Wildflower Meadow\",\"price\":670},\"paper_size\":{\"name\":\"Small\",\"price\":0},\"wrapper\":{\"name\":\"Kraft Paper\",\"price\":20},\"flowers\":[{\"id\":6,\"name\":\"Orchid\",\"quantity\":1,\"unit_price\":90}],\"greeting_card\":true,\"plush_toy\":true,\"bouquet_id\":\"bouquet_6ab71712786d50.67941376\"}', '2026-09-26 08:53:10'),
(17, 21, 'Golden Sunshine', NULL, 1, 650.00, '{\"template\":{\"id\":\"sunshine\",\"name\":\"Golden Sunshine\",\"price\":490},\"paper_size\":{\"name\":\"Small\",\"price\":0},\"wrapper\":{\"name\":\"Kraft Paper\",\"price\":20},\"flowers\":[{\"id\":2,\"name\":\"Tulip\",\"quantity\":1,\"unit_price\":70}],\"greeting_card\":false,\"plush_toy\":false,\"bouquet_id\":\"bouquet_6ab723f1430d74.96719038\"}', '2026-09-26 10:52:27'),
(18, 22, 'Golden Sunshine', NULL, 1, 1420.00, '{\"template\":{\"id\":\"sunshine\",\"name\":\"Golden Sunshine\",\"price\":490},\"paper_size\":{\"name\":\"Medium\",\"price\":30},\"wrapper\":{\"name\":\"Wrapping Paper\",\"price\":40},\"flowers\":[{\"id\":3,\"name\":\"Sunflower\",\"quantity\":2,\"unit_price\":70}],\"greeting_card\":false,\"plush_toy\":true,\"bouquet_id\":\"bouquet_6abb5617ec16a4.81862854\"}', '2026-09-29 14:09:38');

-- --------------------------------------------------------

--
-- Table structure for table `payment_methods`
--

CREATE TABLE `payment_methods` (
  `payment_id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `payment_type` enum('cash','gcash') NOT NULL,
  `gcash_last_four` varchar(4) DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment_methods`
--

INSERT INTO `payment_methods` (`payment_id`, `client_id`, `payment_type`, `gcash_last_four`, `is_default`, `created_at`) VALUES
(1, 2, 'cash', NULL, 1, '2026-09-23 07:57:49'),
(2, 2, 'gcash', '8231', 0, '2026-09-23 07:58:05');

-- --------------------------------------------------------

--
-- Table structure for table `shopping_cart`
--

CREATE TABLE `shopping_cart` (
  `cart_id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `cart_status` enum('active','completed','abandoned') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `shopping_cart`
--

INSERT INTO `shopping_cart` (`cart_id`, `client_id`, `created_at`, `updated_at`, `cart_status`) VALUES
(1, 2, '2026-09-23 11:36:52', '2026-09-23 11:36:52', 'active');

-- --------------------------------------------------------

--
-- Table structure for table `shopping_cart_items`
--

CREATE TABLE `shopping_cart_items` (
  `item_id` int(11) NOT NULL,
  `cart_id` int(11) NOT NULL,
  `flower_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `added_at` datetime DEFAULT current_timestamp(),
  `unit_price` decimal(10,2) NOT NULL,
  `customization` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `client`
--
ALTER TABLE `client`
  ADD PRIMARY KEY (`client_id`),
  ADD UNIQUE KEY `firebase_uid` (`firebase_uid`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `google_id` (`google_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `client_id` (`client_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `fk_orders_client` (`client_id`),
  ADD KEY `idx_orders_payment_id` (`payment_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `idx_order_id` (`order_id`);

--
-- Indexes for table `payment_methods`
--
ALTER TABLE `payment_methods`
  ADD PRIMARY KEY (`payment_id`),
  ADD KEY `client_id` (`client_id`);

--
-- Indexes for table `shopping_cart`
--
ALTER TABLE `shopping_cart`
  ADD PRIMARY KEY (`cart_id`),
  ADD KEY `fk_cart_client` (`client_id`);

--
-- Indexes for table `shopping_cart_items`
--
ALTER TABLE `shopping_cart_items`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `fk_cart_items_cart` (`cart_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `client`
--
ALTER TABLE `client`
  MODIFY `client_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `payment_methods`
--
ALTER TABLE `payment_methods`
  MODIFY `payment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `shopping_cart`
--
ALTER TABLE `shopping_cart`
  MODIFY `cart_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `shopping_cart_items`
--
ALTER TABLE `shopping_cart_items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notification_client` FOREIGN KEY (`client_id`) REFERENCES `client` (`client_id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_client` FOREIGN KEY (`client_id`) REFERENCES `client` (`client_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_orders_payment` FOREIGN KEY (`payment_id`) REFERENCES `payment_methods` (`payment_id`) ON DELETE SET NULL;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE;

--
-- Constraints for table `payment_methods`
--
ALTER TABLE `payment_methods`
  ADD CONSTRAINT `fk_payment_client` FOREIGN KEY (`client_id`) REFERENCES `client` (`client_id`) ON DELETE CASCADE;

--
-- Constraints for table `shopping_cart`
--
ALTER TABLE `shopping_cart`
  ADD CONSTRAINT `fk_cart_client` FOREIGN KEY (`client_id`) REFERENCES `client` (`client_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `shopping_cart_items`
--
ALTER TABLE `shopping_cart_items`
  ADD CONSTRAINT `fk_cart_items_cart` FOREIGN KEY (`cart_id`) REFERENCES `shopping_cart` (`cart_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
