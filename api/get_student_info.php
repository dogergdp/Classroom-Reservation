<?php
// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check if user is logged in and is a student
if (!isset($_SESSION['user_id']) || !isset($_SESSION['role']) || $_SESSION['role'] !== 'student') {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => 'Unauthorized access']);
    exit;
}

// Include database connection
require_once '../db_config.php';
$conn = getDbConnection();

try {
    // Query to get the latest student information
    $stmt = $conn->prepare("
        SELECT course, section, department_id
        FROM users 
        WHERE id = :user_id
    ");
    
    $stmt->bindParam(':user_id', $_SESSION['user_id']);
    $stmt->execute();
    
    $studentData = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($studentData) {
        // If department ID exists, get department name
        $departmentName = null;
        if ($studentData['department_id']) {
            $deptStmt = $conn->prepare("SELECT name FROM departments WHERE id = :dept_id");
            $deptStmt->bindParam(':dept_id', $studentData['department_id']);
            $deptStmt->execute();
            $department = $deptStmt->fetch(PDO::FETCH_ASSOC);
            if ($department) {
                $departmentName = $department['name'];
            }
        }
        
        // Get year level from section (first character)
        $yearLevel = null;
        if ($studentData['section'] && strlen($studentData['section']) >= 1) {
            $yearLevel = substr($studentData['section'], 0, 1);
        }
        
        // Return the data
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'course' => $studentData['course'],
            'section' => $studentData['section'],
            'department_name' => $departmentName,
            'year_level' => $yearLevel
        ]);
    } else {
        // If no data found
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'Student information not found']);
    }
} catch (PDOException $e) {
    // Log error and return error response
    error_log('Database error: ' . $e->getMessage());
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
?>
