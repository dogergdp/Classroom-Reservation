<?php
session_start();
header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'User not logged in']);
    exit;
}

// Database connection
require_once '../db_connect.php';

try {
    $userId = $_SESSION['user_id'];
    $role = $_SESSION['role'];
    $departmentId = $_SESSION['department_id'] ?? null;
    
    // Different queries based on user role
    if ($role === 'admin') {
        // Admin can see all reservations
        $stmt = $conn->prepare("
            SELECT r.*, u.full_name AS professorName 
            FROM reservations r
            JOIN users u ON r.professor_id = u.id
            ORDER BY r.reservation_date DESC, r.start_time ASC
        ");
    } elseif ($role === 'deptHead') {
        // Department head can see reservations from their department
        $stmt = $conn->prepare("
            SELECT r.*, u.full_name AS professorName 
            FROM reservations r
            JOIN users u ON r.professor_id = u.id
            WHERE r.department_id = :departmentId
            ORDER BY r.reservation_date DESC, r.start_time ASC
        ");
        $stmt->bindParam(':departmentId', $departmentId);
    } elseif ($role === 'professor') {
        // Professor can see their own reservations and other approved reservations
        $stmt = $conn->prepare("
            SELECT r.*, u.full_name AS professorName 
            FROM reservations r
            JOIN users u ON r.professor_id = u.id
            WHERE r.professor_id = :userId OR r.status = 'approved'
            ORDER BY r.reservation_date DESC, r.start_time ASC
        ");
        $stmt->bindParam(':userId', $userId);
    } else {
        // Students and others can see only approved reservations
        $stmt = $conn->prepare("
            SELECT r.*, u.full_name AS professorName 
            FROM reservations r
            JOIN users u ON r.professor_id = u.id
            WHERE r.status = 'approved'
            ORDER BY r.reservation_date DESC, r.start_time ASC
        ");
    }
    
    $stmt->execute();
    $reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format the data for the frontend
    $formattedReservations = [];
    foreach ($reservations as $res) {
        $formattedReservations[] = [
            'id' => $res['id'],
            'professorId' => $res['professor_id'],
            'professorName' => $res['professorName'],
            'room' => $res['room'],
            'date' => $res['reservation_date'],
            'startTime' => $res['start_time'],
            'duration' => $res['duration'],
            'status' => $res['status'],
            'reason' => $res['status'] === 'denied' ? $res['denial_reason'] : $res['reason'],
            'course' => $res['course'],
            'section' => $res['section']
        ];
    }
    
    echo json_encode(['success' => true, 'reservations' => $formattedReservations]);
} catch (PDOException $e) {
    error_log('Database error: ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Database error occurred: ' . $e->getMessage()]);
}
?>
