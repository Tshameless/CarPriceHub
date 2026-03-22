<template>
  <div class="profile-page">
    <div class="container">
      <!-- Header -->
      <div class="page-header">
        <nav class="breadcrumb">
          <router-link to="/" class="breadcrumb-link">首页</router-link>
          <el-icon class="breadcrumb-separator"><ArrowRight /></el-icon>
          <span class="breadcrumb-current">个人中心</span>
        </nav>
        <h1 class="page-title">个人中心</h1>
      </div>

      <!-- User Card -->
      <div class="user-card">
        <div class="user-avatar">
          <div class="avatar-fallback">
            {{ user?.username?.charAt(0).toUpperCase() }}
          </div>
        </div>
        <div class="user-info">
          <h2 class="user-name">{{ user?.username }}</h2>
          <p class="user-email">{{ user?.email }}</p>
        </div>
        <button class="logout-btn" @click="handleLogout">
          <el-icon><SwitchButton /></el-icon>
          退出登录
        </button>
      </div>

      <!-- Tabs -->
      <div class="content-card">
        <div class="tabs-header">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'favorites' }"
            @click="activeTab = 'favorites'"
          >
            <el-icon><Star /></el-icon>
            我的收藏
            <span v-if="favorites.length > 0" class="tab-badge">{{ favorites.length }}</span>
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'alerts' }"
            @click="activeTab = 'alerts'"
          >
            <el-icon><Bell /></el-icon>
            价格提醒
            <span v-if="alerts.length > 0" class="tab-badge">{{ alerts.length }}</span>
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'history' }"
            @click="activeTab = 'history'"
          >
            <el-icon><Clock /></el-icon>
            查询历史
          </button>
        </div>

        <div class="tabs-content">
          <!-- Favorites Tab -->
          <div v-if="activeTab === 'favorites'" class="tab-panel">
            <div v-if="favorites.length > 0" class="items-grid">
              <div
                v-for="item in favorites"
                :key="item.id"
                class="favorite-item"
                @click="viewCarDetail(item.car_id)"
              >
                <div class="item-image">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 10L3 16L5 16L7 10H5Z" fill="currentColor"/>
                    <path d="M19 10L21 16H19L17 10H19Z" fill="currentColor"/>
                    <path d="M7 10H17L16 7C15.5 6 14.5 5 12 5C9.5 5 8.5 6 8 7L7 10Z" fill="currentColor"/>
                    <path d="M6 12H18L17 18C16.5 19 15.5 20 12 20C8.5 20 7.5 19 7 18L6 12Z" fill="currentColor"/>
                  </svg>
                </div>
                <div class="item-content">
                  <h4 class="item-title">{{ item.brand }} {{ item.model_name }}</h4>
                  <p class="item-price">
                    <span class="price-label">优惠价</span>
                    <span class="price-value">¥{{ formatPrice(item.price_discount) }}万</span>
                  </p>
                </div>
                <button
                  class="remove-btn"
                  @click.stop="removeFavorite(item.car_id)"
                >
                  <el-icon><Delete /></el-icon>
                </button>
              </div>
            </div>
            <div v-else class="empty-state">
              <div class="empty-icon">
                <el-icon :size="48"><Star /></el-icon>
              </div>
              <h3>暂无收藏车型</h3>
              <p>收藏你感兴趣的车型，方便随时查看</p>
              <router-link to="/search" class="empty-action">
                去搜索车型
              </router-link>
            </div>
          </div>

          <!-- Alerts Tab -->
          <div v-if="activeTab === 'alerts'" class="tab-panel">
            <div v-if="alerts.length > 0" class="items-list">
              <div
                v-for="item in alerts"
                :key="item.id"
                class="alert-item"
              >
                <div class="alert-status" :class="item.status">
                  <el-icon v-if="item.status === 'active'"><Bell /></el-icon>
                  <el-icon v-else-if="item.status === 'triggered'"><CircleCheck /></el-icon>
                  <el-icon v-else><CircleClose /></el-icon>
                </div>
                <div class="alert-content">
                  <h4 class="alert-title">{{ item.carName }}</h4>
                  <p class="alert-target">
                    目标价: <strong>¥{{ item.targetPrice }}万</strong>
                  </p>
                  <p class="alert-date">创建于 {{ formatDate(item.created_at) }}</p>
                </div>
                <button class="remove-btn" @click="removeAlert(item.id)">
                  <el-icon><Delete /></el-icon>
                </button>
              </div>
            </div>
            <div v-else class="empty-state">
              <div class="empty-icon">
                <el-icon :size="48"><Bell /></el-icon>
              </div>
              <h3>暂无价格提醒</h3>
              <p>设置价格提醒，降价时第一时间通知你</p>
              <router-link to="/search" class="empty-action">
                去设置提醒
              </router-link>
            </div>
          </div>

          <!-- History Tab -->
          <div v-if="activeTab === 'history'" class="tab-panel">
            <div v-if="history.length > 0" class="history-list">
              <div
                v-for="item in history"
                :key="item.id"
                class="history-item"
                @click="reSearch(item.keyword)"
              >
                <div class="history-icon">
                  <el-icon><Search /></el-icon>
                </div>
                <div class="history-content">
                  <h4 class="history-keyword">{{ item.keyword || '全部车型' }}</h4>
                  <p class="history-meta">
                    <span>{{ item.result_count }} 个结果</span>
                    <span>·</span>
                    <span>{{ formatDate(item.timestamp) }}</span>
                  </p>
                </div>
                <el-icon class="history-arrow"><ArrowRight /></el-icon>
              </div>
              <button class="clear-history" @click="clearAllHistory">
                <el-icon><Delete /></el-icon>
                清空历史记录
              </button>
            </div>
            <div v-else class="empty-state">
              <div class="empty-icon">
                <el-icon :size="48"><Clock /></el-icon>
              </div>
              <h3>暂无查询历史</h3>
              <p>你的搜索记录会显示在这里</p>
              <router-link to="/search" class="empty-action">
                去搜索车型
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  ArrowRight,
  Star,
  Bell,
  Clock,
  SwitchButton,
  Delete,
  Search,
  CircleCheck,
  CircleClose,
} from '@element-plus/icons-vue';
import { useAuthStore } from '@/stores';
import { favoriteApi, priceAlertApi, searchHistoryApi } from '@/api';
import type { Favorite, PriceAlert, SearchHistory } from '@/api/user';

const router = useRouter();
const authStore = useAuthStore();

const activeTab = ref('favorites');
const favorites = ref<Favorite[]>([]);
const alerts = ref<PriceAlert[]>([]);
const history = ref<SearchHistory[]>([]);

const user = authStore.user;

const formatPrice = (price: number) => price.toFixed(2);

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const fetchFavorites = async () => {
  try {
    favorites.value = await favoriteApi.getFavorites();
  } catch (error) {
    console.error('获取收藏失败:', error);
  }
};

const fetchAlerts = async () => {
  try {
    alerts.value = await priceAlertApi.getAlerts();
  } catch (error) {
    console.error('获取价格提醒失败:', error);
  }
};

const fetchHistory = async () => {
  try {
    history.value = await searchHistoryApi.getHistory();
  } catch (error) {
    console.error('获取历史记录失败:', error);
  }
};

const viewCarDetail = (carId: string) => {
  router.push(`/car/${carId}`);
};

const removeFavorite = async (carId: string) => {
  try {
    await ElMessageBox.confirm('确定要取消收藏该车型吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await favoriteApi.removeFavorite(carId);
    ElMessage.success('已取消收藏');
    await fetchFavorites();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败');
    }
  }
};

const removeAlert = async (alertId: string) => {
  try {
    await ElMessageBox.confirm('确定要删除该价格提醒吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await priceAlertApi.removeAlert(alertId);
    ElMessage.success('已删除提醒');
    await fetchAlerts();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败');
    }
  }
};

const reSearch = (keyword?: string) => {
  if (keyword) {
    router.push(`/search?keyword=${encodeURIComponent(keyword)}`);
  } else {
    router.push('/search');
  }
};

const clearAllHistory = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有查询历史吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await searchHistoryApi.clearHistory();
    ElMessage.success('已清空历史');
    await fetchHistory();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败');
    }
  }
};

const handleLogout = () => {
  authStore.logout();
  ElMessage.success('已退出登录');
  router.push('/');
};

onMounted(() => {
  fetchFavorites();
  fetchAlerts();
  fetchHistory();
});
</script>

<style scoped>
.profile-page {
  padding-top: var(--header-height);
  padding-bottom: var(--space-20);
}

/* Page Header */
.page-header {
  padding: var(--space-8) 0;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
  font-size: var(--text-sm);
}

.breadcrumb-link {
  color: var(--primary-600);
  text-decoration: none;
}

.breadcrumb-separator {
  color: var(--text-tertiary);
  font-size: var(--text-xs);
}

.breadcrumb-current {
  color: var(--text-secondary);
}

.page-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

/* User Card */
.user-card {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%);
  border-radius: var(--radius-2xl);
  padding: var(--space-6);
  margin-bottom: var(--space-6);
  color: white;
}

.user-avatar {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  flex-shrink: 0;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  margin-bottom: var(--space-1);
}

.user-email {
  font-size: var(--text-base);
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-lg);
  color: white;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

/* Content Card */
.content-card {
  background: var(--bg-primary);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  overflow: hidden;
}

/* Tabs Header */
.tabs-header {
  display: flex;
  border-bottom: 1px solid var(--border-light);
  padding: 0 var(--space-4);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-5);
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

.tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 var(--space-1);
  background: var(--error-500);
  color: white;
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  border-radius: var(--radius-full);
}

/* Tabs Content */
.tabs-content {
  padding: var(--space-6);
}

.tab-panel {
  min-height: 400px;
}

/* Items Grid */
.items-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}

.favorite-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--bg-tertiary);
  border-radius: var(--radius-xl);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.favorite-item:hover {
  background: var(--bg-secondary);
}

.item-image {
  width: 80px;
  height: 60px;
  background: linear-gradient(135deg, var(--primary-100) 0%, var(--primary-200) 100%);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-400);
  flex-shrink: 0;
}

.item-image svg {
  width: 32px;
  height: 32px;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-price {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
}

.price-label {
  color: var(--text-tertiary);
}

.price-value {
  font-weight: var(--font-bold);
  color: var(--error-600);
}

.remove-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: all var(--duration-fast);
}

.remove-btn:hover {
  background: var(--error-50);
  color: var(--error-600);
}

/* Items List */
.items-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.alert-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--bg-tertiary);
  border-radius: var(--radius-xl);
}

.alert-status {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.alert-status.active {
  background: var(--primary-100);
  color: var(--primary-600);
}

.alert-status.triggered {
  background: var(--success-100);
  color: var(--success-600);
}

.alert-status.cancelled {
  background: var(--gray-100);
  color: var(--gray-500);
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}

.alert-target {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: var(--space-1);
}

.alert-target strong {
  color: var(--primary-600);
}

.alert-date {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  margin: 0;
}

/* History List */
.history-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.history-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--bg-tertiary);
  border-radius: var(--radius-xl);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.history-item:hover {
  background: var(--bg-secondary);
}

.history-icon {
  width: 44px;
  height: 44px;
  background: var(--primary-100);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-600);
  flex-shrink: 0;
}

.history-content {
  flex: 1;
}

.history-keyword {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}

.history-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin: 0;
}

.history-arrow {
  color: var(--text-tertiary);
}

.clear-history {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-4);
  background: transparent;
  border: 1px dashed var(--border-medium);
  border-radius: var(--radius-xl);
  color: var(--text-tertiary);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--duration-fast);
  margin-top: var(--space-2);
}

.clear-history:hover {
  border-color: var(--error-300);
  color: var(--error-600);
  background: var(--error-50);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-16) 0;
  text-align: center;
}

.empty-icon {
  color: var(--text-tertiary);
  margin-bottom: var(--space-4);
}

.empty-state h3 {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.empty-state p {
  font-size: var(--text-base);
  color: var(--text-secondary);
  margin-bottom: var(--space-6);
}

.empty-action {
  display: inline-flex;
  align-items: center;
  padding: var(--space-3) var(--space-6);
  background: var(--primary-600);
  color: white;
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  text-decoration: none;
  transition: all var(--duration-fast);
}

.empty-action:hover {
  background: var(--primary-700);
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 992px) {
  .items-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .user-card {
    flex-direction: column;
    text-align: center;
  }
  
  .tabs-header {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .tab-btn {
    white-space: nowrap;
  }
  
  .items-grid {
    grid-template-columns: 1fr;
  }
  
  .favorite-item {
    flex-direction: column;
    text-align: center;
  }
  
  .item-content {
    width: 100%;
  }
}
</style>
