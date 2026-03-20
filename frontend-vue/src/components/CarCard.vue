<template>
  <el-card
    class="car-card"
    :body-style="{ padding: '0px' }"
    shadow="hover"
    @click="handleClick"
  >
    <!-- Car Image -->
    <div class="car-image">
      <el-icon :size="48" color="#409EFF"><Van /></el-icon>
    </div>

    <!-- Car Info -->
    <div class="car-info">
      <div class="car-title">
        <span class="brand">{{ car.brand }}</span>
        <span class="model">{{ car.model_name }}</span>
      </div>

      <!-- Tags -->
      <div class="car-tags">
        <el-tag :type="energyTag.type" size="small">{{ energyTag.text }}</el-tag>
        <el-tag :type="bodyTag.type" size="small">{{ bodyTag.text }}</el-tag>
        <el-tag v-if="car.seat_count" size="small">{{ car.seat_count }}座</el-tag>
      </div>

      <!-- Price -->
      <div class="car-price">
        <div class="price-official">
          <span class="label">官方价</span>
          <span class="value">¥{{ car.price_official.toFixed(2) }}万</span>
        </div>
        <div class="price-discount">
          <span class="label">优惠价</span>
          <span class="value">¥{{ car.price_discount.toFixed(2) }}万</span>
        </div>
        <div class="discount-amount">
          省 ¥{{ car.direct_discount.toFixed(2) }}万
        </div>
      </div>

      <!-- Subsidies -->
      <div v-if="car.loan_subsidy_amount && car.loan_subsidy_amount > 0" class="subsidy-tags">
        <el-tag type="warning" size="small">
          贴息¥{{ car.loan_subsidy_amount.toFixed(2) }}万
        </el-tag>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { Van } from '@element-plus/icons-vue';
import type { Car } from '@/types';

interface Props {
  car: Car;
}

const props = defineProps<Props>();
const router = useRouter();

const energyTag = computed(() => {
  const map: Record<string, { type: '' | 'success' | 'warning' | 'info' | 'danger'; text: string }> = {
    petrol: { type: '', text: '燃油' },
    diesel: { type: '', text: '柴油' },
    hybrid: { type: 'success', text: '混动' },
    phev: { type: 'info', text: '插混' },
    bev: { type: 'success', text: '纯电' },
    hydrogen: { type: 'warning', text: '氢能' },
  };
  return map[props.car.energy_type] || { type: '', text: props.car.energy_type };
});

const bodyTag = computed(() => {
  const map: Record<string, { type: '' | 'success' | 'warning' | 'info' | 'danger'; text: string }> = {
    sedan: { type: 'info', text: '轿车' },
    suv: { type: 'warning', text: 'SUV' },
    mpv: { type: '', text: 'MPV' },
    hatchback: { type: '', text: '两厢' },
    coupe: { type: 'danger', text: '跑车' },
    pickup: { type: 'warning', text: '皮卡' },
    wagon: { type: 'info', text: '旅行车' },
  };
  return map[props.car.body_type] || { type: '', text: props.car.body_type };
});

const handleClick = () => {
  router.push(`/car/${props.car.id}`);
};
</script>

<style scoped>
.car-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.car-card:hover {
  transform: translateY(-4px);
}

.car-image {
  height: 160px;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.car-info {
  padding: 16px;
}

.car-title {
  margin-bottom: 12px;
}

.car-title .brand {
  font-size: 18px;
  font-weight: 600;
  color: #212121;
}

.car-title .model {
  margin-left: 8px;
  font-size: 14px;
  color: #666;
}

.car-tags {
  margin-bottom: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.car-price {
  margin-bottom: 8px;
}

.price-official,
.price-discount {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 14px;
}

.price-official .label {
  color: #999;
}

.price-official .value {
  color: #666;
  text-decoration: line-through;
}

.price-discount .label {
  color: #999;
}

.price-discount .value {
  color: #2e7d32;
  font-size: 20px;
  font-weight: 600;
}

.discount-amount {
  font-size: 12px;
  color: #e65100;
  text-align: right;
}

.subsidy-tags {
  margin-top: 8px;
}
</style>
