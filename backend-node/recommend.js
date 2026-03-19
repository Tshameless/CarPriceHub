// 智能推荐算法

/**
 * 计算财务健康度
 * @param {Object} car 车辆信息
 * @param {Object} profile 用户画像
 * @returns {number} 0-100分
 */
function calculateFinancialHealth(car, profile) {
  let score = 100;
  
  // 计算首付
  const downPayment = car.price_discount * 0.2 * 10000; // 20%首付,转换为元
  
  // 检查首付是否合理(不超过存款的50%)
  if (downPayment > profile.savings_for_down_payment * 0.5) {
    score -= 30;
  } else if (downPayment > profile.savings_for_down_payment * 0.3) {
    score -= 15;
  }
  
  // 计算月供(3年期,年利率3%)
  const loanAmount = car.price_discount * 0.8 * 10000;
  const monthlyRate = 0.03 / 12;
  const monthlyPayment = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, 36) / 
                         (Math.pow(1 + monthlyRate, 36) - 1);
  
  // 检查月供是否合理(不超过月收入的30%)
  const income = profile.family_monthly_income || profile.monthly_income;
  if (monthlyPayment > income * 0.3) {
    score -= 25;
  } else if (monthlyPayment > income * 0.2) {
    score -= 10;
  }
  
  // 考虑其他负债
  if (profile.has_mortgage && profile.mortgage_monthly) {
    const totalPayment = monthlyPayment + profile.mortgage_monthly;
    if (totalPayment > income * 0.5) {
      score -= 20;
    }
  }
  
  return Math.max(0, score);
}

/**
 * 计算家庭适配度
 * @param {Object} car 车辆信息
 * @param {Object} profile 用户画像
 * @returns {number} 0-100分
 */
function calculateFamilyFit(car, profile) {
  let score = 100;
  
  // 家庭成员数量
  const totalMembers = profile.family_members + (profile.living_with_parents ? 2 : 0);
  
  // 座位需求
  if (profile.has_children) {
    if (car.seat_count < 5) {
      score -= 30;
    } else if (car.seat_count >= 7 && totalMembers >= 5) {
      score += 10; // 大家庭适合7座
    }
  }
  
  // 车身类型匹配
  if (totalMembers >= 5) {
    if (car.body_type === 'mpv' || car.body_type === 'suv') {
      score += 15;
    } else if (car.body_type === 'sedan') {
      score -= 10;
    }
  }
  
  // 三代同行
  if (profile.living_with_parents && profile.has_children) {
    if (car.seat_count >= 7) {
      score += 20;
    } else if (car.seat_count < 7) {
      score -= 15;
    }
  }
  
  return Math.max(0, Math.min(100, score));
}

/**
 * 计算场景匹配度
 * @param {Object} car 车辆信息
 * @param {Object} profile 用户画像
 * @returns {number} 0-100分
 */
function calculateScenarioMatch(car, profile) {
  let score = 50; // 基础分
  
  switch (profile.primary_usage) {
    case 'commute':
      // 通勤优先混动/纯电
      if (car.energy_type === 'bev' || car.energy_type === 'phev' || car.energy_type === 'hybrid') {
        score += 30;
      }
      // 考虑充电条件
      if (profile.parking_condition === 'fixed_with_charger' && car.energy_type === 'bev') {
        score += 15;
      }
      break;
      
    case 'family':
      // 家庭使用优先SUV/MPV
      if (car.body_type === 'suv' || car.body_type === 'mpv') {
        score += 30;
      }
      break;
      
    case 'business':
      // 商务优先轿车
      if (car.body_type === 'sedan') {
        score += 30;
      }
      // 品牌加成
      if (['宝马', '奔驰', '奥迪'].includes(car.brand)) {
        score += 15;
      }
      break;
      
    case 'travel':
      // 自驾游优先SUV
      if (car.body_type === 'suv') {
        score += 25;
      }
      // 越野车加成
      if (car.brand === '坦克') {
        score += 20;
      }
      break;
  }
  
  return Math.min(100, score);
}

/**
 * 计算首车系数
 * @param {Object} car 车辆信息
 * @param {Object} profile 用户画像
 * @returns {number} 0-100分
 */
function calculateFirstCarFactor(car, profile) {
  if (profile.car_ownership !== 'none') {
    return 50; // 非首车购买
  }
  
  let score = 80;
  
  // 首车优先性价比高的
  const pricePerSeat = car.price_discount / car.seat_count;
  if (pricePerSeat < 3) {
    score += 15;
  } else if (pricePerSeat > 8) {
    score -= 15;
  }
  
  // 首车优先易驾驶的
  if (car.body_type === 'sedan' || car.body_type === 'hatchback') {
    score += 10;
  }
  
  return Math.max(0, Math.min(100, score));
}

/**
 * 计算性价比
 * @param {Object} car 车辆信息
 * @returns {number} 0-100分
 */
function calculateValueScore(car) {
  let score = 50;
  
  // 优惠力度
  const discountRate = car.direct_discount / car.price_official;
  if (discountRate > 0.15) {
    score += 20;
  } else if (discountRate > 0.10) {
    score += 10;
  }
  
  // 贴息和置换补贴
  if (car.loan_subsidy_amount) {
    score += 10;
  }
  if (car.replacement_subsidy) {
    score += 10;
  }
  
  // 价格区间评分
  if (car.price_discount < 15) {
    score += 15; // 经济型
  } else if (car.price_discount < 30) {
    score += 10; // 中端
  }
  
  return Math.min(100, score);
}

/**
 * 计算政策红利
 * @param {Object} car 车辆信息
 * @param {Object} profile 用户画像
 * @returns {number} 0-100分
 */
function calculatePolicyBonus(car, profile) {
  let score = 50;
  
  // 新能源车在限牌城市
  if (profile.restricted_plate_city) {
    if (car.energy_type === 'bev' || car.energy_type === 'phev') {
      score += 30;
    }
  }
  
  // 置换补贴
  if (profile.old_car_trade_in && car.replacement_subsidy) {
    score += 20;
  }
  
  return Math.min(100, score);
}

/**
 * 生成推荐理由
 */
function generateReason(car, scores) {
  const reasons = [];
  
  if (scores.financial_health >= 80) {
    reasons.push('财务压力小');
  }
  if (scores.family_fit >= 80) {
    reasons.push('适合家庭使用');
  }
  if (scores.scenario_match >= 80) {
    reasons.push('匹配使用场景');
  }
  if (scores.value_score >= 80) {
    reasons.push('性价比高');
  }
  if (scores.policy_bonus >= 70) {
    reasons.push('享受政策红利');
  }
  
  return reasons.length > 0 ? reasons.join('，') : '综合推荐';
}

/**
 * 生成风险警告
 */
function generateRiskWarning(car, profile, scores) {
  const downPayment = car.price_discount * 0.2 * 10000;
  const loanAmount = car.price_discount * 0.8 * 10000;
  const monthlyRate = 0.03 / 12;
  const monthlyPayment = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, 36) / 
                         (Math.pow(1 + monthlyRate, 36) - 1);
  
  const income = profile.family_monthly_income || profile.monthly_income;
  
  if (monthlyPayment > income * 0.5) {
    return {
      level: 'critical',
      message: `月供约${Math.round(monthlyPayment)}元，占收入的${Math.round(monthlyPayment / income * 100)}%`,
      suggestion: '建议选择更低价位的车型，或延长贷款期限'
    };
  } else if (monthlyPayment > income * 0.3) {
    return {
      level: 'high',
      message: `月供约${Math.round(monthlyPayment)}元，占收入的${Math.round(monthlyPayment / income * 100)}%`,
      suggestion: '月供略高，建议考虑财务风险'
    };
  } else if (downPayment > profile.savings_for_down_payment * 0.5) {
    return {
      level: 'medium',
      message: '首付占用存款比例较高',
      suggestion: '建议保留一定的应急储备金'
    };
  }
  
  return null;
}

/**
 * 推荐算法主函数
 */
function recommendCars(cars, profile, budgetMin, budgetMax) {
  const recommendations = cars
    .filter(car => {
      // 价格范围筛选
      if (budgetMin && car.price_discount < budgetMin) return false;
      if (budgetMax && car.price_discount > budgetMax) return false;
      return true;
    })
    .map(car => {
      // 计算各项评分
      const financial_health = calculateFinancialHealth(car, profile);
      const family_fit = calculateFamilyFit(car, profile);
      const scenario_match = calculateScenarioMatch(car, profile);
      const first_car_factor = calculateFirstCarFactor(car, profile);
      const value_score = calculateValueScore(car);
      const policy_bonus = calculatePolicyBonus(car, profile);
      
      // 综合评分(加权平均)
      const score = 
        financial_health * 0.30 +
        family_fit * 0.25 +
        scenario_match * 0.20 +
        first_car_factor * 0.10 +
        value_score * 0.10 +
        policy_bonus * 0.05;
      
      const scores = {
        financial_health,
        family_fit,
        scenario_match,
        first_car_factor,
        value_score,
        policy_bonus
      };
      
      return {
        car,
        score: Math.round(score),
        reason: generateReason(car, scores),
        ...scores,
        risk_warning: generateRiskWarning(car, profile, scores)
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10); // 返回前10个推荐
  
  return recommendations;
}

module.exports = { recommendCars };
