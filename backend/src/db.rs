// ── Database Layer (PostgreSQL) ─────────────────────────────────
use carpricehub_shared::*;
use sqlx::{Pool, Postgres, Row};
use uuid::Uuid;

#[derive(Clone)]
pub struct Database {
    pool: Pool<Postgres>,
}

impl Database {
    pub fn new(pool: Pool<Postgres>) -> Self {
        Self { pool }
    }

    pub fn pool(&self) -> &Pool<Postgres> {
        &self.pool
    }

    // Search cars with filters
    pub async fn search_cars(
        &self,
        query: &SearchQuery,
    ) -> Result<Vec<Car>, sqlx::Error> {
        let mut sql = "SELECT * FROM cars WHERE 1=1".to_string();
        let mut params: Vec<String> = vec![];
        let mut bind_count = 0;

        if let Some(kw) = &query.keyword {
            bind_count += 1;
            sql.push_str(&format!(" AND (brand ILIKE ${} OR model_name ILIKE ${})", bind_count, bind_count + 1));
            params.push(format!("%{}%", kw));
            params.push(format!("%{}%", kw));
            bind_count += 1;
        }

        if let Some(min) = query.budget_min {
            bind_count += 1;
            sql.push_str(&format!(" AND price_discount >= ${}", bind_count));
            params.push(min.to_string());
        }

        if let Some(max) = query.budget_max {
            bind_count += 1;
            sql.push_str(&format!(" AND price_discount <= ${}", bind_count));
            params.push(max.to_string());
        }

        if let Some(energy) = &query.energy_type {
            bind_count += 1;
            sql.push_str(&format!(" AND energy_type = ${}", bind_count));
            params.push(format!("{:?}", energy).to_lowercase());
        }

        if let Some(body) = &query.body_type {
            bind_count += 1;
            sql.push_str(&format!(" AND body_type = ${}", bind_count));
            params.push(format!("{:?}", body).to_lowercase());
        }

        if let Some(seats) = query.seat_count_min {
            bind_count += 1;
            sql.push_str(&format!(" AND seat_count >= ${}", bind_count));
            params.push(seats.to_string());
        }

        // Order by direct_discount DESC (biggest discount first)
        sql.push_str(" ORDER BY direct_discount DESC");

        let page = query.page.unwrap_or(1);
        let page_size = query.page_size.unwrap_or(20).min(100);
        let offset = (page - 1) * page_size;
        bind_count += 1;
        sql.push_str(&format!(" LIMIT ${} OFFSET ${}", bind_count, bind_count + 1));
        params.push(page_size.to_string());
        params.push(offset.to_string());

        // Note: Dynamic query building in SQLx is verbose; for production consider query_builder crate or raw query with parameters
        // For now, we'll use a simpler approach with pre-built queries or refactor later
        // This is a placeholder - actual implementation will need proper parameter binding

        let rows = sqlx::query(&sql)
            .bind(query.keyword.clone())
            .bind(query.budget_min)
            .bind(query.budget_max)
            .bind(query.energy_type.clone())
            .bind(query.body_type.clone())
            .bind(query.seat_count_min)
            .bind(page_size as i64)
            .bind(offset as i64)
            .fetch_all(&self.pool)
            .await?;

        rows.into_iter().map(|row| row_to_car(row)).collect()
    }

    // Get car by id
    pub async fn get_car_by_id(&self, id: Uuid) -> Result<Option<Car>, sqlx::Error> {
        let row = sqlx::query("SELECT * FROM cars WHERE id = $1")
            .bind(id)
            .fetch_optional(&self.pool)
            .await?;

        Ok(row.map(row_to_car))
    }

    // Count total for search
    pub async fn count_search_cars(&self, _query: &SearchQuery) -> Result<i64, sqlx::Error> {
        let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM cars")
            .fetch_one(&self.pool)
            .await?;
        Ok(count)
    }
}

fn row_to_car(row: sqlx::postgres::PgRow) -> Car {
    Car {
        id: row.get("id"),
        brand: row.get("brand"),
        model_name: row.get("model_name"),
        year: row.get("year"),
        energy_type: parse_energy_type(row.get::<&str, _>("energy_type")),
        body_type: parse_body_type(row.get::<&str, _>("body_type")),
        seat_count: row.get("seat_count"),
        price_official: row.get("price_official"),
        price_discount: row.get("price_discount"),
        direct_discount: row.get("direct_discount"),
        loan_subsidy_rate: row.get("loan_subsidy_rate"),
        loan_subsidy_amount: row.get("loan_subsidy_amount"),
        replacement_subsidy: row.get("replacement_subsidy"),
        insurance_discount: row.get("insurance_discount"),
        gift_package: row.get("gift_package"),
        effective_date: row.get("effective_date"),
        expire_date: row.get("expire_date"),
        region: row.get("region"),
        updated_at: row.get("updated_at"),
    }
}

fn parse_energy_type(s: &str) -> EnergyType {
    match s.to_lowercase().as_str() {
        "petrol" => EnergyType::Petrol,
        "diesel" => EnergyType::Diesel,
        "hybrid" => EnergyType::Hybrid,
        "phev" => EnergyType::Phev,
        "bev" => EnergyType::Bev,
        "hydrogen" => EnergyType::Hydrogen,
        _ => EnergyType::Petrol,
    }
}

fn parse_body_type(s: &str) -> BodyType {
    match s.to_lowercase().as_str() {
        "sedan" => BodyType::Sedan,
        "suv" => BodyType::Suv,
        "mpv" => BodyType::Mpv,
        "hatchback" => BodyType::Hatchback,
        "coupe" => BodyType::Coupe,
        "pickup" => BodyType::Pickup,
        "wagon" => BodyType::Wagon,
        _ => BodyType::Sedan,
    }
}

// ── 用户收藏相关方法 ─────────────────────────────────────────────

impl Database {
    /// 获取用户收藏列表
    pub async fn get_user_favorites(
        &self,
        user_id: Uuid,
    ) -> Result<Vec<serde_json::Value>, sqlx::Error> {
        let rows = sqlx::query(
            r#"
            SELECT f.id, f.car_id, c.brand, c.model_name, c.price_discount, f.created_at
            FROM favorites f
            JOIN cars c ON f.car_id = c.id
            WHERE f.user_id = $1
            ORDER BY f.created_at DESC
            "#
        )
        .bind(user_id)
        .fetch_all(&self.pool)
        .await?;

        let favorites: Vec<serde_json::Value> = rows
            .into_iter()
            .map(|row| {
                serde_json::json!({
                    "id": row.get::<Uuid, _>("id").to_string(),
                    "car_id": row.get::<Uuid, _>("car_id").to_string(),
                    "brand": row.get::<String, _>("brand"),
                    "model_name": row.get::<String, _>("model_name"),
                    "price_discount": row.get::<f64, _>("price_discount"),
                    "created_at": row.get::<chrono::DateTime<chrono::Utc>, _>("created_at").to_rfc3339(),
                })
            })
            .collect();

        Ok(favorites)
    }

    /// 添加收藏
    pub async fn add_favorite(
        &self,
        user_id: Uuid,
        car_id: Uuid,
    ) -> Result<(), sqlx::Error> {
        sqlx::query(
            "INSERT INTO favorites (user_id, car_id) VALUES ($1, $2)"
        )
        .bind(user_id)
        .bind(car_id)
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    /// 取消收藏
    pub async fn remove_favorite(
        &self,
        user_id: Uuid,
        car_id: Uuid,
    ) -> Result<(), sqlx::Error> {
        sqlx::query(
            "DELETE FROM favorites WHERE user_id = $1 AND car_id = $2"
        )
        .bind(user_id)
        .bind(car_id)
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    /// 检查是否已收藏
    pub async fn check_favorite(
        &self,
        user_id: Uuid,
        car_id: Uuid,
    ) -> Result<bool, sqlx::Error> {
        let count: i64 = sqlx::query_scalar(
            "SELECT COUNT(*) FROM favorites WHERE user_id = $1 AND car_id = $2"
        )
        .bind(user_id)
        .bind(car_id)
        .fetch_one(&self.pool)
        .await?;
        Ok(count > 0)
    }

    // ── 价格提醒相关方法 ─────────────────────────────────────────────

    /// 获取用户价格提醒列表
    pub async fn get_user_alerts(
        &self,
        user_id: Uuid,
    ) -> Result<Vec<serde_json::Value>, sqlx::Error> {
        let rows = sqlx::query(
            r#"
            SELECT pa.id, pa.car_id, c.brand || ' ' || c.model_name as car_name,
                   pa.target_price, pa.status, pa.created_at
            FROM price_alerts pa
            JOIN cars c ON pa.car_id = c.id
            WHERE pa.user_id = $1
            ORDER BY pa.created_at DESC
            "#
        )
        .bind(user_id)
        .fetch_all(&self.pool)
        .await?;

        let alerts: Vec<serde_json::Value> = rows
            .into_iter()
            .map(|row| {
                serde_json::json!({
                    "id": row.get::<Uuid, _>("id").to_string(),
                    "car_id": row.get::<Uuid, _>("car_id").to_string(),
                    "carName": row.get::<String, _>("car_name"),
                    "targetPrice": row.get::<f64, _>("target_price"),
                    "status": row.get::<String, _>("status"),
                    "created_at": row.get::<chrono::DateTime<chrono::Utc>, _>("created_at").to_rfc3339(),
                })
            })
            .collect();

        Ok(alerts)
    }

    /// 创建价格提醒
    pub async fn create_price_alert(
        &self,
        user_id: Uuid,
        car_id: Uuid,
        target_price: f32,
    ) -> Result<(), sqlx::Error> {
        sqlx::query(
            "INSERT INTO price_alerts (user_id, car_id, target_price) VALUES ($1, $2, $3)"
        )
        .bind(user_id)
        .bind(car_id)
        .bind(target_price)
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    /// 删除价格提醒
    pub async fn delete_price_alert(
        &self,
        user_id: Uuid,
        alert_id: Uuid,
    ) -> Result<(), sqlx::Error> {
        sqlx::query(
            "DELETE FROM price_alerts WHERE id = $1 AND user_id = $2"
        )
        .bind(alert_id)
        .bind(user_id)
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    /// 取消价格提醒
    pub async fn cancel_price_alert(
        &self,
        user_id: Uuid,
        alert_id: Uuid,
    ) -> Result<(), sqlx::Error> {
        sqlx::query(
            "UPDATE price_alerts SET status = 'cancelled' WHERE id = $1 AND user_id = $2"
        )
        .bind(alert_id)
        .bind(user_id)
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    // ── 查询历史相关方法 ─────────────────────────────────────────────

    /// 获取用户查询历史
    pub async fn get_search_history(
        &self,
        user_id: Uuid,
    ) -> Result<Vec<serde_json::Value>, sqlx::Error> {
        let rows = sqlx::query(
            r#"
            SELECT id, keyword, filters, result_count, created_at as timestamp
            FROM search_history
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT 50
            "#
        )
        .bind(user_id)
        .fetch_all(&self.pool)
        .await?;

        let history: Vec<serde_json::Value> = rows
            .into_iter()
            .map(|row| {
                let keyword: Option<String> = row.get("keyword");
                let filters: Option<serde_json::Value> = row.get("filters");
                serde_json::json!({
                    "id": row.get::<Uuid, _>("id").to_string(),
                    "keyword": keyword,
                    "filters": filters,
                    "result_count": row.get::<i32, _>("result_count"),
                    "timestamp": row.get::<chrono::DateTime<chrono::Utc>, _>("timestamp").to_rfc3339(),
                })
            })
            .collect();

        Ok(history)
    }

    /// 添加查询历史
    pub async fn add_search_history(
        &self,
        user_id: Uuid,
        keyword: Option<&str>,
        filters: Option<serde_json::Value>,
        result_count: i32,
    ) -> Result<(), sqlx::Error> {
        sqlx::query(
            "INSERT INTO search_history (user_id, keyword, filters, result_count) VALUES ($1, $2, $3, $4)"
        )
        .bind(user_id)
        .bind(keyword)
        .bind(filters)
        .bind(result_count)
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    /// 删除单条历史
    pub async fn delete_search_history(
        &self,
        user_id: Uuid,
        history_id: Uuid,
    ) -> Result<(), sqlx::Error> {
        sqlx::query(
            "DELETE FROM search_history WHERE id = $1 AND user_id = $2"
        )
        .bind(history_id)
        .bind(user_id)
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    /// 清空所有历史
    pub async fn clear_search_history(
        &self,
        user_id: Uuid,
    ) -> Result<(), sqlx::Error> {
        sqlx::query(
            "DELETE FROM search_history WHERE user_id = $1"
        )
        .bind(user_id)
        .execute(&self.pool)
        .await?;
        Ok(())
    }
}
