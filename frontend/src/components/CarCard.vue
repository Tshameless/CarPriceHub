<template>
  <div class="car-card" @click="handleClick">
    <!-- Image -->
    <div class="card-image">
      <div class="image-placeholder">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 10L3 16L5 16L7 10H5Z" fill="currentColor"/>
          <path d="M19 10L21 16H19L17 10H19Z" fill="currentColor"/>
          <path d="M7 10H17L16 7C15.5 6 14.5 5 12 5C9.5 5 8.5 6 8 7L7 10Z" fill="currentColor"/>
          <path d="M6 12H18L17 18C16.5 19 15.5 20 12 20C8.5 20 7.5 19 7 18L6 12Z" fill="currentColor"/>
        </svg>
      </div>
      <!-- Discount Badge -->
      <div v-if="car.direct_discount > 0" class="discount-badge">
        省 ¥{{ formatPrice(car.direct_discount) }}万
      </div>
    </div>

    <!-- Content -->
    <div class="card-content">
      <!-- Header -->
      <div class="card-header">
        <div class="car-title">
          <span class="brand">{{ car.brand }}</span>
          <span class="model">{{ car.model_name }}</span>
        </div>
        <div class="car-meta">
          <span class="year">{{ car.year }}款</span>
          <span class="divider">·</span>
          <span class="seats">{{ car.seat_count }}座</span>
        </div>
      </div>

      <!-- Tags -->
      <div class="tag-list">
        <span class="tag" :class="`tag-${energyTag.type}`">
          {{ energyTag.text }}
        </span>
        <span class="tag tag-gray">
          {{ bodyTag.text }}
        </span>
      </div>

      <!-- Price -->
      <div class="price-section">
        <div class="price-main">
          <span class="price-currency">¥</span>
          <span class="price-value">{{ formatPrice(car.price_discount) }}</span>
          <span class="price-unit">万</span>
        </div>
        <div class="price-sub">
          <span class="price-original">官方价 ¥{{ formatPrice(car.price_official) }}万</span>
        </div>
      </div>

      <!-- Subsidies -->
      <div v-if="hasSubsidies" class="subsidy-list">
        <div v-if="car.loan_subsidy_amount > 0" class="subsidy-item">
          <span class="subsidy-dot"></span>
          <span>贴息 ¥{{ formatPrice(car.loan_subsidy_amount) }}万</span>
        </div>
        <div v-if="car.replacement_subsidy > 0" class="subsidy-item">
          <span class="subsidy-dot green"></span>
          <span>置换 ¥{{ formatPrice(car.replacement_subsidy) }}万</span>
        </div>
      </div>

      <!-- Footer -->
      <div class="card-footer">
        <span class="region">{{ car.region }}</span>
        <span class="action">
          查看
          <el-icon><ArrowRight /></el-icon>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowRight } from '@element-plus/icons-vue';
import type { Car } from '@/types';

interface Props {
  car: Car;
}

const props = defineProps<Props>();
const router = useRouter();

const energyTag = computed(() => {
  const map: Record<string, { type: string; text: string }> = {
    petrol: { type: 'gray', text: '燃油' },
    diesel: { type: 'gray', text: '柴油' },
    hybrid: { type: 'green', text: '混动' },
    phev: { type: 'blue', text: '插混' },
    bev: { type: 'green', text: '纯电' },
    hydrogen: { type: 'orange', text: '氢能' },
  };
  return map[props.car.energy_type] || { type: 'gray', text: props.car.energy_type };
});

const bodyTag = computed(() => {
  const map: Record<string, string> = {
    sedan: '轿车',
    suv: 'SUV',
    mpv: 'MPV',
    hatchback: '两厢',
    coupe: '跑车',
    pickup: '皮卡',
    wagon: '旅行',
  };
  return map[props.car.body_type] || props.car.body_type;
});

const hasSubsidies = computed(() => {
  return (props.car.loan_subsidy_amount && props.car.loan_subsidy_amount > 0) ||
         (props.car.replacement_subsidy && props.car.replacement_subsidy > 0);
});

const formatPrice = (price: number) => price.toFixed(2);

const handleClick = () => {
  router.push(`/car/${props.car.id}`);
};
</script>

<style scoped>
.car-card {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  transition: all var(--duration-normal) var(--ease-out);
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.car-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-200);
}

/* Image */
.card-image {
  position: relative;
  aspect-ratio: 16/10;
  background: linear-gradient(135deg, var(--primary-50) 0%, #e0e7ff 100%);
  overflow: hidden;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-300);
}

.image-placeholder svg {
  width: 64px;
  height: 64px;
}

.discount-badge {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  background: linear-gradient(135deg, var(--error-500) 0%, var(--error-600) 100%);
  color: white;
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-md);
}

/* Content */
.card-content {
  padding: var(--space-5);
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Header */
.card-header {
  margin-bottom: var(--space-3);
}

.car-title {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  margin-bottom: var(--space-1);
}

.brand {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.model {
  font-size: var(--text-base);
  color: var(--text-secondary);
}

.car-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

.divider {
  color: var(--border-medium);
}

/* Tags */
.tag-list {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-2);
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

/* Price */
.price-section {
  margin-top: auto;
  padding: var(--space-4) 0;
  border-top: 1px solid var(--border-light);
  border-bottom: 1px solid var(--border-light);
  margin-bottom: var(--space-3);
}

.price-main {
  display: flex;
  align-items: flex-start;
  gap: var(--space-1);
  margin-bottom: var(--space-1);
}

.price-currency {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--error-600);
  line-height: 1;
}

.price-value {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--error-600);
  line-height: 1;
  letter-spacing: -0.02em;
}

.price-unit {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--error-600);
  line-height: 1.2;
}

.price-sub {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

.price-original {
  text-decoration: line-through;
}

/* Subsidies */
.subsidy-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.subsidy-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.subsidy-dot {
  width: 6px;
  height: 6px;
  background: var(--accent-500);
  border-radius: var(--radius-full);
}

.subsidy-dot.green {
  background: var(--success-500);
}

/* Footer */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.region {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

.action {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--primary-600);
  transition: color var(--duration-fast);
}

.car-card:hover .action {
  color: var(--primary-700);
}

.action .el-icon {
  transition: transform var(--duration-fast);
}

.car-card:hover .action .el-icon {
  transform: translateX(2px);
}

/* Responsive */
@media (max-width: 768px) {
  .card-content {
    padding: var(--space-4);
  }
  
  .brand {
    font-size: var(--text-base);
  }
  
  .model {
    font-size: var(--text-sm);
  }
  
  .price-value {
    font-size: var(--text-2xl);
  }
}
</style>
