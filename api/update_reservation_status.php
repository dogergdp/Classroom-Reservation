<?php
session_start();
header('Content-Type: application/json');

// Check if user is logged in and has appropriate role
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'deptHead') {
    echo json_encode(['success' => false, 'error' => 'Unauthorized access']);
    exit;
}

// Get JSON input data
$jsonData = file_get_contents('php://input');
$data = json_decode($jsonData, true);

// Validate input
if (!isset($data['id']) || !isset($data['status']) || 
    !in_array($data['status'], ['approved', 'denied'])) {
    echo json_encode(['success' => false, 'error' => 'Invalid input data']);
    exit;
}

// Database connection
require_once '../db_connect.php';

try {
    $conn->beginTransaction();
    
    // First, get the reservation details to ensure it exists and belongs to this department
    $reservationId = $data['id'];
    $stmt = $conn->prepare("
        SELECT r.*, u.full_name AS professor_name 
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
    
    // Update the reservation status
    $status = $data['status'];
    $reason = isset($data['reason']) ? $data['reason'] : null;
    
    if ($status === 'approved') {
        // Check for conflicting room assignments before approval
        $startTime = new DateTime($reservation['start_time']);
        $endTime = clone $startTime;
        $endTime->add(new DateInterval('PT' . $reservation['duration'] . 'H'));
        $endTimeString = $endTime->format('H:i:s');

        // Check if there's already an approved reservation for this room and time
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

        $stmt = $conn->prepare("
            UPDATE reservations 
            SET status = 'approved', updated_at = NOW() 
            WHERE id = :id
        ");
    } else { // denied
        $stmt = $conn->prepare("
            UPDATE reservations 
            SET status = 'denied', denial_reason = :reason, updated_at = NOW() 
            WHERE id = :id
        ");
        $stmt->bindParam(':reason', $reason);
    }
    
    $stmt->bindParam(':id', $reservationId);
    $stmt->execute();
    
    // If approved, create a room assignment
    $assignmentData = null;
    
    if ($status === 'approved') {
        // Calculate end time by adding duration to start time
        $startTime = new DateTime($reservation['start_time']);
        $endTime = clone $startTime;
        $endTime->add(new DateInterval('PT' . $reservation['duration'] . 'H'));
        $endTimeString = $endTime->format('H:i:s');
        
        // Create room assignment
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
        
        // Get the assignment data to return to the client
        $assignmentData = [
            'id' => $assignmentId,
            'professorId' => $reservation['professor_id'],
            'professorName' => $reservation['professor_name'],
            'room' => $reservation['room'],
            'date' => $reservation['reservation_date'],
            'startTime' => $reservation['start_time'],
            'endTime' => $endTimeString,
            'course' => $reservation['course'],
            'section' => $reservation['section']
        ];
    }
    
    $conn->commit();
    
    $response = ['success' => true, 'status' => $status];
    if ($assignmentData) {
        $response['assignment'] = $assignmentData;
    }
    
    echo json_encode($response);
    
} catch (PDOException $e) {
    $conn->rollBack();
    error_log('Database error: ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Database error occurred: ' . $e->getMessage()]);
}
?>
