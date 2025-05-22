<?php
session_start();
header('Content-Type: application/json');



if (isset($_SESSION['user_id'])) {
    // Include database connection
    require_once 'db_connect.php';

    // Decrypt function (must match your encryption logic)
    function decryptData($encrypted, $key) {
        $c = base64_decode($encrypted);
        $ivlen = openssl_cipher_iv_length($cipher="AES-128-CBC");
        $iv = substr($c, 0, $ivlen);
        $ciphertext_raw = substr($c, $ivlen);
        $original = openssl_decrypt($ciphertext_raw, $cipher, $key, $options=OPENSSL_RAW_DATA, $iv);
        return $original;
    }

    try {
        // Get additional user information
        $stmt = $conn->prepare("
            SELECT u.*, d.name as department_name
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE u.id = :userId
        ");
        $stmt->bindParam(':userId', $_SESSION['user_id']);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        $encryption_key = getenv('CLASSROOM_APP_KEY');
        $first = $user['first_name'] ? decryptData($user['first_name'], $encryption_key) : '';
        $middle = $user['middle_name'] ? decryptData($user['middle_name'], $encryption_key) : '';
        $last = $user['last_name'] ? decryptData($user['last_name'], $encryption_key) : '';
        $fullName = trim($first . ' ' . ($middle ? $middle . ' ' : '') . $last);

        // If the user is a professor, get their department head's name
        $deptHeadName = null;
        if ($user['department_id']) {
            $stmt = $conn->prepare("
                SELECT u.first_name, u.middle_name, u.last_name
                FROM departments d
                JOIN users u ON d.head_id = u.id
                WHERE d.id = :departmentId
            ");
            $stmt->bindParam(':departmentId', $user['department_id']);
            $stmt->execute();
            $deptHead = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($deptHead) {
                $dh_first = $deptHead['first_name'] ? decryptData($deptHead['first_name'], $encryption_key) : '';
                $dh_middle = $deptHead['middle_name'] ? decryptData($deptHead['middle_name'], $encryption_key) : '';
                $dh_last = $deptHead['last_name'] ? decryptData($deptHead['last_name'], $encryption_key) : '';
                $deptHeadName = trim($dh_first . ' ' . ($dh_middle ? $dh_middle . ' ' : '') . $dh_last);
            }
        }

        // Count professors in department (for department heads)
        $professorCount = 0;
        if ($user['role'] === 'deptHead' && $user['department_id']) {
            $stmt = $conn->prepare("
                SELECT COUNT(*) as count
                FROM users
                WHERE department_id = :departmentId AND role = 'professor'
            ");
            $stmt->bindParam(':departmentId', $user['department_id']);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $professorCount = $result['count'];
        }

        $response = [
            'loggedIn' => true,
            'userId' => $_SESSION['user_id'],
            'username' => $user['username'],
            'fullName' => $fullName,
            'role' => $_SESSION['role'],
            'departmentId' => $user['department_id'],
            'departmentName' => $user['department_name'],
            'deptHeadName' => $deptHeadName,
            'professorCount' => $professorCount
        ];

        echo json_encode($response);
    } catch (PDOException $e) {
        error_log('Database error in session.php: ' . $e->getMessage());
        echo json_encode([
            'loggedIn' => true,
            'userId' => $_SESSION['user_id'],
            'username' => $_SESSION['username'],
            'role' => $_SESSION['role']
        ]);
    }
} else {
    echo json_encode(['loggedIn' => false]);
}
?>