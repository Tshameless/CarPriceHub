<template>
  <div class="home-page">
    <!-- Hero Section -->
    <div class="hero-section">
      <h1 class="hero-title">车价通 CarPriceHub</h1>
      <p class="hero-subtitle">让每位购车用户在 30 秒内找到最优购车方案</p>
      <el-input
        v-model="searchKeyword"
        size="large"
        placeholder="搜索车型、品牌..."
        class="hero-search"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </template>
      </el-input>
    </div>

    <!-- Stats -->
    <el-row :gutter="24" class="stats-section">
      <el-col :xs="12" :sm="6">
        <el-card>
          <el-statistic title="覆盖车型" :value="500" suffix="+" value-style="{ color: '#409EFF' }" />
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card>
          <el-statistic title="实时价格" :value="24" suffix="h" value-style="{ color: '#67C23A' }" />
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card>
          <el-statistic title="数据准确率" :value="98" suffix="%" value-style="{ color: '#E6A23C' }" />
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card>
          <el-statistic title="推荐满意度" :value="92" suffix="%" value-style="{ color: '#F56C6C' }" />
        </el-card>
      </el-col>
    </el-row>

    <!-- Quick Actions -->
    <el-row :gutter="16" class="actions-section">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="action-card" @click="router.push('/search')">
          <div class="action-content">
            <el-icon :size="48" color="#409EFF"><Search /></el-icon>
            <h3>价格查询</h3>
            <p>实时优惠价、贷款政策</p>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="action-card" @click="router.push('/recommend')">
          <div class="action-content">
            <el-icon :size="48" color="#E6A23C"><Opportunity /></el-icon>
            <h3>智能推荐</h3>
            <p>根据你的情况推荐最优车型</p>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="action-card" @click="router.push('/compare')">
          <div class="action-content">
            <el-icon :size="48" color="#67C23A"><TrendCharts /></el-icon>
            <h3>多车对比</h3>
            <p>价格、配置、优惠横向对比</p>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="action-card" @click="router.push('/profile')">
          <div class="action-content">
            <el-icon :size="48" color="#F56C6C"><StarFilled /></el-icon>
            <h3>热门榜单</h3>
            <p>最佳优惠、即将涨价</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Featured Cars -->
    <div class="featured-section">
      <h2 class="section-title">🔥 本周热门车型</h2>
      <el-row :gutter="24" v-loading="loading">
        <el-col
          :xs="24"
          :sm="12"
          :md="6"
          v-for="car in featuredCars"
          :key="car.id"
        >
          <CarCard :car="car" />
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Search, Opportunity, TrendCharts, StarFilled } from '@element-plus/icons-vue';
import { useCarStore } from '@/stores';
import CarCard from '@/components/CarCard.vue';

const router = useRouter();
const carStore = useCarStore();

const searchKeyword = ref('');
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
  padding: 0 24px 24px;
}

.hero-section {
  background: linear-gradient(135deg, #409eff 0%, #3a8ee6 100%);
  border-radius: 12px;
  padding: 48px 24px;
  text-align: center;
  margin-bottom: 32px;
  color: #fff;
}

.hero-title {
  font-size: 48px;
  margin-bottom: 16px;
  color: #fff;
}

.hero-subtitle {
  font-size: 20px;
  margin-bottom: 32px;
  opacity: 0.9;
}

.hero-search {
  max-width: 600px;
  margin: 0 auto;
}

.stats-section {
  margin-bottom: 32px;
}

.actions-section {
  margin-bottom: 32px;
}

.action-card {
  cursor: pointer;
  text-align: center;
  padding: 24px;
  transition: transform 0.2s;
}

.action-card:hover {
  transform: translateY(-4px);
}

.action-content h3 {
  margin: 16px 0 8px;
  font-size: 18px;
}

.action-content p {
  color: #666;
  margin: 0;
}

.featured-section {
  margin-bottom: 24px;
}

.section-title {
  margin-bottom: 24px;
  font-size: 24px;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 32px;
  }

  .hero-subtitle {
    font-size: 16px;
  }
}
</style>
