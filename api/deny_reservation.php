<?php
session_start();
header('Content-Type: application/json');

// Check if user is logged in with appropriate role
if (!isset($_SESSION['user_id']) || ($_SESSION['role'] != 'admin' && $_SESSION['role'] != 'deptHead')) {
    echo json_encode(['success' => false, 'error' => 'Unauthorized access']);
    exit;
}

// Database connection
require_once '../db_connect.php';

try {
    // Validate input
    if (!isset($_POST['reservation_id']) || empty($_POST['reservation_id'])) {
        echo json_encode(['success' => false, 'error' => 'Reservation ID is required']);
        exit;
    }

    $reservationId = $_POST['reservation_id'];
    $reason = isset($_POST['reason']) ? $_POST['reason'] : 'No reason provided';
    
    // Update the reservation status to denied
    $stmt = $conn->prepare("
        UPDATE reservations 
        SET status = 'denied', denial_reason = :reason, updated_at = NOW() 
        WHERE id = :reservationId
    ");
    
    $stmt->bindParam(':reservationId', $reservationId);
    $stmt->bindParam(':reason', $reason);
    $result = $stmt->execute();
    
    if ($result) {
        echo json_encode(['success' => true, 'message' => 'Reservation denied successfully']);
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to deny reservation']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
?>
