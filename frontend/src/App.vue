<template>
  <el-config-provider :locale="zhCn">
    <div id="app">
      <el-container style="min-height: 100vh">
        <AppHeader />
        <el-main class="main-content">
          <router-view />
        </el-main>
        <AppFooter />
      </el-container>
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import AppHeader from '@/components/Layout/Header.vue';
import AppFooter from '@/components/Layout/Footer.vue';
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.main-content {
  padding: 0;
  background-color: #f5f7fa;
}
</style>
