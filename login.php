<?php
// Database connection
$host = 'localhost';
$dbname = 'classroom_reservation';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}

// Check if form is submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $inputUsername = $_POST['username'];
    $inputPassword = $_POST['password'];

    // Use prepared statements to prevent SQL injection
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = :username");
    $stmt->bindParam(':username', $inputUsername, PDO::PARAM_STR);
    $stmt->execute();

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

// ...existing code...

    if ($user) {
        // Verify the plain text password
        if ($inputPassword === $user['password']) {
            // Start session and store user info
            session_start();
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['role'] = $user['role'];

            // Redirect to the main app
            header("Location: app.php");
            exit();
        } else {
            // Password does not match
            echo "<script>alert('Invalid username or password'); window.location.href='index.php';</script>";
        }
    } else {
        // User not found
        echo "<script>alert('Invalid username or password'); window.location.href='index.php';</script>";
    }

}
?>