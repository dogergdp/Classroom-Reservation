<?php
session_start();
header('Content-Type: application/json');

// Check if user is logged in and is a student
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'student') {
    echo json_encode(['success' => false, 'error' => 'Unauthorized access']);
    exit;
}

// Database connection
require_once '../db_connect.php';

try {
    $userId = $_SESSION['user_id'];
    
    $stmt = $conn->prepare("
        SELECT full_name, email, department_id, course, section
        FROM users
        WHERE id = :userId AND role = 'student'
    ");
    
    $stmt->bindParam(':userId', $userId);
    $stmt->execute();
    
    $studentInfo = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($studentInfo) {
        // Get department name if applicable
        $departmentName = null;
        if ($studentInfo['department_id']) {
            $deptStmt = $conn->prepare("SELECT name FROM departments WHERE id = :deptId");
            $deptStmt->bindParam(':deptId', $studentInfo['department_id']);
            $deptStmt->execute();
            $deptInfo = $deptStmt->fetch(PDO::FETCH_ASSOC);
            if ($deptInfo) {
                $departmentName = $deptInfo['name'];
            }
        }
        
        echo json_encode([
            'success' => true, 
            'name' => $studentInfo['full_name'],
            'email' => $studentInfo['email'],
            'departmentId' => $studentInfo['department_id'],
            'departmentName' => $departmentName,
            'course' => $studentInfo['course'],
            'section' => $studentInfo['section']
        ]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Student not found']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
?>
