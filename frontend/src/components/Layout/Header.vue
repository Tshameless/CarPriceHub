<template>
  <header class="header">
    <div class="header-inner">
      <!-- Logo -->
      <router-link to="/" class="brand">
        <div class="brand-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 10L3 16L5 16L7 10H5Z" fill="currentColor"/>
            <path d="M19 10L21 16H19L17 10H19Z" fill="currentColor"/>
            <path d="M7 10H17L16 7C15.5 6 14.5 5 12 5C9.5 5 8.5 6 8 7L7 10Z" fill="currentColor"/>
            <path d="M6 12H18L17 18C16.5 19 15.5 20 12 20C8.5 20 7.5 19 7 18L6 12Z" fill="currentColor"/>
            <circle cx="8.5" cy="15" r="1.5" fill="white"/>
            <circle cx="15.5" cy="15" r="1.5" fill="white"/>
          </svg>
        </div>
        <span class="brand-text">车价通</span>
      </router-link>

      <!-- Desktop Navigation -->
      <nav v-if="!isMobile" class="nav">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
        >
          {{ item.label }}
        </router-link>
      </nav>

      <!-- Right Actions -->
      <div class="actions">
        <!-- Search Button -->
        <button
          v-if="!isMobile"
          class="icon-btn"
          @click="showSearch = true"
        >
          <el-icon :size="20"><Search /></el-icon>
        </button>

        <!-- User Menu -->
        <template v-if="isAuthenticated">
          <el-dropdown trigger="click" placement="bottom-end">
            <button class="avatar-btn">
              <img
                v-if="user?.avatar"
                :src="user.avatar"
                alt="avatar"
                class="avatar-img"
              />
              <div v-else class="avatar-fallback">
                {{ user?.username?.charAt(0).toUpperCase() }}
              </div>
            </button>
            <template #dropdown>
              <el-dropdown-menu>
                <div class="user-menu-header">
                  <span class="user-name">{{ user?.username }}</span>
                  <span class="user-email">{{ user?.email }}</span>
                </div>
                <el-dropdown-item @click="router.push('/profile')">
                  <el-icon><User /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item @click="router.push('/profile?tab=favorites')">
                  <el-icon><Star /></el-icon>
                  我的收藏
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>

        <!-- Auth Buttons -->
        <template v-else>
          <el-button
            v-if="!isMobile"
            type="primary"
            @click="router.push('/login')"
          >
            登录
          </el-button>
          <el-button
            v-if="!isMobile"
            @click="router.push('/register')"
          >
            注册
          </el-button>
          <el-button
            v-if="isMobile"
            type="primary"
            size="small"
            @click="router.push('/login')"
          >
            登录
          </el-button>
        </template>

        <!-- Mobile Menu Button -->
        <button
          v-if="isMobile"
          class="menu-btn"
          @click="showMobileMenu = true"
        >
          <el-icon :size="24"><Menu /></el-icon>
        </button>
      </div>
    </div>

    <!-- Search Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showSearch"
          class="search-modal"
          @click="showSearch = false"
        >
          <div class="search-container" @click.stop>
            <div class="search-input-wrapper">
              <el-icon class="search-icon"><Search /></el-icon>
              <input
                v-model="searchKeyword"
                type="text"
                placeholder="搜索车型、品牌..."
                class="search-input"
                @keyup.enter="handleSearch"
                ref="searchInput"
              />
              <button
                v-if="searchKeyword"
                class="clear-btn"
                @click="searchKeyword = ''"
              >
                <el-icon><Close /></el-icon>
              </button>
            </div>
            <div class="search-suggestions">
              <div class="suggestion-title">热门搜索</div>
              <div class="suggestion-tags">
                <span
                  v-for="tag in hotTags"
                  :key="tag"
                  class="suggestion-tag"
                  @click="searchKeyword = tag; handleSearch()"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Mobile Menu -->
    <Teleport to="body">
      <Transition name="slide">
        <div v-if="showMobileMenu" class="mobile-menu-overlay">
          <div class="mobile-menu">
            <div class="mobile-menu-header">
              <span class="mobile-menu-title">菜单</span>
              <button class="close-btn" @click="showMobileMenu = false">
                <el-icon :size="24"><Close /></el-icon>
              </button>
            </div>
            <nav class="mobile-nav">
              <router-link
                v-for="item in navItems"
                :key="item.path"
                :to="item.path"
                class="mobile-nav-item"
                :class="{ active: isActive(item.path) }"
                @click="showMobileMenu = false"
              >
                {{ item.label }}
                <el-icon><ArrowRight /></el-icon>
              </router-link>
            </nav>
            <div class="mobile-menu-footer">
              <template v-if="isAuthenticated">
                <div class="mobile-user">
                  <div class="mobile-avatar">
                    {{ user?.username?.charAt(0).toUpperCase() }}
                  </div>
                  <div class="mobile-user-info">
                    <span class="mobile-user-name">{{ user?.username }}</span>
                    <span class="mobile-user-email">{{ user?.email }}</span>
                  </div>
                </div>
                <el-button type="primary" size="large" @click="handleLogout">
                  退出登录
                </el-button>
              </template>
              <template v-else>
                <el-button type="primary" size="large" @click="router.push('/login'); showMobileMenu = false;">
                  登录
                </el-button>
                <el-button size="large" @click="router.push('/register'); showMobileMenu = false;">
                  注册
                </el-button>
              </template>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  Search,
  Menu,
  Close,
  ArrowRight,
  User,
  Star,
  SwitchButton,
} from '@element-plus/icons-vue';
import { useAuthStore } from '@/stores';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const searchKeyword = ref('');
const showSearch = ref(false);
const showMobileMenu = ref(false);
const isMobile = ref(window.innerWidth < 768);
const searchInput = ref<HTMLInputElement>();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const user = computed(() => authStore.user);

const navItems = [
  { path: '/', label: '首页' },
  { path: '/search', label: '搜索' },
  { path: '/recommend', label: '智能推荐' },
  { path: '/compare', label: '车型对比' },
];

const hotTags = ['比亚迪', '特斯拉', 'SUV', '20万以下', '新能源车', '混动'];

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/';
  }
  return route.path.startsWith(path);
};

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    showSearch.value = false;
    router.push(`/search?keyword=${encodeURIComponent(searchKeyword.value.trim())}`);
    searchKeyword.value = '';
  }
};

const handleLogout = () => {
  authStore.logout();
  ElMessage.success('已退出登录');
  showMobileMenu.value = false;
  router.push('/');
};

// Watch for search modal open
watch(showSearch, async (val) => {
  if (val) {
    await nextTick();
    searchInput.value?.focus();
  }
});

// Resize handler
const handleResize = () => {
  isMobile.value = window.innerWidth < 768;
};

onMounted(() => {
  authStore.fetchCurrentUser();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-light);
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-height);
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 var(--content-padding);
}

/* Brand */
.brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  text-decoration: none;
  color: var(--text-primary);
}

.brand-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 14px rgba(79, 92, 232, 0.4);
}

.brand-icon svg {
  width: 24px;
  height: 24px;
}

.brand-text {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  letter-spacing: -0.02em;
}

/* Navigation */
.nav {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.nav-item {
  padding: var(--space-2) var(--space-4);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast);
}

.nav-item:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

.nav-item.active {
  color: var(--primary-600);
  background: var(--primary-50);
}

/* Actions */
.actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.icon-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.icon-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.avatar-btn {
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: var(--radius-full);
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
}

.menu-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--text-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
}

/* Search Modal */
.search-modal {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  z-index: 200;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 120px;
}

.search-container {
  width: 100%;
  max-width: 640px;
  margin: 0 var(--space-6);
  background: var(--bg-primary);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-2xl);
  overflow: hidden;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-6);
  border-bottom: 1px solid var(--border-light);
}

.search-icon {
  color: var(--text-tertiary);
  font-size: var(--text-xl);
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: var(--text-lg);
  font-family: inherit;
  color: var(--text-primary);
  outline: none;
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.clear-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.clear-btn:hover {
  background: var(--border-light);
  color: var(--text-primary);
}

.search-suggestions {
  padding: var(--space-6);
}

.suggestion-title {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-tertiary);
  margin-bottom: var(--space-4);
}

.suggestion-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.suggestion-tag {
  padding: var(--space-2) var(--space-4);
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.suggestion-tag:hover {
  background: var(--primary-100);
  color: var(--primary-700);
}

/* User Menu */
.user-menu-header {
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--border-light);
}

.user-name {
  display: block;
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.user-email {
  display: block;
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin-top: var(--space-1);
}

/* Mobile Menu */
.mobile-menu-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  z-index: 200;
}

.mobile-menu {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 320px;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-2xl);
}

.mobile-menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--border-light);
}

.mobile-menu-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.close-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
}

.mobile-nav {
  flex: 1;
  padding: var(--space-4);
}

.mobile-nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
  color: var(--text-primary);
  text-decoration: none;
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  border-radius: var(--radius-lg);
  transition: all var(--duration-fast);
}

.mobile-nav-item:hover {
  background: var(--bg-tertiary);
}

.mobile-nav-item.active {
  background: var(--primary-50);
  color: var(--primary-600);
}

.mobile-nav-item .el-icon {
  color: var(--text-tertiary);
}

.mobile-menu-footer {
  padding: var(--space-6);
  border-top: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.mobile-user {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.mobile-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
  color: white;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
}

.mobile-user-info {
  display: flex;
  flex-direction: column;
}

.mobile-user-name {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.mobile-user-email {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-normal);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all var(--duration-normal) var(--ease-out);
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Responsive */
@media (max-width: 768px) {
  .brand-text {
    font-size: var(--text-lg);
  }
  
  .search-container {
    margin: 0 var(--space-4);
    border-radius: var(--radius-xl);
  }
  
  .search-input-wrapper {
    padding: var(--space-4);
  }
  
  .search-suggestions {
    padding: var(--space-4);
  }
}
</style>
