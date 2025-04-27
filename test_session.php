<?php
session_start();
if (!isset($_SESSION['count'])) {
    $_SESSION['count'] = 1;
} else {
    $_SESSION['count']++;
}
echo "Session ID: " . session_id() . "<br>";
echo "Count: " . $_SESSION['count'];
?>