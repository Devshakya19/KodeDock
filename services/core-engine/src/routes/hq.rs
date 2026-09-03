use crate::handlers;
use actix_web::web;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/hq")
            .route("/health", web::get().to(handlers::hq::health_check))
            .route("/setup", web::post().to(handlers::hq::setup))
            .route("/login", web::post().to(handlers::hq::login))
            .route("/me", web::get().to(handlers::hq::me))
            .route("/stats", web::get().to(handlers::hq::stats))
            .route("/products", web::get().to(handlers::hq::get_products))
            .route(
                "/products/{id}/status",
                web::put().to(handlers::hq::set_product_status),
            )
            .route("/users", web::get().to(handlers::hq::get_users))
            .route(
                "/users/{id}/status",
                web::put().to(handlers::hq::set_user_status),
            )
            .route("/finance/stats", web::get().to(handlers::hq::finance_stats))
            .route(
                "/finance/withdrawals",
                web::get().to(handlers::hq::get_withdrawals),
            )
            .route(
                "/finance/payouts",
                web::get().to(handlers::hq::get_payout_requests),
            )
            .route(
                "/finance/payouts/{id}/process",
                web::put().to(handlers::hq::process_payout),
            )
            .route(
                "/safety/disputes",
                web::get().to(handlers::hq::get_disputes),
            )
            .route(
                "/safety/disputes/{id}",
                web::put().to(handlers::hq::set_dispute_status),
            )
            .route("/settings", web::put().to(handlers::hq::set_settings))
            .route(
                "/platform/settings",
                web::get().to(handlers::hq::get_settings),
            )
            .route(
                "/platform/settings/{key}",
                web::put().to(handlers::hq::update_setting),
            )
            .route(
                "/platform/integrations",
                web::get().to(handlers::hq::get_integrations),
            )
            .route(
                "/platform/integrations/{provider}",
                web::put().to(handlers::hq::update_integration),
            )
            .route("/audit-logs", web::get().to(handlers::hq::get_audit_logs))
            .route("/staff", web::get().to(handlers::hq::get_staff))
            .route("/staff", web::post().to(handlers::hq::invite_staff))
            .route(
                "/staff/{id}/status",
                web::put().to(handlers::hq::set_staff_status),
            )
            .route(
                "/staff/{id}/role",
                web::put().to(handlers::hq::set_staff_role),
            )
            .route(
                "/catalog/categories",
                web::get().to(handlers::hq::get_categories),
            )
            .route(
                "/catalog/categories",
                web::post().to(handlers::hq::create_category),
            )
            .route(
                "/catalog/categories/{id}",
                web::delete().to(handlers::hq::delete_category_handler),
            )
            .route(
                "/support/tickets",
                web::get().to(handlers::hq::get_support_tickets),
            )
            .route(
                "/support/tickets/{id}/status",
                web::put().to(handlers::hq::set_ticket_status),
            ),
    );
}
