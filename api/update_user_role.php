<?php
// Include database connection
require_once '../config/database.php';
require_once '../config/auth.php';

// Check if user is logged in and is an admin
if (!isLoggedIn() || !isAdmin()) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false, 
        'error' => 'Unauthorized access'
    ]);
    exit;
}

// Get JSON data from request
$json = file_get_contents('php://input');
$data = json_decode($json);

// Validate data
if (!isset($data->userId) || !isset($data->newRole)) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false, 
        'error' => 'Missing required fields'
    ]);
    exit;
}

$userId = intval($data->userId);
$newRole = $data->newRole;

// Validate role
$validRoles = ['student', 'professor', 'deptHead', 'admin'];
if (!in_array($newRole, $validRoles)) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false, 
        'error' => 'Invalid role'
    ]);
    exit;
}

try {
    // Update the user role in the database
    $stmt = $conn->prepare("UPDATE users SET role = ? WHERE id = ?");
    $stmt->bind_param("si", $newRole, $userId);
    $stmt->execute();
    
    if ($stmt->affected_rows > 0) {
        // Log the activity
        $currentUserId = $_SESSION['user_id'];
        $stmt = $conn->prepare("INSERT INTO activity_logs (user_id, action, details, action_type) VALUES (?, ?, ?, ?)");
        $action = "Update user role";
        $details = "Changed user ID $userId to role: $newRole";
        $actionType = "user";
        $stmt->bind_param("isss", $currentUserId, $action, $details, $actionType);
        $stmt->execute();
        
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true, 
            'message' => 'User role updated successfully'
        ]);
    } else {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false, 
            'error' => 'User not found or role is already set to the selected value'
        ]);
    }
} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false, 
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
