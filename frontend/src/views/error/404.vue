<template>
  <div class="error-container">
    <div class="error-content">
      <h1 class="error-code">404</h1>
      <p class="error-message">抱歉，您访问的页面不存在</p>
      <router-link to="/" exact-active-class="exact-active" class="back-home-btn">返回首页</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<style scoped>
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.error-content {
  text-align: center;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.error-code {
  font-size: 72px;
  font-weight: bold;
  color: #1890ff;
  margin-bottom: 16px;
}

.error-message {
  font-size: 18px;
  color: #666;
  margin-bottom: 24px;
}

.back-home-btn {
  display: inline-block;
  padding: 10px 20px;
  background-color: #1890ff;
  color: white;
  border-radius: 4px;
  text-decoration: none;
  transition: background-color 0.3s;
}

.back-home-btn:hover {
  background-color: #096dd9;
}
</style>