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

function decryptData($encrypted, $key) {
    $c = base64_decode($encrypted);
    $ivlen = openssl_cipher_iv_length($cipher="AES-128-CBC");
    $iv = substr($c, 0, $ivlen);
    $ciphertext_raw = substr($c, $ivlen);
    $original = openssl_decrypt($ciphertext_raw, $cipher, $key, $options=OPENSSL_RAW_DATA, $iv);
    return $original;
}

try {
    $userId = $_SESSION['user_id'];
    $role = $_SESSION['role'];
    $departmentId = $_SESSION['department_id'] ?? null;
    
    // Different queries based on user role
    if ($role === 'admin') {
        // Admin can see all room assignments
        $stmt = $conn->prepare("
            SELECT ra.*, u.first_name, u.middle_name, u.last_name
            FROM room_assignments ra
            JOIN users u ON ra.professor_id = u.id
            ORDER BY ra.assignment_date DESC, ra.start_time ASC
        ");
    } elseif ($role === 'deptHead') {
        // Department head can see assignments for professors in their department
        $stmt = $conn->prepare("
            SELECT ra.*, u.first_name, u.middle_name, u.last_name
            FROM room_assignments ra
            JOIN users u ON ra.professor_id = u.id
            WHERE u.department_id = :departmentId
            ORDER BY ra.assignment_date DESC, ra.start_time ASC
        ");
        $stmt->bindParam(':departmentId', $departmentId);
    } else {
        // Professors and others see assignments relevant to them
        $stmt = $conn->prepare("
            SELECT ra.*, u.first_name, u.middle_name, u.last_name
            FROM room_assignments ra
            JOIN users u ON ra.professor_id = u.id
            WHERE ra.professor_id = :userId OR u.department_id = :departmentId
            ORDER BY ra.assignment_date DESC, ra.start_time ASC
        ");
        $stmt->bindParam(':userId', $userId);
        $stmt->bindParam(':departmentId', $departmentId);
    }
    
    $stmt->execute();
    $assignments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format the data for the frontend
    $encryption_key = getenv('CLASSROOM_APP_KEY');
    $formattedAssignments = [];
    foreach ($assignments as $asn) {
        $first = $asn['first_name'] ? decryptData($asn['first_name'], $encryption_key) : '';
        $middle = $asn['middle_name'] ? decryptData($asn['middle_name'], $encryption_key) : '';
        $last = $asn['last_name'] ? decryptData($asn['last_name'], $encryption_key) : '';
        $professorName = trim($first . ' ' . ($middle ? $middle . ' ' : '') . $last);

        $formattedAssignments[] = [
            'id' => $asn['id'],
            'reservationId' => $asn['reservation_id'],
            'professorId' => $asn['professor_id'],
            'professorName' => $professorName,
            'room' => $asn['room'],
            'date' => $asn['assignment_date'],
            'startTime' => $asn['start_time'],
            'endTime' => $asn['end_time'],
            'course' => $asn['course'],
            'section' => $asn['section']
        ];
    }
    
    echo json_encode(['success' => true, 'assignments' => $formattedAssignments]);
} catch (PDOException $e) {
    error_log('Database error: ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Database error occurred: ' . $e->getMessage()]);
}
?>
