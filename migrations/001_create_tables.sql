-- ── Database Schema Migration: Initial Tables ─────────────────
-- Run with: sqlx migrate run --database-url postgresql://... --migrations-dir ./migrations

-- Cars table
CREATE TABLE IF NOT EXISTS cars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand VARCHAR(100) NOT NULL,
    model_name VARCHAR(200) NOT NULL,
    year INTEGER NOT NULL,
    energy_type VARCHAR(50) NOT NULL, -- petrol, diesel, hybrid, phev, bev, hydrogen
    body_type VARCHAR(50) NOT NULL,   -- sedan, suv, mpv, hatchback, coupe, pickup, wagon
    seat_count INTEGER,
    price_official DECIMAL(10,2) NOT NULL,       -- 万元
    price_discount DECIMAL(10,2) NOT NULL,      -- 万元
    direct_discount DECIMAL(10,2) NOT NULL,     -- 万元
    loan_subsidy_rate DECIMAL(5,4),              -- 年化利率
    loan_subsidy_amount DECIMAL(10,2),           -- 万元
    replacement_subsidy DECIMAL(10,2),           -- 万元
    insurance_discount DECIMAL(5,2),            -- %
    gift_package JSONB,                          -- [{"name": "...", "estimated_value": ...}]
    effective_date TIMESTAMPTZ NOT NULL,
    expire_date TIMESTAMPTZ,
    region VARCHAR(100) NOT NULL DEFAULT '全国',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for search
CREATE INDEX idx_cars_brand ON cars(brand);
CREATE INDEX idx_cars_energy_type ON cars(energy_type);
CREATE INDEX idx_cars_body_type ON cars(body_type);
CREATE INDEX idx_cars_price_discount ON cars(price_discount);
CREATE INDEX idx_cars_direct_discount ON cars(direct_discount DESC);
CREATE INDEX idx_cars_updated_at ON cars(updated_at DESC);
CREATE INDEX idx_cars_brand_model ON cars(brand, model_name);
CREATE INDEX idx_cars_energy_price ON cars(energy_type, price_discount);

-- Full-text search
CREATE INDEX idx_cars_search ON cars USING GIN (
    to_tsvector('simple', brand || ' ' || model_name)
);

-- User profiles table (optional, for analytics)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monthly_income BIGINT NOT NULL,
    family_monthly_income BIGINT,
    savings_for_down_payment BIGINT NOT NULL,
    max_monthly_payment BIGINT NOT NULL,
    has_mortgage BOOLEAN NOT NULL DEFAULT FALSE,
    mortgage_monthly BIGINT,
    marital_status VARCHAR(50) NOT NULL,
    has_children BOOLEAN NOT NULL DEFAULT FALSE,
    children_count SMALLINT,
    children_age_range VARCHAR(50),
    living_with_parents BOOLEAN NOT NULL DEFAULT FALSE,
    family_members SMALLINT NOT NULL DEFAULT 1,
    planning_children BOOLEAN NOT NULL DEFAULT FALSE,
    car_ownership VARCHAR(50) NOT NULL,
    car_count SMALLINT NOT NULL DEFAULT 0,
    old_car_trade_in BOOLEAN NOT NULL DEFAULT FALSE,
    old_car_value BIGINT,
    primary_usage VARCHAR(50) NOT NULL,
    daily_mileage BIGINT NOT NULL DEFAULT 30,
    parking_condition VARCHAR(50) NOT NULL,
    restricted_plate_city BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Price history table (for trend analysis)
CREATE TABLE IF NOT EXISTS price_history (
    id BIGSERIAL PRIMARY KEY,
    car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    price_official DECIMAL(10,2) NOT NULL,
    price_discount DECIMAL(10,2) NOT NULL,
    direct_discount DECIMAL(10,2) NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(car_id, recorded_at)
);

CREATE INDEX idx_price_history_car ON price_history(car_id);
CREATE INDEX idx_price_history_car_recorded ON price_history(car_id, recorded_at DESC);

-- Price alerts table
CREATE TABLE IF NOT EXISTS price_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,  -- Optional user ID (if auth is added)
    car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    target_price DECIMAL(10,2) NOT NULL,
    alert_type VARCHAR(50) NOT NULL, -- 'below', 'above', 'equal'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    triggered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_price_alerts_car ON price_alerts(car_id);
CREATE INDEX idx_price_alerts_active ON price_alerts(is_active);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,  -- Optional user ID
    car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, car_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_car ON favorites(car_id);
