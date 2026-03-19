// ── Backend Main Entry Point (Axum HTTP Server) ────────────────
use anyhow::Result;
use axum::{
    extract::State,
    http::StatusCode,
    response::{IntoResponse, Json},
    routing::{get, post},
    Router,
};
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
    sqlx::migrate!("./migrations").run(&pool).await?;
    info!("Migrations completed");

    let db = Database::new(pool);

    // Build router
    let app = Router::new()
        .route("/health", get(health))
        .route("/api/v1/cars/search", post(handlers::search_cars))
        .route("/api/v1/cars/{id}/price-detail", get(handlers::get_price_detail))
        .route("/api/v1/recommend", post(handlers::recommend))
        .route("/ws", get(websocket::ws_handler))
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods(Any)
                .allow_headers(Any),
        )
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
