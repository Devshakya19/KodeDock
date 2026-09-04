use totp_rs::{Algorithm, Secret, TOTP};
use aes_gcm::{Aes256Gcm, Key, Nonce};
use aes_gcm::aead::{Aead, KeyInit};
use hex;
use rand::RngCore;
use crate::errors::AppError;

/// Generates a new TOTP secret for a given user email.
/// Returns (base32_secret, qr_code_base64)
pub fn generate_totp_secret(email: &str) -> Result<(String, String), AppError> {
    let secret = Secret::generate_secret().to_bytes().unwrap_or_default();
    
    let totp = TOTP::new(
        Algorithm::SHA1,
        6,
        1,
        30,
        secret,
        Some("KodeDock".to_string()),
        email.to_string(),
    ).map_err(|e| AppError::InternalError(format!("Failed to create TOTP: {}", e)))?;

    let qr_code = totp.get_qr_base64()
        .map_err(|e| AppError::InternalError(format!("Failed to generate QR: {}", e)))?;

    Ok((totp.get_secret_base32(), qr_code))
}

/// Verifies a TOTP token against a base32 secret
pub fn verify_totp(secret_base32: &str, token: &str) -> Result<bool, AppError> {
    let secret = Secret::Encoded(secret_base32.to_string()).to_bytes()
        .map_err(|_| AppError::InternalError("Invalid secret encoding".to_string()))?;
        
    let totp = TOTP::new(
        Algorithm::SHA1,
        6,
        1,
        30,
        secret,
        None,
        "".to_string(),
    ).map_err(|e| AppError::InternalError(format!("Failed to parse TOTP for verification: {}", e)))?;

    Ok(totp.check_current(token).unwrap_or(false))
}

/// Encrypts the base32 secret before saving to the database using AES-256-GCM
pub fn encrypt_secret(master_key_hex: &str, plaintext: &str) -> Result<String, AppError> {
    let key_bytes = hex::decode(master_key_hex)
        .map_err(|_| AppError::InternalError("Invalid master key hex".to_string()))?;
    
    let key = Key::<Aes256Gcm>::from_slice(&key_bytes);
    let cipher = Aes256Gcm::new(key);
    
    let mut nonce_bytes = [0u8; 12];
    rand::thread_rng().fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    let ciphertext = cipher.encrypt(nonce, plaintext.as_bytes())
        .map_err(|_| AppError::InternalError("Encryption failed".to_string()))?;

    // Prepend nonce to ciphertext and base64 encode
    let mut combined = nonce_bytes.to_vec();
    combined.extend(ciphertext);

    use base64::{Engine as _, engine::general_purpose::STANDARD};
    Ok(STANDARD.encode(combined))
}

/// Decrypts the secret from the database using AES-256-GCM
pub fn decrypt_secret(master_key_hex: &str, encrypted_base64: &str) -> Result<String, AppError> {
    use base64::{Engine as _, engine::general_purpose::STANDARD};
    
    let combined = STANDARD.decode(encrypted_base64)
        .map_err(|_| AppError::InternalError("Invalid base64 payload".to_string()))?;
        
    if combined.len() < 12 {
        return Err(AppError::InternalError("Invalid encrypted payload length".to_string()));
    }

    let key_bytes = hex::decode(master_key_hex)
        .map_err(|_| AppError::InternalError("Invalid master key hex".to_string()))?;
        
    let key = Key::<Aes256Gcm>::from_slice(&key_bytes);
    let cipher = Aes256Gcm::new(key);
    
    let nonce = Nonce::from_slice(&combined[0..12]);
    let ciphertext = &combined[12..];

    let plaintext = cipher.decrypt(nonce, ciphertext)
        .map_err(|_| AppError::InternalError("Decryption failed".to_string()))?;

    String::from_utf8(plaintext).map_err(|_| AppError::InternalError("Invalid UTF-8 in decrypted secret".to_string()))
}
