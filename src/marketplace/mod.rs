use actix_web::{web, HttpResponse};
use crate::common::ApiResponse;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/marketplace")
            .route("/products", web::get().to(list_products))
            .route("/categories", web::get().to(list_categories)),
    );
}

async fn list_products() -> HttpResponse {
    HttpResponse::Ok().json(ApiResponse::success(serde_json::json!([])))
}

async fn list_categories() -> HttpResponse {
    HttpResponse::Ok().json(ApiResponse::success(serde_json::json!([])))
}
