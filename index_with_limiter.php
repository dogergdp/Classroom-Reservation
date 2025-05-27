<?php
session_start();

// Initialize login attempt tracking
if (!isset($_SESSION['login_attempts'])) {
    $_SESSION['login_attempts'] = 0;
}

// Check if user is currently locked out
$locked_out = false;
$remaining_time = 0;
$max_attempts = 5;

if (isset($_SESSION['lockout_time']) && isset($_SESSION['lockout_duration'])) {
    $current_time = time();
    $locked_until = $_SESSION['lockout_time'] + $_SESSION['lockout_duration'];
    
    if ($current_time < $locked_until) {
        $locked_out = true;
        $remaining_time = $locked_until - $current_time;
    } else {
        // Lockout period expired but don't reset attempts
        unset($_SESSION['lockout_time']);
        unset($_SESSION['lockout_duration']);
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Classroom Reservation System</title>
    <link rel="stylesheet" href="styles.css">
    <!-- Font Awesome for icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        .countdown-container {
            text-align: center;
            margin-bottom: 20px;
            padding: 10px;
            background-color: #fff3cd;
            border: 1px solid #ffeeba;
            border-radius: 5px;
            color: #856404;
        }
        
        .timer {
            font-size: 24px;
            font-weight: bold;
            margin: 10px 0;
        }
    </style>
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
                
                <?php if (isset($_SESSION['login_error'])): ?>
                    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <?php 
                            echo $_SESSION['login_error']; 
                            unset($_SESSION['login_error']);
                        ?>
                    </div>
                <?php endif; ?>
                
                <?php if (isset($_SESSION['signup_success'])): ?>
                    <div class="mt-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4" role="alert">
                        <p><?php echo htmlspecialchars($_SESSION['signup_success']); ?></p>
                        <?php unset($_SESSION['signup_success']); ?>
                    </div>
                <?php endif; ?>
                
                <?php if ($locked_out): ?>
                <div class="countdown-container">
                    <p><i class="fas fa-lock"></i> Account temporarily locked due to multiple failed attempts</p>
                    <p>Please wait:</p>
                    <div class="timer" id="countdown"><?php echo $remaining_time; ?></div>
                    <p>seconds before trying again</p>
                </div>
                <?php endif; ?>
                
                <!-- Show attempt counter if getting close to lockout -->
                <?php if ($_SESSION['login_attempts'] > 0 && $_SESSION['login_attempts'] < $max_attempts): ?>
                <div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
                    <p>Warning: Failed login attempts: <?php echo $_SESSION['login_attempts']; ?> of <?php echo $max_attempts; ?></p>
                    <p>Your account will be temporarily locked after <?php echo $max_attempts; ?> failed attempts.</p>
                </div>
                <?php endif; ?>
                
                <form action="login_with_limiter.php" method="POST" class="space-y-4" <?php echo $locked_out ? 'style="display:none;"' : ''; ?>>
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
                
                <div class="mt-4 text-center" <?php echo $locked_out ? 'style="display:none;"' : ''; ?>>
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
    
    <?php if ($locked_out): ?>
    <script>
        // Countdown timer
        let timeLeft = <?php echo $remaining_time; ?>;
        const countdownElement = document.getElementById('countdown');
        
        const countdownTimer = setInterval(function() {
            timeLeft--;
            countdownElement.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(countdownTimer);
                location.reload(); // Reload the page when timer reaches zero
            }
        }, 1000);
    </script>
    <?php endif; ?>
</body>
</html>