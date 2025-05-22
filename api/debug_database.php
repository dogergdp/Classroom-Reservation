<?php
session_start();
require_once '../db_config.php';

header('Content-Type: application/json');

// Only allow access to logged in users
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'Unauthorized access']);
    exit();
}

try {
    $conn = getDbConnection();
    
    // Check tables
    $tables = [
        'users' => [],
        'departments' => [],
        'reservations' => [],
        'room_assignments' => []
    ];
    
    foreach ($tables as $table => $data) {
        // Check if table exists
        try {
            $stmt = $conn->prepare("SELECT 1 FROM $table LIMIT 1");
            $stmt->execute();
            $tables[$table]['exists'] = true;
            
            // Count records
            $stmt = $conn->prepare("SELECT COUNT(*) FROM $table");
            $stmt->execute();
            $tables[$table]['count'] = $stmt->fetchColumn();
            
            // Get sample data (first row)
            $stmt = $conn->prepare("SELECT * FROM $table LIMIT 1");
            $stmt->execute();
            $sample = $stmt->fetch(PDO::FETCH_ASSOC);
            $tables[$table]['sample'] = $sample ? array_keys($sample) : [];
            
        } catch (PDOException $e) {
            $tables[$table]['exists'] = false;
            $tables[$table]['error'] = $e->getMessage();
        }
    }
    
    // Get department info for the current user
    $userInfo = [
        'id' => $_SESSION['user_id'],
        'username' => $_SESSION['username'],
        'role' => $_SESSION['role']
    ];
    
    if (isset($_SESSION['department_id'])) {
        $stmt = $conn->prepare("
            SELECT d.*, u.first_name, u.middle_name, u.last_name
            FROM departments d
            LEFT JOIN users u ON d.head_id = u.id
            WHERE d.id = :dept_id
        ");
        $stmt->bindParam(':dept_id', $_SESSION['department_id']);
        $stmt->execute();
        $department = $stmt->fetch(PDO::FETCH_ASSOC);
        $userInfo['department'] = $department;
        
        // If department head, check professors in department
        if ($_SESSION['role'] === 'deptHead') {
            $stmt = $conn->prepare("
                SELECT COUNT(*) 
                FROM users 
                WHERE department_id = :dept_id AND role = 'professor'
            ");
            $stmt->bindParam(':dept_id', $_SESSION['department_id']);
            $stmt->execute();
            $userInfo['professorCount'] = $stmt->fetchColumn();
        }
    }
    
    echo json_encode([
        'success' => true,
        'tables' => $tables,
        'userInfo' => $userInfo,
        'sessionData' => [
            'department_id' => $_SESSION['department_id'] ?? 'not set',
            'department_name' => $_SESSION['department_name'] ?? 'not set'
        ]
    ]);
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
