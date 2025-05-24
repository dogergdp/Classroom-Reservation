<?php
// Assuming the rest of your login code is above...

// After successful user authentication
// Log the login activity
$log_stmt = $conn->prepare("
    INSERT INTO activity_logs (user_id, action, details, action_type) 
    VALUES (:user_id, :action, :details, :action_type)
");

$action = "User login";
$details = $username . " logged in successfully";
$action_type = "login";

$log_stmt->bindParam(':user_id', $user['id']);
$log_stmt->bindParam(':action', $action);
$log_stmt->bindParam(':details', $details);
$log_stmt->bindParam(':action_type', $action_type);

try {
    $log_stmt->execute();
    // Continue with normal response
} catch (Exception $log_e) {
    // Log the error but don't interrupt login
    error_log("Failed to log login: " . $log_e->getMessage());
    // Continue with normal response
}

// Now continue with your normal response
echo json_encode([
    'success' => true,
    'message' => 'Login successful',
    'username' => $username,
    // other user data...
]);