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

// ── 用户收藏相关处理器 ─────────────────────────────────────────────

/// 获取用户收藏列表
pub async fn get_favorites(
    State(db): State<Database>,
    Extension(auth_user): Extension<AuthUser>,
) -> Result<Json<Vec<serde_json::Value>>, (StatusCode, String)> {
    let favorites = db.get_user_favorites(auth_user.claims.sub)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    
    Ok(Json(favorites))
}

/// 添加收藏
pub async fn add_favorite(
    State(db): State<Database>,
    Extension(auth_user): Extension<AuthUser>,
    Json(req): Json<serde_json::Value>,
) -> Result<StatusCode, (StatusCode, String)> {
    let car_id = req["car_id"].as_str()
        .ok_or((StatusCode::BAD_REQUEST, "car_id is required".to_string()))?;
    
    let car_uuid = Uuid::parse_str(car_id)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid car_id".to_string()))?;
    
    db.add_favorite(auth_user.claims.sub, car_uuid)
        .await
        .map_err(|e| {
            if e.to_string().contains("already exists") {
                (StatusCode::CONFLICT, "Already in favorites".to_string())
            } else {
                (StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
            }
        })?;
    
    Ok(StatusCode::CREATED)
}

/// 取消收藏
pub async fn remove_favorite(
    State(db): State<Database>,
    Extension(auth_user): Extension<AuthUser>,
    Path(car_id): Path<String>,
) -> Result<StatusCode, (StatusCode, String)> {
    let car_uuid = Uuid::parse_str(&car_id)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid car_id".to_string()))?;
    
    db.remove_favorite(auth_user.claims.sub, car_uuid)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    
    Ok(StatusCode::NO_CONTENT)
}

/// 检查是否已收藏
pub async fn check_favorite(
    State(db): State<Database>,
    Extension(auth_user): Extension<AuthUser>,
    Path(car_id): Path<String>,
) -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    let car_uuid = Uuid::parse_str(&car_id)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid car_id".to_string()))?;
    
    let is_favorite = db.check_favorite(auth_user.claims.sub, car_uuid)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    
    Ok(Json(serde_json::json!({
        "is_favorite": is_favorite
    })))
}

// ── 价格提醒相关处理器 ─────────────────────────────────────────────

/// 获取用户价格提醒列表
pub async fn get_alerts(
    State(db): State<Database>,
    Extension(auth_user): Extension<AuthUser>,
) -> Result<Json<Vec<serde_json::Value>>, (StatusCode, String)> {
    let alerts = db.get_user_alerts(auth_user.claims.sub)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    
    Ok(Json(alerts))
}

/// 创建价格提醒
pub async fn create_alert(
    State(db): State<Database>,
    Extension(auth_user): Extension<AuthUser>,
    Json(req): Json<serde_json::Value>,
) -> Result<StatusCode, (StatusCode, String)> {
    let car_id = req["car_id"].as_str()
        .ok_or((StatusCode::BAD_REQUEST, "car_id is required".to_string()))?;
    let target_price = req["target_price"].as_f64()
        .ok_or((StatusCode::BAD_REQUEST, "target_price is required".to_string()))?;
    
    let car_uuid = Uuid::parse_str(car_id)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid car_id".to_string()))?;
    
    db.create_price_alert(auth_user.claims.sub, car_uuid, target_price as f32)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    
    Ok(StatusCode::CREATED)
}

/// 删除价格提醒
pub async fn remove_alert(
    State(db): State<Database>,
    Extension(auth_user): Extension<AuthUser>,
    Path(alert_id): Path<String>,
) -> Result<StatusCode, (StatusCode, String)> {
    let alert_uuid = Uuid::parse_str(&alert_id)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid alert_id".to_string()))?;
    
    db.delete_price_alert(auth_user.claims.sub, alert_uuid)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    
    Ok(StatusCode::NO_CONTENT)
}

/// 取消价格提醒
pub async fn cancel_alert(
    State(db): State<Database>,
    Extension(auth_user): Extension<AuthUser>,
    Path(alert_id): Path<String>,
) -> Result<StatusCode, (StatusCode, String)> {
    let alert_uuid = Uuid::parse_str(&alert_id)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid alert_id".to_string()))?;
    
    db.cancel_price_alert(auth_user.claims.sub, alert_uuid)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    
    Ok(StatusCode::OK)
}

// ── 查询历史相关处理器 ─────────────────────────────────────────────

/// 获取用户查询历史
pub async fn get_history(
    State(db): State<Database>,
    Extension(auth_user): Extension<AuthUser>,
) -> Result<Json<Vec<serde_json::Value>>, (StatusCode, String)> {
    let history = db.get_search_history(auth_user.claims.sub)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    
    Ok(Json(history))
}

/// 添加查询历史
pub async fn add_history(
    State(db): State<Database>,
    Extension(auth_user): Extension<AuthUser>,
    Json(req): Json<serde_json::Value>,
) -> Result<StatusCode, (StatusCode, String)> {
    let keyword = req["keyword"].as_str();
    let filters = req["filters"].clone();
    let result_count = req["result_count"].as_i64().unwrap_or(0) as i32;
    
    db.add_search_history(auth_user.claims.sub, keyword, filters, result_count)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    
    Ok(StatusCode::CREATED)
}

/// 删除单条历史
pub async fn remove_history(
    State(db): State<Database>,
    Extension(auth_user): Extension<AuthUser>,
    Path(history_id): Path<String>,
) -> Result<StatusCode, (StatusCode, String)> {
    let history_uuid = Uuid::parse_str(&history_id)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid history_id".to_string()))?;
    
    db.delete_search_history(auth_user.claims.sub, history_uuid)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    
    Ok(StatusCode::NO_CONTENT)
}

/// 清空所有历史
pub async fn clear_history(
    State(db): State<Database>,
    Extension(auth_user): Extension<AuthUser>,
) -> Result<StatusCode, (StatusCode, String)> {
    db.clear_search_history(auth_user.claims.sub)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    
    Ok(StatusCode::NO_CONTENT)
}
