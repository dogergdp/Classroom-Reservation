<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();
require_once 'db.php';

// Initialize login attempts if not set
if (!isset($_SESSION['login_attempts'])) {
    $_SESSION['login_attempts'] = 0;
}

// Check if user is locked out
$max_attempts = 5;
$locked_out = false;

if (isset($_SESSION['lockout_time']) && isset($_SESSION['lockout_duration'])) {
    $current_time = time();
    $locked_until = $_SESSION['lockout_time'] + $_SESSION['lockout_duration'];
    
    if ($current_time < $locked_until) {
        $locked_out = true;
        $_SESSION['login_error'] = "Account is temporarily locked. Please try again later.";
        header("Location: index_with_limiter.php");
        exit;
    }
}

// Process login
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = isset($_POST['username']) ? $_POST['username'] : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';
    
    // Basic validation
    if (empty($username) || empty($password)) {
        $_SESSION['login_error'] = "Please enter both username and password.";
        header("Location: index_with_limiter.php");
        exit;
    }
    
    try {
        // Validate credentials against database
        $stmt = $conn->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows == 1) {
            $user = $result->fetch_assoc();
            
            // Changed from password_verify to SHA1 comparison
            if (sha1($password) === $user['password']) {
                // Password is correct - login successful
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['username'] = $user['username'];
                $_SESSION['role'] = $user['role'];
                
                // Reset login attempts on successful login
                $_SESSION['login_attempts'] = 0;
                
                // Redirect to app.php instead of role-based dashboards
                header("Location: app.php");
                exit;
            } else {
                // Password incorrect
                $_SESSION['login_attempts']++;
                
                // Check if max attempts reached
                if ($_SESSION['login_attempts'] >= $max_attempts) {
                    // Calculate lockout duration - starts at 30 seconds and doubles each time
                    $base_lockout = 30; // 30 seconds initial lockout
                    $lockout_multiplier = pow(2, floor($_SESSION['login_attempts'] / $max_attempts) - 1);
                    $lockout_duration = $base_lockout * $lockout_multiplier;
                    
                    $_SESSION['lockout_time'] = time();
                    $_SESSION['lockout_duration'] = $lockout_duration;
                    
                    $_SESSION['login_error'] = "Too many failed login attempts. Your account has been locked for " . 
                                              ($lockout_duration / 60 >= 1 ? floor($lockout_duration / 60) . " minutes" : $lockout_duration . " seconds");
                } else {
                    $_SESSION['login_error'] = "Invalid username or password. Attempts: " . $_SESSION['login_attempts'] . " of " . $max_attempts;
                }
            }
        } else {
            // Username not found
            $_SESSION['login_attempts']++;
            
            // Check if max attempts reached
            if ($_SESSION['login_attempts'] >= $max_attempts) {
                // Calculate lockout duration - starts at 30 seconds and doubles each time
                $base_lockout = 30; // 30 seconds initial lockout
                $lockout_multiplier = pow(2, floor($_SESSION['login_attempts'] / $max_attempts) - 1);
                $lockout_duration = $base_lockout * $lockout_multiplier;
                
                $_SESSION['lockout_time'] = time();
                $_SESSION['lockout_duration'] = $lockout_duration;
                
                $_SESSION['login_error'] = "Too many failed login attempts. Your account has been locked for " . 
                                          ($lockout_duration / 60 >= 1 ? floor($lockout_duration / 60) . " minutes" : $lockout_duration . " seconds");
            } else {
                $_SESSION['login_error'] = "Invalid username or password. Attempts: " . $_SESSION['login_attempts'] . " of " . $max_attempts;
            }
        }
    } catch (Exception $e) {
        // Log error but don't expose details to user
        error_log("Login error: " . $e->getMessage());
        $_SESSION['login_error'] = "An error occurred during login. Please try again.";
    }
    
    header("Location: index_with_limiter.php");
    exit;
}

// If someone accesses this file directly without POST data
header("Location: index_with_limiter.php");
exit;
?>