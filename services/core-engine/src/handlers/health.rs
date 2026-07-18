use actix_web::HttpResponse;
use serde_json::json;
use sqlx::PgPool;

pub async fn health_check(pool: actix_web::web::Data<PgPool>) -> HttpResponse {
    let db_ok = sqlx::query_scalar::<_, i32>("SELECT 1")
        .fetch_one(pool.get_ref())
        .await
        .is_ok();

    let status = if db_ok { "ok" } else { "degraded" };

    HttpResponse::Ok().json(json!({
        "status": status,
        "service": "codehaat-core",
        "version": "0.1.0",
        "db": if db_ok { "connected" } else { "unavailable" }
    }))
}
