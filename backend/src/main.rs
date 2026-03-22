// ── Backend Main Entry Point (Axum HTTP Server) ────────────────
use anyhow::Result;
use axum::{
    extract::{Extension, State},
    http::StatusCode,
    middleware,
    response::{IntoResponse, Json},
    routing::{get, post, delete, patch},
    Router,
};
use std::sync::Arc;
use carpricehub_shared::*;
use sqlx::{postgres::PgPoolOptions, Pool, Postgres};
use std::net::SocketAddr;
use tokio::net::TcpListener;
use tower_http::cors::{Any, CorsLayer};
use tracing::{info, Level};
use tracing_subscriber::{fmt, EnvFilter};

mod db;
mod handlers;
mod recommend;
mod websocket;
mod auth;
mod auth_middleware;

use db::Database;

#[tokio::main]
async fn main() -> Result<()> {
    // Init tracing
    tracing_subscriber::fmt()
        .with_max_level(Level::INFO)
        .init();

    // Load .env
    dotenvy::dotenv().ok();

    // Database pool
    let db_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgresql://postgres:password@localhost:5432/carpricehub".to_string());
    let pool = PgPoolOptions::new()
        .max_connections(10)
        .connect(&db_url)
        .await?;
    info!("Connected to PostgreSQL");

    // Run migrations
    sqlx::migrate!("../migrations").run(&pool).await?;
    info!("Migrations completed");

    let db = Database::new(pool);

    // JWT 配置
    let jwt_config = Arc::new(auth::JwtConfig::from_env()?);

    // Build router - 公共路由
    let public_routes = Router::new()
        .route("/health", get(health))
        .route("/api/v1/auth/register", post(handlers::register))
        .route("/api/v1/auth/login", post(handlers::login))
        .route("/api/v1/cars/search", post(handlers::search_cars))
        .route("/api/v1/cars/{id}/price-detail", get(handlers::get_price_detail))
        .route("/api/v1/recommend", post(handlers::recommend));

    // 需要认证的路由
    let protected_routes = Router::new()
        .route("/api/v1/auth/me", get(handlers::get_current_user))
        .route("/api/v1/user/favorites", get(handlers::get_favorites).post(handlers::add_favorite))
        .route("/api/v1/user/favorites/{car_id}", delete(handlers::remove_favorite))
        .route("/api/v1/user/favorites/check/{car_id}", get(handlers::check_favorite))
        .route("/api/v1/user/alerts", get(handlers::get_alerts).post(handlers::create_alert))
        .route("/api/v1/user/alerts/{alert_id}", delete(handlers::remove_alert))
        .route("/api/v1/user/alerts/{alert_id}/cancel", patch(handlers::cancel_alert))
        .route("/api/v1/user/history", get(handlers::get_history).post(handlers::add_history).delete(handlers::clear_history))
        .route("/api/v1/user/history/{history_id}", delete(handlers::remove_history))
        .layer(middleware::from_fn_with_state(
            jwt_config.clone(),
            auth_middleware::extract_auth_user,
        ));

    // WebSocket
    let ws_route = Router::new()
        .route("/ws", get(websocket::ws_handler));

    // 合并所有路由
    let app = Router::new()
        .merge(public_routes)
        .merge(protected_routes)
        .merge(ws_route)
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods(Any)
                .allow_headers(Any),
        )
        .layer(Extension(jwt_config))
        .with_state(db);

    // Bind
    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));
    let listener = TcpListener::bind(addr).await?;
    info!("Server running on http://{}", addr);

    axum::serve(listener, app).await?;
    Ok(())
}

async fn health() -> impl IntoResponse {
    Json(serde_json::json!({
        "status": "ok",
        "service": "carpricehub-backend",
        "version": "0.1.0"
    }))
}
