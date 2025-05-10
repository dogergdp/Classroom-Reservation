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
        // Admin can see all assignments
        $stmt = $conn->prepare("
            SELECT ra.*, u.full_name AS professor_name 
            FROM room_assignments ra
            JOIN users u ON ra.professor_id = u.id
            ORDER BY ra.assignment_date DESC, ra.start_time ASC
        ");
    } elseif ($role === 'deptHead' && $departmentId) {
        // Department head can see assignments from their department
        $stmt = $conn->prepare("
            SELECT ra.*, u.full_name AS professor_name 
            FROM room_assignments ra
            JOIN users u ON ra.professor_id = u.id
            JOIN users prof ON ra.professor_id = prof.id
            WHERE prof.department_id = :departmentId
            ORDER BY ra.assignment_date DESC, ra.start_time ASC
        ");
        $stmt->bindParam(':departmentId', $departmentId);
    } else {
        // Professor and students can see assignments related to the professor
        $stmt = $conn->prepare("
            SELECT ra.*, u.full_name AS professor_name 
            FROM room_assignments ra
            JOIN users u ON ra.professor_id = u.id
            WHERE ra.professor_id = :userId
            OR (
                SELECT COUNT(*) FROM reservations r 
                WHERE r.room = ra.room AND r.reservation_date = ra.assignment_date 
                AND r.start_time = ra.start_time AND r.status = 'approved'
            ) > 0
            ORDER BY ra.assignment_date DESC, ra.start_time ASC
        ");
        $stmt->bindParam(':userId', $userId);
    }
    
    $stmt->execute();
    $assignments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format the data for the frontend
    $formattedAssignments = [];
    foreach ($assignments as $assign) {
        $formattedAssignments[] = [
            'id' => $assign['id'],
            'professorId' => $assign['professor_id'],
            'professorName' => $assign['professor_name'],
            'room' => $assign['room'],
            'date' => $assign['assignment_date'],
            'startTime' => $assign['start_time'],
            'endTime' => $assign['end_time'],
            'course' => $assign['course'],
            'section' => $assign['section']
        ];
    }
    
    echo json_encode(['success' => true, 'assignments' => $formattedAssignments]);
} catch (PDOException $e) {
    error_log('Database error: ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Database error occurred']);
}
?>
