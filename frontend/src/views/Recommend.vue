<template>
  <div class="recommend-page">
    <el-steps :active="currentStep" class="recommend-steps" finish-status="success">
      <el-step title="财务状况" :icon="User">
        <template #description>
          <span class="step-description">收入与预算</span>
        </template>
      </el-step>
      <el-step title="家庭与用车" :icon="HomeFilled">
        <template #description>
          <span class="step-description">家庭情况与使用场景</span>
        </template>
      </el-step>
      <el-step title="推荐结果" :icon="Opportunity">
        <template #description>
          <span class="step-description">AI智能推荐</span>
        </template>
      </el-step>
    </el-steps>

    <div class="recommend-content">
      <!-- Step 1: 财务状况 -->
      <el-card v-if="currentStep === 0" class="step-card">
        <template #header>
          <div class="card-header">
            <h2>💰 财务状况</h2>
            <p class="card-subtitle">请提供您的财务信息，以便我们为您推荐最适合的车型</p>
          </div>
        </template>
        
        <el-form
          ref="form1Ref"
          :model="formData"
          :rules="formRules1"
          label-width="180px"
          label-position="top"
          size="large"
        >
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12">
              <el-form-item label="月收入（税后，元）" prop="monthly_income">
                <el-input-number
                  v-model="formData.monthly_income"
                  :min="5000"
                  :max="500000"
                  :step="1000"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item label="家庭月总收入（元）" prop="family_monthly_income">
                <el-input-number
                  v-model="formData.family_monthly_income"
                  :min="0"
                  :step="1000"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item label="可用首付存款（元）" prop="savings_for_down_payment">
                <el-input-number
                  v-model="formData.savings_for_down_payment"
                  :min="0"
                  :step="10000"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item label="月供承受上限（元）" prop="max_monthly_payment">
                <el-input-number
                  v-model="formData.max_monthly_payment"
                  :min="0"
                  :max="50000"
                  :step="500"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item label="是否有房贷/租金" prop="has_mortgage">
                <el-radio-group v-model="formData.has_mortgage">
                  <el-radio :label="false">无</el-radio>
                  <el-radio :label="true">有</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item label="房贷/租金月支出（元）" prop="mortgage_monthly">
                <el-input-number
                  v-model="formData.mortgage_monthly"
                  :min="0"
                  :step="500"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <div class="step-actions">
          <el-button type="primary" size="large" @click="nextStep">
            下一步
          </el-button>
        </div>
      </el-card>

      <!-- Step 2: 家庭与用车情况 -->
      <el-card v-if="currentStep === 1" class="step-card">
        <template #header>
          <div class="card-header">
            <h2>👨‍👩‍👧 家庭与用车情况</h2>
            <p class="card-subtitle">请提供您的家庭情况和用车需求</p>
          </div>
        </template>

        <el-form
          ref="form2Ref"
          :model="formData"
          :rules="formRules2"
          label-width="180px"
          label-position="top"
          size="large"
        >
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12">
              <el-form-item label="婚姻状况" prop="marital_status">
                <el-select v-model="formData.marital_status" placeholder="请选择" style="width: 100%">
                  <el-option label="未婚" value="single" />
                  <el-option label="已婚" value="married" />
                  <el-option label="离异" value="divorced" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item label="是否有小孩" prop="has_children">
                <el-radio-group v-model="formData.has_children">
                  <el-radio :label="false">无</el-radio>
                  <el-radio :label="true">有</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item label="孩子数量" prop="children_count">
                <el-input-number
                  v-model="formData.children_count"
                  :min="0"
                  :max="5"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item label="家庭常住人口" prop="family_members">
                <el-input-number
                  v-model="formData.family_members"
                  :min="1"
                  :max="10"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item label="是否已有车" prop="car_ownership">
                <el-select v-model="formData.car_ownership" placeholder="请选择" style="width: 100%">
                  <el-option label="无（首车）" value="none" />
                  <el-option label="有 1 辆" value="one" />
                  <el-option label="有 2 辆+" value="two_or_more" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item label="主要使用场景" prop="primary_usage">
                <el-select v-model="formData.primary_usage" placeholder="请选择" style="width: 100%">
                  <el-option label="上下班通勤" value="commute" />
                  <el-option label="家庭出行" value="family" />
                  <el-option label="商务接待" value="business" />
                  <el-option label="自驾游" value="travel" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item label="日均行驶里程（km）" prop="daily_mileage">
                <el-input-number
                  v-model="formData.daily_mileage"
                  :min="0"
                  :max="200"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item label="是否限牌城市" prop="restricted_plate_city">
                <el-radio-group v-model="formData.restricted_plate_city">
                  <el-radio :label="false">否</el-radio>
                  <el-radio :label="true">是</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <div class="step-actions">
          <el-button size="large" @click="prevStep">上一步</el-button>
          <el-button
            type="primary"
            size="large"
            :loading="recommendStore.loading"
            @click="submitProfile"
          >
            获取推荐
          </el-button>
        </div>
      </el-card>

      <!-- Step 3: 推荐结果 -->
      <div v-if="currentStep === 2" class="step-card">
        <el-alert
          title="智能推荐结果"
          description="以下是根据您的财务状况、家庭情况和用车需求综合计算的最优车型推荐"
          type="success"
          show-icon
          :closable="false"
          class="results-alert"
        />

        <div v-if="recommendStore.recommendations.length > 0" class="recommendations-grid">
          <el-row :gutter="24">
            <el-col
              v-for="(rec, index) in recommendStore.recommendations"
              :key="rec.car.id"
              :xs="24"
              :lg="12"
            >
              <RecommendationCard :recommendation="rec" :rank="index + 1" />
            </el-col>
          </el-row>
        </div>

        <el-empty
          v-else-if="!recommendStore.loading"
          description="暂无推荐结果"
          class="empty-results"
        />

        <div class="step-actions">
          <el-button size="large" @click="resetForm">重新评估</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import {
  User,
  HomeFilled,
  Opportunity,
} from '@element-plus/icons-vue';
import { useRecommendStore } from '@/stores';
import RecommendationCard from '@/components/RecommendationCard.vue';
import type { UserProfile } from '@/types';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';

const router = useRouter();
const recommendStore = useRecommendStore();

const currentStep = ref(0);
const form1Ref = ref<FormInstance>();
const form2Ref = ref<FormInstance>();

const formData = reactive<UserProfile>({
  monthly_income: 0,
  family_monthly_income: undefined,
  savings_for_down_payment: 0,
  max_monthly_payment: 0,
  has_mortgage: false,
  mortgage_monthly: undefined,
  marital_status: 'single',
  has_children: false,
  children_count: undefined,
  children_age_range: undefined,
  living_with_parents: false,
  family_members: 1,
  planning_children: false,
  car_ownership: 'none',
  car_count: 0,
  old_car_trade_in: false,
  old_car_value: undefined,
  primary_usage: 'commute',
  daily_mileage: 30,
  parking_condition: 'fixed_with_charger',
  restricted_plate_city: false,
});

const formRules1: FormRules = {
  monthly_income: [
    { required: true, message: '请输入月收入', trigger: 'blur' },
  ],
  savings_for_down_payment: [
    { required: true, message: '请输入可用首付存款', trigger: 'blur' },
  ],
  max_monthly_payment: [
    { required: true, message: '请输入月供承受上限', trigger: 'blur' },
  ],
};

const formRules2: FormRules = {
  marital_status: [
    { required: true, message: '请选择婚姻状况', trigger: 'change' },
  ],
  family_members: [
    { required: true, message: '请输入家庭常住人口', trigger: 'blur' },
  ],
  car_ownership: [
    { required: true, message: '请选择是否已有车', trigger: 'change' },
  ],
  primary_usage: [
    { required: true, message: '请选择主要使用场景', trigger: 'change' },
  ],
};

const nextStep = async () => {
  if (!form1Ref.value) return;
  
  try {
    await form1Ref.value.validate();
    currentStep.value++;
  } catch (error) {
    ElMessage.error('请填写完整的财务信息');
  }
};

const prevStep = () => {
  currentStep.value--;
};

const submitProfile = async () => {
  if (!form2Ref.value) return;
  
  try {
    await form2Ref.value.validate();
    await recommendStore.submitProfile(formData);
    currentStep.value++;
  } catch (error) {
    ElMessage.error('请填写完整的家庭与用车信息');
  }
};

const resetForm = () => {
  currentStep.value = 0;
  recommendStore.reset();
  Object.assign(formData, {
    monthly_income: 0,
    family_monthly_income: undefined,
    savings_for_down_payment: 0,
    max_monthly_payment: 0,
    has_mortgage: false,
    mortgage_monthly: undefined,
    marital_status: 'single',
    has_children: false,
    children_count: undefined,
    children_age_range: undefined,
    living_with_parents: false,
    family_members: 1,
    planning_children: false,
    car_ownership: 'none',
    car_count: 0,
    old_car_trade_in: false,
    old_car_value: undefined,
    primary_usage: 'commute',
    daily_mileage: 30,
    parking_condition: 'fixed_with_charger',
    restricted_plate_city: false,
  });
};

const getRankType = (rank: number): string => {
  if (rank === 1) return 'danger';
  if (rank === 2) return '';
  if (rank === 3) return 'warning';
  return 'info';
};
</script>

<style scoped>
.recommend-page {
  padding: 0 24px 24px;
}

.recommend-steps {
  margin-bottom: 32px;
}

.step-description {
  font-size: 12px;
  color: #909399;
}

.recommend-content {
  max-width: 1200px;
  margin: 0 auto;
}

.step-card {
  margin-bottom: 24px;
}

.card-header h2 {
  margin: 0;
  font-size: 24px;
}

.card-subtitle {
  margin: 8px 0 0;
  color: #909399;
  font-size: 14px;
}

.step-actions {
  margin-top: 32px;
  text-align: center;
  display: flex;
  gap: 16px;
  justify-content: center;
}

.results-alert {
  margin-bottom: 24px;
}

.recommendations-grid {
  margin-bottom: 24px;
}

.recommendation-card-placeholder {
  margin-bottom: 24px;
}

.card-rank {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rank-badge {
  font-size: 16px;
  font-weight: bold;
}

.recommendation-content p {
  margin: 8px 0;
}

.empty-results {
  padding: 80px 0;
}

@media (max-width: 768px) {
  .recommend-page {
    padding: 0 16px 16px;
  }
  
  .step-actions {
    flex-direction: column;
  }
  
  .card-header h2 {
    font-size: 20px;
  }
}
</style>
