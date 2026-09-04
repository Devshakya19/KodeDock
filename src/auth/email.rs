use lettre::{Message, SmtpTransport, Transport};
use lettre::transport::smtp::authentication::Credentials;
use crate::config::AppConfig;
use crate::errors::AppError;

pub async fn send_verification_email(config: &AppConfig, to_email: &str, otp: &str) -> Result<(), AppError> {
    let email_body = format!(
        "<h1>Welcome to KodeDock!</h1>\n<p>Your email verification code is: <strong>{}</strong></p>\n<p>This code will expire in 15 minutes.</p>",
        otp
    );

    let email = Message::builder()
        .from(config.smtp_from.parse().map_err(|_| AppError::InternalError("Invalid SMTP from address".to_string()))?)
        .to(to_email.parse().map_err(|_| AppError::InternalError("Invalid to address".to_string()))?)
        .subject("Verify your KodeDock account")
        .header(lettre::message::header::ContentType::TEXT_HTML)
        .body(email_body)
        .map_err(|e| AppError::InternalError(format!("Failed to build email: {}", e)))?;

    let mut mailer_builder = SmtpTransport::builder_dangerous(&config.smtp_host)
        .port(config.smtp_port);

    if !config.smtp_user.is_empty() && !config.smtp_pass.is_empty() {
        let creds = Credentials::new(config.smtp_user.clone(), config.smtp_pass.clone());
        mailer_builder = mailer_builder.credentials(creds);
    }

    let mailer = mailer_builder.build();

    // lettre SmtpTransport is blocking, so we should run it inside spawn_blocking
    // in a real production highly concurrent environment to prevent blocking the async runtime
    tokio::task::spawn_blocking(move || {
        mailer.send(&email).map_err(|e| AppError::InternalError(format!("Failed to send email: {}", e)))
    })
    .await
    .map_err(|e| AppError::InternalError(format!("Task spawn failed: {}", e)))??;

    Ok(())
}
