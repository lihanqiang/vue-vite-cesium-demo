<template>
  <div class="user-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>用户管理</h2>
    </div>

    <!-- Tab 切换 -->
    <a-tabs v-model:activeKey="activeTab" class="tab-container" animated>
      <a-tab-pane key="user" tab="用户管理">
        <UserTab />
      </a-tab-pane>
      <a-tab-pane key="role" tab="角色权限">
        <RoleTab />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import UserTab from './components/UserTab.vue';
import RoleTab from './components/RoleTab.vue';

// 状态定义
const activeTab = ref<string>('user');

// 初始化数据
onMounted(() => {
});

</script>

<style scoped lang="less">
.user-management {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  .page-header {
    margin-bottom: 20px;
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 10px;

    h2 {
      font-size: 18px;
      font-weight: 600;
      color: #1d2129;
      margin: 0;
    }
  }

  .tab-container {
    margin-bottom: 20px;
  }
}
</style>