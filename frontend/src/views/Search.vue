<template>
  <div class="search-page">
    <!-- Filter Bar -->
    <el-card class="filter-card">
      <el-row :gutter="16" align="middle">
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-input
            v-model="keyword"
            size="large"
            placeholder="搜索车型、品牌..."
            :prefix-icon="Search"
            @keyup.enter="handleSearch"
          />
        </el-col>
        <el-col :xs="24" :sm="12" :md="4" :lg="3">
          <el-select
            v-model="energyType"
            size="large"
            placeholder="能源类型"
            clearable
            style="width: 100%"
          >
            <el-option label="燃油" value="petrol" />
            <el-option label="混动" value="hybrid" />
            <el-option label="插混" value="phev" />
            <el-option label="纯电" value="bev" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="12" :md="4" :lg="3">
          <el-select
            v-model="bodyType"
            size="large"
            placeholder="车身类型"
            clearable
            style="width: 100%"
          >
            <el-option label="轿车" value="sedan" />
            <el-option label="SUV" value="suv" />
            <el-option label="MPV" value="mpv" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="16" :md="6" :lg="8">
          <div class="budget-slider">
            <span class="slider-label">预算:</span>
            <el-slider
              v-model="budgetRange"
              range
              :min="0"
              :max="100"
              style="flex: 1"
            />
            <span class="slider-value">
              {{ budgetRange[0] }}-{{ budgetRange[1] }}万
            </span>
          </div>
        </el-col>
        <el-col :xs="24" :sm="8" :md="4" :lg="4">
          <div class="filter-actions">
            <el-button size="large" @click="handleReset">重置</el-button>
            <el-button type="primary" size="large" @click="handleSearch">
              搜索
            </el-button>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- Results -->
    <div class="results-header">
      <span class="results-count">共找到 {{ total }} 款车型</span>
    </div>

    <el-row v-loading="loading" :gutter="24">
      <el-col
        v-for="car in searchResults"
        :key="car.id"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
      >
        <CarCard :car="car" />
      </el-col>
    </el-row>

    <div v-if="searchResults.length === 0 && !loading" class="empty-results">
      <el-empty description="暂无符合条件的车型" />
    </div>

    <!-- Pagination -->
    <div v-if="total > pageSize" class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next, total"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Search } from '@element-plus/icons-vue';
import { useCarStore } from '@/stores';
import CarCard from '@/components/CarCard.vue';
import type { EnergyType, BodyType, SearchQuery } from '@/types';

const route = useRoute();
const router = useRouter();
const carStore = useCarStore();

const keyword = ref('');
const energyType = ref<EnergyType | undefined>();
const bodyType = ref<BodyType | undefined>();
const budgetRange = ref<[number, number]>([0, 100]);
const currentPage = ref(1);
const pageSize = 20;

const { searchResults, total, loading } = carStore;

// 从URL参数初始化
onMounted(() => {
  const urlKeyword = route.query.keyword as string;
  if (urlKeyword) {
    keyword.value = decodeURIComponent(urlKeyword);
    handleSearch();
  }
});

// 监听查询参数变化
watch([energyType, bodyType, budgetRange, currentPage], () => {
  if (keyword.value || energyType.value || bodyType.value) {
    performSearch();
  }
});

const handleSearch = () => {
  currentPage.value = 1;
  performSearch();
  
  // 更新URL参数
  if (keyword.value) {
    router.push({
      path: '/search',
      query: { keyword: keyword.value },
    });
  } else {
    router.push('/search');
  }
};

const performSearch = () => {
  const query: SearchQuery = {
    keyword: keyword.value || undefined,
    energy_type: energyType.value,
    body_type: bodyType.value,
    budget_min: budgetRange.value[0],
    budget_max: budgetRange.value[1],
    page: currentPage.value,
    page_size: pageSize,
  };
  
  carStore.fetchCars(query);
};

const handleReset = () => {
  keyword.value = '';
  energyType.value = undefined;
  bodyType.value = undefined;
  budgetRange.value = [0, 100];
  currentPage.value = 1;
  router.push('/search');
  carStore.searchResults = [];
  carStore.total = 0;
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  performSearch();
};
</script>

<style scoped>
.search-page {
  padding: 0 24px 24px;
}

.filter-card {
  margin-bottom: 24px;
}

.budget-slider {
  display: flex;
  align-items: center;
  gap: 12px;
}

.slider-label {
  min-width: 40px;
  color: #606266;
}

.slider-value {
  min-width: 80px;
  text-align: right;
  color: #606266;
}

.filter-actions {
  display: flex;
  gap: 8px;
}

.results-header {
  margin-bottom: 16px;
}

.results-count {
  color: #606266;
  font-size: 14px;
}

.empty-results {
  padding: 80px 0;
  text-align: center;
}

.pagination-container {
  margin-top: 32px;
  text-align: center;
}

@media (max-width: 768px) {
  .search-page {
    padding: 0 16px 16px;
  }
  
  .filter-actions {
    justify-content: flex-end;
  }
}
</style>
