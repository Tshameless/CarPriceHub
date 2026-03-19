//! 认证中间件
//! 
//! 提供 Axum 中间件用于验证 JWT Token

use axum::{
    extract::Request,
    http::StatusCode,
    middleware::Next,
    response::{IntoResponse, Response},
};
use std::sync::Arc;

use crate::auth::{Claims, JwtConfig};

/// 认证错误
#[derive(Debug)]
pub enum AuthError {
    MissingToken,
    InvalidToken(String),
}

impl IntoResponse for AuthError {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            AuthError::MissingToken => {
                (StatusCode::UNAUTHORIZED, "Missing authorization token")
            }
            AuthError::InvalidToken(msg) => {
                (StatusCode::UNAUTHORIZED, msg.as_str())
            }
        };
        
        (status, message).into_response()
    }
}

/// 用户认证信息（在请求扩展中传递）
#[derive(Debug, Clone)]
pub struct AuthUser {
    pub claims: Claims,
}

/// 认证中间件
pub async fn auth_middleware(
    jwt_config: Arc<JwtConfig>,
    request: Request,
    next: Next,
) -> Result<Response, AuthError> {
    // 从请求头获取 token
    let auth_header = request
        .headers()
        .get("Authorization")
        .and_then(|h| h.to_str().ok());
    
    let token = auth_header
        .and_then(|h| {
            if h.starts_with("Bearer ") {
                Some(&h[7..])
            } else {
                None
            }
        })
        .ok_or(AuthError::MissingToken)?;
    
    // 验证 token
    let claims = crate::auth::verify_jwt(token, &jwt_config)
        .map_err(|e| AuthError::InvalidToken(e.to_string()))?;
    
    // 将用户信息添加到请求扩展中
    let auth_user = AuthUser { claims };
    let request = request.extensions().mutate(|ext| {
        ext.insert(auth_user);
    });
    
    Ok(next.run(request).await)
}

/// 可选认证中间件（不强制要求认证）
pub async fn optional_auth_middleware(
    jwt_config: Arc<JwtConfig>,
    request: Request,
    next: Next,
) -> Response {
    // 尝试从请求头获取 token
    let auth_header = request
        .headers()
        .get("Authorization")
        .and_then(|h| h.to_str().ok());
    
    if let Some(token) = auth_header.and_then(|h| {
        if h.starts_with("Bearer ") {
            Some(&h[7..])
        } else {
            None
        }
    }) {
        // 尝试验证 token
        if let Ok(claims) = crate::auth::verify_jwt(token, &jwt_config) {
            let auth_user = AuthUser { claims };
            let request = request.extensions().mutate(|ext| {
                ext.insert(auth_user);
            });
            return next.run(request).await;
        }
    }
    
    // 没有 token 或验证失败，继续处理请求（不添加用户信息）
    next.run(request).await
}

/// 管理员权限检查中间件
pub async fn admin_only_middleware(request: Request, next: Next) -> Result<Response, StatusCode> {
    let auth_user = request
        .extensions()
        .get::<AuthUser>()
        .ok_or(StatusCode::UNAUTHORIZED)?;
    
    if auth_user.claims.role != "admin" {
        return Err(StatusCode::FORBIDDEN);
    }
    
    Ok(next.run(request).await)
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_auth_error_response() {
        let error = AuthError::MissingToken;
        let response = error.into_response();
        assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
    }
}
