<!-- filepath: c:\xampp\htdocs\Classroom Reservation\index.php -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Classroom Reservation System</title>
    <link rel="stylesheet" href="styles.css">
    <!-- Font Awesome for icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div class="min-h-screen bg-gradient flex items-center justify-center">
        <div class="max-w-md w-full bg-white p-6 rounded-lg shadow-lg">
            <h1 class="text-2xl font-bold text-center mb-6">Login</h1>
            
            <?php
            session_start();
            if (isset($_SESSION['login_error'])) {
                echo '<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">';
                echo $_SESSION['login_error'];
                echo '</div>';
                unset($_SESSION['login_error']);
            }
            ?>
            
            <form action="login.php" method="POST">
                <div class="mb-4">
                    <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
                    <input type="text" name="username" id="username" required class="form-control">
                </div>
                <div class="mb-4">
                    <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                    <input type="password" name="password" id="password" required class="form-control">
                </div>
                <button type="submit" class="btn btn-primary w-full">Login</button>
            </form>
        </div>
    </div>
</body>
</html>