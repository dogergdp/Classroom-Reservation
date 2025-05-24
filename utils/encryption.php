<?php
/**
 * Encryption utilities for Classroom Reservation System
 */

// IMPORTANT: In a production environment, these should be stored securely outside the web root
// and loaded from a secure configuration file or environment variables
define('ENCRYPTION_KEY', '8f7ah3j2k5l6m7n8o9p0qAzByC'); // CHANGE THIS IN PRODUCTION!
define('ENCRYPTION_METHOD', 'AES-256-CBC');

/**
 * Encrypt data
 * 
 * @param string $data The data to encrypt
 * @return string The encrypted data (base64 encoded)
 */
function encrypt($data) {
    // Generate a random initialization vector
    $iv_length = openssl_cipher_iv_length(ENCRYPTION_METHOD);
    $iv = openssl_random_pseudo_bytes($iv_length);
    
    // Encrypt the data
    $encrypted = openssl_encrypt($data, ENCRYPTION_METHOD, ENCRYPTION_KEY, 0, $iv);
    
    // Combine IV and encrypted data and encode with base64
    return base64_encode($iv . $encrypted);
}

/**
 * Decrypt data
 * 
 * @param string $data The encrypted data (base64 encoded)
 * @return string|false The decrypted data or false on failure
 */
function decrypt($data) {
    // Decode from base64
    $data = base64_decode($data);
    if ($data === false) {
        return false;
    }
    
    // Extract the initialization vector and the encrypted data
    $iv_length = openssl_cipher_iv_length(ENCRYPTION_METHOD);
    if (strlen($data) <= $iv_length) {
        return false;
    }
    
    $iv = substr($data, 0, $iv_length);
    $encrypted = substr($data, $iv_length);
    
    // Decrypt and return the data
    return openssl_decrypt($encrypted, ENCRYPTION_METHOD, ENCRYPTION_KEY, 0, $iv);
}

/**
 * Check if a string appears to be encrypted using our method
 * 
 * @param string $data The string to check
 * @return bool True if the string appears to be encrypted
 */
function is_encrypted($data) {
    // Try to base64 decode it first
    $decoded = base64_decode($data, true);
    if ($decoded === false) {
        return false;
    }
    
    // Check if the decoded data has the minimum expected length
    $iv_length = openssl_cipher_iv_length(ENCRYPTION_METHOD);
    if (strlen($decoded) <= $iv_length) {
        return false;
    }
    
    // Try to decrypt it
    $iv = substr($decoded, 0, $iv_length);
    $encrypted = substr($decoded, $iv_length);
    
    // If it can be decrypted successfully, it's likely encrypted with our method
    $decrypted = openssl_decrypt($encrypted, ENCRYPTION_METHOD, ENCRYPTION_KEY, 0, $iv);
    
    // If decryption returns false or an empty string, it's probably not encrypted with our method
    return $decrypted !== false && $decrypted !== '';
}

/**
 * Encrypt data only if it's not already encrypted
 * 
 * @param string $data The data to encrypt
 * @return string The encrypted data
 */
function encrypt_if_needed($data) {
    if (empty($data) || is_encrypted($data)) {
        return $data;
    }
    return encrypt($data);
}

/**
 * Decrypt data if it appears to be encrypted
 * 
 * @param string $data The data to decrypt
 * @return string The decrypted data or the original data if not encrypted
 */
function decrypt_if_needed($data) {
    if (empty($data) || !is_encrypted($data)) {
        return $data;
    }
    $decrypted = decrypt($data);
    return $decrypted !== false ? $decrypted : $data;
}
?>
