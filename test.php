<?php
$key = 'ediwow'; // or getenv('CLASSROOM_APP_KEY')
$encrypted = 'pITLHisPODTtzmVbD03oLAlyY7qlapJuoUnBMmIxCSNPyQxXu7dTVh0Mu9fZ/RxSX99BnkzcoPM7dbYK+6r9Og==';
function decryptData($encrypted, $key) {
    $c = base64_decode($encrypted);
    $ivlen = openssl_cipher_iv_length($cipher="AES-128-CBC");
    $iv = substr($c, 0, $ivlen);
    $hmac = substr($c, $ivlen, $sha2len=32);
    $ciphertext_raw = substr($c, $ivlen+$sha2len);
    $original = openssl_decrypt($ciphertext_raw, $cipher, $key, $options=OPENSSL_RAW_DATA, $iv);
    $calcmac = hash_hmac('sha256', $ciphertext_raw, $key, $as_binary=true);
    if (!hash_equals($hmac, $calcmac)) {
        return false;
    }
    return $original;
}
echo decryptData($encrypted, $key);

?>