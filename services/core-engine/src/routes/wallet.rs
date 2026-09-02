use actix_web::web;
use crate::handlers;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/wallet")
            .route("", web::get().to(handlers::wallet::get_balance))
            .route("/topup", web::post().to(handlers::wallet::create_topup))
            .route("/topup/verify", web::post().to(handlers::wallet::verify_topup))
            .route("/transactions", web::get().to(handlers::wallet::list_transactions))
            .route("/withdraw", web::post().to(handlers::wallet::withdraw))
            .route("/release-escrow", web::post().to(handlers::wallet::release_escrow)),
    );
}
