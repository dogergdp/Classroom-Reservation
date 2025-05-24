<?php
session_start();
require_once '../config/database.php';

// Enable detailed error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

// Check if user is logged in and is an admin
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode([
        'success' => false,
        'error' => 'Unauthorized access'
    ]);
    exit;
}

try {
    // Create database connection
    $conn = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Query to get activity logs with user information
    $stmt = $conn->prepare("
        SELECT 
            al.id,
            al.user_id,
            COALESCE(u.username, 'System') as username,
            al.action,
            al.details,
            al.action_type,
            al.timestamp
        FROM 
            activity_logs al
        LEFT JOIN 
            users u ON al.user_id = u.id
        ORDER BY 
            al.timestamp DESC
        LIMIT 1000
    ");
    $stmt->execute();
    
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'logs' => $logs
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>