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
