// 示例车型数据
const cars = [
  // 比亚迪
  { id: '1', brand: '比亚迪', model_name: '秦PLUS DM-i', year: 2024, energy_type: 'phev', body_type: 'sedan', seat_count: 5, price_official: 12.98, price_discount: 11.28, direct_discount: 1.70, loan_subsidy_rate: 0.0199, loan_subsidy_amount: 0.80, replacement_subsidy: 0.50, region: '全国', effective_date: '2024-01-01', updated_at: new Date().toISOString() },
  { id: '2', brand: '比亚迪', model_name: '汉EV', year: 2024, energy_type: 'bev', body_type: 'sedan', seat_count: 5, price_official: 23.98, price_discount: 21.18, direct_discount: 2.80, loan_subsidy_rate: 0.0150, loan_subsidy_amount: 1.20, replacement_subsidy: 0.80, region: '全国', effective_date: '2024-01-01', updated_at: new Date().toISOString() },
  { id: '3', brand: '比亚迪', model_name: '海豹', year: 2024, energy_type: 'bev', body_type: 'sedan', seat_count: 5, price_official: 22.28, price_discount: 19.88, direct_discount: 2.40, loan_subsidy_rate: 0.0199, loan_subsidy_amount: 1.00, replacement_subsidy: 0.60, region: '全国', effective_date: '2024-01-01', updated_at: new Date().toISOString() },
  { id: '4', brand: '比亚迪', model_name: '海鸥', year: 2024, energy_type: 'bev', body_type: 'hatchback', seat_count: 4, price_official: 8.58, price_discount: 7.68, direct_discount: 0.90, loan_subsidy_rate: 0.0299, loan_subsidy_amount: 0.30, replacement_subsidy: 0.30, region: '全国', effective_date: '2024-01-01', updated_at: new Date().toISOString() },
  { id: '5', brand: '比亚迪', model_name: '宋PLUS DM-i', year: 2024, energy_type: 'phev', body_type: 'suv', seat_count: 5, price_official: 17.98, price_discount: 15.98, direct_discount: 2.00, loan_subsidy_rate: 0.0199, loan_subsidy_amount: 0.90, replacement_subsidy: 0.60, region: '全国', effective_date: '2024-01-01', updated_at: new Date().toISOString() },
  
  // 大众
  { id: '6', brand: '大众', model_name: '朗逸', year: 2024, energy_type: 'petrol', body_type: 'sedan', seat_count: 5, price_official: 13.09, price_discount: 10.89, direct_discount: 2.20, loan_subsidy_rate: 0.0250, loan_subsidy_amount: 0.60, replacement_subsidy: 0.40, region: '全国', effective_date: '2024-01-01', updated_at: new Date().toISOString() },
  { id: '7', brand: '大众', model_name: '迈腾', year: 2024, energy_type: 'petrol', body_type: 'sedan', seat_count: 5, price_official: 23.69, price_discount: 19.99, direct_discount: 3.70, loan_subsidy_rate: 0.0199, loan_subsidy_amount: 1.00, replacement_subsidy: 0.70, region: '全国', effective_date: '2024-01-01', updated_at: new Date().toISOString() },
  { id: '8', brand: '大众', model_name: '途岳', year: 2024, energy_type: 'petrol', body_type: 'suv', seat_count: 5, price_official: 17.86, price_discount: 14.86, direct_discount: 3.00, loan_subsidy_rate: 0.0299, loan_subsidy_amount: 0.80, replacement_subsidy: 0.50, region: '全国', effective_date: '2024-01-01', updated_at: new Date().toISOString() },
  { id: '9', brand: '大众', model_name: '途昂', year: 2024, energy_type: 'petrol', body_type: 'suv', seat_count: 7, price_official: 32.90, price_discount: 28.50, direct_discount: 4.40, loan_subsidy_rate: 0.0199, loan_subsidy_amount: 1.50, replacement_subsidy: 1.00, region: '全国', effective_date: '2024-01-01', updated_at: new Date().toISOString() },
  
  // 丰田
  { id: '10', brand: '丰田', model_name: '卡罗拉', year: 2024, energy_type: 'petrol', body_type: 'sedan', seat_count: 5, price_official: 12.98, price_discount: 10.58, direct_discount: 2.40, loan_subsidy_rate: 0.0250, loan_subsidy_amount: 0.50, replacement_subsidy: 0.35, region: '全国', effective_date: '2024-01-01', updated_at: new Date().toISOString() },
  { id: '11', brand: '丰田', model_name: '凯美瑞', year: 2024, energy_type: 'petrol', body_type: 'sedan', seat_count: 5, price_official: 19.98, price_discount: 16.68, direct_discount: 3.30, loan_subsidy_rate: 0.0199, loan_subsidy_amount: 0.90, replacement_subsidy: 0.60, region: '全国', effective_date: '2024-01-01', updated_at: new Date().toISOString() },
  { id: '12', brand: '丰田', model_name: '汉兰达', year: 2024, energy_type: 'petrol', body_type: 'suv', seat_count: 7, price_official: 28.98, price_discount: 25.28, direct_discount: 3.70, loan_subsidy_rate: 0.0250, loan_subsidy_amount: 1.20, replacement_subsidy: 0.80, region: '全国', effective_date: '2024-01-01', updated_at: new Date().toISOString() },
  
  // 本田
  { id: '13', brand: '本田', model_name: '雅阁', year: 2024, energy_type: 'petrol', body_type: 'sedan', seat_count: 5, price_official: 19.68, price_discount: 16.38, direct_discount: 3.30, loan_subsidy_rate: 0.0199, loan_subsidy_amount: 0.85, replacement_subsidy: 0.55, region: '全国', effective_date: '2024-01-01', updated_at: new Date().toISOString() },
  { id: '14', brand: '本田', model_name: 'CR-V', year: 2024, energy_type: 'petrol', body_type: 'suv', seat_count: 5, price_official: 20.98, price_discount: 17.58, direct_discount: 3.40, loan_subsidy_rate: 0.0250, loan_subsidy_amount: 0.90, replacement_subsidy: 0.60, region: '全国', effective_date: '2024-01-01', updated_at: new Date().toISOString() },
  
  // 特斯拉
  { id: '15', brand: '特斯拉', model_name: 'Model 3', year: 2024, energy_type: 'bev', body_type: 'sedan', seat_count: 5, price_official: 24.59, price_discount: 23.19, direct_discount: 1.40, region: '全国', effective_date: '2024-01-01', updated_at: new Date().toISOString() },
  { id: '16', brand: '特斯拉', model_name: 'Model Y', year: 2024, energy_type: 'bev', body_type: 'suv', seat_count: 5, price_official: 26.39, price_discount: 24.89, direct_discount: 1.50, region: '全国', effective_date: '2024-01-01', updated_at: new Date().toISOString() },
  
  // 小鹏
  { id: '17', brand: '小鹏', model_name: 'P7', year: 2024, energy_type: 'bev', body_type: 'sedan', seat_count: 5, price_official: 23.99, price_discount: 20.99, direct_discount: 3.00, loan_subsidy_rate: 0.0199, loan_subsidy_amount: 1.20, replacement_subsidy: 0.70, region: '全国', effective_date: '2024-01-01', updated_at: new Date().toISOString() },
  { id: '18', brand: '小鹏', model_name: 'G6', year: 2024, energy_type: 'bev', body_type: 'suv', seat_count: 5, price_official: 22.99, price_discount: 20.49, direct_discount: 2.50, loan_subsidy_rate: 0.0199, loan_subsidy_amount: 1.00, replacement_subsidy: 0.60, region: '全国', effective_date: '2024-01-01', updated_at: new Date().toISOString() },
  
  // 蔚来
  { id: '19', brand: '蔚来', model_name: 'ET5', year: 2024, energy_type: 'bev', body_type: 'sedan', seat_count: 5, price_official: 32.80, price_discount: 30.80, direct_discount: 2.00, region: '全国', effective_date: '2024-01-01', updated_at: new Date().toISOString() },
  { id: '20', brand: '蔚来', model_name: 'ES6', year: 2024, energy_type: 'bev', body_type: 'suv', seat_count: 5, price_official: 36.80, price_discount: 34.80, direct_discount: 2.00, region: '全国', effective_date: '2024-01-01', updated_at: new Date().toISOString() },
  
  // 宝马
  { id: '21', brand: '宝马', model_name: '3系', year: 2024, energy_type: 'petrol', body_type: 'sedan', seat_count: 5, price_official: 32.99, price_discount: 28.99, direct_discount: 4.00, loan_subsidy_rate: 0.0199, loan_subsidy_amount: 1.50, replacement_subsidy: 1.00, region: '全国', effective_date: '2024-01-01', updated_at: new Date().toISOString() },
  { id: '22', brand: '宝马', model_name: '5系', year: 2024, energy_type: 'petrol', body_type: 'sedan', seat_count: 5, price_official: 47.99, price_discount: 42.99, direct_discount: 5.00, loan_subsidy_rate: 0.0150, loan_subsidy_amount: 2.00, replacement_subsidy: 1.50, region: '全国', effective_date: '2024-01-01', updated_at: new Date().toISOString() },
  { id: '23', brand: '宝马', model_name: 'X3', year: 2024, energy_type: 'petrol', body_type: 'suv', seat_count: 5, price_official: 44.99, price_discount: 39.99, direct_discount: 5.00, loan_subsidy_rate: 0.0199, loan_subsidy_amount: 1.80, replacement_subsidy: 1.20, region: '全国', effective_date: '2024-01-01', updated_at: new Date().toISOString() },
  
  // 奔驰
  { id: '24', brand: '奔驰', model_name: 'C级', year: 2024, energy_type: 'petrol', body_type: 'sedan', seat_count: 5, price_official: 35.68, price_discount: 30.68, direct_discount: 5.00, loan_subsidy_rate: 0.0199, loan_subsidy_amount: 1.80, replacement_subsidy: 1.20, region: '全国', effective_date: '2024-01-01', updated_at: new Date().toISOString() },
  { id: '25', brand: '奔驰', model_name: 'E级', year: 2024, energy_type: 'petrol', body_type: 'sedan', seat_count: 5, price_official: 50.98, price_discount: 45.98, direct_discount: 5.00, loan_subsidy_rate: 0.0150, loan_subsidy_amount: 2.50, replacement_subsidy: 1.80, region: '全国', effective_date: '2024-01-01', updated_at: new Date().toISOString() },
  
  // 坦克
  { id: '26', brand: '坦克', model_name: '300', year: 2024, energy_type: 'petrol', body_type: 'suv', seat_count: 5, price_official: 19.88, price_discount: 17.88, direct_discount: 2.00, loan_subsidy_rate: 0.0299, loan_subsidy_amount: 0.70, replacement_subsidy: 0.50, region: '全国', effective_date: '2024-01-01', updated_at: new Date().toISOString() },
  { id: '27', brand: '坦克', model_name: '500', year: 2024, energy_type: 'petrol', body_type: 'suv', seat_count: 5, price_official: 35.50, price_discount: 31.50, direct_discount: 4.00, loan_subsidy_rate: 0.0250, loan_subsidy_amount: 1.30, replacement_subsidy: 0.90, region: '全国', effective_date: '2024-01-01', updated_at: new Date().toISOString() },
  
  // 别克
  { id: '28', brand: '别克', model_name: 'GL8', year: 2024, energy_type: 'petrol', body_type: 'mpv', seat_count: 7, price_official: 29.99, price_discount: 25.99, direct_discount: 4.00, loan_subsidy_rate: 0.0199, loan_subsidy_amount: 1.20, replacement_subsidy: 0.80, region: '全国', effective_date: '2024-01-01', updated_at: new Date().toISOString() },
  
  // 五菱
  { id: '29', brand: '五菱', model_name: '宏光MINIEV', year: 2024, energy_type: 'bev', body_type: 'hatchback', seat_count: 4, price_official: 5.98, price_discount: 4.58, direct_discount: 1.40, loan_subsidy_rate: 0.0399, loan_subsidy_amount: 0.15, replacement_subsidy: 0.15, region: '全国', effective_date: '2024-01-01', updated_at: new Date().toISOString() },
  
  // 吉利
  { id: '30', brand: '吉利', model_name: '帝豪', year: 2024, energy_type: 'petrol', body_type: 'sedan', seat_count: 5, price_official: 8.39, price_discount: 6.79, direct_discount: 1.60, loan_subsidy_rate: 0.0299, loan_subsidy_amount: 0.30, replacement_subsidy: 0.25, region: '全国', effective_date: '2024-01-01', updated_at: new Date().toISOString() },
  { id: '31', brand: '吉利', model_name: '星越L', year: 2024, energy_type: 'petrol', body_type: 'suv', seat_count: 5, price_official: 16.82, price_discount: 14.32, direct_discount: 2.50, loan_subsidy_rate: 0.0250, loan_subsidy_amount: 0.70, replacement_subsidy: 0.50, region: '全国', effective_date: '2024-01-01', updated_at: new Date().toISOString() },
  
  // 领克
  { id: '32', brand: '领克', model_name: '03', year: 2024, energy_type: 'petrol', body_type: 'sedan', seat_count: 5, price_official: 15.48, price_discount: 13.28, direct_discount: 2.20, loan_subsidy_rate: 0.0250, loan_subsidy_amount: 0.60, replacement_subsidy: 0.40, region: '全国', effective_date: '2024-01-01', updated_at: new Date().toISOString() },
  
  // 问界
  { id: '33', brand: '问界', model_name: 'M5', year: 2024, energy_type: 'bev', body_type: 'suv', seat_count: 5, price_official: 28.98, price_discount: 26.38, direct_discount: 2.60, region: '全国', effective_date: '2024-01-01', updated_at: new Date().toISOString() },
  { id: '34', brand: '问界', model_name: 'M7', year: 2024, energy_type: 'bev', body_type: 'suv', seat_count: 6, price_official: 32.98, price_discount: 29.98, direct_discount: 3.00, region: '全国', effective_date: '2024-01-01', updated_at: new Date().toISOString() },
  
  // 理想
  { id: '35', brand: '理想', model_name: 'L7', year: 2024, energy_type: 'bev', body_type: 'suv', seat_count: 5, price_official: 33.98, price_discount: 31.48, direct_discount: 2.50, region: '全国', effective_date: '2024-01-01', updated_at: new Date().toISOString() },
  { id: '36', brand: '理想', model_name: 'L9', year: 2024, energy_type: 'bev', body_type: 'suv', seat_count: 6, price_official: 45.98, price_discount: 42.98, direct_discount: 3.00, region: '全国', effective_date: '2024-01-01', updated_at: new Date().toISOString() },
  
  // 理想
  { id: '37', brand: '理想', model_name: 'L8', year: 2024, energy_type: 'bev', body_type: 'suv', seat_count: 6, price_official: 39.98, price_discount: 37.48, direct_discount: 2.50, region: '全国', effective_date: '2024-01-01', updated_at: new Date().toISOString() },
  
  // 小鹏
  { id: '38', brand: '小鹏', model_name: 'G9', year: 2024, energy_type: 'bev', body_type: 'suv', seat_count: 5, price_official: 30.99, price_discount: 28.49, direct_discount: 2.50, loan_subsidy_rate: 0.0199, loan_subsidy_amount: 1.10, replacement_subsidy: 0.65, region: '全国', effective_date: '2024-01-01', updated_at: new Date().toISOString() }
];

module.exports = cars;
