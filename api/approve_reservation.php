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

function decryptData($encrypted, $key) {
    $c = base64_decode($encrypted);
    $ivlen = openssl_cipher_iv_length($cipher="AES-128-CBC");
    $iv = substr($c, 0, $ivlen);
    $ciphertext_raw = substr($c, $ivlen);
    $original = openssl_decrypt($ciphertext_raw, $cipher, $key, $options=OPENSSL_RAW_DATA, $iv);
    return $original;
}

try {
    // Validate input
    if (!isset($_POST['reservation_id']) || empty($_POST['reservation_id'])) {
        echo json_encode(['success' => false, 'error' => 'Reservation ID is required']);
        exit;
    }

    $reservationId = $_POST['reservation_id'];
    
    $conn->beginTransaction();
    
    // Get the reservation details first
    $stmt = $conn->prepare("
        SELECT r.*, 
            u.first_name, u.middle_name, u.last_name,
            u.id AS professor_id
        FROM reservations r
        JOIN users u ON r.professor_id = u.id
        WHERE r.id = :id
    ");
    
    $stmt->bindParam(':id', $reservationId);
    $stmt->execute();
    $reservation = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$reservation) {
        $conn->rollBack();
        echo json_encode(['success' => false, 'error' => 'Reservation not found']);
        exit;
    }
    
    // Check for room conflicts
    $startTime = new DateTime($reservation['start_time']);
    $endTime = clone $startTime;
    $endTime->add(new DateInterval('PT' . $reservation['duration'] . 'H'));
    $endTimeString = $endTime->format('H:i:s');
    
    // Check if there's already an assignment for this room and time
    $conflictCheck = $conn->prepare("
        SELECT COUNT(*) FROM room_assignments 
        WHERE room = :room 
        AND assignment_date = :date 
        AND (
            (start_time < :endTime AND end_time > :startTime) OR
            (start_time = :startTime AND end_time = :endTime)
        )
    ");
    
    $conflictCheck->bindParam(':room', $reservation['room']);
    $conflictCheck->bindParam(':date', $reservation['reservation_date']);
    $conflictCheck->bindParam(':startTime', $reservation['start_time']);
    $conflictCheck->bindParam(':endTime', $endTimeString);
    $conflictCheck->execute();
    
    if ($conflictCheck->fetchColumn() > 0) {
        $conn->rollBack();
        echo json_encode(['success' => false, 'error' => 'Room already assigned for this time slot']);
        exit;
    }
    
    // Update the reservation status to approved
    $stmt = $conn->prepare("
        UPDATE reservations 
        SET status = 'approved', updated_at = NOW() 
        WHERE id = :reservationId
    ");
    
    $stmt->bindParam(':reservationId', $reservationId);
    $stmt->execute();
    
    // Create a room assignment
    $stmt = $conn->prepare("
        INSERT INTO room_assignments 
        (reservation_id, professor_id, room, assignment_date, start_time, end_time, course, section, assigned_by)
        VALUES (:reservationId, :professorId, :room, :date, :startTime, :endTime, :course, :section, :assignedBy)
    ");
    
    $stmt->bindParam(':reservationId', $reservationId);
    $stmt->bindParam(':professorId', $reservation['professor_id']);
    $stmt->bindParam(':room', $reservation['room']);
    $stmt->bindParam(':date', $reservation['reservation_date']);
    $stmt->bindParam(':startTime', $reservation['start_time']);
    $stmt->bindParam(':endTime', $endTimeString);
    $stmt->bindParam(':course', $reservation['course']);
    $stmt->bindParam(':section', $reservation['section']);
    $stmt->bindParam(':assignedBy', $_SESSION['user_id']);
    $stmt->execute();
    
    $assignmentId = $conn->lastInsertId();
    
    $conn->commit();
    
    $encryption_key = getenv('CLASSROOM_APP_KEY');
    $first = $professor['first_name'] ? decryptData($professor['first_name'], $encryption_key) : '';
    $middle = $professor['middle_name'] ? decryptData($professor['middle_name'], $encryption_key) : '';
    $last = $professor['last_name'] ? decryptData($professor['last_name'], $encryption_key) : '';
    $professor_name = trim($first . ' ' . ($middle ? $middle . ' ' : '') . $last);
    
    echo json_encode([
        'success' => true, 
        'message' => 'Reservation approved successfully',
        'assignment' => [
            'id' => $assignmentId,
            'professorId' => $reservation['professor_id'],
            'professorName' => $professor_name,
            'room' => $reservation['room'],
            'date' => $reservation['reservation_date'],
            'startTime' => $reservation['start_time'],
            'endTime' => $endTimeString,
            'course' => $reservation['course'],
            'section' => $reservation['section']
        ]
    ]);
} catch (PDOException $e) {
    if (isset($conn)) $conn->rollBack();
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
?>
