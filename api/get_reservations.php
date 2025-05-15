<?php
session_start();
header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    error_log('User not logged in');
    echo json_encode(['success' => false, 'error' => 'User not logged in']);
    exit;
}

// Database connection
require_once '../db_connect.php';

try {
    $userId = $_SESSION['user_id'];
    $role = $_SESSION['role'];
    $departmentId = $_SESSION['department_id'] ?? null;
    error_log("UserID: $userId, Role: $role, DepartmentID: $departmentId");

    // Different queries based on user role
    if ($role === 'admin') {
        error_log('Running admin query');
        $stmt = $conn->prepare("
            SELECT 
                r.id,
                r.professor_id,
                u.full_name AS professor_name,
                r.room,
                r.reservation_date AS date,
                r.start_time,
                r.duration,
                r.status,
                r.reason,
                r.course,
                r.section
            FROM reservations r
            JOIN users u ON r.professor_id = u.id
            ORDER BY r.reservation_date DESC, r.start_time ASC
        ");
    } elseif ($role === 'deptHead') {
        error_log('Running deptHead query');
        $stmt = $conn->prepare("
            SELECT 
                r.id,
                r.professor_id,
                u.full_name AS professor_name,
                r.room,
                r.reservation_date AS date,
                r.start_time,
                r.duration,
                r.status,
                r.reason,
                r.course,
                r.section
            FROM reservations r
            JOIN users u ON r.professor_id = u.id
            WHERE r.department_id = :departmentId
            ORDER BY r.reservation_date DESC, r.start_time ASC
        ");
        $stmt->bindParam(':departmentId', $departmentId);
    } elseif ($role === 'professor') {
        error_log('Running professor query - showing all reservations');
        // Modified this query - professors can now see all reservations, not just their own
        $stmt = $conn->prepare("
            SELECT 
                r.id,
                r.professor_id,
                u.full_name AS professor_name,
                r.room,
                r.reservation_date AS date,
                r.start_time,
                r.duration,
                r.status,
                r.reason,
                r.course,
                r.section
            FROM reservations r
            JOIN users u ON r.professor_id = u.id
            WHERE r.department_id = :departmentId
            ORDER BY r.reservation_date DESC, r.start_time ASC
        ");
        $stmt->bindParam(':departmentId', $departmentId);
    } elseif ($role === 'student') {
        // Get student's course and section
        $courseStmt = $conn->prepare("
            SELECT course, section FROM users WHERE id = :userId
        ");
        $courseStmt->bindParam(':userId', $userId);
        $courseStmt->execute();
        $studentInfo = $courseStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$studentInfo || !$studentInfo['course'] || !$studentInfo['section']) {
            error_log('Student has no course/section assigned');
            echo json_encode(['success' => false, 'error' => 'No course/section assigned to student']);
            exit;
        }
        
        $course = $studentInfo['course'];
        $section = $studentInfo['section'];
        
        error_log("Running student query for course: $course, section: $section");
        $stmt = $conn->prepare("
            SELECT 
                r.id,
                r.professor_id,
                u.full_name AS professor_name,
                r.room,
                r.reservation_date AS date,
                r.start_time,
                r.duration,
                r.status,
                r.reason,
                r.course,
                r.section
            FROM reservations r
            JOIN users u ON r.professor_id = u.id
            WHERE r.status = 'approved'
            AND r.course = :course
            AND r.section = :section
            ORDER BY r.reservation_date DESC, r.start_time ASC
        ");
        $stmt->bindParam(':course', $course);
        $stmt->bindParam(':section', $section);
    } else {
        // This case handles any other roles not explicitly covered
        error_log('Running other query');
        $stmt = $conn->prepare("
            SELECT 
                r.id,
                r.professor_id,
                u.full_name AS professor_name,
                r.room,
                r.reservation_date AS date,
                r.start_time,
                r.duration,
                r.status,
                r.reason,
                r.course,
                r.section
            FROM reservations r
            JOIN users u ON r.professor_id = u.id
            WHERE r.status = 'approved'
            ORDER BY r.reservation_date DESC, r.start_time ASC
        ");
    }

    $stmt->execute();
    $reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $formattedReservations = [];
    foreach ($reservations as $res) {
        $formattedReservations[] = [
            'id' => $res['id'],
            'professorId' => $res['professor_id'],
            'professorName' => $res['professor_name'],
            'room' => $res['room'],
            'date' => $res['date'],
            'startTime' => $res['start_time'],
            'duration' => $res['duration'],
            'status' => $res['status'],
            'reason' => $res['reason'], // Consider if 'denial_reason' should be used for 'denied' status
            'course' => $res['course'],
            'section' => $res['section']
        ];
    } 

    error_log('Formatted reservations: ' . print_r($formattedReservations, true));

    echo json_encode(['success' => true, 'reservations' => $formattedReservations]);
} catch (PDOException $e) {
    error_log('Database error: ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Database error occurred: ' . $e->getMessage()]);
}
?>