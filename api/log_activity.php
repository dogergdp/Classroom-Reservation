<?php
session_start();
require_once '../config/database.php';

// Enable detailed error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

// For actions that don't require login (like first-time setup)
$user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 0;

// Get parameters
$action = isset($_POST['action']) ? $_POST['action'] : '';
$details = isset($_POST['details']) ? $_POST['details'] : '';
$action_type = isset($_POST['action_type']) ? $_POST['action_type'] : 'general';

// Validate required fields
if (empty($action)) {
    echo json_encode([
        'success' => false,
        'error' => 'Action is required'
    ]);
    exit;
}

try {
    // Create database connection
    $conn = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Insert log entry
    $stmt = $conn->prepare("
        INSERT INTO activity_logs (user_id, action, details, action_type)
        VALUES (:user_id, :action, :details, :action_type)
    ");
    
    $stmt->bindParam(':user_id', $user_id);
    $stmt->bindParam(':action', $action);
    $stmt->bindParam(':details', $details);
    $stmt->bindParam(':action_type', $action_type);
    
    $stmt->execute();
    
    echo json_encode([
        'success' => true,
        'message' => 'Activity logged successfully'
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>