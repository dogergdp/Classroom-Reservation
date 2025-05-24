<?php
require_once '../config/database.php';

header('Content-Type: application/json');

try {
    // Create database connection
    $conn = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Test direct insertion
    $user_id = 1; // Admin user ID
    $action = "Test action";
    $details = "Test details";
    $action_type = "test";
    
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
        'message' => 'Test log entry created successfully'
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>