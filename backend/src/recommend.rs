// ── Recommendation Engine (User Profile × Cars) ───────────────
use carpricehub_shared::*;
use crate::db::Database;
use anyhow::Result;

pub async fn recommend(
    db: &Database,
    req: &RecommendRequest,
) -> Result<Vec<Recommendation>> {
    // Step 1: Build search query based on profile
    let mut query = SearchQuery {
        page: Some(1),
        page_size: Some(50),
        ..Default::default()
    };

    // Budget from profile if not specified
    if query.budget_min.is_none() {
        query.budget_min = req.budget_min;
    }
    if query.budget_max.is_none() {
        query.budget_max = req.budget_max;
    }

    // If still no budget, calculate from income (3x annual income as max)
    if query.budget_max.is_none() {
        let annual_income = req.profile.family_monthly_income.unwrap_or(req.profile.monthly_income) * 12;
        query.budget_max = Some((annual_income / 3) as f64);
    }

    // Energy type preference: prefer EV if restricted plate city
    if req.profile.restricted_plate_city {
        query.energy_type = Some(EnergyType::Bev);
    }

    // Seat count preference: 5+ if married with kids
    if req.profile.marital_status == MaritalStatus::Married && req.profile.has_children {
        query.seat_count_min = Some(5);
    }

    // Step 2: Search cars
    let cars = db.search_cars(&query).await?;

    // Step 3: Score each car
    let mut recommendations: Vec<Recommendation> = cars
        .into_iter()
        .map(|car| score_car(&car, &req.profile))
        .collect();

    // Step 4: Sort by total score
    recommendations.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap());

    // Step 5: Keep top 10
    recommendations.truncate(10);

    Ok(recommendations)
}

fn score_car(car: &Car, profile: &UserProfile) -> Recommendation {
    // 1. Financial Health (30%)
    let financial_health = calculate_financial_health(car, profile);

    // 2. Family Fit (25%)
    let family_fit = calculate_family_fit(car, profile);

    // 3. Scenario Match (20%)
    let scenario_match = calculate_scenario_match(car, profile);

    // 4. First Car Factor (10%)
    let first_car_factor = calculate_first_car_factor(car, profile);

    // 5. Value Score (10%)
    let value_score = calculate_value_score(car);

    // 6. Policy Bonus (5%)
    let policy_bonus = calculate_policy_bonus(car, profile);

    // Total score (0-100)
    let score = (financial_health * 0.30)
        + (family_fit * 0.25)
        + (scenario_match * 0.20)
        + (first_car_factor * 0.10)
        + (value_score * 0.10)
        + (policy_bonus * 0.05);

    // Risk warning
    let risk_warning = check_risk(car, profile);

    // Reason generation
    let reason = generate_reason(car, profile, score);

    Recommendation {
        car: car.clone(),
        score,
        reason,
        financial_health,
        family_fit,
        scenario_match,
        first_car_factor,
        value_score,
        policy_bonus,
        risk_warning,
    }
}

fn calculate_financial_health(car: &Car, profile: &UserProfile) -> f64 {
    let monthly_income = profile.family_monthly_income.unwrap_or(profile.monthly_income) as f64;
    let max_monthly_payment = profile.max_monthly_payment as f64;

    // Assume 30% down, 3-year loan, 5% interest (simplified)
    let loan_amount = (car.price_discount * 10000.0) * 0.7;
    let monthly_payment = loan_amount / 36.0 * 1.1; // rough estimate with interest

    if monthly_payment > max_monthly_payment {
        return 0.0; // Over budget
    }

    let payment_ratio = monthly_payment / monthly_income;
    let health_score = (1.0 - payment_ratio) * 100.0;

    health_score.max(0.0).min(100.0)
}

fn calculate_family_fit(car: &Car, profile: &UserProfile) -> f64 {
    if !profile.has_children && !profile.living_with_parents {
        // Single / couple: no strict requirement
        return 100.0;
    }

    let seats = car.seat_count.unwrap_or(5);
    let target_seats = if profile.family_members >= 5 { 7 } else { 5 };

    let seat_score = if seats >= target_seats { 100.0 } else { 50.0 };

    // ISOFIX presence (simplified: assume larger cars have it)
    let isofix_score = if car.body_type == BodyType::Suv || car.body_type == BodyType::Mpv { 100.0 } else { 70.0 };

    (seat_score + isofix_score) / 2.0
}

fn calculate_scenario_match(car: &Car, profile: &UserProfile) -> f64 {
    match profile.primary_usage {
        UsageScenario::Commute => {
            // Prefer fuel-efficient or EV for long commute
            if car.energy_type == EnergyType::Bev || car.energy_type == EnergyType::Hybrid {
                100.0
            } else if profile.daily_mileage > 50 {
                60.0 // High mileage petrol is expensive
            } else {
                85.0
            }
        }
        UsageScenario::Family => {
            // Prefer SUV/MPV with space
            if car.body_type == BodyType::Suv || car.body_type == BodyType::Mpv {
                100.0
            } else {
                60.0
            }
        }
        UsageScenario::Business => {
            // Prefer sedan/coupe for professional image
            if car.body_type == BodyType::Sedan || car.body_type == BodyType::Coupe {
                100.0
            } else {
                70.0
            }
        }
        UsageScenario::Travel => {
            // Prefer SUV for off-road / long trip
            if car.body_type == BodyType::Suv || car.body_type == BodyType::Pickup {
                100.0
            } else {
                65.0
            }
        }
    }
}

fn calculate_first_car_factor(car: &Car, profile: &UserProfile) -> f64 {
    if profile.car_ownership != CarOwnership::None {
        return 100.0; // Not first car, no preference
    }

    // First car: prefer reliable, easy to drive, cheap to insure
    // Simplified: smaller cars, lower price
    if car.price_discount < 15.0 {
        100.0
    } else if car.price_discount < 25.0 {
        80.0
    } else {
        60.0 // Premium cars less ideal for first car
    }
}

fn calculate_value_score(car: &Car) -> f64 {
    // Based on discount ratio and loan subsidy
    let discount_ratio = car.direct_discount / car.price_official;
    let subsidy_bonus = car.loan_subsidy_amount.unwrap_or(0.0) / car.price_official;

    let raw_score = (discount_ratio * 200.0) + (subsidy_bonus * 300.0);
    raw_score.max(0.0).min(100.0)
}

fn calculate_policy_bonus(car: &Car, profile: &UserProfile) -> f64 {
    let mut score = 50.0;

    // Restriction city bonus for EV
    if profile.restricted_plate_city && car.energy_type == EnergyType::Bev {
        score += 40.0;
    }

    // Trade-in subsidy
    if profile.old_car_trade_in && car.replacement_subsidy.is_some() {
        score += 20.0;
    }

    score.min(100.0)
}

fn check_risk(car: &Car, profile: &UserProfile) -> Option<RiskWarning> {
    let monthly_income = profile.family_monthly_income.unwrap_or(profile.monthly_income) as f64;
    let loan_amount = (car.price_discount * 10000.0) * 0.7;
    let monthly_payment = loan_amount / 36.0 * 1.1;

    let payment_ratio = monthly_payment / monthly_income;

    if payment_ratio > 0.50 {
        Some(RiskWarning {
            level: RiskLevel::Critical,
            message: "月供超过月收入50%，财务风险极高".to_string(),
            suggestion: "建议降低预算或增加首付".to_string(),
        })
    } else if payment_ratio > 0.40 {
        Some(RiskWarning {
            level: RiskLevel::High,
            message: "月供接近月收入40%，财务压力较大".to_string(),
            suggestion: "建议谨慎评估还款能力".to_string(),
        })
    } else if payment_ratio > 0.30 {
        Some(RiskWarning {
            level: RiskLevel::Medium,
            message: "月供超过推荐比例30%，需预留应急资金".to_string(),
            suggestion: "建议增加储蓄缓冲".to_string(),
        })
    } else {
        None
    }
}

fn generate_reason(car: &Car, profile: &UserProfile, score: f64) -> String {
    let mut reasons = vec![];

    if car.direct_discount > 0 {
        reasons.push(format!("当前优惠{}万", car.direct_discount));
    }

    if let Some(subsidy) = car.loan_subsidy_amount {
        if subsidy > 0 {
            reasons.push(format!("贴息{}万", subsidy));
        }
    }

    if profile.restricted_plate_city && car.energy_type == EnergyType::Bev {
        reasons.push("绿牌免摇号".to_string());
    }

    if profile.has_children && car.seat_count.unwrap_or(5) >= 5 {
        reasons.push("空间满足家庭需求".to_string());
    }

    if profile.car_ownership == CarOwnership::None && car.price_discount < 15.0 {
        reasons.push("适合首购".to_string());
    }

    if reasons.is_empty() {
        "综合性价比优秀".to_string()
    } else {
        format!("{}，综合评分{:.1}", reasons.join(" + "), score)
    }
}
