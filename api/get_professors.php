<?php
session_start();
header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'User not logged in']);
    exit;
}

// Database connection
require_once '../db_connect.php';

try {
    // Get department ID from session
    $departmentId = $_SESSION['department_id'] ?? null;
    
    if (!$departmentId) {
        echo json_encode(['success' => false, 'error' => 'Department ID not found']);
        exit;
    }
    
    // Get all professors in the department
    $stmt = $conn->prepare("
        SELECT id, username, full_name, email 
        FROM users 
        WHERE role = 'professor' AND department_id = :departmentId
        ORDER BY full_name
    ");
    
    $stmt->bindParam(':departmentId', $departmentId);
    $stmt->execute();
    
    $professors = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'professors' => $professors]);
    
} catch (PDOException $e) {
    error_log('Database error: ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Database error occurred: ' . $e->getMessage()]);
}
?>
