<?php
session_start();
// --- Activity Logging: Store logout in activity_logs table ---
if (isset($_SESSION['user_id']) && isset($_SESSION['username'])) {
    require_once 'db_config.php';
    try {
        $conn = getDbConnection();
        $stmt = $conn->prepare("INSERT INTO activity_logs (user_id, action, details, action_type) VALUES (:user_id, :action, :details, :action_type)");
        $stmt->bindValue(':user_id', $_SESSION['user_id']);
        $stmt->bindValue(':action', 'User logout');
        $stmt->bindValue(':details', $_SESSION['username'] . ' logged out');
        $stmt->bindValue(':action_type', 'logout');
        $stmt->execute();
    } catch (Exception $ex) {
        // Logging failure should not block logout
    }
}
// --- End Activity Logging ---
session_destroy();
header("Location: index.php");
exit();
?>