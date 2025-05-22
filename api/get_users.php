<?php
session_start();
require_once '../db_config.php';

function decryptData($encrypted, $key) {
    $c = base64_decode($encrypted);
    $ivlen = openssl_cipher_iv_length($cipher="AES-128-CBC");
    $iv = substr($c, 0, $ivlen);
    if (strlen($iv) !== $ivlen) {
        error_log("IV length is " . strlen($iv) . ", expected $ivlen. Data: $encrypted");
    }
    $hmac = substr($c, $ivlen, $sha2len=32);
    $ciphertext_raw = substr($c, $ivlen+$sha2len);
    $original = openssl_decrypt($ciphertext_raw, $cipher, $key, $options=OPENSSL_RAW_DATA, $iv);
    $calcmac = hash_hmac('sha256', $ciphertext_raw, $key, $as_binary=true);
    if (!hash_equals($hmac, $calcmac)) {
        return false;
    }
    return $original;
}

// Add more verbose error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

// Check if user is logged in and is an admin
if (!isset($_SESSION['user_id']) || !isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode([
        'success' => false,
        'error' => 'Unauthorized access',
        'role' => $_SESSION['role'] ?? 'not set',
        'user_id' => $_SESSION['user_id'] ?? 'not set'
    ]);
    exit;
}

try {
    $conn = getDbConnection();

    // Use your actual encryption key here
    $encryption_key = getenv('CLASSROOM_APP_KEY'); // Or wherever you store your key

    // Join with departments to get department names
    $query = "SELECT u.id, u.username, u.role, u.first_name, u.middle_name, u.last_name, u.full_name, u.email, u.department_id, d.name as department_name 
              FROM users u 
              LEFT JOIN departments d ON u.department_id = d.id 
              ORDER BY u.role, u.full_name";

    $stmt = $conn->prepare($query);
    $stmt->execute();

    $users = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Only decrypt if the value is not empty and looks like base64
        foreach (['first_name', 'middle_name', 'last_name', 'email'] as $field) {
            if (!empty($row[$field]) && base64_decode($row[$field], true) !== false) {
                $row[$field] = decryptData($row[$field], $encryption_key);
            } else {
                $row[$field] = '';
            }
        }
        $row['full_name'] = trim($row['first_name'] . ' ' . $row['middle_name'] . ' ' . $row['last_name']);

        $users[] = [
            'id' => $row['id'],
            'username' => $row['username'],
            'role' => $row['role'],
            'full_name' => $row['full_name'],
            'email' => $row['email'],
            'department_id' => $row['department_id'],
            'department_name' => $row['department_name']
        ];
    }

    echo json_encode([
        'success' => true,
        'users' => $users,
        'count' => count($users)
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
