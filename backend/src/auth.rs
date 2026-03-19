//! 用户认证模块
//! 
//! 提供 JWT 认证、密码加密、用户注册/登录功能

use anyhow::{anyhow, Result};
use argon2::{self, Config, ThreadMode, Variant, Version};
use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use rand::Rng;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

/// JWT Claims 结构
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: Uuid,        // 用户 ID
    pub username: String, // 用户名
    pub email: String,    // 邮箱
    pub role: String,     // 角色: "user", "admin"
    pub exp: i64,         // 过期时间
    pub iat: i64,         // 签发时间
}

/// 用户信息
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct User {
    pub id: Uuid,
    pub username: String,
    pub email: String,
    #[serde(skip_serializing)]
    pub password_hash: String,
    pub role: String,
    pub created_at: chrono::DateTime<Utc>,
    pub updated_at: chrono::DateTime<Utc>,
}

/// 注册请求
#[derive(Debug, Deserialize)]
pub struct RegisterRequest {
    pub username: String,
    pub email: String,
    pub password: String,
}

/// 登录请求
#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub username: String,
    pub password: String,
}

/// 登录响应
#[derive(Debug, Serialize)]
pub struct LoginResponse {
    pub access_token: String,
    pub token_type: String,
    pub expires_in: i64,
    pub user: UserInfo,
}

/// 用户信息（不包含敏感字段）
#[derive(Debug, Serialize)]
pub struct UserInfo {
    pub id: Uuid,
    pub username: String,
    pub email: String,
    pub role: String,
}

/// JWT 配置
pub struct JwtConfig {
    pub secret: String,
    pub expiration: i64, // 小时
}

impl JwtConfig {
    pub fn from_env() -> Self {
        Self {
            secret: std::env::var("JWT_SECRET")
                .unwrap_or_else(|_| "your-secret-key-change-in-production".to_string()),
            expiration: std::env::var("JWT_EXPIRATION_HOURS")
                .unwrap_or_else(|_| "24".to_string())
                .parse()
                .unwrap_or(24),
        }
    }
}

/// 密码加密
pub fn hash_password(password: &str) -> Result<String> {
    let salt = rand::thread_rng().gen::<[u8; 32]>();
    let config = Config {
        variant: Variant::Argon2id,
        version: Version::Version13,
        mem_cost: 65536,
        time_cost: 3,
        lanes: 4,
        thread_mode: ThreadMode::Parallel,
        secret: &[],
        ad: &[],
        hash_length: 32,
    };
    
    argon2::hash_encoded(password.as_bytes(), &salt, &config)
        .map_err(|e| anyhow!("Failed to hash password: {}", e))
}

/// 验证密码
pub fn verify_password(hash: &str, password: &str) -> Result<bool> {
    argon2::verify_encoded(hash, password.as_bytes())
        .map_err(|e| anyhow!("Failed to verify password: {}", e))
}

/// 生成 JWT Token
pub fn generate_jwt(user: &User, config: &JwtConfig) -> Result<String> {
    let now = Utc::now();
    let exp = now + Duration::hours(config.expiration);
    
    let claims = Claims {
        sub: user.id,
        username: user.username.clone(),
        email: user.email.clone(),
        role: user.role.clone(),
        exp: exp.timestamp(),
        iat: now.timestamp(),
    };
    
    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(config.secret.as_ref()),
    )
    .map_err(|e| anyhow!("Failed to generate JWT: {}", e))
}

/// 验证 JWT Token
pub fn verify_jwt(token: &str, config: &JwtConfig) -> Result<Claims> {
    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(config.secret.as_ref()),
        &Validation::default(),
    )
    .map_err(|e| anyhow!("Invalid token: {}", e))?;
    
    Ok(token_data.claims)
}

/// 用户注册
pub async fn register(pool: &PgPool, req: RegisterRequest) -> Result<User> {
    // 检查用户名是否已存在
    let existing = sqlx::query!(
        "SELECT id FROM users WHERE username = $1 OR email = $2",
        req.username,
        req.email
    )
    .fetch_optional(pool)
    .await?;
    
    if existing.is_some() {
        return Err(anyhow!("Username or email already exists"));
    }
    
    // 加密密码
    let password_hash = hash_password(&req.password)?;
    
    // 创建用户
    let user = sqlx::query_as!(
        User,
        r#"
        INSERT INTO users (username, email, password_hash, role)
        VALUES ($1, $2, $3, 'user')
        RETURNING id, username, email, password_hash, role, created_at, updated_at
        "#,
        req.username,
        req.email,
        password_hash
    )
    .fetch_one(pool)
    .await?;
    
    Ok(user)
}

/// 用户登录
pub async fn login(pool: &PgPool, req: LoginRequest, jwt_config: &JwtConfig) -> Result<LoginResponse> {
    // 查找用户
    let user = sqlx::query_as!(
        User,
        "SELECT id, username, email, password_hash, role, created_at, updated_at FROM users WHERE username = $1",
        req.username
    )
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| anyhow!("Invalid username or password"))?;
    
    // 验证密码
    let valid = verify_password(&user.password_hash, &req.password)?;
    if !valid {
        return Err(anyhow!("Invalid username or password"));
    }
    
    // 生成 JWT
    let access_token = generate_jwt(&user, jwt_config)?;
    
    Ok(LoginResponse {
        access_token,
        token_type: "Bearer".to_string(),
        expires_in: jwt_config.expiration * 3600, // 转换为秒
        user: UserInfo {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        },
    })
}

/// 获取用户信息
pub async fn get_user_by_id(pool: &PgPool, user_id: Uuid) -> Result<User> {
    let user = sqlx::query_as!(
        User,
        "SELECT id, username, email, password_hash, role, created_at, updated_at FROM users WHERE id = $1",
        user_id
    )
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| anyhow!("User not found"))?;
    
    Ok(user)
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_hash_and_verify_password() {
        let password = "test_password_123";
        let hash = hash_password(password).unwrap();
        
        assert!(verify_password(&hash, password).unwrap());
        assert!(!verify_password(&hash, "wrong_password").unwrap());
    }
    
    #[test]
    fn test_jwt_generation_and_verification() {
        let user = User {
            id: Uuid::new_v4(),
            username: "testuser".to_string(),
            email: "test@example.com".to_string(),
            password_hash: "hash".to_string(),
            role: "user".to_string(),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };
        
        let config = JwtConfig {
            secret: "test-secret".to_string(),
            expiration: 24,
        };
        
        let token = generate_jwt(&user, &config).unwrap();
        let claims = verify_jwt(&token, &config).unwrap();
        
        assert_eq!(claims.sub, user.id);
        assert_eq!(claims.username, user.username);
    }
}
