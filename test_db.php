<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Include database connection
require_once 'db.php';

// If we get here without errors, connection is working
echo "Database connection successful!<br>";
echo "Connected to: " . $conn->host_info . "<br>";

// Test query
$result = $conn->query("SELECT * FROM users");
if ($result) {
    echo "Found " . $result->num_rows . " users in database.<br>";
    while ($row = $result->fetch_assoc()) {
        echo "User: " . htmlspecialchars($row['username']) . " (Role: " . htmlspecialchars($row['role']) . ")<br>";
    }
} else {
    echo "Error querying users table: " . $conn->error;
}
?>