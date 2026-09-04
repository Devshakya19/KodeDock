use actix_web::{web, HttpResponse};
use crate::common::ApiResponse;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/storage")
            .route("/upload-ticket", web::post().to(generate_upload_ticket)),
    );
}

async fn generate_upload_ticket() -> HttpResponse {
    HttpResponse::Ok().json(ApiResponse::success(serde_json::json!({
        "upload_url": "http://localhost:8333/kodedock-public-assets/placeholder",
        "ticket_id": uuid::Uuid::new_v4()
    })))
}
