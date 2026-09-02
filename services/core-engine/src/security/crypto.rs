use aes_gcm::{
    aead::{Aead, AeadCore, KeyInit, OsRng},
    Aes256Gcm, Nonce,
};
use hex::{decode as hex_decode, encode as hex_encode};
use sha2::{Digest, Sha256};

/// Derive a 256-bit AES key from the application secret using SHA-256
fn derive_key(secret: &str) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(secret.as_bytes());
    let result = hasher.finalize();
    let mut key = [0u8; 32];
    key.copy_from_slice(&result);
    key
}

/// Encrypt a string using AES-256-GCM authenticated encryption.
/// The output format is: hex(12-byte-nonce + ciphertext-with-tag).
pub fn encrypt_github_token(token: &str, secret: &str) -> String {
    let key_bytes = derive_key(secret);
    let cipher = Aes256Gcm::new_from_slice(&key_bytes).expect("Invalid key length for AES-256");

    // Generate random 96-bit (12-byte) nonce
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng);

    match cipher.encrypt(&nonce, token.as_bytes()) {
        Ok(mut ciphertext) => {
            let mut payload = nonce.to_vec();
            payload.append(&mut ciphertext);
            hex_encode(payload)
        }
        Err(e) => {
            log::error!("AES-256-GCM encryption error: {:?}", e);
            // Fallback to empty string on fatal encryption failure
            String::new()
        }
    }
}

/// Decrypt a hex-encoded AES-256-GCM string.
/// Falls back gracefully to legacy XOR decryption if the token was stored prior to the upgrade.
pub fn decrypt_github_token(encrypted_hex: &str, secret: &str) -> Result<String, String> {
    let raw_bytes = hex_decode(encrypted_hex).map_err(|e| format!("Invalid hex: {}", e))?;

    // Standard AES-256-GCM payload must have at least 12 bytes (nonce) + 16 bytes (auth tag)
    if raw_bytes.len() >= 28 {
        let key_bytes = derive_key(secret);
        if let Ok(cipher) = Aes256Gcm::new_from_slice(&key_bytes) {
            let nonce = Nonce::from_slice(&raw_bytes[..12]);
            let ciphertext = &raw_bytes[12..];

            if let Ok(decrypted_bytes) = cipher.decrypt(nonce, ciphertext) {
                if let Ok(plaintext) = String::from_utf8(decrypted_bytes) {
                    return Ok(plaintext);
                }
            }
        }
    }

    // Fallback: Attempt legacy XOR decryption for existing tokens
    decrypt_legacy_xor(&raw_bytes, secret)
}

/// Legacy XOR decryption to ensure zero downtime for existing stored user tokens
fn decrypt_legacy_xor(token_bytes: &[u8], secret: &str) -> Result<String, String> {
    let mut hasher = Sha256::new();
    hasher.update(secret.as_bytes());
    let key_result = hasher.finalize();
    let key = key_result.as_slice();

    let mut decrypted = Vec::with_capacity(token_bytes.len());
    for (i, byte) in token_bytes.iter().enumerate() {
        decrypted.push(byte ^ key[i % key.len()]);
    }

    String::from_utf8(decrypted).map_err(|e| format!("Legacy UTF-8 decode error: {}", e))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_aes_gcm_roundtrip() {
        let secret = "super-secret-production-jwt-key-2024";
        let token = "ghp_1234567890abcdefghijklmnopqrstuvwxyz";

        let encrypted = encrypt_github_token(token, secret);
        assert_ne!(encrypted, token);

        let decrypted = decrypt_github_token(&encrypted, secret).expect("Decryption failed");
        assert_eq!(decrypted, token);
    }
}
