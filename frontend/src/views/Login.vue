<template>
  <div class="auth-page">
    <div class="auth-container">
      <!-- Left Side - Branding -->
      <div class="auth-branding">
        <div class="branding-content">
          <div class="logo">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 10L3 16L5 16L7 10H5Z" fill="currentColor"/>
              <path d="M19 10L21 16H19L17 10H19Z" fill="currentColor"/>
              <path d="M7 10H17L16 7C15.5 6 14.5 5 12 5C9.5 5 8.5 6 8 7L7 10Z" fill="currentColor"/>
              <path d="M6 12H18L17 18C16.5 19 15.5 20 12 20C8.5 20 7.5 19 7 18L6 12Z" fill="currentColor"/>
            </svg>
            <span>车价通</span>
          </div>
          <h1>找到你的理想座驾</h1>
          <p>汇聚全网实时车价，AI 智能推荐，让购车决策更简单</p>
          <div class="features">
            <div class="feature">
              <el-icon><Check /></el-icon>
              <span>500+ 车型数据</span>
            </div>
            <div class="feature">
              <el-icon><Check /></el-icon>
              <span>24小时实时更新</span>
            </div>
            <div class="feature">
              <el-icon><Check /></el-icon>
              <span>AI 智能推荐</span>
            </div>
          </div>
        </div>
        <div class="branding-decoration">
          <div class="decoration-circle"></div>
          <div class="decoration-circle"></div>
          <div class="decoration-circle"></div>
        </div>
      </div>

      <!-- Right Side - Form -->
      <div class="auth-form-wrapper">
        <div class="form-container">
          <div class="form-header">
            <h2>欢迎回来</h2>
            <p>登录你的账号，继续探索</p>
          </div>

          <form class="auth-form" @submit.prevent="handleSubmit">
            <div class="form-group">
              <label class="form-label">用户名</label>
              <div class="input-wrapper">
                <el-icon class="input-icon"><User /></el-icon>
                <input
                  v-model="form.username"
                  type="text"
                  placeholder="请输入用户名"
                  class="form-input"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">
                密码
                <router-link to="/forgot-password" class="forgot-link">
                  忘记密码？
                </router-link>
              </label>
              <div class="input-wrapper">
                <el-icon class="input-icon"><Lock /></el-icon>
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="请输入密码"
                  class="form-input"
                  required
                />
                <button
                  type="button"
                  class="toggle-password"
                  @click="showPassword = !showPassword"
                >
                  <el-icon v-if="showPassword"><View /></el-icon>
                  <el-icon v-else><Hide /></el-icon>
                </button>
              </div>
            </div>

            <div class="form-options">
              <label class="checkbox-wrapper">
                <input v-model="rememberMe" type="checkbox" />
                <span class="checkmark"></span>
                <span class="checkbox-label">记住我</span>
              </label>
            </div>

            <button
              type="submit"
              class="submit-btn"
              :disabled="loading"
            >
              <span v-if="!loading">登录</span>
              <el-icon v-else class="loading-icon"><Loading /></el-icon>
            </button>
          </form>

          <div class="form-footer">
            <p>还没有账号？</p>
            <router-link to="/register" class="link-btn">
              立即注册
              <el-icon><ArrowRight /></el-icon>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  User,
  Lock,
  View,
  Hide,
  ArrowRight,
  Check,
  Loading,
} from '@element-plus/icons-vue';
import { useAuthStore } from '@/stores';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  username: '',
  password: '',
});

const showPassword = ref(false);
const rememberMe = ref(false);
const loading = ref(false);

const handleSubmit = async () => {
  if (!form.username || !form.password) {
    ElMessage.warning('请填写完整信息');
    return;
  }

  loading.value = true;
  try {
    await authStore.login(form.username, form.password);
    ElMessage.success('登录成功');
    router.push('/');
  } catch (error: any) {
    ElMessage.error(error.message || '登录失败');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
}

.auth-container {
  display: grid;
  grid-template-columns: 1fr 480px;
  width: 100%;
}

/* Branding Side */
.auth-branding {
  position: relative;
  background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-12);
  overflow: hidden;
}

.branding-content {
  position: relative;
  z-index: 1;
  max-width: 480px;
  color: white;
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-8);
}

.logo svg {
  width: 48px;
  height: 48px;
}

.logo span {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
}

.branding-content h1 {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  margin-bottom: var(--space-4);
}

.branding-content > p {
  font-size: var(--text-lg);
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: var(--space-8);
  line-height: var(--leading-relaxed);
}

.features {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.feature {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-base);
  color: rgba(255, 255, 255, 0.9);
}

.feature .el-icon {
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-sm);
}

.branding-decoration {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.decoration-circle:nth-child(1) {
  width: 600px;
  height: 600px;
  top: -200px;
  right: -200px;
}

.decoration-circle:nth-child(2) {
  width: 400px;
  height: 400px;
  bottom: -100px;
  left: -100px;
}

.decoration-circle:nth-child(3) {
  width: 300px;
  height: 300px;
  top: 50%;
  left: 30%;
  transform: translate(-50%, -50%);
}

/* Form Side */
.auth-form-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  background: var(--bg-secondary);
}

.form-container {
  width: 100%;
  max-width: 400px;
}

.form-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.form-header h2 {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.form-header p {
  font-size: var(--text-base);
  color: var(--text-secondary);
  margin: 0;
}

/* Form */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
}

.forgot-link {
  font-size: var(--text-sm);
  color: var(--primary-600);
  text-decoration: none;
}

.forgot-link:hover {
  text-decoration: underline;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: var(--space-4);
  color: var(--text-tertiary);
  font-size: var(--text-lg);
}

.form-input {
  width: 100%;
  padding: var(--space-4) var(--space-4) var(--space-4) var(--space-12);
  background: var(--bg-primary);
  border: 1.5px solid var(--border-medium);
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  font-family: inherit;
  color: var(--text-primary);
  transition: all var(--duration-fast);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px var(--primary-100);
}

.form-input::placeholder {
  color: var(--text-tertiary);
}

.toggle-password {
  position: absolute;
  right: var(--space-4);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: all var(--duration-fast);
}

.toggle-password:hover {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

/* Checkbox */
.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.checkbox-wrapper input {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-medium);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-fast);
}

.checkbox-wrapper input:checked + .checkmark {
  background: var(--primary-600);
  border-color: var(--primary-600);
}

.checkbox-wrapper input:checked + .checkmark::after {
  content: '';
  width: 5px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* Submit Button */
.submit-btn {
  width: 100%;
  padding: var(--space-4);
  background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--duration-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(79, 92, 232, 0.4);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Form Footer */
.form-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  margin-top: var(--space-8);
  padding-top: var(--space-6);
  border-top: 1px solid var(--border-light);
}

.form-footer p {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0;
}

.link-btn {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--primary-600);
  text-decoration: none;
  transition: color var(--duration-fast);
}

.link-btn:hover {
  color: var(--primary-700);
}

/* Responsive */
@media (max-width: 992px) {
  .auth-container {
    grid-template-columns: 1fr;
  }
  
  .auth-branding {
    display: none;
  }
  
  .auth-form-wrapper {
    padding: var(--space-6);
  }
}
</style>
