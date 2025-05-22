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
        <div class="flex flex-row items-center justify-center w-full max-w-5xl space-x-12">
            <!-- Title Section (Left) -->
            <div class="mb-8 text-center">
                <h1 class="text-3xl font-extrabold text-center text-rose-600">
                    <i class="fas fa-door-open mr-2"></i> Classroom Reservation
                </h1>
                <h2 class="mt-6 text-2xl font-bold text-center text-gray-900">
                    Login to your account
                </h2>
            </div>
            <div style="width: 64px; min-width: 32px; height: 1px;"></div>
            <!-- Login Card (Right) -->
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
                <!-- Show success message from signup -->
                <?php if (isset($_SESSION['signup_success'])): ?>
                    <div class="mt-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4" role="alert">
                        <p><?php echo htmlspecialchars($_SESSION['signup_success']); ?></p>
                        <?php unset($_SESSION['signup_success']); ?>
                    </div>
                <?php endif; ?>
                <form action="login.php" method="POST" class="space-y-4">
                    <div class="mb-4">
                        <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
                        <input type="text" name="username" id="username" required class="form-control">
                    </div>
                    <div class="mb-4">
                        <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" name="password" id="password" required class="form-control">
                    </div>
                    <button type="submit" class="btn btn-primary w-full block mb-6" style="width:100%">Login</button>
                </form>
                <div class="mt-4 text-center">
                    <p class="text-sm text-gray-600">
                        Don't have an account? <br>
                        <a href="signup.php" class="font-medium text-rose-600 hover:text-rose-500">
                            Sign up now
                        </a>
                    </p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>