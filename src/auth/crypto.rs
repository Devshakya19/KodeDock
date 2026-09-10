use aes_gcm::{
    aead::{Aead, AeadCore, KeyInit, OsRng},
    Aes256Gcm, Nonce,
};
use hex::{decode as hex_decode, encode as hex_encode};
use rand::RngCore;
use sha2::{Digest, Sha256};
use uuid::Uuid;

use crate::auth::errors::AuthError;

/// Derive a 256-bit AES key from the application secret using SHA-256.
pub fn derive_key(secret: &str) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(secret.as_bytes());
    let result = hasher.finalize();
    let mut key = [0u8; 32];
    key.copy_from_slice(&result);
    key
}

/// Computes SHA-256 hash of a string (used for storing refresh tokens safely).
pub fn hash_token(token: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(token.as_bytes());
    hex_encode(hasher.finalize())
}

/// Generates a cryptographically random hexadecimal token of given byte length.
pub fn generate_secure_token(bytes_len: usize) -> String {
    let mut buffer = vec![0u8; bytes_len];
    OsRng.fill_bytes(&mut buffer);
    hex_encode(buffer)
}

/// Encrypt a string using AES-256-GCM authenticated encryption.
/// The output format is: hex(12-byte-nonce + ciphertext-with-tag).
pub fn encrypt_token(token: &str, secret: &str) -> Result<String, AuthError> {
    let key_bytes = derive_key(secret);
    let cipher = Aes256Gcm::new_from_slice(&key_bytes)
        .map_err(|e| AuthError::Crypto(format!("AES cipher initialization failed: {}", e)))?;

    let nonce = Aes256Gcm::generate_nonce(&mut OsRng);

    match cipher.encrypt(&nonce, token.as_bytes()) {
        Ok(mut ciphertext) => {
            let mut payload = nonce.to_vec();
            payload.append(&mut ciphertext);
            Ok(hex_encode(payload))
        }
        Err(e) => {
            log::error!("AES-256-GCM encryption error: {:?}", e);
            Err(AuthError::Crypto("Encryption failed".to_string()))
        }
    }
}

/// Decrypt a hex-encoded AES-256-GCM string.
pub fn decrypt_token(encrypted_hex: &str, secret: &str) -> Result<String, AuthError> {
    let raw_bytes = hex_decode(encrypted_hex)
        .map_err(|e| AuthError::Crypto(format!("Invalid hex encoding: {}", e)))?;

    if raw_bytes.len() < 28 {
        // Must have at least 12 bytes nonce + 16 bytes tag
        return Err(AuthError::Crypto("Ciphertext too short".to_string()));
    }

    let key_bytes = derive_key(secret);
    let cipher = Aes256Gcm::new_from_slice(&key_bytes)
        .map_err(|e| AuthError::Crypto(format!("Cipher init failed: {}", e)))?;

    let nonce = Nonce::from_slice(&raw_bytes[..12]);
    let ciphertext = &raw_bytes[12..];

    let decrypted_bytes = cipher
        .decrypt(nonce, ciphertext)
        .map_err(|_| AuthError::Crypto("Decryption authentication tag check failed".to_string()))?;

    String::from_utf8(decrypted_bytes)
        .map_err(|e| AuthError::Crypto(format!("Invalid UTF-8 payload: {}", e)))
}

/// Encodes a UUID into a Base58 opaque public ID with a prefix (e.g. `kd_usr_3kZw...`).
pub fn encode_public_id(prefix: &str, id: &Uuid) -> String {
    let encoded = bs58::encode(id.as_bytes()).into_string();
    format!("{}_{}", prefix, encoded)
}

/// Decodes a Base58 opaque public ID back into a UUID.
pub fn decode_public_id(prefix: &str, public_id: &str) -> Result<Uuid, AuthError> {
    let prefix_with_underscore = format!("{}_", prefix);
    if !public_id.starts_with(&prefix_with_underscore) {
        return Err(AuthError::Crypto("Invalid ID prefix".to_string()));
    }
    
    let base58_part = &public_id[prefix_with_underscore.len()..];
    let decoded_bytes = bs58::decode(base58_part).into_vec()
        .map_err(|_| AuthError::Crypto("Invalid Base58 encoding".to_string()))?;
        
    Uuid::from_slice(&decoded_bytes)
        .map_err(|_| AuthError::Crypto("Invalid UUID payload".to_string()))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_aes_256_gcm_roundtrip() -> Result<(), Box<dyn std::error::Error>> {
        let secret = "top-secret-signing-key-kodedock-production-2026";
        let plaintext = "gho_1234567890abcdefghijklmnopqrstuvwxyz_secret_oauth_token";

        let encrypted = encrypt_token(plaintext, secret)?;
        assert_ne!(encrypted, plaintext);

        let decrypted = decrypt_token(&encrypted, secret)?;
        assert_eq!(decrypted, plaintext);
        Ok(())
    }

    #[test]
    fn test_token_hash_consistency() {
        let token = "refresh_token_sample_12345";
        let hash1 = hash_token(token);
        let hash2 = hash_token(token);
        assert_eq!(hash1, hash2);
        assert_eq!(hash1.len(), 64);
    }

    #[test]
    fn test_secure_random_token_generation() {
        let token1 = generate_secure_token(32);
        let token2 = generate_secure_token(32);
        assert_eq!(token1.len(), 64); // 32 bytes in hex = 64 characters
        assert_ne!(token1, token2);
    }

    #[test]
    fn test_public_id_encoding_decoding() -> Result<(), Box<dyn std::error::Error>> {
        let original_uuid = Uuid::new_v4();
        let public_id = encode_public_id("kd_usr", &original_uuid);
        
        assert!(public_id.starts_with("kd_usr_"));
        
        let decoded_uuid = decode_public_id("kd_usr", &public_id)?;
        assert_eq!(original_uuid, decoded_uuid);
        
        let invalid_prefix = decode_public_id("kd_sel", &public_id);
        assert!(invalid_prefix.is_err());
        Ok(())
    }
}
