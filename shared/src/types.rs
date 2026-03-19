// ── Shared Data Structures (前后端共享) ───────────────────────
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

// ========== Car Price Models ==========

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Car {
    pub id: Uuid,
    pub brand: String,
    pub model_name: String,
    pub year: i32,
    pub energy_type: EnergyType,
    pub body_type: BodyType,
    pub seat_count: Option<i32>,
    pub price_official: f64,      // 万元
    pub price_discount: f64,      // 万元
    pub direct_discount: f64,     // 万元 = 官方价 - 优惠价
    pub loan_subsidy_rate: Option<f64>,  // 年化利率
    pub loan_subsidy_amount: Option<f64>, // 贴息折算金额（万元）
    pub replacement_subsidy: Option<f64>, // 置换补贴（万元）
    pub insurance_discount: Option<f64>, // 保险折扣（%）
    pub gift_package: Option<Vec<GiftItem>>,
    pub effective_date: DateTime<Utc>,
    pub expire_date: Option<DateTime<Utc>>,
    pub region: String,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GiftItem {
    pub name: String,
    pub estimated_value: f64, // 万元
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum EnergyType {
    Petrol,
    Diesel,
    Hybrid,
    Phev,
    Bev,
    Hydrogen,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum BodyType {
    Sedan,
    Suv,
    Mpv,
    Hatchback,
    Coupe,
    Pickup,
    Wagon,
}

// ========== User Profile & Recommendation ==========

#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct UserProfile {
    #[validate(range(min = 5000, max = 500000))]
    pub monthly_income: i64,         // 月收入（元）

    pub family_monthly_income: Option<i64>, // 家庭总收入

    #[validate(range(min = 0))]
    pub savings_for_down_payment: i64, // 可用首付存款（元）

    #[validate(range(max = 50000))]
    pub max_monthly_payment: i64,   // 月供承受上限（元）

    pub has_mortgage: bool,
    pub mortgage_monthly: Option<i64>, // 房贷/租金月支出

    pub marital_status: MaritalStatus,

    pub has_children: bool,
    pub children_count: Option<u8>,
    pub children_age_range: Option<ChildrenAgeRange>,

    pub living_with_parents: bool,
    pub family_members: u8,

    pub planning_children: bool,

    pub car_ownership: CarOwnership,
    pub car_count: u8,

    pub old_car_trade_in: bool,
    pub old_car_value: Option<i64>,

    pub primary_usage: UsageScenario,

    #[validate(range(min = 0))]
    pub daily_mileage: i64,          // 日均里程（km）

    pub parking_condition: ParkingCondition,

    pub restricted_plate_city: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum MaritalStatus {
    Single,
    Married,
    Divorced,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum ChildrenAgeRange {
    Under3,
    Age4To12,
    Age13Plus,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum CarOwnership {
    None,
    One,
    TwoOrMore,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum UsageScenario {
    Commute,
    Family,
    Business,
    Travel,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum ParkingCondition {
    FixedWithCharger,
    Underground,
    Street,
}

// ========== Recommendation Result ==========

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Recommendation {
    pub car: Car,
    pub score: f64,                 // 综合评分 0-100
    pub reason: String,             // 推荐理由（自然语言）
    pub financial_health: f64,      // 财务健康度 0-100
    pub family_fit: f64,            // 家庭适配度 0-100
    pub scenario_match: f64,        // 场景匹配度 0-100
    pub first_car_factor: f64,      // 首车系数 0-100
    pub value_score: f64,           // 性价比 0-100
    pub policy_bonus: f64,          // 政策红利 0-100
    pub risk_warning: Option<RiskWarning>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskWarning {
    pub level: RiskLevel,
    pub message: String,
    pub suggestion: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum RiskLevel {
    Low,
    Medium,
    High,
    Critical,
}

// ========== API Request/Response Types ==========

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SearchQuery {
    pub keyword: Option<String>,
    pub budget_min: Option<f64>,
    pub budget_max: Option<f64>,
    pub energy_type: Option<EnergyType>,
    pub body_type: Option<BodyType>,
    pub seat_count_min: Option<i32>,
    pub page: Option<u32>,
    pub page_size: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResult {
    pub cars: Vec<Car>,
    pub total: u64,
    pub page: u32,
    pub page_size: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecommendRequest {
    pub profile: UserProfile,
    pub budget_min: Option<f64>,
    pub budget_max: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecommendResponse {
    pub recommendations: Vec<Recommendation>,
    pub total_cars_considered: u64,
    pub processing_time_ms: u64,
}

// ========== WebSocket Types ==========

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "data")]
pub enum WsMessage {
    #[serde(rename = "subscribe")]
    Subscribe { car_ids: Vec<Uuid> },
    #[serde(rename = "unsubscribe")]
    Unsubscribe { car_ids: Vec<Uuid> },
    #[serde(rename = "price_update")]
    PriceUpdate { car_id: Uuid, field: String, old_value: serde_json::Value, new_value: serde_json::Value, updated_at: DateTime<Utc> },
    #[serde(rename = "error")]
    Error { message: String },
}
