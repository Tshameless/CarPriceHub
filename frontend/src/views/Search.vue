<template>
  <div class="search-page">
    <div class="container">
      <!-- Header -->
      <div class="page-header">
        <nav class="breadcrumb">
          <router-link to="/" class="breadcrumb-link">首页</router-link>
          <el-icon class="breadcrumb-separator"><ArrowRight /></el-icon>
          <span class="breadcrumb-current">搜索</span>
        </nav>
        <h1 class="page-title">找到你的理想座驾</h1>
        <p class="page-desc">浏览全网实时车价，筛选最适合你的车型</p>
      </div>

      <!-- Search Section -->
      <div class="search-section">
        <div class="search-box">
          <el-icon class="search-icon"><Search /></el-icon>
          <input
            v-model="keyword"
            type="text"
            placeholder="搜索车型、品牌，如：比亚迪 秦..."
            class="search-input"
            @keyup.enter="handleSearch"
          />
          <button class="search-btn" @click="handleSearch">
            <span>搜索</span>
          </button>
        </div>
      </div>

      <!-- Filter Section -->
      <div class="filter-section">
        <div class="filter-group">
          <span class="filter-label">能源类型</span>
          <div class="filter-options">
            <button
              v-for="type in energyTypes"
              :key="type.value"
              class="filter-btn"
              :class="{ active: energyType === type.value }"
              @click="energyType = energyType === type.value ? undefined : type.value"
            >
              {{ type.label }}
            </button>
          </div>
        </div>

        <div class="filter-group">
          <span class="filter-label">车身类型</span>
          <div class="filter-options">
            <button
              v-for="type in bodyTypes"
              :key="type.value"
              class="filter-btn"
              :class="{ active: bodyType === type.value }"
              @click="bodyType = bodyType === type.value ? undefined : type.value"
            >
              {{ type.label }}
            </button>
          </div>
        </div>

        <div class="filter-group">
          <span class="filter-label">价格区间</span>
          <div class="price-range">
            <el-slider
              v-model="budgetRange"
              range
              :min="0"
              :max="100"
              :step="5"
              class="price-slider"
            />
            <div class="price-labels">
              <span class="price-label">{{ budgetRange[0] }}万</span>
              <span class="price-label">{{ budgetRange[1] }}万</span>
            </div>
          </div>
        </div>

        <!-- Active Filters -->
        <div v-if="hasActiveFilters" class="active-filters">
          <span class="filters-title">已选条件：</span>
          <div class="filter-tags">
            <span v-if="keyword" class="filter-tag">
              关键词: {{ keyword }}
              <button class="tag-remove" @click="keyword = ''; handleSearch()">
                <el-icon><Close /></el-icon>
              </button>
            </span>
            <span v-if="energyType" class="filter-tag">
              {{ getEnergyLabel(energyType) }}
              <button class="tag-remove" @click="energyType = undefined; handleSearch()">
                <el-icon><Close /></el-icon>
              </button>
            </span>
            <span v-if="bodyType" class="filter-tag">
              {{ getBodyLabel(bodyType) }}
              <button class="tag-remove" @click="bodyType = undefined; handleSearch()">
                <el-icon><Close /></el-icon>
              </button>
            </span>
            <span class="filter-tag">
              {{ budgetRange[0] }}-{{ budgetRange[1] }}万
              <button class="tag-remove" @click="budgetRange = [0, 100]; handleSearch()">
                <el-icon><Close /></el-icon>
              </button>
            </span>
          </div>
          <button class="clear-all" @click="handleReset">清除全部</button>
        </div>
      </div>

      <!-- Results Section -->
      <div class="results-section">
        <!-- Results Header -->
        <div class="results-header">
          <div class="results-info">
            <span class="results-count">
              共 <strong>{{ total }}</strong> 款车型
            </span>
            <span v-if="loading" class="loading-text">加载中...</span>
          </div>
          <div class="results-sort">
            <span class="sort-label">排序：</span>
            <div class="sort-options">
              <button
                class="sort-btn"
                :class="{ active: sortBy === 'discount' }"
                @click="sortBy = 'discount'"
              >
                优惠力度
              </button>
              <button
                class="sort-btn"
                :class="{ active: sortBy === 'price-asc' }"
                @click="sortBy = 'price-asc'"
              >
                价格从低到高
              </button>
              <button
                class="sort-btn"
                :class="{ active: sortBy === 'price-desc' }"
                @click="sortBy = 'price-desc'"
              >
                价格从高到低
              </button>
            </div>
          </div>
        </div>

        <!-- Results Grid -->
        <div v-if="searchResults.length > 0" class="results-grid" v-loading="loading">
          <CarCard
            v-for="car in searchResults"
            :key="car.id"
            :car="car"
          />
        </div>

        <!-- Empty State -->
        <div v-else-if="!loading" class="empty-state">
          <div class="empty-icon">
            <el-icon :size="64"><Search /></el-icon>
          </div>
          <h3 class="empty-title">暂无符合条件的车型</h3>
          <p class="empty-desc">试试调整筛选条件或搜索其他关键词</p>
          <button class="empty-action" @click="handleReset">
            清除筛选条件
          </button>
        </div>

        <!-- Pagination -->
        <div v-if="total > pageSize" class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="total"
            layout="prev, pager, next, jumper"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Search, ArrowRight, Close } from '@element-plus/icons-vue';
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
const pageSize = 12;
const sortBy = ref('discount');

const { searchResults, total, loading } = carStore;

const energyTypes = [
  { value: 'petrol', label: '燃油' },
  { value: 'hybrid', label: '混动' },
  { value: 'phev', label: '插混' },
  { value: 'bev', label: '纯电' },
];

const bodyTypes = [
  { value: 'sedan', label: '轿车' },
  { value: 'suv', label: 'SUV' },
  { value: 'mpv', label: 'MPV' },
  { value: 'hatchback', label: '两厢' },
];

const hasActiveFilters = computed(() => {
  return keyword.value || energyType.value || bodyType.value ||
    budgetRange.value[0] !== 0 || budgetRange.value[1] !== 100;
});

const getEnergyLabel = (value: string) => {
  const type = energyTypes.find(t => t.value === value);
  return type?.label || value;
};

const getBodyLabel = (value: string) => {
  const type = bodyTypes.find(t => t.value === value);
  return type?.label || value;
};

const handleSearch = () => {
  currentPage.value = 1;
  performSearch();
  
  const query: Record<string, string> = {};
  if (keyword.value) query.keyword = keyword.value;
  router.push({ path: '/search', query });
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
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

watch([energyType, bodyType, budgetRange], () => {
  if (keyword.value || energyType.value || bodyType.value) {
    handleSearch();
  }
}, { deep: true });

onMounted(() => {
  const urlKeyword = route.query.keyword as string;
  if (urlKeyword) {
    keyword.value = decodeURIComponent(urlKeyword);
    performSearch();
  }
});
</script>

<style scoped>
.search-page {
  padding-top: var(--header-height);
  padding-bottom: var(--space-20);
}

/* Page Header */
.page-header {
  padding: var(--space-12) 0 var(--space-8);
  text-align: center;
}

.breadcrumb {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
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

.page-title {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
  letter-spacing: -0.02em;
}

.page-desc {
  font-size: var(--text-lg);
  color: var(--text-secondary);
  margin: 0;
}

/* Search Section */
.search-section {
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
  padding: var(--space-4);
  font-size: var(--text-lg);
  font-family: inherit;
  color: var(--text-primary);
  outline: none;
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.search-btn {
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

/* Filter Section */
.filter-section {
  background: var(--bg-primary);
  border-radius: var(--radius-2xl);
  padding: var(--space-6);
  margin-bottom: var(--space-8);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) 0;
  border-bottom: 1px solid var(--border-light);
}

.filter-group:last-of-type {
  border-bottom: none;
}

.filter-label {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-secondary);
  min-width: 80px;
  flex-shrink: 0;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.filter-btn {
  padding: var(--space-2) var(--space-4);
  background: transparent;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.filter-btn:hover {
  border-color: var(--primary-300);
  color: var(--primary-600);
}

.filter-btn.active {
  background: var(--primary-600);
  border-color: var(--primary-600);
  color: white;
}

/* Price Range */
.price-range {
  flex: 1;
  max-width: 400px;
}

.price-slider {
  margin-bottom: var(--space-2);
}

.price-labels {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

/* Active Filters */
.active-filters {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding-top: var(--space-4);
  margin-top: var(--space-4);
  border-top: 1px solid var(--border-light);
}

.filters-title {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  flex-shrink: 0;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  flex: 1;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  background: var(--primary-50);
  border: 1px solid var(--primary-200);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  color: var(--primary-700);
}

.tag-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: none;
  background: transparent;
  color: var(--primary-500);
  cursor: pointer;
  border-radius: var(--radius-full);
  transition: all var(--duration-fast);
}

.tag-remove:hover {
  background: var(--primary-100);
  color: var(--primary-700);
}

.clear-all {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color var(--duration-fast);
}

.clear-all:hover {
  color: var(--error-600);
}

/* Results Section */
.results-section {
  background: var(--bg-primary);
  border-radius: var(--radius-2xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

/* Results Header */
.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--border-light);
}

.results-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.results-count {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.results-count strong {
  color: var(--primary-600);
  font-size: var(--text-lg);
}

.loading-text {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

.results-sort {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.sort-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.sort-options {
  display: flex;
  gap: var(--space-1);
}

.sort-btn {
  padding: var(--space-2) var(--space-3);
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.sort-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.sort-btn.active {
  background: var(--primary-50);
  border-color: var(--primary-200);
  color: var(--primary-700);
}

/* Results Grid */
.results-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-6);
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

.empty-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.empty-desc {
  font-size: var(--text-base);
  color: var(--text-secondary);
  margin-bottom: var(--space-6);
}

.empty-action {
  padding: var(--space-3) var(--space-6);
  background: var(--primary-600);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.empty-action:hover {
  background: var(--primary-700);
  transform: translateY(-1px);
}

/* Pagination */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: var(--space-8);
  padding-top: var(--space-6);
  border-top: 1px solid var(--border-light);
}

/* Responsive */
@media (max-width: 1200px) {
  .results-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 992px) {
  .results-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .results-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-4);
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: var(--text-3xl);
  }
  
  .filter-group {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .price-range {
    max-width: 100%;
    width: 100%;
  }
  
  .active-filters {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
  }
  
  .sort-options {
    flex-wrap: wrap;
  }
}
</style>
