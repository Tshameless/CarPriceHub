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

      <!-- User Actions (Desktop) -->
      <div v-if="!isMobile" class="user-actions">
        <template v-if="isAuthenticated">
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="32" :icon="UserFilled" />
              <span class="username">{{ user?.username || '用户' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="router.push('/profile')">
                  <el-icon><UserFilled /></el-icon>个人中心
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button type="primary" @click="router.push('/login')">登录</el-button>
          <el-button @click="router.push('/register')">注册</el-button>
        </template>
      </div>

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

      <!-- Mobile User Actions -->
      <div class="mobile-user-actions">
        <template v-if="isAuthenticated">
          <div class="mobile-user-info">
            <el-avatar :size="48" :icon="UserFilled" />
            <span class="mobile-username">{{ user?.username || '用户' }}</span>
          </div>
          <el-button type="primary" @click="router.push('/profile'); showMobileMenu = false;">
            个人中心
          </el-button>
          <el-button @click="handleLogout">
            退出登录
          </el-button>
        </template>
        <template v-else>
          <el-button type="primary" @click="router.push('/login'); showMobileMenu = false;">
            登录
          </el-button>
          <el-button @click="router.push('/register'); showMobileMenu = false;">
            注册
          </el-button>
        </template>
      </div>
    </el-drawer>
  </el-header>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  HomeFilled,
  Search,
  Opportunity,
  Document,
  UserFilled,
  Menu,
  Van,
  ArrowDown,
  SwitchButton,
} from '@element-plus/icons-vue';
import { useAuthStore } from '@/stores';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const searchKeyword = ref('');
const showMobileMenu = ref(false);
const isMobile = ref(window.innerWidth < 768);

const currentRoute = computed(() => route.path);
const isAuthenticated = computed(() => authStore.isAuthenticated);
const user = computed(() => authStore.user);

const handleLogout = () => {
  authStore.logout();
  ElMessage.success('已退出登录');
  router.push('/');
};

onMounted(() => {
  // 尝试获取当前用户信息
  authStore.fetchCurrentUser();
});

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

.user-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.username {
  font-size: 14px;
}

.mobile-user-actions {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mobile-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.mobile-username {
  font-size: 16px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .app-header {
    padding: 0 16px;
  }
}
</style>
