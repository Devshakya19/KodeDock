use actix_web::{web, HttpResponse};
use crate::common::ApiResponse;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/tax")
            .route("/tds/summary", web::get().to(get_tds_summary)),
    );
}

async fn get_tds_summary() -> HttpResponse {
    HttpResponse::Ok().json(ApiResponse::success(serde_json::json!({
        "section": "194-O",
        "rate_bps": 100,
        "total_tds_withheld_paise": 0
    })))
}
