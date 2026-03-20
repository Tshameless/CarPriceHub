/**
 * Vue Router 配置
 */
import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

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
    meta: { title: '个人中心' },
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

// 路由守卫 - 设置页面标题
router.beforeEach((to, from, next) => {
  const title = to.meta.title as string;
  if (title) {
    document.title = `${title} - 车价通 CarPriceHub`;
  }
  next();
});

export default router;
