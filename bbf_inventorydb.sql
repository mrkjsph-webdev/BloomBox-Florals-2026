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
-- Database: `bbf_inventorydb`
--

-- --------------------------------------------------------

--
-- Table structure for table `flower_inventory`
--

CREATE TABLE `flower_inventory` (
  `flower_id` int(11) NOT NULL,
  `flower_name` varchar(255) NOT NULL,
  `flower_image` varchar(255) DEFAULT NULL,
  `flower_description` text DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `flower_inventory`
--

INSERT INTO `flower_inventory` (`flower_id`, `flower_name`, `flower_image`, `flower_description`, `stock`) VALUES
(1, 'Rose', 'https://cms.interiorcompany.com/wp-content/uploads/2024/01/lincoln-red-rose-bush-types.jpg', 'A timeless flower perfect for expressing love and appreciation.', 64),
(2, 'Tulip', 'https://tse2.mm.bing.net/th/id/OIP.ksz4la7Kq-Cg0oiJSS0MdQHaHA?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', 'A cheerful and elegant bloom that brings warmth to every bouquet.', 88),
(3, 'Sunflower', 'https://images.unsplash.com/photo-1470509037663-253afd7f0f51?auto=format&fit=crop&w=900&q=80', 'A bright and joyful flower that adds energy to every celebration.', 79),
(4, 'Lily', 'https://www.thespruce.com/thmb/TlRZEo8_EOoaiSCXhGuZOkDkkAE=/3000x2000/filters:fill(auto,1)/Stargazer-lily-bloom-big-5a9f60fd43a1030037869efe.jpg', 'A graceful bloom that brings a sophisticated touch to any arrangement.', 83),
(5, 'Daisy', 'https://cdn.pixabay.com/photo/2012/06/17/17/32/flower-50157_1280.jpg', 'A simple and charming flower that brings a feeling of happiness.', 87),
(6, 'Orchid', 'https://www.thespruce.com/thmb/jI1wd2IKAwN5wplPhRVikDIxpRU=/2122x1412/filters:no_upscale():max_bytes(150000):strip_icc()/CymbidiumOrchid-GettyImages-506065092-c5a8e2a0d48041ec8b91c6c245cb9461.jpg', 'An elegant flower that creates a refined and memorable bouquet.', 78),
(7, 'Carnation', 'https://tse2.mm.bing.net/th/id/OIP.PNFuaSrHyUZW1KGMhVoW3QHaFj?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', 'A beautiful long-lasting flower suited for meaningful occasions.', 94),
(8, 'Peony', 'https://cdn.britannica.com/40/189540-050-1307654B/garden-peonies.jpg', 'A soft and romantic bloom that makes every bouquet feel special.', 65);

-- --------------------------------------------------------

--
-- Table structure for table `popular_flowers`
--

CREATE TABLE `popular_flowers` (
  `popular_id` int(11) NOT NULL,
  `flower_id` int(11) NOT NULL,
  `amount_sold` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `popular_flowers`
--

INSERT INTO `popular_flowers` (`popular_id`, `flower_id`, `amount_sold`) VALUES
(1, 1, 48),
(2, 3, 21),
(3, 5, 13),
(4, 7, 6),
(5, 2, 12),
(6, 4, 17),
(7, 6, 22),
(8, 8, 35);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `flower_inventory`
--
ALTER TABLE `flower_inventory`
  ADD PRIMARY KEY (`flower_id`);

--
-- Indexes for table `popular_flowers`
--
ALTER TABLE `popular_flowers`
  ADD PRIMARY KEY (`popular_id`),
  ADD KEY `fk_popular_flower` (`flower_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `flower_inventory`
--
ALTER TABLE `flower_inventory`
  MODIFY `flower_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `popular_flowers`
--
ALTER TABLE `popular_flowers`
  MODIFY `popular_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `popular_flowers`
--
ALTER TABLE `popular_flowers`
  ADD CONSTRAINT `fk_popular_flower` FOREIGN KEY (`flower_id`) REFERENCES `flower_inventory` (`flower_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
