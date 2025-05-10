<?php
$host = "localhost";
$dbname = "classroom_reservation";
$username_db = "root";
$password_db = "";  // Default for XAMPP

// Create a function to get database connection
function getDbConnection() {
    global $host, $dbname, $username_db, $password_db;
    
    try {
        $conn = new PDO("mysql:host=$host;dbname=$dbname", $username_db, $password_db);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $conn;
    } catch(PDOException $e) {
        die("Connection failed: " . $e->getMessage());
    }
}
?>
