<?php
require_once '../config/database.php';
require_once '../config/auth.php';

if (!isLoggedIn() || !isAdmin()) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false, 
        'error' => 'Unauthorized access'
    ]);
    exit;
}

$json = file_get_contents('php://input');
$data = json_decode($json);

if (!isset($data->userId)) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false, 
        'error' => 'Missing required fields'
    ]);
    exit;
}

$userId = intval($data->userId);

if ($userId === $_SESSION['user_id']) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false, 
        'error' => 'You cannot delete your own account'
    ]);
    exit;
}

try {

    $conn->begin_transaction();
    
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

    $stmt = $conn->prepare("DELETE FROM reservations WHERE professor_id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    
    $stmt = $conn->prepare("DELETE FROM room_assignments WHERE professor_id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    
    $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    
    if ($stmt->affected_rows > 0) {

        $currentUserId = $_SESSION['user_id'];
        $stmt = $conn->prepare("INSERT INTO activity_logs (user_id, action, details, action_type) VALUES (?, ?, ?, ?)");
        $action = "Delete user";
        $details = "Deleted user: {$user['username']} (ID: $userId)";
        $actionType = "user";
        $stmt->bind_param("isss", $currentUserId, $action, $details, $actionType);
        $stmt->execute();
        
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
