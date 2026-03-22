<template>
  <el-card
    class="recommendation-card"
    shadow="hover"
    @click="handleClick"
  >
    <template #header>
      <div class="card-header">
        <div class="rank-badge-container">
          <el-tag
            :type="getRankType(rank)"
            effect="dark"
            class="rank-badge"
          >
            {{ rank }}
          </el-tag>
        </div>
        <div class="car-info">
          <h3 class="car-title">{{ recommendation.car.brand }} {{ recommendation.car.model_name }}</h3>
          <div class="car-tags">
            <el-tag size="small">{{ recommendation.car.year }}款</el-tag>
            <el-tag type="success" size="small">
              ¥{{ recommendation.car.price_discount.toFixed(2) }}万
            </el-tag>
          </div>
        </div>
      </div>
    </template>

    <!-- 风险提醒 -->
    <el-alert
      v-if="recommendation.risk_warning"
      :title="recommendation.risk_warning.message"
      :type="getAlertType(recommendation.risk_warning.level)"
      :description="recommendation.risk_warning.suggestion"
      show-icon
      :closable="false"
      class="risk-alert"
    />

    <!-- 推荐理由 -->
    <div class="recommendation-reason">
      <p><strong>推荐理由：</strong>{{ recommendation.reason }}</p>
    </div>

    <!-- 综合评分 -->
    <div class="score-section">
      <div class="score-header">
        <span>综合评分：</span>
        <el-tag type="primary" size="large" class="score-tag">
          {{ recommendation.score.toFixed(1) }}分
        </el-tag>
      </div>
      <el-progress
        :percentage="recommendation.score"
        :color="'#409EFF'"
        :stroke-width="16"
        :show-text="false"
        class="score-progress"
      />
    </div>

    <!-- 详细评分 -->
    <div class="detail-scores">
      <div class="score-item">
        <div class="score-label">财务健康度</div>
        <el-progress
          :percentage="recommendation.financial_health"
          :color="'#67c23a'"
          :stroke-width="8"
          :show-text="false"
        />
        <span class="score-value">{{ Math.round(recommendation.financial_health) }}</span>
      </div>
      <div class="score-item">
        <div class="score-label">家庭适配度</div>
        <el-progress
          :percentage="recommendation.family_fit"
          :color="'#409eff'"
          :stroke-width="8"
          :show-text="false"
        />
        <span class="score-value">{{ Math.round(recommendation.family_fit) }}</span>
      </div>
      <div class="score-item">
        <div class="score-label">场景匹配度</div>
        <el-progress
          :percentage="recommendation.scenario_match"
          :color="'#e6a23c'"
          :stroke-width="8"
          :show-text="false"
        />
        <span class="score-value">{{ Math.round(recommendation.scenario_match) }}</span>
      </div>
    </div>

    <!-- 价格信息 -->
    <el-divider />
    <div class="price-section">
      <el-row justify="space-between" align="middle">
        <el-col>
          <span class="price-original">
            官方价: ¥{{ recommendation.car.price_official.toFixed(2) }}万
          </span>
        </el-col>
        <el-col class="price-main">
          <span class="price-label">优惠价:</span>
          <span class="price-value">
            ¥{{ recommendation.car.price_discount.toFixed(2) }}万
          </span>
        </el-col>
      </el-row>
      <div v-if="recommendation.car.direct_discount > 0" class="price-save">
        直降 ¥{{ recommendation.car.direct_discount.toFixed(2) }}万
      </div>
      <div v-if="recommendation.car.loan_subsidy_amount && recommendation.car.loan_subsidy_amount > 0" class="loan-subsidy">
        <el-tag type="warning" size="small">
          贴息 ¥{{ recommendation.car.loan_subsidy_amount.toFixed(2) }}万
        </el-tag>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { Recommendation } from '@/types';

interface Props {
  recommendation: Recommendation;
  rank: number;
}

const props = defineProps<Props>();
const router = useRouter();

const getRankType = (rank: number): string => {
  if (rank === 1) return 'danger';
  if (rank === 2) return '';
  if (rank === 3) return 'warning';
  return 'info';
};

const getAlertType = (level: string): 'error' | 'warning' | 'info' => {
  if (level === 'critical') return 'error';
  if (level === 'high') return 'warning';
  return 'info';
};

const handleClick = () => {
  router.push(`/car/${props.recommendation.car.id}`);
};
</script>

<style scoped>
.recommendation-card {
  cursor: pointer;
  transition: all 0.3s;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.recommendation-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rank-badge-container {
  flex-shrink: 0;
}

.rank-badge {
  font-size: 18px;
  font-weight: bold;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.car-info {
  flex: 1;
}

.car-title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.car-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.risk-alert {
  margin-bottom: 16px;
}

.recommendation-reason {
  margin-bottom: 16px;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.recommendation-reason p {
  margin: 0;
  line-height: 1.6;
}

.score-section {
  margin-bottom: 16px;
}

.score-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.score-tag {
  font-size: 16px;
  font-weight: bold;
}

.score-progress {
  width: 100%;
}

.detail-scores {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.score-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.score-label {
  min-width: 80px;
  font-size: 14px;
  color: #606266;
}

.score-value {
  min-width: 30px;
  font-size: 14px;
  font-weight: bold;
  color: #303133;
}

.price-section {
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.price-original {
  color: #909399;
  text-decoration: line-through;
}

.price-main {
  text-align: right;
}

.price-label {
  color: #606266;
  margin-right: 8px;
}

.price-value {
  font-size: 24px;
  font-weight: bold;
  color: #67c23a;
}

.price-save {
  margin-top: 8px;
  color: #f56c6c;
  font-size: 14px;
  text-align: center;
}

.loan-subsidy {
  margin-top: 8px;
  text-align: center;
}
</style>
