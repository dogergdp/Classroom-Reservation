<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || ($_SESSION['role'] != 'admin' && $_SESSION['role'] != 'deptHead')) {
    echo json_encode(['success' => false, 'error' => 'Unauthorized access']);
    exit;
}

require_once '../db_connect.php';

try {
    if (!isset($_POST['reservation_id']) || empty($_POST['reservation_id'])) {
        echo json_encode(['success' => false, 'error' => 'Reservation ID is required']);
        exit;
    }

    $reservationId = $_POST['reservation_id'];
    $reason = isset($_POST['reason']) ? $_POST['reason'] : 'No reason provided';

    $stmt = $conn->prepare("
        UPDATE reservations 
        SET status = 'denied', denial_reason = :reason, updated_at = NOW() 
        WHERE id = :reservationId
    ");
    $stmt->bindParam(':reservationId', $reservationId);
    $stmt->bindParam(':reason', $reason);
    $result = $stmt->execute();

    if ($result) {
        try {
            $logStmt = $conn->prepare("INSERT INTO activity_logs (user_id, action, details, action_type) VALUES (:user_id, :action, :details, :action_type)");
            $logStmt->bindValue(':user_id', $_SESSION['user_id']);
            $logStmt->bindValue(':action', 'Deny reservation');
            $logStmt->bindValue(':details', 'Reservation denied (ID: ' . $reservationId . '). Reason: ' . $reason);
            $logStmt->bindValue(':action_type', 'reservation');
            $logStmt->execute();
        } catch (Exception $logEx) {

        }
    }

    if ($result) {
        echo json_encode(['success' => true, 'message' => 'Reservation denied successfully']);
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to deny reservation']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
?>
