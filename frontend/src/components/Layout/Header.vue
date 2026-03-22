<template>
  <el-header class="app-header">
    <div class="header-container">
      <!-- Logo -->
      <router-link to="/" class="logo-link">
        <el-icon :size="32" color="#409EFF"><Van /></el-icon>
        <span class="logo-text">车价通</span>
      </router-link>

      <!-- Desktop Menu -->
      <el-menu
        v-if="!isMobile"
        mode="horizontal"
        :default-active="currentRoute"
        class="header-menu"
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#ffd04b"
        router
      >
        <el-menu-item index="/">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/search">
          <el-icon><Search /></el-icon>
          <span>搜索</span>
        </el-menu-item>
        <el-menu-item index="/recommend">
          <el-icon><Opportunity /></el-icon>
          <span>推荐</span>
        </el-menu-item>
        <el-menu-item index="/compare">
          <el-icon><Document /></el-icon>
          <span>对比</span>
        </el-menu-item>
        <el-menu-item index="/profile">
          <el-icon><UserFilled /></el-icon>
          <span>我的</span>
        </el-menu-item>
      </el-menu>

      <!-- Search Bar (Desktop) -->
      <el-input
        v-if="!isMobile"
        v-model="searchKeyword"
        placeholder="搜索车型、品牌..."
        class="search-input"
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
        <template #append>
          <el-button @click="handleSearch">搜索</el-button>
        </template>
      </el-input>

      <!-- Mobile Menu Button -->
      <el-button
        v-if="isMobile"
        text
        @click="showMobileMenu = true"
        class="mobile-menu-btn"
      >
        <el-icon :size="24"><Menu /></el-icon>
      </el-button>
    </div>

    <!-- Mobile Menu Drawer -->
    <el-drawer
      v-model="showMobileMenu"
      direction="rtl"
      size="70%"
      :show-close="false"
    >
      <el-menu
        :default-active="currentRoute"
        router
        @select="showMobileMenu = false"
      >
        <el-menu-item index="/">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/search">
          <el-icon><Search /></el-icon>
          <span>搜索</span>
        </el-menu-item>
        <el-menu-item index="/recommend">
          <el-icon><Opportunity /></el-icon>
          <span>推荐</span>
        </el-menu-item>
        <el-menu-item index="/compare">
          <el-icon><Document /></el-icon>
          <span>对比</span>
        </el-menu-item>
        <el-menu-item index="/profile">
          <el-icon><UserFilled /></el-icon>
          <span>我的</span>
        </el-menu-item>
      </el-menu>
      <el-input
        v-model="searchKeyword"
        placeholder="搜索车型、品牌..."
        class="mobile-search"
        @keyup.enter="handleMobileSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
        <template #append>
          <el-button @click="handleMobileSearch">搜索</el-button>
        </template>
      </el-input>
    </el-drawer>
  </el-header>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  HomeFilled,
  Search,
  Opportunity,
  Document,
  UserFilled,
  Menu,
  Van,
} from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();

const searchKeyword = ref('');
const showMobileMenu = ref(false);
const isMobile = ref(window.innerWidth < 768);

const currentRoute = computed(() => route.path);

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push(`/search?keyword=${encodeURIComponent(searchKeyword.value.trim())}`);
  }
};

const handleMobileSearch = () => {
  handleSearch();
  showMobileMenu.value = false;
};

// 监听窗口大小变化
const handleResize = () => {
  isMobile.value = window.innerWidth < 768;
};

window.addEventListener('resize', handleResize);

// 组件卸载时清理事件监听器
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.app-header {
  background-color: #545c64;
  padding: 0 24px;
  height: 60px;
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
}

.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #fff;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  margin-left: 8px;
}

.header-menu {
  flex: 1;
  margin-left: 40px;
  border-bottom: none;
}

.search-input {
  width: 300px;
}

.mobile-menu-btn {
  color: #fff;
}

.mobile-search {
  margin-top: 16px;
}

@media (max-width: 768px) {
  .app-header {
    padding: 0 16px;
  }
}
</style>
