<template>
  <div class="login-page">
    <el-card class="login-card">
      <template #header>
        <div class="login-header">
          <h2>欢迎回来</h2>
          <p>登录车价通，开启智能购车之旅</p>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @keyup.enter="handleSubmit"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="rememberMe">记住我</el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            @click="handleSubmit"
            class="submit-btn"
          >
            登录
          </el-button>
        </el-form-item>

        <div class="login-footer">
          <span>还没有账号？</span>
          <el-button type="primary" link @click="router.push('/register')">
            立即注册
          </el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, Lock } from '@element-plus/icons-vue';
import { useAuthStore } from '@/stores';

const router = useRouter();
const authStore = useAuthStore();

const formRef = ref();
const loading = ref(false);
const rememberMe = ref(false);

const form = reactive({
  username: '',
  password: '',
});

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度应为3-50个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6个字符', trigger: 'blur' },
  ],
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    loading.value = true;
    try {
      await authStore.login(form.username, form.password);
      ElMessage.success('登录成功');
      
      // 如果有记住我，可以在这里处理
      if (rememberMe.value) {
        localStorage.setItem('remember-username', form.username);
      }
      
      // 跳转到首页或之前访问的页面
      const redirect = router.currentRoute.value.query.redirect as string;
      router.push(redirect || '/');
    } catch (error: any) {
      ElMessage.error(error.message || '登录失败，请检查用户名和密码');
    } finally {
      loading.value = false;
    }
  });
};

// 自动填充记住的用户名
const savedUsername = localStorage.getItem('remember-username');
if (savedUsername) {
  form.username = savedUsername;
  rememberMe.value = true;
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 420px;
}

.login-header {
  text-align: center;
}

.login-header h2 {
  margin: 0 0 8px;
  font-size: 24px;
  color: #303133;
}

.login-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.submit-btn {
  width: 100%;
}

.login-footer {
  text-align: center;
  margin-top: 16px;
  color: #606266;
}
</style>
