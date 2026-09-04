use actix_web::{web, HttpResponse};
use crate::common::ApiResponse;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/jobs")
            .route("/status", web::get().to(jobs_status)),
    );
}

async fn jobs_status() -> HttpResponse {
    HttpResponse::Ok().json(ApiResponse::success(serde_json::json!({
        "scheduler": "active",
        "escrow_auto_release": "15m",
        "token_purge": "24h"
    })))
}
