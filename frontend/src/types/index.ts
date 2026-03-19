// ── TypeScript Types (Frontend mirror of Rust types) ───────────
export type EnergyType = 'petrol' | 'diesel' | 'hybrid' | 'phev' | 'bev' | 'hydrogen';
export type BodyType = 'sedan' | 'suv' | 'mpv' | 'hatchback' | 'coupe' | 'pickup' | 'wagon';

export type MaritalStatus = 'single' | 'married' | 'divorced';
export type ChildrenAgeRange = 'under3' | 'age4to12' | 'age13plus';
export type CarOwnership = 'none' | 'one' | 'two_or_more';
export type UsageScenario = 'commute' | 'family' | 'business' | 'travel';
export type ParkingCondition = 'fixed_with_charger' | 'underground' | 'street';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Car {
  id: string;
  brand: string;
  model_name: string;
  year: number;
  energy_type: EnergyType;
  body_type: BodyType;
  seat_count?: number;
  price_official: number;       // 万元
  price_discount: number;      // 万元
  direct_discount: number;     // 万元
  loan_subsidy_rate?: number;  // 年化利率
  loan_subsidy_amount?: number; // 贴息折算金额（万元）
  replacement_subsidy?: number; // 置换补贴（万元）
  insurance_discount?: number; // 保险折扣（%）
  gift_package?: GiftItem[];
  effective_date: string;
  expire_date?: string;
  region: string;
  updated_at: string;
}

export interface GiftItem {
  name: string;
  estimated_value: number; // 万元
}

export interface UserProfile {
  monthly_income: number;         // 月收入（元）
  family_monthly_income?: number; // 家庭总收入
  savings_for_down_payment: number; // 可用首付存款（元）
  max_monthly_payment: number;   // 月供承受上限（元）
  has_mortgage: boolean;
  mortgage_monthly?: number;     // 房贷/租金月支出
  marital_status: MaritalStatus;
  has_children: boolean;
  children_count?: number;
  children_age_range?: ChildrenAgeRange;
  living_with_parents: boolean;
  family_members: number;
  planning_children: boolean;
  car_ownership: CarOwnership;
  car_count: number;
  old_car_trade_in: boolean;
  old_car_value?: number;
  primary_usage: UsageScenario;
  daily_mileage: number;          // 日均里程（km）
  parking_condition: ParkingCondition;
  restricted_plate_city: boolean;
}

export interface Recommendation {
  car: Car;
  score: number;                 // 综合评分 0-100
  reason: string;                // 推荐理由
  financial_health: number;      // 财务健康度 0-100
  family_fit: number;            // 家庭适配度 0-100
  scenario_match: number;        // 场景匹配度 0-100
  first_car_factor: number;      // 首车系数 0-100
  value_score: number;           // 性价比 0-100
  policy_bonus: number;          // 政策红利 0-100
  risk_warning?: RiskWarning;
}

export interface RiskWarning {
  level: RiskLevel;
  message: string;
  suggestion: string;
}

export interface SearchQuery {
  keyword?: string;
  budget_min?: number;
  budget_max?: number;
  energy_type?: EnergyType;
  body_type?: BodyType;
  seat_count_min?: number;
  page?: number;
  page_size?: number;
}

export interface SearchResult {
  cars: Car[];
  total: number;
  page: number;
  page_size: number;
}

export interface RecommendRequest {
  profile: UserProfile;
  budget_min?: number;
  budget_max?: number;
}

export interface RecommendResponse {
  recommendations: Recommendation[];
  total_cars_considered: number;
  processing_time_ms: number;
}

// ── 价格历史相关类型 ──────────────────────────────────────────────

export interface PriceHistory {
  id: string;
  car_id: string;
  price: number;           // 价格（万元）
  price_type: 'official' | 'dealer';  // 价格类型
  recorded_at: string;     // 记录时间
  source: string;          // 数据来源
}

export interface PriceTrend {
  car_id: string;
  car_name: string;
  official_prices: PricePoint[];
  dealer_prices: PricePoint[];
  price_change: number;    // 价格变化（万元）
  change_percent: number;  // 变化百分比
  lowest_price: number;    // 最低价
  highest_price: number;   // 最高价
  avg_price: number;       // 平均价
}

export interface PricePoint {
  date: string;   // 日期 YYYY-MM-DD
  price: number;  // 价格
}

export interface PriceAlert {
  id: string;
  car_id: string;
  target_price: number;    // 目标价格
  notify_type: 'email' | 'sms' | 'push';
  is_active: boolean;
  created_at: string;
  triggered_at?: string;
}
