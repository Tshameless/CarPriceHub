<template>
  <el-footer class="app-footer">
    <div class="footer-container">
      <el-row :gutter="24">
        <el-col :xs="24" :sm="8">
          <div class="footer-section">
            <h4>车价通</h4>
            <p class="footer-text">基于 Tauri 构建的多端汽车价格查询应用</p>
          </div>
        </el-col>
        <el-col :xs="24" :sm="8">
          <div class="footer-section">
            <h4>功能</h4>
            <div class="footer-links">
              <router-link to="/search">价格查询</router-link>
              <router-link to="/recommend">智能推荐</router-link>
              <router-link to="/compare">车型对比</router-link>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="8">
          <div class="footer-section">
            <h4>关于</h4>
            <div class="footer-links">
              <a href="#">使用说明</a>
              <a href="#">隐私政策</a>
              <a href="#">联系我们</a>
            </div>
          </div>
        </el-col>
      </el-row>
      <el-divider />
      <div class="footer-bottom">
        <p>© 2026 车价通 CarPriceHub. 基于 Tauri 技术构建.</p>
      </div>
    </div>
  </el-footer>
</template>

<script setup lang="ts">
</script>

<style scoped>
.app-footer {
  background-color: #f5f5f5;
  padding: 40px 24px 20px;
  height: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-section {
  margin-bottom: 24px;
}

.footer-section h4 {
  margin-bottom: 16px;
  color: #212121;
  font-size: 16px;
  font-weight: 600;
}

.footer-text {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}

.footer-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-links a {
  color: #666;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: #409EFF;
}

.footer-bottom {
  text-align: center;
  padding-top: 16px;
}

.footer-bottom p {
  color: #999;
  font-size: 12px;
  margin: 0;
}
</style>
