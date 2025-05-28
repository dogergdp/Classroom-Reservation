<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || !in_array($_SESSION['role'], ['deptHead', 'admin'])) {
    echo json_encode(['success' => false, 'error' => 'Unauthorized access']);
    exit;
}

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
    $departmentId = $_SESSION['department_id'] ?? null;
    
    if ($_SESSION['role'] === 'admin') {
        $stmt = $conn->prepare("
        SELECT id, username, first_name, middle_name, last_name, email, department_id 
        FROM users 
        WHERE role = 'professor'
        ORDER BY last_name, first_name
        ");
    } else {
        $stmt = $conn->prepare("
            SELECT id, username, first_name, middle_name, last_name, email, department_id 
            FROM users 
            WHERE role = 'professor' AND department_id = :departmentId
            ORDER BY last_name, first_name
        ");
        $stmt->bindParam(':departmentId', $departmentId);
    }
    
    $stmt->execute();
    $professors = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $encryption_key = getenv('CLASSROOM_APP_KEY');
    
    foreach ($professors as &$prof) {
        $first = $prof['first_name'] ? decryptData($prof['first_name'], $encryption_key) : '';
        $middle = $prof['middle_name'] ? decryptData($prof['middle_name'], $encryption_key) : '';
        $last = $prof['last_name'] ? decryptData($prof['last_name'], $encryption_key) : '';
        $prof['full_name'] = trim($first . ' ' . ($middle ? $middle . ' ' : '') . $last);
    }

    unset($prof);
}catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    exit;
}

echo json_encode(['success' => true, 'professors' => $professors]);
?>