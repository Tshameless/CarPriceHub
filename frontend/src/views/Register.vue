<template>
  <div class="register-page">
    <el-card class="register-card">
      <template #header>
        <div class="register-header">
          <h2>创建账号</h2>
          <p>加入车价通，获取个性化购车推荐</p>
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
            placeholder="请输入用户名（3-50个字符）"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="form.email"
            placeholder="请输入邮箱地址"
            size="large"
            :prefix-icon="Message"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码（至少6个字符）"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item prop="agreement">
          <el-checkbox v-model="form.agreement">
            我已阅读并同意
            <el-button type="primary" link @click.stop="showAgreement">
              用户协议
            </el-button>
            和
            <el-button type="primary" link @click.stop="showPrivacy">
              隐私政策
            </el-button>
          </el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            @click="handleSubmit"
            class="submit-btn"
          >
            注册
          </el-button>
        </el-form-item>

        <div class="register-footer">
          <span>已有账号？</span>
          <el-button type="primary" link @click="router.push('/login')">
            立即登录
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
import { User, Lock, Message } from '@element-plus/icons-vue';
import { useAuthStore } from '@/stores';

const router = useRouter();
const authStore = useAuthStore();

const formRef = ref();
const loading = ref(false);

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreement: false,
});

const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度应为3-50个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
  agreement: [
    {
      validator: (rule: any, value: boolean, callback: any) => {
        if (!value) {
          callback(new Error('请阅读并同意用户协议和隐私政策'));
        } else {
          callback();
        }
      },
      trigger: 'change',
    },
  ],
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    loading.value = true;
    try {
      await authStore.register(form.username, form.email, form.password);
      ElMessage.success('注册成功，已自动登录');
      router.push('/');
    } catch (error: any) {
      ElMessage.error(error.message || '注册失败，请稍后重试');
    } finally {
      loading.value = false;
    }
  });
};

const showAgreement = () => {
  ElMessage.info('用户协议功能开发中...');
};

const showPrivacy = () => {
  ElMessage.info('隐私政策功能开发中...');
};
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 24px;
}

.register-card {
  width: 100%;
  max-width: 420px;
}

.register-header {
  text-align: center;
}

.register-header h2 {
  margin: 0 0 8px;
  font-size: 24px;
  color: #303133;
}

.register-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.submit-btn {
  width: 100%;
}

.register-footer {
  text-align: center;
  margin-top: 16px;
  color: #606266;
}
</style>
