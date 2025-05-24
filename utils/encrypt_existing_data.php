<?php
/**
 * Database migration script to encrypt existing sensitive data
 * 
 * WARNING: Run this script only once to avoid double-encrypting data
 * Make a database backup before running this script
 */

require_once '../db_config.php';
require_once 'encryption.php';

/**
 * Encrypt sensitive fields in the specified table
 * 
 * @param PDO $conn Database connection
 * @param string $table Table name
 * @param array $fields Fields to encrypt
 * @param string $id_column Primary key column name
 * @return int Number of records updated
 */
function encrypt_table_fields($conn, $table, $fields, $id_column = 'id') {
    $count = 0;
    
    // Get all records
    $stmt = $conn->prepare("SELECT $id_column, " . implode(', ', $fields) . " FROM $table");
    $stmt->execute();
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $id = $row[$id_column];
        $updates = [];
        $binds = [':id' => $id];
        
        foreach ($fields as $field) {
            // Only encrypt if not already encrypted and not empty
            if (!empty($row[$field]) && !is_encrypted($row[$field])) {
                $updates[] = "$field = :$field";
                $binds[":$field"] = encrypt($row[$field]);
            }
        }
        
        // If there are fields to update
        if (!empty($updates)) {
            $sql = "UPDATE $table SET " . implode(', ', $updates) . " WHERE $id_column = :id";
            $update_stmt = $conn->prepare($sql);
            
            foreach ($binds as $param => $value) {
                $update_stmt->bindValue($param, $value);
            }
            
            if ($update_stmt->execute()) {
                $count++;
            }
        }
    }
    
    return $count;
}

// Run the migration only with explicit confirmation
if (isset($_GET['confirm']) && $_GET['confirm'] === 'yes') {
    try {
        $conn = getDbConnection();
        
        // Start transaction
        $conn->beginTransaction();
        
        echo "<h1>Encrypting Sensitive Data</h1>";
        
        // Encrypt users table
        $user_fields = ['full_name', 'email'];
        $user_count = encrypt_table_fields($conn, 'users', $user_fields);
        echo "<p>Encrypted $user_count user records</p>";
        
        // Encrypt reservations table
        $reservation_fields = ['reason', 'course', 'section'];
        $reservation_count = encrypt_table_fields($conn, 'reservations', $reservation_fields);
        echo "<p>Encrypted $reservation_count reservation records</p>";
        
        // Encrypt room_assignments table
        $assignment_fields = ['course', 'section'];
        $assignment_count = encrypt_table_fields($conn, 'room_assignments', $assignment_fields);
        echo "<p>Encrypted $assignment_count room assignment records</p>";
        
        // Commit transaction
        $conn->commit();
        
        echo "<p>Data encryption completed successfully!</p>";
        
    } catch (PDOException $e) {
        // Rollback transaction on error
        if (isset($conn)) {
            $conn->rollBack();
        }
        echo "<h1>Error</h1>";
        echo "<p>Database error: " . $e->getMessage() . "</p>";
    }
} else {
    echo "<h1>Encrypt Existing Data</h1>";
    echo "<p>This script will encrypt sensitive data in the database.</p>";
    echo "<p><strong>WARNING:</strong> Make a backup of your database before running this script!</p>";
    echo "<p><strong>WARNING:</strong> Running this script multiple times may cause double-encryption.</p>";
    echo "<p>To proceed, click: <a href='?confirm=yes' style='color: red; font-weight: bold;'>Encrypt Data</a></p>";
}
?>
