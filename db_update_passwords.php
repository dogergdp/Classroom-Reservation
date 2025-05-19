<?php
// This is a one-time script to update existing passwords to SHA-1 hashed format
// Run this once after implementing the SHA-1 hashing

require_once 'db_config.php';

try {
    $conn = getDbConnection();
    
    // Get all users
    $stmt = $conn->query("SELECT id, username, password FROM users");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<h1>Password Update Script</h1>";
    echo "<p>Converting passwords to SHA-1 hash format...</p>";
    
    $count = 0;
    
    // Update each user's password to a SHA-1 hash
    foreach ($users as $user) {
        // Skip if the password already looks like a hash
        if (strlen($user['password']) === 40 && ctype_xdigit($user['password'])) {
            echo "<p>User '{$user['username']}' already has a hashed password. Skipping...</p>";
            continue;
        }
        
        $hashed_password = sha1($user['password']);
        
        $update = $conn->prepare("UPDATE users SET password = :password WHERE id = :id");
        $update->bindParam(':password', $hashed_password);
        $update->bindParam(':id', $user['id']);
        $update->execute();
        
        echo "<p>Updated password for user: {$user['username']}</p>";
        $count++;
    }
    
    echo "<h2>Password update completed!</h2>";
    echo "<p>Updated $count user passwords to SHA-1 format.</p>";
    echo "<p><a href='index.php'>Return to login page</a></p>";
    
} catch(PDOException $e) {
    die("Database error: " . $e->getMessage());
}
?>
