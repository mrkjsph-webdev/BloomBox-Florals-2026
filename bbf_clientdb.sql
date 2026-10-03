-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 03, 2026 at 01:50 PM
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
(2, 'VWF0xwrZCYNR9qlIpwKSIhlBdhZ2', '110009424948891624332', 'Rai Lumiere', NULL, 'lumiere2080@gmail.com', 'https://lh3.googleusercontent.com/a/ACg8ocI8p18SHhfTklx3cOTA7WwMHUiHeuOuclKZQ32TZlp81ViNLxo=s96-c', '09684228231', 'Female', 'Malagasang 1-E Imus Cavite, Imus City, 4103, Cavite, Philippines', '2026-09-16 09:35:06', '2026-10-03 17:16:10'),
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
(10, 2, 22, 'Order Status Updated', 'Your order #22 is now Delivered.', 'unread', '2026-09-29 14:36:44'),
(11, 2, 23, 'Order Confirmed', 'Your order #0023 has been successfully placed.', 'unread', '2026-09-29 15:31:07'),
(12, 2, 23, 'Order Status Updated', 'Your order #23 is now Out for Delivery.', 'unread', '2026-09-29 15:31:57'),
(13, 2, 23, 'Order Status Updated', 'Your order #23 is now Delivered.', 'unread', '2026-09-29 15:32:03'),
(14, 2, 11, 'Order Status Updated', 'Your order #11 is now Out for Delivery.', 'unread', '2026-09-30 07:12:00'),
(15, 2, 11, 'Order Status Updated', 'Your order #11 is now Delivered.', 'unread', '2026-09-30 07:12:04'),
(16, 2, 30, 'Order Confirmed', 'Your order #0030 has been successfully placed.', 'unread', '2026-10-03 19:12:28');

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
  `unit_price` decimal(10,2) NOT NULL,
  `payment_status` enum('pending','paid','failed') NOT NULL DEFAULT 'pending',
  `paymongo_checkout_id` varchar(255) DEFAULT NULL,
  `paymongo_payment_intent_id` varchar(255) DEFAULT NULL,
  `paymongo_payment_id` varchar(255) DEFAULT NULL,
  `paymongo_qr_code_url` text DEFAULT NULL,
  `paymongo_qr_expires_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`order_id`, `client_id`, `payment_id`, `order_date`, `order_status`, `delivery_method`, `unit_price`, `payment_status`, `paymongo_checkout_id`, `paymongo_payment_intent_id`, `paymongo_payment_id`, `paymongo_qr_code_url`, `paymongo_qr_expires_at`) VALUES
(1, 2, 2, '2026-09-23 11:36:59', 'cancelled', 'standard', 2190.00, 'pending', NULL, NULL, NULL, NULL, NULL),
(2, 2, 1, '2026-09-23 11:45:18', 'completed', 'standard', 2020.00, 'pending', NULL, NULL, NULL, NULL, NULL),
(3, 2, 2, '2026-09-23 13:28:51', 'completed', 'standard', 910.00, 'pending', NULL, NULL, NULL, NULL, NULL),
(4, 2, 2, '2026-09-23 13:29:37', 'out for delivery', 'standard', 770.00, 'pending', NULL, NULL, NULL, NULL, NULL),
(5, 2, 2, '2026-09-23 13:43:17', 'completed', 'standard', 1510.00, 'pending', NULL, NULL, NULL, NULL, NULL),
(6, 2, 2, '2026-09-23 13:45:33', 'completed', 'standard', 1250.00, 'pending', NULL, NULL, NULL, NULL, NULL),
(7, 2, 2, '2026-09-23 14:10:09', 'completed', 'standard', 1180.00, 'pending', NULL, NULL, NULL, NULL, NULL),
(8, 2, 1, '2026-09-26 07:26:26', 'completed', 'standard', 2790.00, 'pending', NULL, NULL, NULL, NULL, NULL),
(9, 2, 2, '2026-09-26 07:27:38', 'completed', 'standard', 1640.00, 'pending', NULL, NULL, NULL, NULL, NULL),
(10, 2, 1, '2026-09-26 07:47:59', 'completed', 'express', 1390.00, 'pending', NULL, NULL, NULL, NULL, NULL),
(11, 2, 1, '2026-09-26 08:02:00', 'completed', 'express', 1370.00, 'pending', NULL, NULL, NULL, NULL, NULL),
(12, 2, 1, '2026-09-26 08:15:46', 'pending', 'standard', 1370.00, 'pending', NULL, NULL, NULL, NULL, NULL),
(13, 2, 1, '2026-09-26 08:23:40', 'completed', 'standard', 920.00, 'pending', NULL, NULL, NULL, NULL, NULL),
(14, 2, 1, '2026-09-26 08:30:55', 'out for delivery', 'standard', 1230.00, 'pending', NULL, NULL, NULL, NULL, NULL),
(15, 2, 2, '2026-09-26 08:53:10', 'completed', 'express', 2750.00, 'pending', NULL, NULL, NULL, NULL, NULL),
(21, 2, 1, '2026-09-26 10:52:27', 'completed', 'standard', 700.00, 'pending', NULL, NULL, NULL, NULL, NULL),
(22, 2, 1, '2026-09-29 14:09:38', 'completed', 'standard', 1470.00, 'pending', NULL, NULL, NULL, NULL, NULL),
(23, 2, 2, '2026-09-29 15:31:07', 'completed', 'standard', 2750.00, 'pending', NULL, NULL, NULL, NULL, NULL),
(24, 2, 2, '2026-10-03 18:45:34', 'pending', 'express', 1530.00, 'pending', NULL, 'pi_bBW3QCmVyVqFCUGyLkNiPmHq', NULL, NULL, NULL),
(25, 2, 2, '2026-10-03 18:59:26', 'pending', 'express', 1530.00, 'pending', NULL, 'pi_mw68NscwNmbXpEyiREi24caF', NULL, NULL, NULL),
(30, 2, 1, '2026-10-03 19:12:28', 'pending', 'standard', 1480.00, 'pending', NULL, NULL, NULL, NULL, NULL),
(31, 2, 2, '2026-10-03 19:13:43', 'pending', 'standard', 970.00, 'pending', NULL, 'pi_SrHnGruYNkNSjsWGQur3EZPD', NULL, NULL, NULL),
(32, 2, 2, '2026-10-03 19:35:12', 'pending', 'standard', 830.00, 'pending', NULL, 'pi_ZKCynfzMWYcEZ4KuGVxg4C6i', NULL, 'data:image/png;base64,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', '2026-10-03 14:05:14'),
(33, 2, 2, '2026-10-03 19:47:39', 'pending', 'standard', 830.00, 'pending', NULL, 'pi_rZsvrFaTzbcWFdJZaTJnADPw', NULL, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAk4AAAJOCAIAAADOOx+iAAApH0lEQVR4nOzdeZScV3nn8ad6l9Sy9sWyJEuyZSIvyIu8gx1iOwYTzMCEwWvIcDhMgISZJJDJnBBmIMkwA5M5ZzDEjm22E4IJwYQYiGOIbUYGY4PBdmQbL0i2JVtSa2mptbTUa83hLUbo+JVat2/d5Xmf+n6O/8ghVffeqq63frpVTz23o16vCwAAdrXlXgAAAHERdQAA44g6AIBxRB0AwDiiDgBgHFEHADCOqAMAGEfUAQCMI+oAAMYRdQAA44g6AIBxRB0AwDiiDgBgHFEHADCOqAMAGEfUAQCMI+oAAMYRdQAA44g6AIBxRB0AwDiiDgBgHFEHADCOqAMAGEfUAQCMI+oAAMYRdQAA44g6AIBxRB0AwDiiDgBgHFEHADCOqAMAGEfUAQCMI+oAAMYRdQAA44g6AIBxRB0AwDiiDgBgHFEHADCOqAMAGNeRa+JarZZrahGp1+uv+F/81uM3TvleZaHW4yLl3yLUM59y9pTParzXhstc8a4Cv8cVamT9c7ncq8xvzdree9NgVwcAMI6oAwAYR9QBAIwj6gAAxhF1AADjslVglsWrzNFfC+cye6h6ML+5XO5VlreONFetV3p+f4uU9ZbxqhD97uUye6iqUZd7+Qn1mtf23hsDuzoAgHFEHQDAOKIOAGAcUQcAMI6oAwAYp6gCsyxl/Z62KkQ/8XoP+t0rZY8+G5VvoWoOQ/0tXOZykXL2eF0f/dacskdoKCnfe9NgVwcAMI6oAwAYR9QBAIwj6gAAxhF1AADjVFdgphTvNOp48p6k7LceF34VdHkrZuP1XYxXPeh3m5RXQd6+pilf8/HOHEcDuzoAgHFEHQDAOKIOAGAcUQcAMI6oAwAYRwXmUcWrhQsl7ynkodYT6lkNVbcZ75TteLcpi9drNOXfS1tn2rz1jdRbNoNdHQDAOKIOAGAcUQcAMI6oAwAYR9QBAIxTXYGpv94pZX9Cv3vFq2HzW0/KufLWSbqsx+U2KU/rdhkn5d/L5TYpXwnxTg/Xdi65vdpOdnUAAOOIOgCAcUQdAMA4og4AYBxRBwAwTlEFpv4Ok/p7IebtqViWci6/cazexkUVx0n5/JTlPQc8ZSWnPezqAADGEXUAAOOIOgCAcUQdAMA4og4AYFzNXq+zeLRVrPmJd4q031x5eyq6jJz3PPp4z3PenqV5+6xqe8bivaJ4h29gVwcAMI6oAwAYR9QBAIwj6gAAxhF1AADjFPXAdKHtrF4X8Wqr4lUhuoyTt6auLNQrIV4f0bJ4r0O/kf1O4g4lZVWk33pC9XQNJdTrJ29daxrs6gAAxhF1AADjiDoAgHFEHQDAOKIOAGCc6grMUCdW563N86tq01abF2queHWbec/C9pPyzOiUla4us6fsI2r1jPh4db/6a4wni10dAMA4og4AYBxRBwAwjqgDABhH1AEAjFN0CnnKyjdtJ2in7OyX8kzkULWv8dYTanY911GD/me1zGqv2niPQv91que6YFcHADCOqAMAGEfUAQCMI+oAAMYRdQAA4xRVYJbFq46rYp+6lD0Dy7Q9rpT9CVN2/0tZu6i/SjPlaz7vCqtYa6q/qvZw7OoAAMYRdQAA44g6AIBxRB0AwDiiDgBgXLZTyENV5oSqoEtZB+gye8oaUZd7laU8p9jvDOtQp9i7SHmqtZ+Uf52853e7rDCelB0v482Vt0twDOzqAADGEXUAAOOIOgCAcUQdAMA4og4AYFy2Hph5e1emXE+8Wko/2k4cTtlLM+950Cn7bWp71YWStyOoi5Tn2scbR1u34eaxqwMAGEfUAQCMI+oAAMYRdQAA44g6AIBx2XpgluWtpdR2om7K87L9xKsrC/WspuwamvIEbW2ndZfprxYONZeLeF1MXR5pyspJbfW6h2NXBwAwjqgDABhH1AEAjCPqAADGEXUAAOMUVWCmrN/TdkJ0WbxH4XKv1ukwGa8zZMpT2vP2t4x3NaWsePS7LkLN7ife6zBUTSankAMAkAhRBwAwjqgDABhH1AEAjCPqAADGKarAdJGyt57L7H7VTfEeRcqKNW2dGONVloYSr9OgtseVchz9z2G85yfvGd9+73WcQg4AQBREHQDAOKIOAGAcUQcAMI6oAwAYl60CM1Q3uby9K0N1/0s5e1m8zn5+I4eq7Mp7nri2c5zjXSmhal/z9lCNR1vFbGtiVwcAMI6oAwAYR9QBAIwj6gAAxhF1AADjFPXAjFenlLIGMuUK453J7idllV3evoIpH1e8elQ/8SpL866wLGV1d8qq7Hg0V5ayqwMAGEfUAQCMI+oAAMYRdQAA44g6AIBxtVxnwmo7/TneyNo6++X6ix9N3k6eoU6+dpHy7Pu8J3qX5T0ZPGVlYMruvvpn5xRyAAASIeoAAMYRdQAA44g6AIBxRB0AwDhFp5CHqv5KWTuUsqLP72TnUHO5jBOvtkpbb728rwS/cVL+dVzW4zJOqNeq31wpq1hDnY/vdyJ8mZ7KyVDY1QEAjCPqAADGEXUAAOOIOgCAcUQdAMA4RaeQl8U7TTjUvVJW2YWq7NLWU1Fbx8uUnQZdRg510n1ZqNdhKPq7LIaqbww1l984Za1QpcmuDgBgHFEHADCOqAMAGEfUAQCMI+oAAMZlq8DUf/Z0vDOR/eTtyOfXXTNUvZy214aflGdq562Fi/dI/ebKe+XmrZ2ON7K2zrQTY1cHADCOqAMAGEfUAQCMI+oAAMYRdQAA42qau5a5iHdOcbzZ4/VmdKF/PS7i1RymPC87Zb/NeM+ztqq/lO9p2h67y+wu9PcjnSx2dQAA44g6AIBxRB0AwDiiDgBgHFEHADAuWwVmysrJeN3b8nY11FYD6TJy3jPQXVboJ+/fy2qlYqi58p5LnvL1XJb3fUNPTSa7OgCAcUQdAMA4og4AYBxRBwAwjqgDABinugKzLN7p4SlrIPP2stNW/ZW3p6KLlN01XWZP2f9T20nTeWsp/cbxE68PbcrrggpMAAASIeoAAMYRdQAA44g6AIBxRB0AwLiO3AuYiF/tWcqaMb8apLw1bGV+z6rLOH6zx7tXKCkrOV3m0naOfLzKQP1nc/tJ+V6nrZdmGuzqAADGEXUAAOOIOgCAcUQdAMA4og4AYFy2Hphl8XrQpeyy6LdCl9ldxtHW9dGF1bPUXeZKea+yeLWL+vtJpuz6GG8cF9p6qObCrg4AYBxRBwAwjqgDABhH1AEAjCPqAADGVf4U8pR92OJVcoZSxTrAeLR1R9T26nVRxesrlLydTlOes+9HT3WlC3Z1AADjiDoAgHFEHQDAOKIOAGAcUQcAME7RKeQp+8v5jZyyw1u82qp4/e78xKtY85vdb+SUfSnzngivrZJTW5dXv+cwXqfKvJ2EQ62neezqAADGEXUAAOOIOgCAcUQdAMA4og4AYJyiHpjxKnxC9Zcra50VhpK0ilVk/+Dw5m17nnthx5Pr+557YefLfQP9Awf2DQ4Pj4yOjddFQQ+/Wk1OO3nBH7/7V8979ZL2tpwtQ6OqYjfUlOOUxavXzftuky1xiDr325S1zgpDSRN1e/YNPfPC9gd/8uKP1r20YVN//8Dg0MiYqO1OW6sdP2/6O9+65m2vP2PG9J7cq4mCqJt4nDKiLiyibhK3KWudFYYSNerGx+ubtu6+9wfr7/nes09v2L53/1CFmq93dXZcet7y373hotNPXtBmbntH1E08ThlRFxZRN4nblLXOCkOJFHXj4/UNL/V/7dtP3r326U1bB8bGxpsfM4NabfGCGe9627lvveK06dO6c68mJKJu4nHKiLqwiLpJ3KasdVYYSoyo27pj31f/ed3f37Nu09bd9fHKbOOOprur47ILT37f9ReuWjEvb0IERNRNPE4ZURcWUTeJ25S1zgpDCRt1wyNja3/0/F/d8dC/PrOlqju5I6rVTlw08z+8/fyrX7dq2tSu3KsJgKibeJwyoi6sbFFXpr+noraXSLzvvSox8o5d+2//6iNf/tbjA3sPhFiaOj3dnVe+ZuV7r7tw5Ylzq767C3VdhLpXyqhLee2Eur5SzpUGUXfU2Yk6zSM/vWH7/7z9/z7wyPOmNnMltVpt+ZLZ77nm/Ksu/ZWpPZ25l+OPqGseUdcMou6osxN1Okeu1+s/eGzTn9987083bNf7+4Ggpk7puuqSV/3OtResWDy7ots7oq55RF0ziLqjzk7UKRx5fLx+38PrP/rpezdtGRANvwBPpVarrTxx7nuvu+DK15zS063o7C1HRF3ziLpmEHVHnZ2o0zZyvS73P7z+Tz/5nc19A0EWUznTpnZf/Wur3v3vzlt2wqzca5kcoq55RF0ziLqjzk7UaRv54X/d9J8/cfeLm3cFWUlF1dpqv7J8/u9ef+FlF57U3VWZ7R1R1zyirhmKfmxQFq+Y3kWol3XeHyTkHbnMe5znXtzx+x/71pPP9bXU55ZHM31a91uuOP3dbz/vhPnH5V7LEcS7UlK+uYeaPd4/4vP+hKNMc9RxsgEqoH/gwCc+s/apn5Fzv7B3cPiBHz+/YWN/7oUA1VCZD0DQskZGx7/wDz++/+ENmv/NmNLh7VRyrwWoBqIO2j30+MYvfuPRkdExXR/WZGG3SSYQFVEH1foHBm++46H+3QfIuV8efbByQZuyL2kA5Yg66FWvy133/fSRJ15q+a/oasfPn/7Of1scaNdr80A7ICrVUedS3RTvJwFWS5ZDracseN3dy9sG7vjW4yMjYx6LMaOzs/3is5e9/4aLVv/K8VU5xy5v7XQo2t4T8r5LhHpPyPWNu+qoQyur1+Vb3316/caduReSUW3B3N53vOXsa65aPeu4KbkXA1QYUQeltvfvu+u+n9ru5jyBjo72C1Yvff+NF5192gntFdnMAWoRdVDqB49t/NmLrbmlq82dPe3Gq8+6/k1nzpk5NfdiAAuIOmh0cHj07rXPDI+M5l5Iau3tbeeesfj9N1587hmLO9rp8ACEQdRBo42bdz/29Jbcq0ht9syp1/3Gmb/15rPnzZ6Wey2AKRWLOv1d8lL2xIs3TrwGtY5+8tTLO3btD7KGSmhvbztr1aL333jxhWcu7eio/GbO7xUVrwG0yzh+t3Hht8K8HS9T9vtNo2JRh1YwMjr+0OOb4hek1ETHhTlzes/br1r92285Z+Hc3txrAWwi6qBO/8Dg0xu2xxi5ra1t0fzpr37V8SuXzZ3R26Ph36DFmatzzj1jcWdHe+61AGYRdVDnpa0DfTv2Bh923uzea9+4+s2Xn7pk4czO6n9ICMAdUQd1Nmzq3zc4HHbM5Utm/9f3Xfaas5e1U9YItB6iDuqs37RzNOgXdfNm9374vZddsmaFhk8sAaSXLeryHgPv113Tbz1lfpVLeY/SL4vXIXDj5gEJ1yivra3t2jeufu05y8i5yol3XaTs0hmqK2YVz2vUs2Y+zIE623ftCzjaovnT33zZqXxuCbQyrn+os3f/UMDRTj9l4ZKFMwIOCKByiDqoMzQc8tSelUvndHZSxw+0NKIO6owHrEmp1Y7jLFOg5RF1UCfsF9mamxUBSCNbBWa8N6CUndlS9tsMVSep7Qx02JP3Ne93Daa8CvzOHI/3KPJ2+0yDXR0AwDiiDgBgHN1SgARGRYaL/0ZExkRqxaXXVfzXyb84gdiIOiCGYZEdIs+LPCPyrMgmkW0ie0UOFLHXViTcNJGZIotEVoi8SmSlyAkix5F8QHBEHRDQAZHnRL4n8l2RJ0S2iOwrtnETqxXbu9kiy0TOE7lM5GyRhWQeEIrqHpihTgpO2e/OhV+lWbwKsbw9OU2oF6l2n8idIj8sNnCT+hV8XWSoGGGLyEMit4mcJHKlyFtEzhSZEm/dqqSsDY7X5dVlHL+5yuLVabvMFarbcBrs6oBm1EU2inxF5MsiTxWJ1fyAgyLrik3h50VeJ/LbIpcUn3YC8ETUAd52FAl3m8hPi2/gwqoX439V5Nsivy7yeyLnF9/wAZg0og7wMCKyVuR/FF/LhWxOXVIXGSgC7wGRfy/yHpHFMacDbOJ7b2Cydoj8d5Hriy/noubcIXWRrSKfELlW5F8i7CAB44g6YFKeFHmXyMeK2pPEX7CPijwo8g6RTxWFnQBcqe6BGapXm9+Z4ylPPA9VSVUWb+RQZ7tXpx3zePGh5R+KPF7831k0Sj0/VPxi709F5mZaxqTF+yuHqoqM944Ub4Xxeo26qFbFNbs6wMWYyDeL/dxj+XLukEGRW0T+k8jm3CsBqoGoA45pXOSuogZyQ/IPLY9mpPiFw38k7QAXRB0wsbrIPSJ/UDT3UmVU5B9FPiiyPfdKAO2IOmBiPyq+n3sx9zKOaLT4HcKfUaUCTIyoAyawUeSPipbNao2IfFbkdn6BAExAUQ/MUF0fQ1U8hupuVxavu13eas9QVW2X3PDXHrNHsL/4/dz31Xw/dzSDIh8XOU3kCr/7jw3sGd2+I9Rqah2d3cuXvuJ/1F/x6DdOvIrieN0j41VO6ul4WUa3FOCI6sVng1+aZOPmXPpEPiKyyq+XysDd927535+WQO9KXYuODzIOEBBRBxzRcyL/qzrfgdWLExVuFvlvHn0yxw8cGN2+M1TUtfX0BBkHCIjv6oCyYZGbiibOFTIq8jmRh3MvA9CIqAPKHi5+tZb9p+KT1Vf0DNufexmAOkQd8AoHRP666OlcOY2fAD6QexmAOga/q4tXcxivK12oelQ/2rp0vvb6WzzGCecnxRFxWirHJmlP8THmpXnPLs9bF+3C78oNVZnsN3K8azDlenLVZLKrAw43WlRd7sy9DG91kfuLRp0AfomoAw73QvEZYEW3dA07Rb5WwS8agYiIOuBw39XX63Ky6sUHsH25lwEoQtQBhxwUubtotVV164tvHAH8AlEHHPKyyKO51xDEAZH7+AwTOETRKeRVrFOK1ycz75rzPof5emA+IbI109RhNZqn7BWZkWX6UK8fbbXBfuL10gz1Lsop5EBL+ZHIUO41hLKh2KQCEKIOOGRIZF3Fay8Pt6v4xg6AEHXAIXu0nr/qZ0j3MXtAUkQd0NBfzWZgR1MvPsM0s0kFmkLUAQ391Tmyx9FmEz+cAAJQ1APTrwul38jxOumVxVtzvNOW/W4TavZMPTB3FWf3WNJ4RF25lyEBXz8pTyGPdzVpk7IjaC7s6oCGfRU5cNzdILs6oIGoAxqGzf3mesRceAOeiDqggQoOwCyiDmjoFKnSdw8OOrjAgQauBKBhmkh77jWE1VPkN4B8FZh5zylOeS65n1D1lvqrpNT0wJxRBIOZxmCHHpFSeU+sjvcO4Hcbl3uFqj6N1ydTc1dMdnVAw2yRqbnXENYCJb80ALIj6oCG2cV/ZtRElnGBAw1cCUDDTJETcq8hoA6RU3KvAdCCqAMapoisyr2GgI4TWZl7DYAWRB3QUBM5V3MdxyQtEVmaew2AFop6YJbF6/EYryde3krOvM9YqHtl6oEpIquLr+v6Ms0e1pkis3KvYSLxThgPVSuYslOuy+wp3yW0dRtuHrs64JDlIqfmXkMQXSKvU/4PWSAlog44ZLrI5SYuikUiF+ReA6CIgasaCOhKkXm519CkmshrRU7MvQxAEaIOONwqkYsr3gxzqshv8uNx4HBEHXC4KSLXV7xtypoirQH8UrYvrlNWGKbsQRev+qs8e6jn0G92l3tV06+KnC9yX+5l+OkR+S2FbV/yVjPGq+TM2/M2Xr9fe+8A7OqAV5gl8u7ioIMqWiPyG7nXAKhD1AFlV4r8WgW/sesVeV/1y2qA8Ig6oGyGyB+IzM+9jEmpibxR5KrcywA04kemUGfR/OMCjjZ9ml8t4kUi7xL5uMhIwMXEtFzkg8VPAwG8ElEHdf7Pn7xpdGw81Ggzenu87tdZfBj4UFGfovfL9v9vmsgHimZgAI5A0SnkZfEqDP3Wk7K/ZRWrNOONk8lCkT8TeUFkfe6VTKy9+IHEDVX/PiLUlZuy3jLeWeqhOl76sVenXe1rA4jsPJGPiszJvYwJ1IoKmg8VNSkAjoyoAybQVnQe+S9ag6Qmco7IX4oszr0SQDWiDphYp8h7im/CtP3SriZyhshNIqfnXgmgHVEHHNOUIur+SFN9Y60oQrml+IgVwDEQdYCLqUXa/bmOH2i3F93LPluc1FO537kDGVT+xwYpz/h2GTmUvL314p0mrLje8pimiPxOcRTch0SezfcLhJ7i68OPiizLtAAfoa7TUNdyyqrIlBXX8aoiUz7PMbCrA9x1irxV5EtFn8n0p+TUiqD9iMgnq5VzQHZEHTApNZGzig8PPyqyNOHnh90iV4j8rcjvi8xMNSlgBFEHeJgj8ocidxY/3J4ZOfDaRU4tWpR9UeRSA186AOlx2QB+2ovftN0scp3IbSLfFdkV+gu8DpGTRa4pmqGsoAIF8EbUAc2YWpz48xqRR0T+TuQ7Ihub7hBdEzlOZHXxveCbRE7k0xegSRU7hdxFqBqteP3c/O4Vqr+ltqrReNWeCU0rPlq8WORFke+L/LPIoyIviwyKuPet7iw+C10pconIrxdRNyvqouOJV/cbryazLGUdst9coSpC49Vg67m62dUBoXSInFT8d41IX/GDhMdF1ok8L7JNZI/IQZHRIvxqxUatu9gUzirqKl9V/CT89KK0cgafVQJhEXVAcF0iS4r/LhMZEzkgsrf4b1+RdmNFknUWe8HeogNLb3EX4g2IhagDomovkqxX5PjcKwFaF193AwCMI+oAAMYp+gAzZafKeDVaKWf3o+1c8grWW+IYQtUBlsWrS4w3V7wz0F2kvCo1X8vs6oBWp/kdCgiCqANa3djuAQmYdm28q0AdXpRAS6sPDx98dn3AAdt6ugOOBgRB1AEtbXjjS4Prngw4YPv03oCjAUEQdUDrqo+O9t/5jZEt2wKO2TF/bsDRgCCyVWDGOy23LG+/zbzd5OLNHmouajKzqdf33Lu2/+++LuPujTqPpSbdSxfnfYWX5e23Ga83bLwz0ENVe+q5uhX92ABAMvWRkT33rt38F3852r8r4LC1jo7uk5YHHBAIgqgDWkv94MGh5zf2f/Wu/q99Y2zXQNjB23qn9axYFnZMoHlEHRBRfWho7wMPHXj62cCHtvoZGxsd2DO04YWDTz83sn2HjIdfU+fCBV1LFgUfFmgSUQfEMrzp5W23fmHX1/9pfO++3GtJZMqqU9pnV/WYPRhG1AHh1YeH99z/vb5P3XbgyWdCFn3oVuto7z3/nFoH7ypQR9Ep5Hl7YKbsS+lXE6WtmjHUs2qv3nJk85btt3+x/867xgb25l5LUh3z5k47Z/UR/1/xOq+WaeuTmfKE8Xg1kFXvism/v4Bg6iMje9f+oO+mWwfXPSVjrbKZO2TqWWd0LVmcexXAERB1QBgjW7ft+NyXdn7lH4KXNVZCrbtr5hsur3V35V4IcAREHdCs+ujovgd/2PfJW/c/uk7GxnIvJ4+eU07uveDc3KsAjoyoA5oyun3Hji98eecdd47uDPlb7GqpdbTP+jdXdcydnXshwJERdYCv0bF9P/zxzzdzjzxaH23RzVxDzyknz7zqcsl65jAwAUVRl7ImMxRta453lnHKcfRUbU1gdGf/zr/9+x1/85XRHTtV/Dw8n1p315zr39a5cMEv/5es/Wzj9beMd3J6yqsyZTVsGT0wgYoYG9v/48f7brp130OP1EdGc68mt5r0XrBm5huvYEsHzYg6YBLGdu3e+eWv7fj8HSPbtrf4Zq6hY97c+e95Z/vMGbkXAkyEqAPcjI8PPvZE30237v3+w/XhkdyrUaHW1TnvHdf2rjkr90KAYyDqACd71z740oc/NrzpZTZzv9BWm3HF6+bc8DbpaM+9FOAYOIUccDLltFWzrn5Dxyx6GRdqMnX16Qs/8L72GcflXgpwbDXN1W7xutKFmstl9nhVmnnPVo43u1r1kdF9Dz7cd9NtrfxTcWkcNX7S8qWf+MjUs17teo9ANZkp3xP8pLwGXcR7Pwz1vpEGUdfUXC6zE3WTvY1yI1v7tn/2S/1f+frY7lZsACYi3cuWLv6LP+m96Dz3qkuirvnb+CHqGoi6puZymZ2om+xt9KsPj+xd+2Dfp25rubbOxX5u8Uf+eFI5R9QFuY0foq6BqGtqLpfZibrJ3qYqRl7esu32v9l15zfG9rTGYT1ttamvPv2ED39w6llnTPZXdERd87fxQ9Q1EHVNzeUyO1E32dtUSH1oeM/9a/s+dfuBp561fQRrravzuMsvPf4Dv9e94kSfuxN1Td/GD1HXQNQ1NZfL7ETdZG9TOcMbX9p26xd2/eM/je/dn3stEdSkY87suTe+fe47rvH+qThR1/xt/BB1DdmiLuVTmTcAyvR3k4sXSCaj7ueP4uDQwHfu7/v0Zw4++zMZt/CIGmpdndPWnLXgve+cdsGaWof/z3BD/d3j/aPQb5yylO8SKd/rqv5PW6Kuqdu4zF5G1MUYOb96feiFjdtu+dzub357fP9g7tU0rb2956Rlc677zZlXv75jdrO/JiTq0oyjLcb0XO9EXVO3cZm9jKiLMbIS4wcODNz9L303f25o/fMV3d7VOju6T1o+602vn3n167sWLwrSx5moSzOOthjTc70TdU3dxmX2MqIuxsiK1OsHf/b8tr/6zMA9944PHsy9GmdtbR2zZkw549SZb7h8+iUXdS6cH/CwAqIuzTjaYkzP9U7UNXUbl9nLiLoYI2szvn9w9zfv2XbL54de2ChqH2N7W9uUns55c7tXrug9f03v+ed0r1jWNnVK8HmIujTjaIsxPdc7UdfUbVxmLyPqYoys0Xh98Imntnz8k4OPPSEKukT//Klva691d7VP7+2YN7d76Qk9p5zcc8rJ3StO7Jw3t9bTHXFqoi7JONpiTM/1rijq8j6VKV9YoYR6pCkvPJd7udBfru0n3usw1HqqGFEuI5flDRu/9bis0EXKf/qnwckGAADjiDoAgHFEHQDAOKIOAGAcUQcAMM5gu+dQ8lYc5a0001Zr6ifej1Xi3ctFFV+HLvRX8Oqvk4wn1DtJLuzqAADGEXUAAOOIOgCAcUQdAMA4og4AYJz/scIJpGxnrE2o+kaXmii/ueLViGqrk/QTr/bVRd6q0ZTXl7ZuumWhri+XK9dF3i64uWoy2dUBAIwj6gAAxhF1AADjiDoAgHFEHQDAuMr3wIx3lL6NLpTanp+8jyvv2dz6T/Su4qsuZR/RvH/3eOL17dTz2NnVAQCMI+oAAMYRdQAA44g6AIBxRB0AwLhsFZgpz+p1oe3MaP11pHl7TqY8DzrvidVWT75O2Usz5UnlLrPnrX1NWdeqp9aUXR0AwDiiDgBgHFEHADCOqAMAGEfUAQCMy3YKecpOen7rcZG3s1/eujttZ1jHezbiPWMpT3/2G9llLj/xzscPNbuLUPfSfwa6y8gu49ADEwCAKIg6AIBxRB0AwDiiDgBgHFEHADCu8j0wU5497SdlJz2Xe7ms0I+2Dpwu44SSt9+my8gutHX7TFmZ7LIeF1Xsium3Qhf0wAQAIBGiDgBgHFEHADCOqAMAGEfUAQCMy9YDMx5tHSZT9gws3yZUJ0aX9ZRpqzV14fdqyVuFGK/jZVnKGsh4QvVvDPXekrcrZlne7r4xsKsDABhH1AEAjCPqAADGEXUAAOOIOgCAcYpOIS/L200uZV1iyqq2lOcv5+1hmLJnoIu83QhDCVWhau+c64aU7y3xzm1PWe2ZBrs6AIBxRB0AwDiiDgBgHFEHADCOqAMAGJetAjNvV0OX24Sq2/SrgMrbJc9lPSmFqtsM9UqIJ16lYt5H4XKbeN0+9felTPnYU95GD3Z1AADjiDoAgHFEHQDAOKIOAGAcUQcAMK6muWbGRbxqK5d7laXsWJiyQtVl9rynbLtIOXJZqIq1lKdju4j3KEKNE2+ulFJ25U3510mDXR0AwDiiDgBgHFEHADCOqAMAGEfUAQCMq1gFZsp6ORfaKrvinUEcqk5SW91mvMpbF3nrh/VXHafs3+gyu4u8rzr99ahUYAIAEAVRBwAwjqgDABhH1AEAjCPqAADGqT6FvEzbmb+hRk7ZQVFbl06X9eQ9b13bafh+c4V6tYS6V8rep2V+rzqXcfxu43IvvxWmrLfUXM/Prg4AYBxRBwAwjqgDABhH1AEAjCPqAADGKeqBmfKEX21nYZfp7/bpMpf+qi39PR7jjRyvY6qLvOuJ10szb79NbfXVerCrAwAYR9QBAIwj6gAAxhF1AADjiDoAgHEV64HpQlv/vVA9MOP10nSRt1qvLFR1XMqKNRcpq9ryVp+6SFmrrK0m0+/V6yfU85yyV+1ksasDABhH1AEAjCPqAADGEXUAAOOIOgCAcap7YKas1nO5l4u8J/za6FTZOs9GFftS5r2Xi7wj5+146XIvF9reIZvHrg4AYBxRBwAwjqgDABhH1AEAjCPqAADGVawCM2//Rj95Ty6uYqdKl/Xk7baXshdimf5T7PNey1a74JZp7jmpDbs6AIBxRB0AwDiiDgBgHFEHADCOqAMAGKfoFHK/2qG81Wh567hC0TZyyio7F37nL/vdxuWxp6xZzdsfNd7p/ClrnuPVSVaxajQXdnUAAOOIOgCAcUQdAMA4og4AYBxRBwAwTlEPTBc2zhdOWSUVauSyvGd8532k2rpZ5u2zWpa3x6yflH0pU1bDpqxDdsEp5AAAREHUAQCMI+oAAMYRdQAA44g6AIBxinpgughVaebSE89vPaHuFa9HqLZujS6z+/VC9JPy+Yk3ct6qv7y9GeONrK0zZN6zy1NWSjePXR0AwDiiDgBgHFEHADCOqAMAGEfUAQCMU9QDM1S9U7zblOmvhYunir0Zy1J2CExZv6e/B2bK6yIUbZ0qUz5jepLCD7s6AIBxRB0AwDiiDgBgHFEHADCOqAMAGKeoB2aoPofxTogO1dExFG0nDsfr+hjqXmXa6spS1u9pq290kbdqVH9tcMq/l7aa8ImxqwMAGEfUAQCMI+oAAMYRdQAA44g6AIBxinpg5hWqmiheL7uUXfJcxinL22VR/+PK262xiq+fUOPkrWZMWQUdb/Yq9uk9HLs6AIBxRB0AwDiiDgBgHFEHADCOqAMAGKeoB2ZK5Sogbf3lyuL15Ix3VrifeGdzl+XtmKqtQ2nKaj2/uULdy2XNoZ4Nv1dCvHeklH93PT1U2dUBAIwj6gAAxhF1AADjiDoAgHFEHQDAuGwVmGXxquxSVir6zR6vy6K2vpT6u2KGGjlez8CUvStdVLErpss48U57d6nSDDWyy71chHqvy4VdHQDAOKIOAGAcUQcAMI6oAwAYR9QBAIxTVIFZFqrXX0p5uzXG6z3oJ2/VVsrKSf09VMviVRT7ze43V8rK7ZTdYlOe/+5Hc8fLMnZ1AADjiDoAgHFEHQDAOKIOAGAcUQcAME51BWZKeTte+t0m1OyhOjGm7LtYFqr6K+Vz6DJ73irEeHOFOgc85anxfrep4lnzKets02BXBwAwjqgDABhH1AEAjCPqAADGEXUAAOOowPyFvOeAx+sHWMVTv0PNFapHn9/jSlmlGWqcvNWVKXuWxjsxP+8J437i1Vvmrco+HLs6AIBxRB0AwDiiDgBgHFEHADCOqAMAGKe6AlNP/7SGUHVTKSsVQ90rb5VmvGo0vwo6FynrLeN1MXXh17vSZZy8HWVDjRPveY5XJV6Wsno5BnZ1AADjiDoAgHFEHQDAOKIOAGAcUQcAME5RBWa8Dm+h5D3n2u828br/uch73nG8noouQp1YnbKvqcs4KetR9dTvhRWvntmvfjje37SMHpgAAERB1AEAjCPqAADGEXUAAOOIOgCAcTWrNU4AADSwqwMAGEfUAQCMI+oAAMYRdQAA44g6AIBxRB0AwDiiDgBgHFEHADCOqAMAGEfUAQCMI+oAAMYRdQAA44g6AIBxRB0AwDiiDgBgHFEHADCOqAMAGEfUAQCMI+oAAMYRdQAA44g6AIBxRB0AwDiiDgBgHFEHADCOqAMAGEfUAQCMI+oAAMYRdQAA44g6AIBxRB0AwDiiDgBgHFEHADCOqAMAGEfUAQCMI+oAAMYRdQAA44g6AIBxRB0AwDiiDgBg3P8LAAD//4yK54y1WzxqAAAAAElFTkSuQmCC', '2026-10-03 14:17:41');

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
(18, 22, 'Golden Sunshine', NULL, 1, 1420.00, '{\"template\":{\"id\":\"sunshine\",\"name\":\"Golden Sunshine\",\"price\":490},\"paper_size\":{\"name\":\"Medium\",\"price\":30},\"wrapper\":{\"name\":\"Wrapping Paper\",\"price\":40},\"flowers\":[{\"id\":3,\"name\":\"Sunflower\",\"quantity\":2,\"unit_price\":70}],\"greeting_card\":false,\"plush_toy\":true,\"bouquet_id\":\"bouquet_6abb5617ec16a4.81862854\"}', '2026-09-29 14:09:38'),
(19, 23, 'Blush Garden', NULL, 1, 2650.00, '{\"template\":{\"id\":\"blush\",\"name\":\"Blush Garden\",\"price\":580},\"paper_size\":{\"name\":\"Large\",\"price\":60},\"wrapper\":{\"name\":\"Wrapping Paper\",\"price\":40},\"flowers\":[{\"id\":8,\"name\":\"Peony\",\"quantity\":10,\"unit_price\":90}],\"greeting_card\":true,\"plush_toy\":true,\"bouquet_id\":\"bouquet_6abb69339faac1.97456462\"}', '2026-09-29 15:31:07'),
(20, 24, 'Golden Sunshine', NULL, 1, 1430.00, '{\"template\":{\"id\":\"sunshine\",\"name\":\"Golden Sunshine\",\"price\":490},\"paper_size\":{\"name\":\"Large\",\"price\":60},\"wrapper\":{\"name\":\"Kraft Paper\",\"price\":20},\"flowers\":[{\"id\":3,\"name\":\"Sunflower\",\"quantity\":3,\"unit_price\":70}],\"greeting_card\":false,\"plush_toy\":true,\"bouquet_id\":\"bouquet_6ac0ca3dee1c85.75287718\"}', '2026-10-03 18:45:34'),
(21, 25, 'Golden Sunshine', NULL, 1, 1430.00, '{\"template\":{\"id\":\"sunshine\",\"name\":\"Golden Sunshine\",\"price\":490},\"paper_size\":{\"name\":\"Large\",\"price\":60},\"wrapper\":{\"name\":\"Kraft Paper\",\"price\":20},\"flowers\":[{\"id\":3,\"name\":\"Sunflower\",\"quantity\":3,\"unit_price\":70}],\"greeting_card\":false,\"plush_toy\":true,\"bouquet_id\":\"bouquet_6ac0ca3dee1c85.75287718\"}', '2026-10-03 18:59:26'),
(26, 30, 'Golden Sunshine', NULL, 1, 1430.00, '{\"template\":{\"id\":\"sunshine\",\"name\":\"Golden Sunshine\",\"price\":490},\"paper_size\":{\"name\":\"Large\",\"price\":60},\"wrapper\":{\"name\":\"Kraft Paper\",\"price\":20},\"flowers\":[{\"id\":3,\"name\":\"Sunflower\",\"quantity\":3,\"unit_price\":70}],\"greeting_card\":false,\"plush_toy\":true,\"bouquet_id\":\"bouquet_6ac0ca3dee1c85.75287718\"}', '2026-10-03 19:12:28'),
(27, 31, 'Blush Garden', NULL, 1, 920.00, '{\"template\":{\"id\":\"blush\",\"name\":\"Blush Garden\",\"price\":580},\"paper_size\":{\"name\":\"Small\",\"price\":0},\"wrapper\":{\"name\":\"Tissue Paper\",\"price\":30},\"flowers\":[{\"id\":3,\"name\":\"Sunflower\",\"quantity\":1,\"unit_price\":70}],\"greeting_card\":false,\"plush_toy\":false,\"bouquet_id\":\"bouquet_6ac0e361c6e796.76500261\"}', '2026-10-03 19:13:43'),
(28, 32, 'Blush Garden', NULL, 1, 780.00, '{\"template\":{\"id\":\"blush\",\"name\":\"Blush Garden\",\"price\":580},\"paper_size\":{\"name\":\"Small\",\"price\":0},\"wrapper\":{\"name\":\"Tissue Paper\",\"price\":30},\"flowers\":[{\"id\":1,\"name\":\"Rose\",\"quantity\":1,\"unit_price\":80}],\"greeting_card\":false,\"plush_toy\":false,\"bouquet_id\":\"bouquet_6ac0e86b999067.54793755\"}', '2026-10-03 19:35:12'),
(29, 33, 'Blush Garden', NULL, 1, 780.00, '{\"template\":{\"id\":\"blush\",\"name\":\"Blush Garden\",\"price\":580},\"paper_size\":{\"name\":\"Small\",\"price\":0},\"wrapper\":{\"name\":\"Tissue Paper\",\"price\":30},\"flowers\":[{\"id\":1,\"name\":\"Rose\",\"quantity\":1,\"unit_price\":80}],\"greeting_card\":false,\"plush_toy\":false,\"bouquet_id\":\"bouquet_6ac0e86b999067.54793755\"}', '2026-10-03 19:47:39');

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
(1, 2, '2026-09-23 11:36:52', '2026-10-03 19:12:28', 'abandoned'),
(2, 2, '2026-10-03 19:13:37', '2026-10-03 19:13:37', 'active');

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
  `customization` text DEFAULT NULL,
  `is_selected` tinyint(1) NOT NULL DEFAULT 0,
  `order_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `shopping_cart_items`
--

INSERT INTO `shopping_cart_items` (`item_id`, `cart_id`, `flower_id`, `quantity`, `added_at`, `unit_price`, `customization`, `is_selected`, `order_id`) VALUES
(69, 1, 3, 3, '2026-10-03 17:26:21', 70.00, '{\"template\":{\"id\":\"sunshine\",\"name\":\"Golden Sunshine\",\"price\":490},\"paper_size\":{\"name\":\"Large\",\"price\":60},\"wrapper\":{\"name\":\"Kraft Paper\",\"price\":20},\"flowers\":[{\"id\":3,\"name\":\"Sunflower\",\"quantity\":3,\"unit_price\":70}],\"greeting_card\":false,\"plush_toy\":true,\"bouquet_id\":\"bouquet_6ac0ca3dee1c85.75287718\"}', 1, NULL),
(70, 1, 4, 4, '2026-10-03 17:26:21', 80.00, '{\"template\":{\"id\":\"sunshine\",\"name\":\"Golden Sunshine\",\"price\":490},\"paper_size\":{\"name\":\"Large\",\"price\":60},\"wrapper\":{\"name\":\"Kraft Paper\",\"price\":20},\"flowers\":[{\"id\":4,\"name\":\"Lily\",\"quantity\":4,\"unit_price\":80}],\"greeting_card\":false,\"plush_toy\":true,\"bouquet_id\":\"bouquet_6ac0ca3dee1c85.75287718\"}', 1, NULL),
(71, 1, 5, 2, '2026-10-03 17:26:21', 60.00, '{\"template\":{\"id\":\"sunshine\",\"name\":\"Golden Sunshine\",\"price\":490},\"paper_size\":{\"name\":\"Large\",\"price\":60},\"wrapper\":{\"name\":\"Kraft Paper\",\"price\":20},\"flowers\":[{\"id\":5,\"name\":\"Daisy\",\"quantity\":2,\"unit_price\":60}],\"greeting_card\":false,\"plush_toy\":true,\"bouquet_id\":\"bouquet_6ac0ca3dee1c85.75287718\"}', 1, NULL),
(72, 1, 8, 1, '2026-10-03 17:26:21', 90.00, '{\"template\":{\"id\":\"sunshine\",\"name\":\"Golden Sunshine\",\"price\":490},\"paper_size\":{\"name\":\"Large\",\"price\":60},\"wrapper\":{\"name\":\"Kraft Paper\",\"price\":20},\"flowers\":[{\"id\":8,\"name\":\"Peony\",\"quantity\":1,\"unit_price\":90}],\"greeting_card\":false,\"plush_toy\":true,\"bouquet_id\":\"bouquet_6ac0ca3dee1c85.75287718\"}', 1, NULL),
(73, 2, 3, 1, '2026-10-03 19:13:37', 70.00, '{\"template\":{\"id\":\"blush\",\"name\":\"Blush Garden\",\"price\":580},\"paper_size\":{\"name\":\"Small\",\"price\":0},\"wrapper\":{\"name\":\"Tissue Paper\",\"price\":30},\"flowers\":[{\"id\":3,\"name\":\"Sunflower\",\"quantity\":1,\"unit_price\":70}],\"greeting_card\":false,\"plush_toy\":false,\"bouquet_id\":\"bouquet_6ac0e361c6e796.76500261\"}', 1, NULL),
(74, 2, 2, 1, '2026-10-03 19:13:37', 70.00, '{\"template\":{\"id\":\"blush\",\"name\":\"Blush Garden\",\"price\":580},\"paper_size\":{\"name\":\"Small\",\"price\":0},\"wrapper\":{\"name\":\"Tissue Paper\",\"price\":30},\"flowers\":[{\"id\":2,\"name\":\"Tulip\",\"quantity\":1,\"unit_price\":70}],\"greeting_card\":false,\"plush_toy\":false,\"bouquet_id\":\"bouquet_6ac0e361c6e796.76500261\"}', 1, NULL),
(75, 2, 4, 1, '2026-10-03 19:13:37', 80.00, '{\"template\":{\"id\":\"blush\",\"name\":\"Blush Garden\",\"price\":580},\"paper_size\":{\"name\":\"Small\",\"price\":0},\"wrapper\":{\"name\":\"Tissue Paper\",\"price\":30},\"flowers\":[{\"id\":4,\"name\":\"Lily\",\"quantity\":1,\"unit_price\":80}],\"greeting_card\":false,\"plush_toy\":false,\"bouquet_id\":\"bouquet_6ac0e361c6e796.76500261\"}', 1, NULL),
(76, 2, 6, 1, '2026-10-03 19:13:37', 90.00, '{\"template\":{\"id\":\"blush\",\"name\":\"Blush Garden\",\"price\":580},\"paper_size\":{\"name\":\"Small\",\"price\":0},\"wrapper\":{\"name\":\"Tissue Paper\",\"price\":30},\"flowers\":[{\"id\":6,\"name\":\"Orchid\",\"quantity\":1,\"unit_price\":90}],\"greeting_card\":false,\"plush_toy\":false,\"bouquet_id\":\"bouquet_6ac0e361c6e796.76500261\"}', 1, NULL),
(77, 2, 1, 1, '2026-10-03 19:35:07', 80.00, '{\"template\":{\"id\":\"blush\",\"name\":\"Blush Garden\",\"price\":580},\"paper_size\":{\"name\":\"Small\",\"price\":0},\"wrapper\":{\"name\":\"Tissue Paper\",\"price\":30},\"flowers\":[{\"id\":1,\"name\":\"Rose\",\"quantity\":1,\"unit_price\":80}],\"greeting_card\":false,\"plush_toy\":false,\"bouquet_id\":\"bouquet_6ac0e86b999067.54793755\"}', 0, 33),
(78, 2, 8, 1, '2026-10-03 19:35:07', 90.00, '{\"template\":{\"id\":\"blush\",\"name\":\"Blush Garden\",\"price\":580},\"paper_size\":{\"name\":\"Small\",\"price\":0},\"wrapper\":{\"name\":\"Tissue Paper\",\"price\":30},\"flowers\":[{\"id\":8,\"name\":\"Peony\",\"quantity\":1,\"unit_price\":90}],\"greeting_card\":false,\"plush_toy\":false,\"bouquet_id\":\"bouquet_6ac0e86b999067.54793755\"}', 0, 33);

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
  ADD KEY `fk_cart_items_cart` (`cart_id`),
  ADD KEY `idx_shopping_cart_items_order_id` (`order_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `client`
--
ALTER TABLE `client`
  MODIFY `client_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=71;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `payment_methods`
--
ALTER TABLE `payment_methods`
  MODIFY `payment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `shopping_cart`
--
ALTER TABLE `shopping_cart`
  MODIFY `cart_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `shopping_cart_items`
--
ALTER TABLE `shopping_cart_items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=79;

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
