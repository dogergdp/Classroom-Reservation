<?php
session_start();
header('Content-Type: application/json');

if (isset($_SESSION['user_id'])) {
    // Include database connection
    require_once 'db_connect.php';
    
    try {
        // Get additional user information
        $stmt = $conn->prepare("
            SELECT u.*, d.name as department_name
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE u.id = :userId
        ");
        $stmt->bindParam(':userId', $_SESSION['user_id']);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // If the user is a professor, get their department head's name
        $deptHeadName = null;
        if ($user['department_id']) {
            $stmt = $conn->prepare("
                SELECT u.full_name 
                FROM departments d
                JOIN users u ON d.head_id = u.id
                WHERE d.id = :departmentId
            ");
            $stmt->bindParam(':departmentId', $user['department_id']);
            $stmt->execute();
            $deptHead = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($deptHead) {
                $deptHeadName = $deptHead['full_name'];
            }
        }
        
        // Count professors in department (for department heads)
        $professorCount = 0;
        if ($user['role'] === 'deptHead' && $user['department_id']) {
            $stmt = $conn->prepare("
                SELECT COUNT(*) as count
                FROM users
                WHERE department_id = :departmentId AND role = 'professor'
            ");
            $stmt->bindParam(':departmentId', $user['department_id']);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $professorCount = $result['count'];
        }
        
        $response = [
            'loggedIn' => true,
            'userId' => $_SESSION['user_id'],
            'username' => $user['username'],
            'fullName' => $user['full_name'],
            'role' => $_SESSION['role'],
            'departmentId' => $user['department_id'],
            'departmentName' => $user['department_name'],
            'deptHeadName' => $deptHeadName,
            'professorCount' => $professorCount
        ];
        
        echo json_encode($response);
    } catch (PDOException $e) {
        error_log('Database error in session.php: ' . $e->getMessage());
        echo json_encode([
            'loggedIn' => true,
            'userId' => $_SESSION['user_id'],
            'username' => $_SESSION['username'],
            'role' => $_SESSION['role']
        ]);
    }
} else {
    echo json_encode(['loggedIn' => false]);
}
?>