<?php
/**
 * Database Connection File
 * Establishes connection to MySQL database for the Classroom Reservation System
 */

// Database credentials
$db_host = "localhost";    // Database host (usually localhost for XAMPP)
$db_name = "classroom_reservation";  // Database name
$db_user = "root";         // Database username (default for XAMPP is root)
$db_pass = "";             // Database password (default for XAMPP is empty)

// Create database connection
try {
    $conn = new mysqli($db_host, $db_user, $db_pass);
    
    // Check if the database exists, if not create it
    $check_db = $conn->query("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '$db_name'");
    if ($check_db->num_rows == 0) {
        // Database doesn't exist, create it
        $conn->query("CREATE DATABASE IF NOT EXISTS $db_name");
        echo "<!-- Database created successfully -->";
    }
    
    // Select the database
    $conn->select_db($db_name);
    
    // Check if users table exists
    $check_table = $conn->query("SHOW TABLES LIKE 'users'");
    if ($check_table->num_rows == 0) {
        // Create users table
        $conn->query("CREATE TABLE users (
            id INT(11) NOT NULL AUTO_INCREMENT,
            username VARCHAR(50) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            email VARCHAR(100) NOT NULL,
            role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        )");
        
        // Insert test users
        $admin_password = password_hash('admin123', PASSWORD_DEFAULT);
        $user_password = password_hash('user123', PASSWORD_DEFAULT);
        
        $conn->query("INSERT INTO users (username, password, email, role) 
                     VALUES ('admin', '$admin_password', 'admin@example.com', 'admin')");
        $conn->query("INSERT INTO users (username, password, email, role) 
                     VALUES ('user', '$user_password', 'user@example.com', 'user')");
                     
        echo "<!-- Test users created successfully -->";
    }
    
} catch (Exception $e) {
    // Log error but don't display to user (security)
    error_log('Database connection error: ' . $e->getMessage());
    
    // Provide generic error
    die("Database connection failed. Please check configuration.");
}

// Set character set to UTF-8
$conn->set_charset("utf8mb4");

// Uncomment for debugging
// echo "Database connected successfully";
?>