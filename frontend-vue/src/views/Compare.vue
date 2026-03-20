<template>
  <div class="compare-page">
    <el-card class="compare-card">
      <template #header>
        <div class="card-header">
          <h2>车型对比</h2>
          <el-button
            v-if="cars.length < 4"
            type="primary"
            :icon="Plus"
            @click="router.push('/search')"
          >
            添加车型
          </el-button>
        </div>
      </template>

      <div v-if="cars.length === 0" class="empty-compare">
        <el-empty description="暂无对比车型，请先添加车型">
          <el-button type="primary" @click="router.push('/search')">
            去搜索车型
          </el-button>
        </el-empty>
      </div>

      <div v-else class="compare-table-container">
        <el-table
          :data="tableData"
          border
          style="width: 100%"
          :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        >
          <el-table-column
            prop="field"
            label="对比项"
            width="150"
            fixed
          />
          <el-table-column
            v-for="car in cars"
            :key="car.id"
            :label="`${car.brand} ${car.model_name}`"
            min-width="200"
          >
            <template #header>
              <div class="table-header">
                <span>{{ car.brand }} {{ car.model_name }}</span>
                <el-button
                  type="danger"
                  :icon="Delete"
                  size="small"
                  text
                  @click="removeCar(car.id)"
                >
                  删除
                </el-button>
              </div>
            </template>
            <template #default="{ row }">
              <div v-if="row.key === 'price'">
                ¥{{ car.price_official.toFixed(2) }}万
              </div>
              <div v-else-if="row.key === 'discount'" class="discount-price">
                ¥{{ car.price_discount.toFixed(2) }}万
              </div>
              <div v-else-if="row.key === 'save'">
                <el-tag type="warning">
                  -¥{{ car.direct_discount.toFixed(2) }}万
                </el-tag>
              </div>
              <div v-else-if="row.key === 'energy'">
                {{ getEnergyLabel(car.energy_type) }}
              </div>
              <div v-else-if="row.key === 'body'">
                {{ car.body_type.toUpperCase() }}
              </div>
              <div v-else-if="row.key === 'seats'">
                {{ car.seat_count || '-' }}座
              </div>
              <div v-else-if="row.key === 'loan'">
                <span v-if="car.loan_subsidy_amount">
                  ¥{{ car.loan_subsidy_amount.toFixed(2) }}万
                </span>
                <span v-else>-</span>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <el-alert
          title="💡 提示：最多可同时对比 4 款车型"
          type="info"
          :closable="false"
          show-icon
          class="compare-tip"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { Plus, Delete } from '@element-plus/icons-vue';
import { useCompareStore } from '@/stores';
import type { Car } from '@/types';

const router = useRouter();
const compareStore = useCompareStore();

const cars = computed(() => compareStore.cars);

const tableData = [
  { key: 'price', field: '官方价' },
  { key: 'discount', field: '优惠价' },
  { key: 'save', field: '优惠金额' },
  { key: 'energy', field: '能源类型' },
  { key: 'body', field: '车身类型' },
  { key: 'seats', field: '座位数' },
  { key: 'loan', field: '贷款贴息' },
];

const getEnergyLabel = (type: string) => {
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

const removeCar = (carId: string) => {
  compareStore.removeCar(carId);
};
</script>

<style scoped>
.compare-page {
  padding: 0 24px 24px;
}

.compare-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 20px;
}

.empty-compare {
  padding: 80px 0;
  text-align: center;
}

.compare-table-container {
  overflow-x: auto;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.discount-price {
  color: #67c23a;
  font-weight: 600;
}

.compare-tip {
  margin-top: 16px;
}

@media (max-width: 768px) {
  .compare-page {
    padding: 0 16px 16px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .compare-table-container {
    overflow-x: scroll;
  }
}
</style>
