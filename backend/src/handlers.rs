// ── HTTP Handlers ────────────────────────────────────────────────
use axum::{
    extract::{Extension, Path, State},
    http::StatusCode,
    response::Json,
};
use carpricehub_shared::*;
use std::sync::Arc;
use uuid::Uuid;
use validator::Validate;

use crate::{auth, auth_middleware::AuthUser, db::Database, recommend};

// ── 认证相关处理器 ─────────────────────────────────────────────

/// 用户注册
pub async fn register(
    State(db): State<Database>,
    Json(req): Json<auth::RegisterRequest>,
) -> Result<Json<auth::UserInfo>, (StatusCode, String)> {
    // 验证输入
    if req.username.len() < 3 || req.username.len() > 50 {
        return Err((StatusCode::BAD_REQUEST, "Username must be 3-50 characters".to_string()));
    }
    
    if !validator::validate_email(&req.email) {
        return Err((StatusCode::BAD_REQUEST, "Invalid email address".to_string()));
    }
    
    if req.password.len() < 6 {
        return Err((StatusCode::BAD_REQUEST, "Password must be at least 6 characters".to_string()));
    }
    
    // 注册用户
    let user = auth::register(&db.pool, req)
        .await
        .map_err(|e| {
            if e.to_string().contains("already exists") {
                (StatusCode::CONFLICT, e.to_string())
            } else {
                (StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
            }
        })?;
    
    Ok(Json(auth::UserInfo {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
    }))
}

/// 用户登录
pub async fn login(
    State(db): State<Database>,
    Extension(jwt_config): Extension<Arc<auth::JwtConfig>>,
    Json(req): Json<auth::LoginRequest>,
) -> Result<Json<auth::LoginResponse>, (StatusCode, String)> {
    let response = auth::login(&db.pool, req, &jwt_config)
        .await
        .map_err(|_| (StatusCode::UNAUTHORIZED, "Invalid username or password".to_string()))?;
    
    Ok(Json(response))
}

/// 获取当前用户信息
pub async fn get_current_user(
    Extension(auth_user): Extension<AuthUser>,
) -> Result<Json<auth::UserInfo>, (StatusCode, String)> {
    Ok(Json(auth::UserInfo {
        id: auth_user.claims.sub,
        username: auth_user.claims.username,
        email: auth_user.claims.email,
        role: auth_user.claims.role,
    }))
}

/// 获取用户信息（通过 ID）
pub async fn get_user_profile(
    State(db): State<Database>,
    Extension(auth_user): Extension<AuthUser>,
    Path(user_id): Path<String>,
) -> Result<Json<auth::UserInfo>, (StatusCode, String)> {
    let uuid = Uuid::parse_str(&user_id)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid user ID".to_string()))?;
    
    // 只允许查看自己的信息（或管理员查看所有）
    if auth_user.claims.sub != uuid && auth_user.claims.role != "admin" {
        return Err((StatusCode::FORBIDDEN, "Access denied".to_string()));
    }
    
    let user = auth::get_user_by_id(&db.pool, uuid)
        .await
        .map_err(|_| (StatusCode::NOT_FOUND, "User not found".to_string()))?;
    
    Ok(Json(auth::UserInfo {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
    }))
}

// ── 车辆相关处理器 ─────────────────────────────────────────────

pub async fn search_cars(
    State(db): State<Database>,
    Json(query): Json<SearchQuery>,
) -> Result<Json<SearchResult>, (StatusCode, String)> {
    if let Err(e) = query.validate() {
        return Err((StatusCode::BAD_REQUEST, format!("Invalid query: {}", e)));
    }

    let cars = db.search_cars(&query).await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let total = db.count_search_cars(&query).await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(SearchResult {
        cars,
        total: total as u64,
        page: query.page.unwrap_or(1),
        page_size: query.page_size.unwrap_or(20),
    }))
}

pub async fn get_price_detail(
    State(db): State<Database>,
    Path(id): Path<String>,
) -> Result<Json<Car>, (StatusCode, String)> {
    let uuid = Uuid::parse_str(&id)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid UUID".to_string()))?;

    let car = db.get_car_by_id(uuid).await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    match car {
        Some(car) => Ok(Json(car)),
        None => Err((StatusCode::NOT_FOUND, "Car not found".to_string())),
    }
}

pub async fn recommend(
    State(db): State<Database>,
    Json(req): Json<RecommendRequest>,
) -> Result<Json<RecommendResponse>, (StatusCode, String)> {
    if let Err(e) = req.profile.validate() {
        return Err((StatusCode::BAD_REQUEST, format!("Invalid profile: {}", e)));
    }

    let start = std::time::Instant::now();

    let recommendations = recommend::recommend(&db, &req).await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let processing_time_ms = start.elapsed().as_millis() as u64;

    Ok(Json(RecommendResponse {
        recommendations,
        total_cars_considered: recommendations.len() as u64,
        processing_time_ms,
    }))
}
