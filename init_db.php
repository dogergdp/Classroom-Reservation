<?php
// This script helps initialize or reset the database
require_once 'db_config.php';

try {
    // Connect to MySQL without database selection
    $conn = new PDO("mysql:host=$host", $username_db, $password_db);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create database if it doesn't exist
    $conn->exec("CREATE DATABASE IF NOT EXISTS `$dbname` 
                 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci");
    
    echo "Database created or already exists.<br>";
    
    // Connect to the database
    $conn = getDbConnection();
    
    // Read the SQL file
    $sql = file_get_contents('classroom_reservation.sql');
    
    // Execute the SQL
    $conn->exec($sql);
    
    echo "Database schema created successfully!<br>";
    echo "You can now <a href='index.php'>login to the system</a>.";
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage() . "<br>";
}
?>
