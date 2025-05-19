<?php
session_start();
require_once '../db_config.php';

// Add more verbose error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

// Check if user is logged in and is an admin
if (!isset($_SESSION['user_id']) || !isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode([
        'success' => false,
        'error' => 'Unauthorized access',
        'role' => $_SESSION['role'] ?? 'not set',
        'user_id' => $_SESSION['user_id'] ?? 'not set'
    ]);
    exit;
}

try {
    $conn = getDbConnection();
    
    // Join with departments to get department names
    $query = "SELECT u.id, u.username, u.role, u.full_name, u.email, u.department_id, d.name as department_name 
              FROM users u 
              LEFT JOIN departments d ON u.department_id = d.id 
              ORDER BY u.role, u.full_name";
    
    $stmt = $conn->prepare($query);
    $stmt->execute();
    
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'users' => $users,
        'count' => count($users)
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
