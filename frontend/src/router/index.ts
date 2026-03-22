/**
 * Vue Router 配置
 */
import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页' },
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/Search.vue'),
    meta: { title: '搜索' },
  },
  {
    path: '/car/:id',
    name: 'CarDetail',
    component: () => import('@/views/CarDetail.vue'),
    meta: { title: '车辆详情' },
  },
  {
    path: '/recommend',
    name: 'Recommend',
    component: () => import('@/views/Recommend.vue'),
    meta: { title: '智能推荐' },
  },
  {
    path: '/compare',
    name: 'Compare',
    component: () => import('@/views/Compare.vue'),
    meta: { title: '车辆对比' },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { title: '个人中心', requiresAuth: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', guestOnly: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { title: '注册', guestOnly: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

// 路由守卫 - 设置页面标题和权限验证
router.beforeEach((to, from, next) => {
  const title = to.meta.title as string;
  if (title) {
    document.title = `${title} - 车价通 CarPriceHub`;
  }

  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;

  // 需要登录的页面
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({
      path: '/login',
      query: { redirect: to.fullPath },
    });
    return;
  }

  // 仅限游客访问的页面（登录、注册）
  if (to.meta.guestOnly && isAuthenticated) {
    next('/');
    return;
  }

  next();
});

export default router;
