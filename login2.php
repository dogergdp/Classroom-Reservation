<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Vulnerable Login</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div style="max-width:400px;margin:60px auto;padding:30px;background:#fff;border-radius:8px;box-shadow:0 2px 8px #ccc;">
        <h2 style="text-align:center;">Vulnerable Login (SQL Injection Demo)</h2>
        <form method="POST">
            <div style="margin-bottom:15px;">
                <label>Username</label>
                <input type="text" name="username" required style="width:100%;padding:8px;">
            </div>
            <div style="margin-bottom:15px;">
                <label>Password</label>
                <input type="password" name="password" required style="width:100%;padding:8px;">
            </div>
            <button type="submit" style="width:100%;padding:10px;">Login</button>
        </form>
        <?php

        
        $host = 'localhost';
        $dbname = 'classroom_reservation';
        $username = 'root';
        $password = '';

                // Database connection
        $conn = mysqli_connect($host, $username, $password, $dbname);

        if (!$conn) {
            die("Connection failed: " . mysqli_connect_error());
        }

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $inputUsername = $_POST['username'];
            $inputPassword = $_POST['password'];
        
            // ⚠️ Vulnerable SQL query: direct inclusion of user input
            $sql = "SELECT * FROM users WHERE username = '$inputUsername' AND password = '$inputPassword'";
            $result = mysqli_query($conn, $sql);
        
            if (mysqli_num_rows($result) > 0) {
                // Login success
                session_start();
                $user = mysqli_fetch_assoc($result);
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['username'] = $user['username'];
                $_SESSION['role'] = $user['role'];
        
                header("Location: app.php");
                exit();
            } else {
                // Login failed
                echo "<script>alert('Invalid username or password'); window.location.href='index.php';</script>";
            }
        }
    
        ?>
    </div>
</body>
</html>