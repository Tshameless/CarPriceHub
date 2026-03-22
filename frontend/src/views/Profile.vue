<template>
  <div class="profile-page">
    <el-card class="profile-card">
      <template #header>
        <div class="profile-header">
          <div class="user-info">
            <el-avatar :size="64" :icon="UserFilled" />
            <div class="user-details">
              <h2>{{ authStore.user?.username || '用户' }}</h2>
              <p>{{ authStore.user?.email || '' }}</p>
            </div>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab" class="profile-tabs">
        <el-tab-pane name="favorites">
          <template #label>
            <el-icon><Star /></el-icon> 收藏车型
            <el-tag v-if="favorites.length > 0" size="small" class="tab-badge">
              {{ favorites.length }}
            </el-tag>
          </template>
          <div class="tab-content">
            <el-row v-if="favorites.length > 0" :gutter="16">
              <el-col
                :xs="24"
                :sm="12"
                :md="8"
                v-for="item in favorites"
                :key="item.id"
                class="favorite-item"
              >
                <el-card shadow="hover">
                  <div class="favorite-car">
                    <h4>{{ item.brand }} {{ item.model_name }}</h4>
                    <p class="price">¥{{ item.price_discount }}万</p>
                    <div class="actions">
                      <el-button type="primary" link @click="viewCarDetail(item.car_id)">
                        查看详情
                      </el-button>
                      <el-button type="danger" link @click="removeFavorite(item.car_id)">
                        取消收藏
                      </el-button>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
            <el-empty
              v-else
              description="暂无收藏车型"
              class="empty-content"
            >
              <el-button type="primary" @click="router.push('/search')">
                去搜索
              </el-button>
            </el-empty>
          </div>
        </el-tab-pane>

        <el-tab-pane name="alerts">
          <template #label>
            <el-icon><Bell /></el-icon> 价格提醒
            <el-tag v-if="alerts.length > 0" size="small" class="tab-badge">
              {{ alerts.length }}
            </el-tag>
          </template>
          <div class="tab-content">
            <el-row v-if="alerts.length > 0" :gutter="16">
              <el-col
                :xs="24"
                :sm="12"
                v-for="item in alerts"
                :key="item.id"
                class="alert-item"
              >
                <el-card shadow="hover">
                  <div class="alert-info">
                    <div class="alert-header">
                      <h4>{{ item.carName }}</h4>
                      <el-tag :type="getAlertStatusType(item.status)">
                        {{ getAlertStatusText(item.status) }}
                      </el-tag>
                    </div>
                    <p class="target-price">目标价: ¥{{ item.targetPrice }}万</p>
                    <p class="alert-date">创建时间: {{ formatDate(item.created_at) }}</p>
                    <div class="actions">
                      <el-button type="primary" link @click="viewCarDetail(item.car_id)">
                        查看车型
                      </el-button>
                      <el-button
                        v-if="item.status === 'active'"
                        type="danger"
                        link
                        @click="removeAlert(item.id)"
                      >
                        删除提醒
                      </el-button>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
            <el-empty
              v-else
              description="暂无价格提醒"
              class="empty-content"
            >
              <el-button type="primary" @click="router.push('/search')">
                去设置提醒
              </el-button>
            </el-empty>
          </div>
        </el-tab-pane>

        <el-tab-pane name="history">
          <template #label>
            <el-icon><Clock /></el-icon> 查询历史
          </template>
          <div class="tab-content">
            <div v-if="history.length > 0" class="history-list">
              <div
                v-for="item in history"
                :key="item.id"
                class="history-item"
              >
                <div class="history-info">
                  <span class="history-keyword">{{ item.keyword || '全部车型' }}</span>
                  <span class="history-count">{{ item.result_count }} 个结果</span>
                  <span class="history-time">{{ formatDate(item.timestamp) }}</span>
                </div>
                <div class="history-actions">
                  <el-button type="primary" link @click="reSearch(item.keyword)">
                    重新搜索
                  </el-button>
                </div>
              </div>
              <div class="clear-history">
                <el-button type="danger" link @click="clearAllHistory">
                  <el-icon><Delete /></el-icon> 清空历史
                </el-button>
              </div>
            </div>
            <el-empty
              v-else
              description="暂无查询历史"
              class="empty-content"
            >
              <el-button type="primary" @click="router.push('/search')">
                去搜索
              </el-button>
            </el-empty>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Star, Bell, Clock, UserFilled, Delete } from '@element-plus/icons-vue';
import { useAuthStore } from '@/stores';
import { favoriteApi, priceAlertApi, searchHistoryApi } from '@/api';
import type { Favorite, PriceAlert, SearchHistory } from '@/api/user';

const router = useRouter();
const authStore = useAuthStore();

const activeTab = ref('favorites');
const favorites = ref<Favorite[]>([]);
const alerts = ref<PriceAlert[]>([]);
const history = ref<SearchHistory[]>([]);
const loading = ref(false);

// 获取收藏列表
const fetchFavorites = async () => {
  try {
    favorites.value = await favoriteApi.getFavorites();
  } catch (error) {
    console.error('获取收藏失败:', error);
  }
};

// 获取价格提醒列表
const fetchAlerts = async () => {
  try {
    alerts.value = await priceAlertApi.getAlerts();
  } catch (error) {
    console.error('获取价格提醒失败:', error);
  }
};

// 获取查询历史
const fetchHistory = async () => {
  try {
    history.value = await searchHistoryApi.getHistory();
  } catch (error) {
    console.error('获取历史记录失败:', error);
  }
};

// 查看车辆详情
const viewCarDetail = (carId: string) => {
  router.push(`/car/${carId}`);
};

// 取消收藏
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

// 删除价格提醒
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

// 重新搜索
const reSearch = (keyword?: string) => {
  if (keyword) {
    router.push(`/search?keyword=${encodeURIComponent(keyword)}`);
  } else {
    router.push('/search');
  }
};

// 清空所有历史
const clearAllHistory = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有查询历史吗？此操作不可恢复。', '提示', {
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

// 获取提醒状态类型
const getAlertStatusType = (status: string) => {
  switch (status) {
    case 'active':
      return 'info';
    case 'triggered':
      return 'success';
    case 'cancelled':
      return 'danger';
    default:
      return 'info';
  }
};

// 获取提醒状态文本
const getAlertStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return '监控中';
    case 'triggered':
      return '已触发';
    case 'cancelled':
      return '已取消';
    default:
      return status;
  }
};

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

onMounted(() => {
  fetchFavorites();
  fetchAlerts();
  fetchHistory();
});
</script>

<style scoped>
.profile-page {
  padding: 0 24px 24px;
}

.profile-card {
  max-width: 1200px;
  margin: 0 auto;
}

.profile-header {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-details h2 {
  margin: 0 0 4px;
  font-size: 20px;
}

.user-details p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.profile-tabs {
  min-height: 500px;
}

.tab-badge {
  margin-left: 4px;
}

.tab-content {
  padding: 24px 0;
}

.favorite-item,
.alert-item {
  margin-bottom: 16px;
}

.favorite-car h4,
.alert-info h4 {
  margin: 0 0 8px;
  font-size: 16px;
}

.price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px;
}

.actions {
  display: flex;
  gap: 8px;
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.target-price {
  color: #f56c6c;
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 4px;
}

.alert-date {
  color: #909399;
  font-size: 12px;
  margin: 0 0 12px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.history-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.history-keyword {
  font-weight: 500;
  color: #303133;
}

.history-count {
  color: #409eff;
  font-size: 14px;
}

.history-time {
  color: #909399;
  font-size: 12px;
}

.clear-history {
  text-align: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}

.empty-content {
  padding: 80px 0;
}

@media (max-width: 768px) {
  .profile-page {
    padding: 0 16px 16px;
  }

  .history-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .history-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
