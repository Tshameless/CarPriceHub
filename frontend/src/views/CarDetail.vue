<template>
  <div class="car-detail-page">
    <el-button :icon="ArrowLeft" @click="router.back()" class="back-btn">
      返回
    </el-button>

    <el-row :gutter="24" v-loading="loading">
      <el-col :xs="24" :md="10">
        <el-card>
          <template #default>
            <div class="car-image">
              <el-icon :size="100" color="#409EFF"><Van /></el-icon>
            </div>
            <div class="car-actions">
              <el-button type="primary" :icon="Star">收藏</el-button>
              <el-button :icon="Share">分享</el-button>
            </div>
          </template>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="14">
        <el-card>
          <template #header>
            <div class="card-header">
              <h1 class="car-title">
                {{ car?.brand }} {{ car?.model_name }}
                <el-tag type="info" style="margin-left: 12px">
                  {{ car?.year }}款
                </el-tag>
              </h1>
            </div>
          </template>

          <div class="price-section">
            <el-row :gutter="16">
              <el-col :span="8">
                <div class="price-item">
                  <div class="price-label">官方指导价</div>
                  <div class="price-official">
                    ¥{{ car?.price_official.toFixed(2) }}万
                  </div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="price-item">
                  <div class="price-label">优惠成交价</div>
                  <div class="price-discount">
                    ¥{{ car?.price_discount.toFixed(2) }}万
                  </div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="price-item">
                  <div class="price-label">直接优惠</div>
                  <div class="price-save">
                    -¥{{ car?.direct_discount.toFixed(2) }}万
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>

          <!-- Alerts -->
          <div v-if="car?.loan_subsidy_amount && car.loan_subsidy_amount > 0" class="alert-item">
            <el-alert
              :title="`贷款贴息 ¥${car.loan_subsidy_amount.toFixed(2)}万`"
              :description="`年化利率 ${(car.loan_subsidy_rate || 0) * 100}%`"
              type="success"
              show-icon
              :closable="false"
            />
          </div>

          <div v-if="car?.replacement_subsidy && car.replacement_subsidy > 0" class="alert-item">
            <el-alert
              :title="`置换补贴 ¥${car.replacement_subsidy.toFixed(2)}万`"
              type="info"
              show-icon
              :closable="false"
            />
          </div>

          <el-divider />

          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="能源类型">
              {{ getEnergyLabel(car?.energy_type) }}
            </el-descriptions-item>
            <el-descriptions-item label="车身类型">
              {{ car?.body_type.toUpperCase() }}
            </el-descriptions-item>
            <el-descriptions-item label="座位数">
              {{ car?.seat_count || '-' }}座
            </el-descriptions-item>
            <el-descriptions-item label="适用地区">
              {{ car?.region }}
            </el-descriptions-item>
            <el-descriptions-item label="政策生效">
              {{ formatDate(car?.effective_date) }}
            </el-descriptions-item>
            <el-descriptions-item label="政策截止">
              {{ car?.expire_date ? formatDate(car.expire_date) : '长期有效' }}
            </el-descriptions-item>
          </el-descriptions>

          <div v-if="car?.gift_package && car.gift_package.length > 0">
            <el-divider>赠品清单</el-divider>
            <ul class="gift-list">
              <li v-for="(gift, i) in car.gift_package" :key="i">
                {{ gift.name }}（估值 ¥{{ gift.estimated_value.toFixed(2) }}万）
              </li>
            </ul>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Tabs -->
    <el-card class="detail-tabs">
      <el-tabs v-model="activeTab">
        <el-tab-pane name="trend">
          <template #label>
            <el-icon><TrendCharts /></el-icon> 价格趋势
          </template>
          <div class="tab-content">
            <div class="tab-controls">
              <span class="control-label">时间范围：</span>
              <el-select v-model="trendDays" @change="fetchPriceTrend">
                <el-option label="最近7天" :value="7" />
                <el-option label="最近30天" :value="30" />
                <el-option label="最近3个月" :value="90" />
                <el-option label="最近半年" :value="180" />
              </el-select>
            </div>
            <PriceTrendChart
              :price-trend="priceTrend"
              :loading="priceLoading"
              :height="400"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane name="alert">
          <template #label>
            <el-icon><Bell /></el-icon> 价格提醒
          </template>
          <div class="tab-content">
            <el-card class="alert-card">
              <h3>设置价格提醒</h3>
              <p class="alert-description">
                当价格达到您的目标价时，系统会自动通知您
              </p>
              
              <div class="alert-form">
                <div class="form-group">
                  <span class="form-label">目标价格：</span>
                  <el-input-number
                    v-model="alertPrice"
                    placeholder="输入目标价格"
                    :min="0"
                    :step="0.1"
                    :precision="2"
                    controls-position="right"
                  />
                  <span class="unit">万元</span>
                </div>
                <el-button
                  type="primary"
                  :icon="Bell"
                  @click="handleCreateAlert"
                  :disabled="!alertPrice"
                >
                  创建提醒
                </el-button>
              </div>

              <el-divider />

              <div class="alert-tips">
                <p>
                  💡 建议：当前价格
                  <strong class="current-price">
                    {{ car?.price_discount.toFixed(2) }}万
                  </strong>
                </p>
                <p>您可以选择比当前价格更低的目标价，系统会在价格下降时通知您</p>
              </div>
            </el-card>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ArrowLeft,
  Star,
  Share,
  Van,
  TrendCharts,
  Bell,
} from '@element-plus/icons-vue';
import { useCarStore, usePriceStore } from '@/stores';
import PriceTrendChart from '@/components/charts/PriceTrendChart.vue';
import type { Car } from '@/types';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const carStore = useCarStore();
const priceStore = usePriceStore();

const car = ref<Car | null>(null);
const activeTab = ref('trend');
const trendDays = ref(30);
const alertPrice = ref<number | null>(null);

const loading = computed(() => carStore.loading);
const priceLoading = computed(() => priceStore.loading);
const priceTrend = computed(() => priceStore.priceTrend);

const getEnergyLabel = (type?: string) => {
  if (!type) return '-';
  const map: Record<string, string> = {
    petrol: '燃油',
    diesel: '柴油',
    hybrid: '混动',
    phev: '插混',
    bev: '纯电',
    hydrogen: '氢能',
  };
  return map[type] || type;
};

const formatDate = (date?: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString();
};

const fetchPriceTrend = () => {
  const carId = route.params.id as string;
  if (carId) {
    priceStore.fetchPriceTrend(carId, trendDays.value);
  }
};

const handleCreateAlert = async () => {
  const carId = route.params.id as string;
  if (!carId || !alertPrice.value) {
    ElMessage.warning('请输入目标价格');
    return;
  }

  try {
    await priceStore.createPriceAlert(carId, alertPrice.value, 'push');
    ElMessage.success('价格提醒已创建');
    alertPrice.value = null;
  } catch (error) {
    ElMessage.error('创建提醒失败');
  }
};

onMounted(async () => {
  const carId = route.params.id as string;
  if (carId) {
    const fetchedCar = await carStore.fetchCarById(carId);
    if (fetchedCar) {
      car.value = fetchedCar;
      fetchPriceTrend();
    }
  }
});
</script>

<style scoped>
.car-detail-page {
  padding: 0 24px 24px;
}

.back-btn {
  margin-bottom: 24px;
}

.car-image {
  height: 300px;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 100px;
}

.car-actions {
  padding: 16px;
  display: flex;
  gap: 8px;
}

.car-title {
  font-size: 28px;
  margin: 0;
}

.price-section {
  margin-bottom: 24px;
}

.price-item {
  text-align: center;
}

.price-label {
  color: #909399;
  font-size: 14px;
  margin-bottom: 8px;
}

.price-official {
  font-size: 20px;
  text-decoration: line-through;
  color: #909399;
}

.price-discount {
  font-size: 32px;
  font-weight: bold;
  color: #67c23a;
}

.price-save {
  font-size: 24px;
  font-weight: bold;
  color: #f56c6c;
}

.alert-item {
  margin-bottom: 16px;
}

.gift-list {
  margin: 0;
  padding-left: 24px;
}

.detail-tabs {
  margin-top: 24px;
}

.tab-content {
  padding: 24px 0;
}

.tab-controls {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-label {
  color: #606266;
}

.alert-card {
  max-width: 800px;
  margin: 0 auto;
}

.alert-description {
  color: #909399;
  margin-bottom: 16px;
}

.alert-form {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-label {
  color: #606266;
}

.unit {
  color: #909399;
  margin-left: 4px;
}

.alert-tips {
  color: #909399;
}

.current-price {
  color: #67c23a;
}

@media (max-width: 768px) {
  .car-detail-page {
    padding: 0 16px 16px;
  }
  
  .car-title {
    font-size: 24px;
  }
  
  .price-discount {
    font-size: 24px;
  }
  
  .alert-form {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
