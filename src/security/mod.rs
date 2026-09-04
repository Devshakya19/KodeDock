use actix_web::{web, HttpResponse};
use crate::common::ApiResponse;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/security")
            .route("/health", web::get().to(security_health)),
    );
}

async fn security_health() -> HttpResponse {
    HttpResponse::Ok().json(ApiResponse::success(serde_json::json!({
        "ast_scanner": "ready",
        "regex_engine": "active"
    })))
}
