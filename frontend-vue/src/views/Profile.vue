<template>
  <div class="profile-page">
    <el-card class="profile-card">
      <el-tabs v-model="activeTab" class="profile-tabs">
        <el-tab-pane name="favorites">
          <template #label>
            <el-icon><Star /></el-icon> 收藏车型
          </template>
          <div class="tab-content">
            <el-list v-if="favorites.length > 0">
              <el-list-item v-for="item in favorites" :key="item.id">
                <el-list-item-meta
                  :title="`${item.brand} ${item.model_name}`"
                  :description="`¥${item.price_discount}万`"
                />
                <template #actions>
                  <el-button type="primary" link @click="viewCarDetail(item.id)">
                    查看详情
                  </el-button>
                  <el-button type="danger" link @click="removeFavorite(item.id)">
                    删除
                  </el-button>
                </template>
              </el-list-item>
            </el-list>
            <el-empty
              v-else
              description="暂无收藏"
              class="empty-content"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane name="alerts">
          <template #label>
            <el-icon><Bell /></el-icon> 价格提醒
          </template>
          <div class="tab-content">
            <el-list v-if="alerts.length > 0">
              <el-list-item v-for="item in alerts" :key="item.id">
                <el-list-item-meta>
                  <template #title>
                    {{ item.carName }} - 目标价 ¥{{ item.targetPrice }}万
                  </template>
                  <template #description>
                    {{ item.status === 'active' ? '监控中' : '已触发' }}
                  </template>
                </el-list-item-meta>
                <template #actions>
                  <el-tag :type="item.status === 'active' ? 'info' : 'success'">
                    {{ item.status === 'active' ? '监控中' : '已触发' }}
                  </el-tag>
                  <el-button
                    v-if="item.status === 'active'"
                    type="danger"
                    link
                    @click="removeAlert(item.id)"
                  >
                    删除
                  </el-button>
                </template>
              </el-list-item>
            </el-list>
            <el-empty
              v-else
              description="暂无价格提醒"
              class="empty-content"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane name="history">
          <template #label>
            <el-icon><Clock /></el-icon> 查询历史
          </template>
          <div class="tab-content">
            <el-list v-if="history.length > 0">
              <el-list-item v-for="item in history" :key="item.id">
                <el-list-item-meta
                  :title="item.keyword || '全部车型'"
                  :description="item.timestamp"
                />
                <template #actions>
                  <el-button type="primary" link @click="reSearch(item.keyword)">
                    重新搜索
                  </el-button>
                </template>
              </el-list-item>
            </el-list>
            <el-empty
              v-else
              description="暂无查询历史"
              class="empty-content"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const activeTab = ref('favorites');

// 模拟数据
const favorites = ref<any[]>([]);
const alerts = ref<any[]>([]);
const history = ref<any[]>([]);

const viewCarDetail = (carId: string) => {
  router.push(`/car/${carId}`);
};

const removeFavorite = (carId: string) => {
  // TODO: 实现移除收藏逻辑
};

const removeAlert = (alertId: string) => {
  // TODO: 实现移除价格提醒逻辑
};

const reSearch = (keyword?: string) => {
  if (keyword) {
    router.push(`/search?keyword=${encodeURIComponent(keyword)}`);
  } else {
    router.push('/search');
  }
};
</script>

<style scoped>
.profile-page {
  padding: 0 24px 24px;
}

.profile-card {
  max-width: 1200px;
  margin: 0 auto;
}

.profile-tabs {
  min-height: 500px;
}

.tab-content {
  padding: 24px 0;
}

.empty-content {
  padding: 80px 0;
}

@media (max-width: 768px) {
  .profile-page {
    padding: 0 16px 16px;
  }
}
</style>
