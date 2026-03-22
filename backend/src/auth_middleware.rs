//! 认证中间件
//! 
//! 提供 Axum 中间件用于验证 JWT Token

use axum::{
    extract::{Request, State, Extension},
    http::StatusCode,
    middleware::Next,
    response::{IntoResponse, Response},
};
use std::sync::Arc;

use crate::auth::{Claims, JwtConfig};
use crate::db::Database;

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

/// 从请求中提取认证用户
pub async fn extract_auth_user(
    Extension(jwt_config): Extension<Arc<JwtConfig>>,
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
    
    let mut request = request;
    request.extensions_mut().insert(auth_user);
    
    Ok(next.run(request).await)
}

/// 管理员权限检查
pub fn require_admin(auth_user: &AuthUser) -> Result<(), StatusCode> {
    if auth_user.claims.role != "admin" {
        return Err(StatusCode::FORBIDDEN);
    }
    Ok(())
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
