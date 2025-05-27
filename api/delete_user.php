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
if (!isset($data->userId)) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false, 
        'error' => 'Missing required fields'
    ]);
    exit;
}

$userId = intval($data->userId);

// Don't allow deletion of the current user
if ($userId === $_SESSION['user_id']) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false, 
        'error' => 'You cannot delete your own account'
    ]);
    exit;
}

try {
    // Begin transaction
    $conn->begin_transaction();
    
    // First, get user information for logging
    $stmt = $conn->prepare("SELECT username FROM users WHERE id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    
    if (!$user) {
        $conn->rollback();
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false, 
            'error' => 'User not found'
        ]);
        exit;
    }
    
    // Delete user's reservations
    $stmt = $conn->prepare("DELETE FROM reservations WHERE professor_id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    
    // Delete user's room assignments
    $stmt = $conn->prepare("DELETE FROM room_assignments WHERE professor_id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    
    // Finally delete the user
    $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    
    if ($stmt->affected_rows > 0) {
        // Log the activity
        $currentUserId = $_SESSION['user_id'];
        $stmt = $conn->prepare("INSERT INTO activity_logs (user_id, action, details, action_type) VALUES (?, ?, ?, ?)");
        $action = "Delete user";
        $details = "Deleted user: {$user['username']} (ID: $userId)";
        $actionType = "user";
        $stmt->bind_param("isss", $currentUserId, $action, $details, $actionType);
        $stmt->execute();
        
        // Commit transaction
        $conn->commit();
        
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true, 
            'message' => 'User deleted successfully'
        ]);
    } else {
        $conn->rollback();
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false, 
            'error' => 'Failed to delete user'
        ]);
    }
} catch (Exception $e) {
    $conn->rollback();
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false, 
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
