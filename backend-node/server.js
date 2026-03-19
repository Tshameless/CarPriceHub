// ── CarPriceHub Node.js Backend Server ───────────────────────────
const express = require('express');
const cors = require('cors');
const cars = require('./cars-data');
const { recommendCars } = require('./recommend');

const app = express();
const PORT = 8080;

// 中间件
app.use(cors());
app.use(express.json());

// 日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'carpricehub-backend-node',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 搜索车型
app.post('/api/v1/cars/search', (req, res) => {
  try {
    const {
      keyword,
      budget_min,
      budget_max,
      energy_type,
      body_type,
      seat_count_min,
      page = 1,
      page_size = 10
    } = req.body;
    
    let filteredCars = [...cars];
    
    // 关键词搜索
    if (keyword) {
      const kw = keyword.toLowerCase();
      filteredCars = filteredCars.filter(car => 
        car.brand.toLowerCase().includes(kw) ||
        car.model_name.toLowerCase().includes(kw)
      );
    }
    
    // 价格范围
    if (budget_min !== undefined) {
      filteredCars = filteredCars.filter(car => car.price_discount >= budget_min);
    }
    if (budget_max !== undefined) {
      filteredCars = filteredCars.filter(car => car.price_discount <= budget_max);
    }
    
    // 能源类型
    if (energy_type) {
      filteredCars = filteredCars.filter(car => car.energy_type === energy_type);
    }
    
    // 车身类型
    if (body_type) {
      filteredCars = filteredCars.filter(car => car.body_type === body_type);
    }
    
    // 座位数
    if (seat_count_min !== undefined) {
      filteredCars = filteredCars.filter(car => car.seat_count >= seat_count_min);
    }
    
    // 排序(按优惠力度降序)
    filteredCars.sort((a, b) => b.direct_discount - a.direct_discount);
    
    // 分页
    const total = filteredCars.length;
    const startIndex = (page - 1) * page_size;
    const paginatedCars = filteredCars.slice(startIndex, startIndex + page_size);
    
    res.json({
      cars: paginatedCars,
      total,
      page,
      page_size
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取车型详情
app.get('/api/v1/cars/:id/price-detail', (req, res) => {
  try {
    const { id } = req.params;
    const car = cars.find(c => c.id === id);
    
    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }
    
    res.json(car);
  } catch (error) {
    console.error('Get detail error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 智能推荐
app.post('/api/v1/recommend', (req, res) => {
  try {
    const startTime = Date.now();
    const { profile, budget_min, budget_max } = req.body;
    
    if (!profile) {
      return res.status(400).json({ error: 'Profile is required' });
    }
    
    const recommendations = recommendCars(cars, profile, budget_min, budget_max);
    
    const processingTime = Date.now() - startTime;
    
    res.json({
      recommendations,
      total_cars_considered: cars.length,
      processing_time_ms: processingTime
    });
  } catch (error) {
    console.error('Recommend error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// WebSocket 占位(实际项目中需要使用 ws 或 socket.io)
app.get('/ws', (req, res) => {
  res.json({
    message: 'WebSocket endpoint - Use ws://localhost:8080 for real-time updates',
    status: 'placeholder'
  });
});

// 统计信息
app.get('/api/v1/stats', (req, res) => {
  const brands = [...new Set(cars.map(c => c.brand))];
  const energyTypes = [...new Set(cars.map(c => c.energy_type))];
  const bodyTypes = [...new Set(cars.map(c => c.body_type))];
  
  const avgDiscount = cars.reduce((sum, c) => sum + c.direct_discount, 0) / cars.length;
  const avgPrice = cars.reduce((sum, c) => sum + c.price_discount, 0) / cars.length;
  
  res.json({
    total_cars: cars.length,
    brands: brands.length,
    brand_list: brands,
    energy_types: energyTypes,
    body_types: bodyTypes,
    avg_discount: Math.round(avgDiscount * 100) / 100,
    avg_price: Math.round(avgPrice * 100) / 100
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚗 CarPriceHub Backend running on http://localhost:${PORT}`);
  console.log(`📊 Loaded ${cars.length} car models`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📖 API endpoints:`);
  console.log(`   POST /api/v1/cars/search - 搜索车型`);
  console.log(`   GET  /api/v1/cars/:id/price-detail - 获取详情`);
  console.log(`   POST /api/v1/recommend - 智能推荐`);
  console.log(`   GET  /api/v1/stats - 统计信息`);
});
