-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 24, 2025 at 08:13 AM
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
-- Database: `classroom_reservation`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `action` varchar(255) NOT NULL,
  `details` text DEFAULT NULL,
  `action_type` varchar(50) DEFAULT 'general',
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `details`, `action_type`, `timestamp`) VALUES
(2, 1, 'Test Action', 'This is a test log entry.', 'test', '2025-05-24 06:08:48');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `head_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `name`, `head_id`) VALUES
(1, 'Computer Studies', 13);

-- --------------------------------------------------------

--
-- Table structure for table `reservations`
--

CREATE TABLE `reservations` (
  `id` int(11) NOT NULL,
  `professor_id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  `room` varchar(10) NOT NULL,
  `reservation_date` date NOT NULL,
  `start_time` time NOT NULL,
  `duration` int(11) NOT NULL,
  `status` enum('pending','approved','denied') NOT NULL DEFAULT 'pending',
  `reason` text DEFAULT NULL,
  `denial_reason` text DEFAULT NULL,
  `course` varchar(50) NOT NULL,
  `section` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reservations`
--

INSERT INTO `reservations` (`id`, `professor_id`, `department_id`, `room`, `reservation_date`, `start_time`, `duration`, `status`, `reason`, `denial_reason`, `course`, `section`, `created_at`, `updated_at`) VALUES
(1, 15, 1, 'R01', '2025-05-23', '10:50:00', 2, 'approved', '', NULL, 'BSCS', '1B', '2025-05-22 08:38:07', '2025-05-22 08:39:46'),
(2, 15, 1, 'R02', '2025-05-26', '09:00:00', 3, 'pending', '', NULL, 'BSIS', '3A', '2025-05-22 08:42:50', NULL),
(3, 15, 1, 'R02', '2025-05-27', '16:00:00', 3, 'pending', '', NULL, 'BSIT', '2A', '2025-05-24 05:49:24', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `room_assignments`
--

CREATE TABLE `room_assignments` (
  `id` int(11) NOT NULL,
  `reservation_id` int(11) DEFAULT NULL,
  `professor_id` int(11) NOT NULL,
  `room` varchar(10) NOT NULL,
  `assignment_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `course` varchar(50) NOT NULL,
  `section` varchar(20) NOT NULL,
  `assigned_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `room_assignments`
--

INSERT INTO `room_assignments` (`id`, `reservation_id`, `professor_id`, `room`, `assignment_date`, `start_time`, `end_time`, `course`, `section`, `assigned_by`, `created_at`) VALUES
(1, 1, 15, 'R01', '2025-05-23', '10:50:00', '12:50:00', 'BSCS', '1B', 13, '2025-05-22 08:39:46');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('professor','deptHead','admin','student') NOT NULL,
  `first_name` varchar(128) NOT NULL,
  `middle_name` varchar(128) NOT NULL,
  `last_name` varchar(128) NOT NULL,
  `email` varchar(100) NOT NULL,
  `department_id` int(11) DEFAULT NULL,
  `course` varchar(50) DEFAULT NULL,
  `section` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `first_name`, `middle_name`, `last_name`, `email`, `department_id`, `course`, `section`) VALUES
(1, 'admin', 'cbfdac6008f9cab4083784cbd1874f76618d2a97', 'admin', '0', '0', '0', 'admin@university.edu', NULL, NULL, NULL),
(12, 'dogerz', '86f7e437faa5a7fce15d1ddcb9eaeaea377667b8', 'student', 'kytZ3OsQvoo7796ydavFD3R0ojIeqShigiK8IJS6DzU=', 'Ps+EhfBtfJFvkOL4zBEZa2LkZyrbrC3HQtl8yfS7YHM=', 'ae10NFuP8SUXf3FJ7chw+thQjw9H56RXxN0J4OwI1TM=', '+gbzOvVYggr+dy800kRzPoLZ9KilcbzmxKatyBycbrUobT1HPv53XMjhBFlA+vNp', NULL, 'BSCS', '3A'),
(13, 'jsmith', 'cbfdac6008f9cab4083784cbd1874f76618d2a97', 'deptHead', 'N2O/C7hI+2AoDsVn9P+FmFWIivghKzywAbzW7DJMbIw=', 'IxbJ4HUHKTFDR8D0SOLToz85UoXa3DCCbHus/ntSCkA=', 'KJYfgl8T/7QZWJ72Xa+8aFxPSAKr4aJHKwW/m51ZdBU=', 'pgZ5b2p/pL3AP4Otg1bV1+xO4RIkDFg4eiR2Z/ZZs955bSCRQQEnhBahcVTHYTWv', 1, '', ''),
(14, 'profmiguel', 'cbfdac6008f9cab4083784cbd1874f76618d2a97', 'professor', 'VAQ10MigW+ypE9MEII1ntYcM/70723Lt5XQBdk1DeHo=', 'Cm/MgmGO0xmtw+jNMqxgwyPSfnjXmnolaxyZL3QmHXo=', 'GKRTYvKsRDZxVXcc9Mk7bUerJFaEryltTs9UB63BSKk=', 'WEYTfMGpjpoKWsWGRlAhIh2B0mfNOi8SApcmgoN3GU4eZRqkK6cWIQXFJCWbUGzY', 1, NULL, NULL),
(15, 'profchris', 'cbfdac6008f9cab4083784cbd1874f76618d2a97', 'professor', 'jlw894BIpuSPy979PKkreXao2MbO+QXRdxI1ZOa27G4=', 'toSCj0gjnLsmsJL7reNMAWHG0XKPgGRKvItjrXnZ0wo=', 'AZPvmo5JqGx1M/dQ6crgwpEWr3HEjXtYX2n3tM8r3dc=', '0WSWVpuNz8phAzVGf3KDIT4v1Qk7+Un3X1GQOAz2Vyg8f3ihNH2NgO72KcNO1byR', 1, NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `head_id` (`head_id`);

--
-- Indexes for table `reservations`
--
ALTER TABLE `reservations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `professor_id` (`professor_id`),
  ADD KEY `department_id` (`department_id`);

--
-- Indexes for table `room_assignments`
--
ALTER TABLE `room_assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `professor_id` (`professor_id`),
  ADD KEY `assigned_by` (`assigned_by`),
  ADD KEY `reservation_id` (`reservation_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `department_id` (`department_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `reservations`
--
ALTER TABLE `reservations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `room_assignments`
--
ALTER TABLE `room_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `departments`
--
ALTER TABLE `departments`
  ADD CONSTRAINT `departments_ibfk_1` FOREIGN KEY (`head_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `reservations`
--
ALTER TABLE `reservations`
  ADD CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`professor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reservations_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `room_assignments`
--
ALTER TABLE `room_assignments`
  ADD CONSTRAINT `room_assignments_ibfk_1` FOREIGN KEY (`professor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `room_assignments_ibfk_2` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `room_assignments_ibfk_3` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
