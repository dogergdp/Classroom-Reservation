<?php
session_start();
require_once '../db_config.php';

header('Content-Type: application/json');

// Check if user is logged in and is a professor
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'professor') {
    echo json_encode(['error' => 'Unauthorized access']);
    exit();
}

// Check if the request is a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Invalid request method']);
    exit();
}

// Get request data
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['error' => 'Invalid data format']);
    exit();
}

// Validate required fields
$requiredFields = ['room', 'date', 'startTime', 'duration', 'course', 'section'];
foreach ($requiredFields as $field) {
    if (!isset($data[$field]) || empty($data[$field])) {
        echo json_encode(['error' => "Missing required field: $field"]);
        exit();
    }
}

try {
    $conn = getDbConnection();
    
    // Insert the reservation
    $stmt = $conn->prepare("INSERT INTO reservations 
                            (professor_id, department_id, room, reservation_date, start_time, 
                            duration, status, reason, course, section) 
                            VALUES (:professor_id, :department_id, :room, :date, :start_time, 
                            :duration, 'pending', :reason, :course, :section)");
                            
    $stmt->bindParam(':professor_id', $_SESSION['user_id']);
    $stmt->bindParam(':department_id', $_SESSION['department_id']);
    $stmt->bindParam(':room', $data['room']);
    $stmt->bindParam(':date', $data['date']);
    $stmt->bindParam(':start_time', $data['startTime']);
    $stmt->bindParam(':duration', $data['duration']);
    $stmt->bindParam(':reason', $data['reason']);
    $stmt->bindParam(':course', $data['course']);
    $stmt->bindParam(':section', $data['section']);
    
    $stmt->execute();
    
    $reservationId = $conn->lastInsertId();
    
    echo json_encode([
        'success' => true, 
        'message' => 'Reservation request submitted successfully',
        'reservation' => [
            'id' => $reservationId,
            'professorId' => $_SESSION['user_id'],
            'room' => $data['room'],
            'date' => $data['date'],
            'startTime' => $data['startTime'],
            'duration' => $data['duration'],
            'status' => 'pending',
            'reason' => $data['reason'],
            'course' => $data['course'],
            'section' => $data['section']
        ]
    ]);
    
} catch(PDOException $e) {
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
