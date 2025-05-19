<?php
session_start();
require_once 'db_config.php';

// Handle login form submission
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['username'];
    $password = $_POST['password'];
    
    try {
        $conn = getDbConnection();
        
        $stmt = $conn->prepare("SELECT u.id, u.username, u.password, u.role, u.full_name, 
                               u.email, u.department_id, d.name as department_name,
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
            $_SESSION['full_name'] = $user['full_name'];
            $_SESSION['role'] = $user['role'];
            
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