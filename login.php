<?php
session_start();
require_once 'db_config.php';


function decryptData($encrypted, $key) {
    $c = base64_decode($encrypted);
    $ivlen = openssl_cipher_iv_length($cipher="AES-128-CBC");
    $iv = substr($c, 0, $ivlen);
    $ciphertext_raw = substr($c, $ivlen);
    $original = openssl_decrypt($ciphertext_raw, $cipher, $key, $options=OPENSSL_RAW_DATA, $iv);
    return $original;
}
// Handle login form submission
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['username'];
    $password = $_POST['password'];

    try {
        $conn = getDbConnection();

        $stmt = $conn->prepare("SELECT u.id, u.username, u.password, u.role,
                               u.first_name, u.middle_name, u.last_name, u.email, u.department_id, d.name as department_name,
                               u.course, u.section 
                               FROM users u 
                               LEFT JOIN departments d ON u.department_id = d.id 
                               WHERE u.username = :username");
        $stmt->bindParam(':username', $username);
        $stmt->execute();

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // Hash the provided password with SHA-1 for comparison
        $hashed_password = sha1($password);

        if ($user && $hashed_password === $user['password']) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['role'] = $user['role'];

            // Decrypt name fields for full name
            $encryption_key = getenv('CLASSROOM_APP_KEY');
            $first_name = $user['first_name'] ? decryptData($user['first_name'], $encryption_key) : '';
            $middle_name = $user['middle_name'] ? decryptData($user['middle_name'], $encryption_key) : '';
            $last_name = $user['last_name'] ? decryptData($user['last_name'], $encryption_key) : '';
            $_SESSION['full_name'] = trim($first_name . ' ' . ($middle_name ? $middle_name . ' ' : '') . $last_name);

            if ($user['department_id']) {
                $_SESSION['department_id'] = $user['department_id'];
                $_SESSION['department_name'] = $user['department_name'];

                // For department heads, get professor count
                if ($user['role'] === 'deptHead') {
                    $stmt = $conn->prepare("SELECT COUNT(*) FROM users WHERE department_id = :dept_id AND role = 'professor'");
                    $stmt->bindParam(':dept_id', $user['department_id']);
                    $stmt->execute();
                    $_SESSION['professor_count'] = $stmt->fetchColumn();
                }
            }

            // Store course and section for students
            if ($user['role'] === 'student') {
                $_SESSION['course'] = $user['course'];
                $_SESSION['section'] = $user['section'];
            }

            header("Location: app.php");
            exit();
        } else {
            $_SESSION['login_error'] = "Invalid username or password";
            header("Location: index.php");
            exit();
        }
    } catch(PDOException $e) {
        $_SESSION['login_error'] = "Database error: " . $e->getMessage();
        header("Location: index.php");
        exit();
    }
}
?>
<script>
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // First login
    const loginFormData = new FormData();
    loginFormData.append('username', username);
    loginFormData.append('password', password);
    
    fetch('api/login.php', {
        method: 'POST',
        body: loginFormData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Explicitly log the activity separately
            const logFormData = new FormData();
            logFormData.append('action', 'User login');
            logFormData.append('details', username + ' logged in successfully');
            logFormData.append('action_type', 'login');
            
            return fetch('api/log_activity.php', {
                method: 'POST',
                body: logFormData
            })
            .then(() => {
                // Continue with redirect regardless of logging success
                window.location.href = 'index.php';
            })
            .catch(error => {
                console.error('Error logging activity:', error);
                window.location.href = 'index.php'; // Still redirect on log error
            });
        } else {
            // Handle login error
            alert(data.message || 'Login failed.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
});
</script>