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
if (!isset($data['professorId']) || !isset($data['room']) || !isset($data['date']) || 
    !isset($data['startTime']) || !isset($data['endTime']) || 
    !isset($data['course']) || !isset($data['section'])) {
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

// Database connection
require_once '../db_connect.php';

try {
    $conn->beginTransaction();
    
    // First, check if the professor is in this department head's department
    $stmt = $conn->prepare("
        SELECT id, full_name FROM users 
        WHERE id = :professorId AND role = 'professor' AND department_id = :departmentId
    ");
    $stmt->bindParam(':professorId', $data['professorId']);
    $stmt->bindParam(':departmentId', $_SESSION['department_id']);
    $stmt->execute();
    
    $professor = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$professor) {
        $conn->rollBack();
        echo json_encode(['success' => false, 'error' => 'Professor not found or not in your department']);
        exit;
    }
    
    // Check if the room is already assigned for this date and time
    $stmt = $conn->prepare("
        SELECT id FROM room_assignments 
        WHERE room = :room AND assignment_date = :date 
        AND (
            (start_time <= :startTime AND end_time > :startTime) OR
            (start_time < :endTime AND end_time >= :endTime) OR
            (start_time >= :startTime AND end_time <= :endTime)
        )
    ");
    $stmt->bindParam(':room', $data['room']);
    $stmt->bindParam(':date', $data['date']);
    $stmt->bindParam(':startTime', $data['startTime']);
    $stmt->bindParam(':endTime', $data['endTime']);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $conn->rollBack();
        echo json_encode(['success' => false, 'error' => 'Room already booked for this time']);
        exit;
    }
    
    // Calculate duration in hours
    $startTime = new DateTime($data['startTime']);
    $endTime = new DateTime($data['endTime']);
    $duration = $startTime->diff($endTime)->h;
    
    // Create a reservation record (automatically approved)
    $stmt = $conn->prepare("
        INSERT INTO reservations 
        (professor_id, department_id, room, reservation_date, start_time, duration, status, reason, course, section)
        VALUES (:professorId, :departmentId, :room, :date, :startTime, :duration, 'approved', 'Directly assigned by department head', :course, :section)
    ");
    
    $stmt->bindParam(':professorId', $data['professorId']);
    $stmt->bindParam(':departmentId', $_SESSION['department_id']);
    $stmt->bindParam(':room', $data['room']);
    $stmt->bindParam(':date', $data['date']);
    $stmt->bindParam(':startTime', $data['startTime']);
    $stmt->bindParam(':duration', $duration);
    $stmt->bindParam(':course', $data['course']);
    $stmt->bindParam(':section', $data['section']);
    $stmt->execute();
    
    $reservationId = $conn->lastInsertId();
    
    // Create room assignment
    $stmt = $conn->prepare("
        INSERT INTO room_assignments 
        (reservation_id, professor_id, room, assignment_date, start_time, end_time, course, section, assigned_by)
        VALUES (:reservationId, :professorId, :room, :date, :startTime, :endTime, :course, :section, :assignedBy)
    ");
    
    $stmt->bindParam(':reservationId', $reservationId);
    $stmt->bindParam(':professorId', $data['professorId']);
    $stmt->bindParam(':room', $data['room']);
    $stmt->bindParam(':date', $data['date']);
    $stmt->bindParam(':startTime', $data['startTime']);
    $stmt->bindParam(':endTime', $data['endTime']);
    $stmt->bindParam(':course', $data['course']);
    $stmt->bindParam(':section', $data['section']);
    $stmt->bindParam(':assignedBy', $_SESSION['user_id']);
    $stmt->execute();
    
    $assignmentId = $conn->lastInsertId();
    
    $conn->commit();
    
    // Return success response with created data
    echo json_encode([
        'success' => true,
        'reservation' => [
            'id' => $reservationId,
            'professorId' => $data['professorId'],
            'room' => $data['room'],
            'date' => $data['date'],
            'startTime' => $data['startTime'],
            'duration' => $duration,
            'course' => $data['course'],
            'section' => $data['section']
        ],
        'assignment' => [
            'id' => $assignmentId,
            'professorId' => $data['professorId'],
            'professorName' => $professor['full_name'],
            'room' => $data['room'],
            'date' => $data['date'],
            'startTime' => $data['startTime'],
            'endTime' => $data['endTime'],
            'course' => $data['course'],
            'section' => $data['section']
        ]
    ]);
    
} catch (PDOException $e) {
    $conn->rollBack();
    error_log('Database error: ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Database error occurred: ' . $e->getMessage()]);
}
?>
