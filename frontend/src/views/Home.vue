<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-bg">
        <div class="gradient-orb orb-1"></div>
        <div class="gradient-orb orb-2"></div>
        <div class="gradient-orb orb-3"></div>
      </div>
      
      <div class="container">
        <div class="hero-content">
          <div class="hero-badge">
            <span class="badge-dot"></span>
            智能购车助手
          </div>
          
          <h1 class="hero-title">
            找到最适合你的
            <span class="gradient-text">理想座驾</span>
          </h1>
          
          <p class="hero-desc">
            汇聚全网实时车价，AI 智能推荐，让购车决策更简单
          </p>
          
          <!-- Search Box -->
          <div class="hero-search">
            <div class="search-box">
              <el-icon class="search-icon"><Search /></el-icon>
              <input
                v-model="searchKeyword"
                type="text"
                placeholder="搜索车型、品牌，如：比亚迪 秦..."
                class="search-input"
                @keyup.enter="handleSearch"
              />
              <button class="search-btn" @click="handleSearch">
                <span>搜索</span>
                <el-icon><ArrowRight /></el-icon>
              </button>
            </div>
            
            <div class="hot-tags">
              <span class="tags-label">热门：</span>
              <button
                v-for="tag in hotTags"
                :key="tag"
                class="tag-btn"
                @click="searchKeyword = tag; handleSearch()"
              >
                {{ tag }}
              </button>
            </div>
          </div>
          
          <!-- Stats -->
          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-value">500+</span>
              <span class="stat-label">车型数据</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-value">24h</span>
              <span class="stat-label">实时更新</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-value">98%</span>
              <span class="stat-label">准确率</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-value">10万+</span>
              <span class="stat-label">服务用户</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">快速开始</h2>
          <p class="section-subtitle">选择适合你的购车方式</p>
        </div>
        
        <div class="features-grid">
          <div class="feature-card" @click="router.push('/search')">
            <div class="feature-icon blue">
              <el-icon :size="28"><Search /></el-icon>
            </div>
            <h3 class="feature-title">价格查询</h3>
            <p class="feature-desc">全网实时车价，优惠信息一目了然</p>
            <div class="feature-arrow">
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
          
          <div class="feature-card" @click="router.push('/recommend')">
            <div class="feature-icon orange">
              <el-icon :size="28"><MagicStick /></el-icon>
            </div>
            <h3 class="feature-title">智能推荐</h3>
            <p class="feature-desc">AI 分析需求，精准推荐适合车型</p>
            <div class="feature-arrow">
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
          
          <div class="feature-card" @click="router.push('/compare')">
            <div class="feature-icon green">
              <el-icon :size="28"><ScaleToOriginal /></el-icon>
            </div>
            <h3 class="feature-title">车型对比</h3>
            <p class="feature-desc">多维度横向对比，选出最优方案</p>
            <div class="feature-arrow">
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
          
          <div class="feature-card" @click="router.push('/profile')">
            <div class="feature-icon purple">
              <el-icon :size="28"><Star /></el-icon>
            </div>
            <h3 class="feature-title">我的收藏</h3>
            <p class="feature-desc">收藏心仪车型，设置价格提醒</p>
            <div class="feature-arrow">
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Cars Section -->
    <section class="cars-section">
      <div class="container">
        <div class="section-header row">
          <div>
            <h2 class="section-title">热门车型</h2>
            <p class="section-subtitle">本周最受关注的高性价比车型</p>
          </div>
          <router-link to="/search" class="view-all">
            查看全部
            <el-icon><ArrowRight /></el-icon>
          </router-link>
        </div>
        
        <div class="cars-grid" v-loading="loading">
          <CarCard
            v-for="car in featuredCars"
            :key="car.id"
            :car="car"
          />
        </div>
      </div>
    </section>

    <!-- Why Choose Us -->
    <section class="why-section">
      <div class="container">
        <div class="section-header center">
          <h2 class="section-title">为什么选择我们</h2>
          <p class="section-subtitle">专业、全面、智能的汽车服务平台</p>
        </div>
        
        <div class="why-grid">
          <div class="why-item">
            <div class="why-icon">
              <el-icon :size="32"><DataAnalysis /></el-icon>
            </div>
            <h3>实时数据</h3>
            <p>全网价格实时监控，第一时间掌握优惠信息</p>
          </div>
          
          <div class="why-item">
            <div class="why-icon">
              <el-icon :size="32"><Cpu /></el-icon>
            </div>
            <h3>智能推荐</h3>
            <p>AI 算法深度分析，精准匹配你的需求</p>
          </div>
          
          <div class="why-item">
            <div class="why-icon">
              <el-icon :size="32"><Money /></el-icon>
            </div>
            <h3>省钱助手</h3>
            <p>汇总所有优惠政策，帮你找到最划算方案</p>
          </div>
          
          <div class="why-item">
            <div class="why-icon">
              <el-icon :size="32"><Bell /></el-icon>
            </div>
            <h3>价格提醒</h3>
            <p>设置目标价格，降价第一时间通知你</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-card">
          <div class="cta-content">
            <h2>准备好找到你的理想座驾了吗？</h2>
            <p>立即开始搜索，发现更多惊喜优惠</p>
            <div class="cta-actions">
              <el-button type="primary" size="large" @click="router.push('/search')">
                开始搜索
                <el-icon class="el-icon--right"><ArrowRight /></el-icon>
              </el-button>
              <el-button size="large" @click="router.push('/recommend')">
                智能推荐
              </el-button>
            </div>
          </div>
          <div class="cta-decoration">
            <div class="decoration-circle"></div>
            <div class="decoration-circle"></div>
            <div class="decoration-circle"></div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  Search,
  ArrowRight,
  MagicStick,
  ScaleToOriginal,
  Star,
  DataAnalysis,
  Cpu,
  Money,
  Bell,
} from '@element-plus/icons-vue';
import { useCarStore } from '@/stores';
import CarCard from '@/components/CarCard.vue';

const router = useRouter();
const carStore = useCarStore();

const searchKeyword = ref('');
const hotTags = ['比亚迪', '特斯拉', 'SUV', '20万以下', '新能源车', '混动'];

const { featuredCars, loading, fetchFeaturedCars } = carStore;

onMounted(() => {
  fetchFeaturedCars();
});

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push(`/search?keyword=${encodeURIComponent(searchKeyword.value.trim())}`);
  }
};
</script>

<style scoped>
.home-page {
  padding-top: var(--header-height);
}

/* Hero Section */
.hero {
  position: relative;
  padding: var(--space-20) 0;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
}

.orb-1 {
  width: 600px;
  height: 600px;
  background: linear-gradient(135deg, var(--primary-400), var(--primary-600));
  top: -200px;
  right: -100px;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, var(--accent-400), var(--accent-500));
  bottom: -100px;
  left: -100px;
  opacity: 0.3;
}

.orb-3 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  top: 50%;
  left: 30%;
  opacity: 0.2;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--primary-50);
  border: 1px solid var(--primary-200);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--primary-700);
  margin-bottom: var(--space-6);
}

.badge-dot {
  width: 8px;
  height: 8px;
  background: var(--primary-500);
  border-radius: var(--radius-full);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.hero-title {
  font-size: var(--text-6xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  color: var(--text-primary);
  margin-bottom: var(--space-6);
  letter-spacing: -0.03em;
}

.gradient-text {
  background: linear-gradient(135deg, var(--primary-600) 0%, var(--accent-500) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-desc {
  font-size: var(--text-xl);
  color: var(--text-secondary);
  margin-bottom: var(--space-10);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* Search Box */
.hero-search {
  max-width: 640px;
  margin: 0 auto var(--space-10);
}

.search-box {
  display: flex;
  align-items: center;
  background: var(--bg-primary);
  border-radius: var(--radius-2xl);
  padding: var(--space-2);
  box-shadow: var(--shadow-xl), 0 0 0 1px var(--border-light);
  transition: box-shadow var(--duration-normal);
}

.search-box:focus-within {
  box-shadow: var(--shadow-xl), 0 0 0 2px var(--primary-300);
}

.search-icon {
  margin-left: var(--space-4);
  color: var(--text-tertiary);
  font-size: var(--text-xl);
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: var(--space-4) var(--space-4);
  font-size: var(--text-lg);
  font-family: inherit;
  color: var(--text-primary);
  outline: none;
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.search-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-6);
  background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%);
  color: white;
  border: none;
  border-radius: var(--radius-xl);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.search-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(79, 92, 232, 0.4);
}

.hot-tags {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  margin-top: var(--space-4);
  flex-wrap: wrap;
}

.tags-label {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

.tag-btn {
  padding: var(--space-2) var(--space-3);
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.tag-btn:hover {
  border-color: var(--primary-300);
  color: var(--primary-600);
}

/* Hero Stats */
.hero-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-8);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}

.stat-value {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--border-light);
}

/* Section Common */
.section-header {
  margin-bottom: var(--space-10);
}

.section-header.center {
  text-align: center;
}

.section-header.row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.section-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
  letter-spacing: -0.02em;
}

.section-subtitle {
  font-size: var(--text-lg);
  color: var(--text-secondary);
  margin: 0;
}

.view-all {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--primary-600);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  text-decoration: none;
  transition: color var(--duration-fast);
}

.view-all:hover {
  color: var(--primary-700);
}

/* Features Section */
.features-section {
  padding: var(--space-20) 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-6);
}

.feature-card {
  background: var(--bg-primary);
  border-radius: var(--radius-2xl);
  padding: var(--space-8);
  text-align: center;
  cursor: pointer;
  transition: all var(--duration-normal);
  border: 1px solid var(--border-light);
  position: relative;
  overflow: hidden;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
  border-color: var(--primary-200);
}

.feature-icon {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-5);
  color: white;
}

.feature-icon.blue {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.feature-icon.orange {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.feature-icon.green {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.feature-icon.purple {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.feature-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.feature-desc {
  font-size: var(--text-base);
  color: var(--text-secondary);
  margin-bottom: var(--space-5);
  line-height: var(--leading-relaxed);
}

.feature-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  color: var(--text-tertiary);
  transition: all var(--duration-fast);
}

.feature-card:hover .feature-arrow {
  background: var(--primary-600);
  color: white;
}

/* Cars Section */
.cars-section {
  padding: var(--space-20) 0;
  background: var(--bg-tertiary);
}

.cars-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-6);
}

/* Why Section */
.why-section {
  padding: var(--space-20) 0;
}

.why-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-8);
}

.why-item {
  text-align: center;
}

.why-icon {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-2xl);
  background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-5);
  color: white;
  font-size: var(--text-2xl);
  box-shadow: 0 20px 40px -10px rgba(79, 92, 232, 0.4);
}

.why-item h3 {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.why-item p {
  font-size: var(--text-base);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
  margin: 0;
}

/* CTA Section */
.cta-section {
  padding: var(--space-20) 0;
}

.cta-card {
  position: relative;
  background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%);
  border-radius: var(--radius-2xl);
  padding: var(--space-16);
  overflow: hidden;
  text-align: center;
}

.cta-content {
  position: relative;
  z-index: 1;
}

.cta-content h2 {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  color: white;
  margin-bottom: var(--space-4);
}

.cta-content p {
  font-size: var(--text-xl);
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: var(--space-8);
}

.cta-actions {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
}

.cta-decoration {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.decoration-circle:nth-child(1) {
  width: 400px;
  height: 400px;
  top: -200px;
  right: -100px;
}

.decoration-circle:nth-child(2) {
  width: 300px;
  height: 300px;
  bottom: -150px;
  left: -50px;
}

.decoration-circle:nth-child(3) {
  width: 200px;
  height: 200px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* Responsive */
@media (max-width: 1200px) {
  .features-grid,
  .cars-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .why-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero {
    padding: var(--space-16) 0;
  }
  
  .hero-title {
    font-size: var(--text-4xl);
  }
  
  .hero-desc {
    font-size: var(--text-lg);
  }
  
  .search-box {
    flex-direction: column;
    padding: var(--space-3);
  }
  
  .search-input {
    width: 100%;
    text-align: center;
  }
  
  .search-btn {
    width: 100%;
    justify-content: center;
  }
  
  .hero-stats {
    flex-wrap: wrap;
    gap: var(--space-6);
  }
  
  .stat-divider {
    display: none;
  }
  
  .features-grid,
  .cars-grid,
  .why-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header.row {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-4);
  }
  
  .cta-content h2 {
    font-size: var(--text-2xl);
  }
  
  .cta-actions {
    flex-direction: column;
  }
}
</style>
