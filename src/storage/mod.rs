pub mod handlers;
pub mod models;
pub mod service;

use actix_web::web;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/storage")
            .route("/upload-intent", web::post().to(handlers::upload_intent))
            .route("/upload-confirm", web::post().to(handlers::upload_confirm))
            .route("/download/{asset_id}", web::get().to(handlers::download_intent))
    );
}
