<?php
<?php
require_once 'config/database.php';

echo "<h1>Activity Log Test</h1>";

try {
    // Create database connection
    $conn = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Test direct insertion
    $user_id = 1; // Admin user ID
    $action = "Test log entry";
    $details = "This is a test log entry from test_log.php";
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
    
    echo "<p style='color:green'>Test log entry created successfully!</p>";
    echo "<p>Now check your database to verify the entry exists.</p>";
    
    // Query to verify it was added
    $check = $conn->query("SELECT * FROM activity_logs ORDER BY id DESC LIMIT 1");
    $last_entry = $check->fetch(PDO::FETCH_ASSOC);
    
    echo "<h3>Last Entry in Database:</h3>";
    echo "<pre>";
    print_r($last_entry);
    echo "</pre>";
    
} catch (PDOException $e) {
    echo "<p style='color:red'>Error: " . $e->getMessage() . "</p>";
}
?>