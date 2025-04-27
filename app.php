<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    // Redirect to login page if session is not set
    header("Location: index.php");
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Classroom Reservation System</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div id="app-container">
        <!-- Main application content goes here -->
    </div>
    <script src="script.js"></script>
</body>
</html>