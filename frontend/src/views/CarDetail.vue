<template>
  <div class="detail-page">
    <div class="container">
      <!-- Breadcrumb -->
      <nav class="breadcrumb">
        <router-link to="/" class="breadcrumb-link">首页</router-link>
        <el-icon class="breadcrumb-separator"><ArrowRight /></el-icon>
        <router-link to="/search" class="breadcrumb-link">搜索</router-link>
        <el-icon class="breadcrumb-separator"><ArrowRight /></el-icon>
        <span class="breadcrumb-current">{{ car?.brand }} {{ car?.model_name }}</span>
      </nav>

      <div v-if="car" class="detail-content">
        <!-- Main Info Card -->
        <div class="main-card">
          <div class="car-visual">
            <div class="car-image">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 10L3 16L5 16L7 10H5Z" fill="currentColor"/>
                <path d="M19 10L21 16H19L17 10H19Z" fill="currentColor"/>
                <path d="M7 10H17L16 7C15.5 6 14.5 5 12 5C9.5 5 8.5 6 8 7L7 10Z" fill="currentColor"/>
                <path d="M6 12H18L17 18C16.5 19 15.5 20 12 20C8.5 20 7.5 19 7 18L6 12Z" fill="currentColor"/>
              </svg>
            </div>
            <div class="image-actions">
              <button
                class="action-btn"
                :class="{ active: isFavorite }"
                @click="toggleFavorite"
              >
                <el-icon><Star /></el-icon>
                <span>{{ isFavorite ? '已收藏' : '收藏' }}</span>
              </button>
              <button class="action-btn" @click="handleShare">
                <el-icon><Share /></el-icon>
                <span>分享</span>
              </button>
            </div>
          </div>

          <div class="car-info">
            <div class="info-header">
              <div class="title-tags">
                <span class="tag" :class="`tag-${energyTag.type}`">{{ energyTag.text }}</span>
                <span class="tag tag-gray">{{ car.body_type.toUpperCase() }}</span>
                <span class="tag tag-gray">{{ car.seat_count }}座</span>
              </div>
              <h1 class="car-title">
                {{ car.brand }} {{ car.model_name }}
                <span class="year">{{ car.year }}款</span>
              </h1>
            </div>

            <div class="price-section">
              <div class="price-main">
                <span class="price-label">优惠成交价</span>
                <div class="price-value">
                  <span class="currency">¥</span>
                  <span class="amount">{{ formatPrice(car.price_discount) }}</span>
                  <span class="unit">万</span>
                </div>
              </div>
              <div class="price-sub">
                <div class="original-price">
                  <span class="label">官方指导价</span>
                  <span class="value">¥{{ formatPrice(car.price_official) }}万</span>
                </div>
                <div class="savings">
                  <span class="savings-label">直接优惠</span>
                  <span class="savings-value">¥{{ formatPrice(car.direct_discount) }}万</span>
                </div>
              </div>
            </div>

            <div class="specs-grid">
              <div class="spec-item">
                <span class="spec-label">品牌</span>
                <span class="spec-value">{{ car.brand }}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">车型</span>
                <span class="spec-value">{{ car.model_name }}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">年份</span>
                <span class="spec-value">{{ car.year }}款</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">适用地区</span>
                <span class="spec-value">{{ car.region }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Subsidies Card -->
        <div v-if="hasSubsidies" class="subsidies-card">
          <h3 class="card-title">
            <el-icon><Money /></el-icon>
            优惠政策
          </h3>
          <div class="subsidies-list">
            <div v-if="car.loan_subsidy_amount > 0" class="subsidy-item">
              <div class="subsidy-icon orange">
                <el-icon><Money /></el-icon>
              </div>
              <div class="subsidy-content">
                <span class="subsidy-title">贷款贴息</span>
                <span class="subsidy-value">¥{{ formatPrice(car.loan_subsidy_amount) }}万</span>
                <span class="subsidy-note">年化利率 {{ (car.loan_subsidy_rate || 0) * 100 }}%</span>
              </div>
            </div>
            <div v-if="car.replacement_subsidy > 0" class="subsidy-item">
              <div class="subsidy-icon green">
                <el-icon><RefreshLeft /></el-icon>
              </div>
              <div class="subsidy-content">
                <span class="subsidy-title">置换补贴</span>
                <span class="subsidy-value">¥{{ formatPrice(car.replacement_subsidy) }}万</span>
              </div>
            </div>
            <div v-if="car.insurance_discount > 0" class="subsidy-item">
              <div class="subsidy-icon blue">
                <el-icon><Insurance /></el-icon>
              </div>
              <div class="subsidy-content">
                <span class="subsidy-title">保险优惠</span>
                <span class="subsidy-value">¥{{ formatPrice(car.insurance_discount) }}万</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Gifts Card -->
        <div v-if="car.gift_package && car.gift_package.length > 0" class="gifts-card">
          <h3 class="card-title">
            <el-icon><Present /></el-icon>
            购车赠品
          </h3>
          <div class="gifts-list">
            <div
              v-for="(gift, index) in car.gift_package"
              :key="index"
              class="gift-item"
            >
              <el-icon class="gift-icon"><Present /></el-icon>
              <span class="gift-name">{{ gift.name }}</span>
              <span class="gift-value">估值 ¥{{ formatPrice(gift.estimated_value) }}万</span>
            </div>
          </div>
        </div>

        <!-- Tabs Section -->
        <div class="tabs-card">
          <div class="tabs-header">
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'trend' }"
              @click="activeTab = 'trend'"
            >
              <el-icon><TrendCharts /></el-icon>
              价格趋势
            </button>
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'alert' }"
              @click="activeTab = 'alert'"
            >
              <el-icon><Bell /></el-icon>
              价格提醒
            </button>
          </div>

          <div class="tabs-content">
            <!-- Trend Tab -->
            <div v-if="activeTab === 'trend'" class="tab-panel">
              <div class="trend-controls">
                <span class="control-label">时间范围</span>
                <div class="time-options">
                  <button
                    v-for="days in [7, 30, 90, 180]"
                    :key="days"
                    class="time-btn"
                    :class="{ active: trendDays === days }"
                    @click="trendDays = days; fetchPriceTrend()"
                  >
                    {{ days === 7 ? '7天' : days === 30 ? '30天' : days === 90 ? '3个月' : '半年' }}
                  </button>
                </div>
              </div>
              <PriceTrendChart
                :price-trend="priceTrend"
                :loading="priceLoading"
                :height="350"
              />
            </div>

            <!-- Alert Tab -->
            <div v-if="activeTab === 'alert'" class="tab-panel">
              <div class="alert-setup">
                <div class="alert-header">
                  <div class="alert-icon">
                    <el-icon><Bell /></el-icon>
                  </div>
                  <div class="alert-text">
                    <h4>设置价格提醒</h4>
                    <p>当价格达到您的目标价时，我们会第一时间通知您</p>
                  </div>
                </div>

                <div class="alert-form">
                  <div class="input-group">
                    <span class="input-prefix">¥</span>
                    <input
                      v-model.number="alertPrice"
                      type="number"
                      placeholder="输入目标价格"
                      class="price-input"
                    />
                    <span class="input-suffix">万</span>
                  </div>
                  <button
                    class="submit-btn"
                    :disabled="!alertPrice"
                    @click="handleCreateAlert"
                  >
                    创建提醒
                  </button>
                </div>

                <div class="alert-tip">
                  <el-icon><InfoFilled /></el-icon>
                  <span>当前价格 <strong>¥{{ formatPrice(car.price_discount) }}万</strong>，建议设置低于当前价格的目标价</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="loading-state">
        <el-skeleton :rows="10" animated />
      </div>

      <!-- Not Found -->
      <div v-else class="not-found">
        <el-empty description="车型不存在或已下架">
          <el-button type="primary" @click="router.push('/search')">
            返回搜索
          </el-button>
        </el-empty>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Star,
  Share,
  ArrowRight,
  Money,
  RefreshLeft,
  Present,
  TrendCharts,
  Bell,
  Insurance,
  InfoFilled,
} from '@element-plus/icons-vue';
import { useCarStore, usePriceStore, useAuthStore } from '@/stores';
import PriceTrendChart from '@/components/charts/PriceTrendChart.vue';
import type { Car } from '@/types';
import { ElMessage } from 'element-plus';
import { favoriteApi, priceAlertApi } from '@/api';

const route = useRoute();
const router = useRouter();
const carStore = useCarStore();
const priceStore = usePriceStore();
const authStore = useAuthStore();

const car = ref<Car | null>(null);
const activeTab = ref('trend');
const trendDays = ref(30);
const alertPrice = ref<number | null>(null);
const isFavorite = ref(false);

const loading = computed(() => carStore.loading);
const priceLoading = computed(() => priceStore.loading);
const priceTrend = computed(() => priceStore.priceTrend);
const isAuthenticated = computed(() => authStore.isAuthenticated);

const energyTag = computed(() => {
  const map: Record<string, { type: string; text: string }> = {
    petrol: { type: 'gray', text: '燃油' },
    diesel: { type: 'gray', text: '柴油' },
    hybrid: { type: 'green', text: '混动' },
    phev: { type: 'blue', text: '插混' },
    bev: { type: 'green', text: '纯电' },
    hydrogen: { type: 'orange', text: '氢能' },
  };
  return map[car.value?.energy_type || ''] || { type: 'gray', text: car.value?.energy_type || '' };
});

const hasSubsidies = computed(() => {
  return (car.value?.loan_subsidy_amount && car.value.loan_subsidy_amount > 0) ||
         (car.value?.replacement_subsidy && car.value.replacement_subsidy > 0) ||
         (car.value?.insurance_discount && car.value.insurance_discount > 0);
});

const formatPrice = (price: number) => price.toFixed(2);

const fetchPriceTrend = () => {
  const carId = route.params.id as string;
  if (carId) {
    priceStore.fetchPriceTrend(carId, trendDays.value);
  }
};

const handleCreateAlert = async () => {
  if (!isAuthenticated.value) {
    ElMessage.warning('请先登录');
    router.push('/login');
    return;
  }

  const carId = route.params.id as string;
  if (!carId || !alertPrice.value) return;

  try {
    await priceAlertApi.createAlert(carId, alertPrice.value);
    ElMessage.success('价格提醒已创建');
    alertPrice.value = null;
  } catch (error: any) {
    ElMessage.error(error.message || '创建提醒失败');
  }
};

const checkFavoriteStatus = async () => {
  if (!isAuthenticated.value) return;
  const carId = route.params.id as string;
  try {
    isFavorite.value = await favoriteApi.checkFavorite(carId);
  } catch (error) {
    console.error('检查收藏状态失败:', error);
  }
};

const toggleFavorite = async () => {
  if (!isAuthenticated.value) {
    ElMessage.warning('请先登录');
    router.push('/login');
    return;
  }

  const carId = route.params.id as string;
  try {
    if (isFavorite.value) {
      await favoriteApi.removeFavorite(carId);
      ElMessage.success('已取消收藏');
      isFavorite.value = false;
    } else {
      await favoriteApi.addFavorite(carId);
      ElMessage.success('已添加到收藏');
      isFavorite.value = true;
    }
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败');
  }
};

const handleShare = async () => {
  const shareData = {
    title: `${car.value?.brand} ${car.value?.model_name} - 车价通`,
    text: `查看${car.value?.brand} ${car.value?.model_name}的最新价格和优惠信息`,
    url: window.location.href,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (error) {
      console.error('分享失败:', error);
    }
  } else {
    try {
      await navigator.clipboard.writeText(window.location.href);
      ElMessage.success('链接已复制到剪贴板');
    } catch (error) {
      ElMessage.error('复制失败');
    }
  }
};

onMounted(async () => {
  const carId = route.params.id as string;
  if (carId) {
    const fetchedCar = await carStore.fetchCarById(carId);
    if (fetchedCar) {
      car.value = fetchedCar;
      fetchPriceTrend();
      await checkFavoriteStatus();
    }
  }
});
</script>

<style scoped>
.detail-page {
  padding-top: var(--header-height);
  padding-bottom: var(--space-20);
}

/* Breadcrumb */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-6) 0;
  font-size: var(--text-sm);
}

.breadcrumb-link {
  color: var(--primary-600);
  text-decoration: none;
}

.breadcrumb-link:hover {
  text-decoration: underline;
}

.breadcrumb-separator {
  color: var(--text-tertiary);
  font-size: var(--text-xs);
}

.breadcrumb-current {
  color: var(--text-secondary);
}

/* Main Card */
.main-card {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: var(--space-8);
  background: var(--bg-primary);
  border-radius: var(--radius-2xl);
  padding: var(--space-8);
  margin-bottom: var(--space-6);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

/* Car Visual */
.car-visual {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.car-image {
  aspect-ratio: 4/3;
  background: linear-gradient(135deg, var(--primary-50) 0%, #e0e7ff 100%);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-300);
}

.car-image svg {
  width: 120px;
  height: 120px;
}

.image-actions {
  display: flex;
  gap: var(--space-3);
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.action-btn:hover {
  background: var(--bg-secondary);
  border-color: var(--border-dark);
  color: var(--text-primary);
}

.action-btn.active {
  background: var(--accent-50);
  border-color: var(--accent-200);
  color: var(--accent-700);
}

/* Car Info */
.car-info {
  display: flex;
  flex-direction: column;
}

.info-header {
  margin-bottom: var(--space-6);
}

.title-tags {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.tag-blue {
  background: var(--primary-100);
  color: var(--primary-700);
}

.tag-green {
  background: var(--success-100);
  color: var(--success-600);
}

.tag-orange {
  background: var(--accent-100);
  color: var(--accent-700);
}

.tag-gray {
  background: var(--gray-100);
  color: var(--gray-600);
}

.car-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.year {
  font-size: var(--text-lg);
  font-weight: var(--font-normal);
  color: var(--text-tertiary);
  background: var(--bg-tertiary);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
}

/* Price Section */
.price-section {
  padding: var(--space-6);
  background: var(--bg-tertiary);
  border-radius: var(--radius-xl);
  margin-bottom: var(--space-6);
}

.price-main {
  margin-bottom: var(--space-4);
}

.price-label {
  display: block;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: var(--space-1);
}

.price-value {
  display: flex;
  align-items: flex-start;
  gap: var(--space-1);
  color: var(--error-600);
}

.price-value .currency {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  line-height: 1;
}

.price-value .amount {
  font-size: var(--text-5xl);
  font-weight: var(--font-bold);
  line-height: 1;
  letter-spacing: -0.02em;
}

.price-value .unit {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  line-height: 1.2;
}

.price-sub {
  display: flex;
  gap: var(--space-6);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border-light);
}

.original-price,
.savings {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.original-price .label,
.savings-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.original-price .value {
  font-size: var(--text-base);
  color: var(--text-tertiary);
  text-decoration: line-through;
}

.savings-value {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--success-600);
}

/* Specs Grid */
.specs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
}

.spec-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.spec-label {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

.spec-value {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

/* Subsidies Card */
.subsidies-card,
.gifts-card,
.tabs-card {
  background: var(--bg-primary);
  border-radius: var(--radius-2xl);
  padding: var(--space-6);
  margin-bottom: var(--space-6);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

.card-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-5);
}

.subsidies-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-4);
}

.subsidy-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
}

.subsidy-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.subsidy-icon.orange {
  background: linear-gradient(135deg, var(--accent-400) 0%, var(--accent-500) 100%);
}

.subsidy-icon.green {
  background: linear-gradient(135deg, var(--success-400) 0%, var(--success-500) 100%);
}

.subsidy-icon.blue {
  background: linear-gradient(135deg, var(--primary-400) 0%, var(--primary-500) 100%);
}

.subsidy-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.subsidy-title {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.subsidy-value {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.subsidy-note {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

/* Gifts Card */
.gifts-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.gift-item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%);
  border: 1px solid #f5d0fe;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  color: #a21caf;
}

.gift-icon {
  color: #c026d3;
}

.gift-name {
  font-weight: var(--font-medium);
}

.gift-value {
  font-size: var(--text-xs);
  color: #c026d3;
}

/* Tabs Card */
.tabs-header {
  display: flex;
  gap: var(--space-1);
  border-bottom: 1px solid var(--border-light);
  margin-bottom: var(--space-6);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-6);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.tab-btn:hover {
  color: var(--text-primary);
}

.tab-btn.active {
  color: var(--primary-600);
  border-bottom-color: var(--primary-600);
}

/* Trend Controls */
.trend-controls {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.control-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
}

.time-options {
  display: flex;
  gap: var(--space-2);
}

.time-btn {
  padding: var(--space-2) var(--space-4);
  background: transparent;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.time-btn:hover {
  border-color: var(--primary-300);
  color: var(--primary-600);
}

.time-btn.active {
  background: var(--primary-600);
  border-color: var(--primary-600);
  color: white;
}

/* Alert Setup */
.alert-setup {
  max-width: 600px;
  margin: 0 auto;
}

.alert-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.alert-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: var(--text-2xl);
}

.alert-text h4 {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}

.alert-text p {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0;
}

.alert-form {
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.input-group {
  flex: 1;
  display: flex;
  align-items: center;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: var(--space-1) var(--space-4);
}

.input-prefix,
.input-suffix {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-secondary);
}

.price-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: var(--space-3) var(--space-2);
  font-size: var(--text-lg);
  font-family: inherit;
  color: var(--text-primary);
  outline: none;
  text-align: center;
}

.submit-btn {
  padding: var(--space-4) var(--space-8);
  background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(79, 92, 232, 0.4);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.alert-tip {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4);
  background: var(--primary-50);
  border: 1px solid var(--primary-200);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  color: var(--primary-700);
}

.alert-tip strong {
  color: var(--primary-800);
}

/* Loading & Not Found */
.loading-state,
.not-found {
  padding: var(--space-16) 0;
}

/* Responsive */
@media (max-width: 992px) {
  .main-card {
    grid-template-columns: 1fr;
  }
  
  .car-visual {
    max-width: 400px;
    margin: 0 auto;
  }
  
  .price-value .amount {
    font-size: var(--text-4xl);
  }
  
  .alert-form {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .main-card,
  .subsidies-card,
  .gifts-card,
  .tabs-card {
    padding: var(--space-4);
  }
  
  .car-title {
    font-size: var(--text-2xl);
    flex-direction: column;
    align-items: flex-start;
  }
  
  .price-sub {
    flex-direction: column;
    gap: var(--space-3);
  }
  
  .specs-grid {
    grid-template-columns: 1fr;
  }
  
  .subsidies-list {
    grid-template-columns: 1fr;
  }
  
  .tabs-header {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .tab-btn {
    white-space: nowrap;
  }
}
</style>
