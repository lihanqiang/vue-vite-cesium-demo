<template>
  <div class="header">
    <div class="logo">
      <span class="logo-text">低空飞行安全系统</span>
    </div>
    <a-menu mode="horizontal" :selected-keys="selectedKeys" @select="handleMenuSelect" class="nav-menu">
      <a-menu-item key="sceneManager">
        <span>场景管理</span>
      </a-menu-item>
      <a-menu-item key="aircraft">
        <span>飞机管理</span>
      </a-menu-item>
      <a-menu-item key="map">
        <span>地图服务</span>
      </a-menu-item>
      <a-menu-item key="userManager">
        <span>用户管理</span>
      </a-menu-item>
      <a-menu-item key="platform">
        <span>平台管理</span>
      </a-menu-item>
      <a-menu-item key="command">
        <span>指令管理</span>
      </a-menu-item>
      <a-menu-item key="communication">
        <span>通信管理</span>
      </a-menu-item>
    </a-menu>
    <div class="user-info">
      <span class="utc-time">UTC {{ utcTime }}</span>
      <a-dropdown>
        <span class="user-trigger flex items-center">
          <span class="user-name">管理员</span>
        </span>
        <template #overlay>
          <a-menu>
            <a-menu-item key="profile">
              <span>个人中心</span>
            </a-menu-item>
            <a-menu-item key="settings">
              <span>系统设置</span>
            </a-menu-item>
            <a-menu-divider />
            <a-menu-item key="logout">
              <span @click="handleLogout">退出登录</span>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const selectedKeys = ref<string[]>([]);
const utcTime = ref('2000.1.1 00:00:00')
const updateSelectedKeys = () => {
  const path = route.path.replace('/', '');
  if (path) {
    selectedKeys.value = [path];
  } else {
    selectedKeys.value = ['sceneManager'];
  }
};
// 4. 监听路由路径变化，实时更新 selectedKeys
watch(
  () => route.path, // 监听路由路径的变化
  () => {
    updateSelectedKeys(); // 路径变化时调用更新函数
  }
);
let timer: string | number | NodeJS.Timeout | null | undefined = null
// 初始化选中菜单
onMounted(() => {
  const path = route.path.replace('/', '');
  selectedKeys.value = [path || 'scene'];

  // UTC时间更新
  updateUtcTime();
  timer = setInterval(updateUtcTime, 1000);
});
onUnmounted(() => {
  if(timer){
    clearInterval(timer)
  }
})
// 菜单选择事件
const handleMenuSelect = ({ key }: { key: string }) => {
  selectedKeys.value = [key]
  router.push(`/${key}`);
};

// 更新UTC时间
const updateUtcTime = () => {
  utcTime.value = `${dayjs(new Date()).format('YYYY.MM.DD HH:mm:ss')}`;
};
const handleLogout = () => {
  router.push(`/login`);
}
</script>

<style lang="less" scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 24px;
  background-color: #132843;
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
  -webkit-app-region: drag;

  .logo {
    display: flex;
    align-items: center;

    .logo-icon {
      font-size: 24px;
      margin-right: 8px;
      color: #1890ff;
    }

    .logo-text {
      font-size: 18px;
      font-weight: 600;
    }
  }

  .nav-menu {
    flex: 1;
    margin-left: 64px;
    font-size: 16px;
    background-color: #132843;

    .ant-menu-item {
      -webkit-app-region: no-drag;
    }
  }

  .user-info {
    display: flex;
    align-items: center;

    .utc-time {
      margin-right: 24px;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
    }

    .user-trigger {
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        color: #1890ff;
      }

      .user-icon {
        font-size: 18px;
        margin-right: 8px;
      }

      .user-name {
        font-size: 14px;
      }
    }
  }
}

/* 覆盖Ant Design Vue的菜单样式 */
:deep(.ant-menu-horizontal) {
  border-bottom: none;

  .ant-menu-item {
    -webkit-app-region: no-drag;
    color: rgba(255, 255, 255, 0.7);
    transition: all 0.3s;

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    &.ant-menu-item-selected {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
}
</style>