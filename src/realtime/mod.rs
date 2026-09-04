use actix_web::{web, HttpResponse};
use crate::common::ApiResponse;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/realtime")
            .route("/status", web::get().to(realtime_status)),
    );
}

async fn realtime_status() -> HttpResponse {
    HttpResponse::Ok().json(ApiResponse::success(serde_json::json!({
        "active_sockets": 0,
        "engine": "tokio-tungstenite"
    })))
}
