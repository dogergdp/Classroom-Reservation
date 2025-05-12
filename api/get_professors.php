<?php
session_start();
header('Content-Type: application/json');

// Check if user is logged in and has appropriate role
if (!isset($_SESSION['user_id']) || !in_array($_SESSION['role'], ['deptHead', 'admin'])) {
    echo json_encode(['success' => false, 'error' => 'Unauthorized access']);
    exit;
}

// Database connection
require_once '../db_connect.php';

try {
    $departmentId = $_SESSION['department_id'] ?? null;
    
    // For department head, get professors from their department
    // For admin, get all professors
    if ($_SESSION['role'] === 'admin') {
        $stmt = $conn->prepare("
            SELECT id, username, full_name, email, department_id 
            FROM users 
            WHERE role = 'professor'
            ORDER BY full_name
        ");
    } else {
        $stmt = $conn->prepare("
            SELECT id, username, full_name, email, department_id 
            FROM users 
            WHERE role = 'professor' AND department_id = :departmentId
            ORDER BY full_name
        ");
        $stmt->bindParam(':departmentId', $departmentId);
    }
    
    $stmt->execute();
    $professors = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'professors' => $professors]);
    
} catch (PDOException $e) {
    error_log('Database error: ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Database error occurred: ' . $e->getMessage()]);
}
?>
