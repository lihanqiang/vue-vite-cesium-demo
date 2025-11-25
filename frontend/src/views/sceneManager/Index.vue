<template>
  <div class="scene-management">
    <div class="header">
      <h2 class="title">场景管理</h2>
      <div class="action-buttons">
        <a-button type="primary" icon="plus" @click="handleAddScene">
          创建新场景
        </a-button>
        <a-button icon="upload" style="margin-left: 8px;" @click="handleImportScene">
          导入场景
        </a-button>
      </div>
    </div>
    <div class="filter-bar">
      <a-select placeholder="全部场景" style="width: 150px; margin-right: 16px;" v-model:value="selectedFilter">
        <a-select-option value="all">全部场景</a-select-option>
        <a-select-option value="active">已激活</a-select-option>
        <a-select-option value="pending">待审核</a-select-option>
        <a-select-option value="archived">已归档</a-select-option>
      </a-select>
      <a-input placeholder="搜索场景..." style="width: 200px; margin-right: 16px;" v-model:value="searchKeyword" />
      <a-button icon="search" @click="handleSearch">搜索</a-button>
      <a-button icon="refresh" style="margin-left: 8px;" @click="handleRefresh">刷新</a-button>
    </div>
    <SceneList :scenes="filteredScenes" @edit="handleEditScene" @delete="handleDeleteScene" @add="handleAddScene" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import SceneList from './components/SceneList.vue';
import { message } from 'ant-design-vue';

// 定义场景类型
interface Scene {
  id: number;
  name: string;
  location: string;
  status: 'active' | 'pending' | 'archived' | 'emergency';
  updateTime: string;
  operator: string;
  image: string;
}

// 模拟场景数据
const scenes = ref<Scene[]>([
  {
    id: 1,
    name: '城市中心区域监控',
    location: '北京市朝阳区CBD区域',
    status: 'active',
    updateTime: '2023-05-15',
    operator: '管理员',
    image: 'https://picsum.photos/id/1015/800/450',
  },
  {
    id: 2,
    name: '山区救援演练场景',
    location: '河北省张家口市山区',
    status: 'pending',
    updateTime: '2023-05-12',
    operator: '操作员A',
    image: 'https://picsum.photos/id/1016/800/450',
  },
  {
    id: 3,
    name: '海岸线巡逻监控',
    location: '山东省青岛市海岸线',
    status: 'active',
    updateTime: '2023-05-10',
    operator: '管理员',
    image: 'https://picsum.photos/id/1019/800/450',
  },
  {
    id: 4,
    name: '农田监测场景',
    location: '河南省郑州市农田区',
    status: 'archived',
    updateTime: '2023-04-28',
    operator: '操作员B',
    image: 'https://picsum.photos/id/1031/800/450',
  },
  {
    id: 5,
    name: '电力线路巡检场景',
    location: '山西省大同市输电线路',
    status: 'active',
    updateTime: '2023-05-05',
    operator: '操作员C',
    image: 'https://picsum.photos/id/1043/800/450',
  },
  {
    id: 6,
    name: '森林火灾监测',
    location: '内蒙古呼伦贝尔森林区',
    status: 'emergency',
    updateTime: '2023-05-16',
    operator: '管理员',
    image: 'https://picsum.photos/id/1067/800/450',
  },
]);

// 筛选和搜索
const selectedFilter = ref<string>('all');
const searchKeyword = ref<string>('');

// 过滤后的场景
const filteredScenes = computed<Scene[]>(() => {
  return scenes.value.filter(scene => {
    // 状态筛选
    if (selectedFilter.value !== 'all' && scene.status !== selectedFilter.value) {
      return false;
    }
    // 关键词搜索
    if (searchKeyword.value && !scene.name.includes(searchKeyword.value) && !scene.location.includes(searchKeyword.value)) {
      return false;
    }
    return true;
  });
});

// 事件处理函数
const handleAddScene = () => {
  message.success('创建新场景');
  // 跳转或弹窗逻辑
};

const handleImportScene = () => {
  message.success('导入场景');
  // 导入逻辑
};

const handleEditScene = (scene: Scene) => {
  message.success(`编辑场景: ${scene.name}`);
  // 跳转或弹窗逻辑
};

const handleDeleteScene = (sceneId: number) => {
  message.success(`删除场景ID: ${sceneId}`);
  // 删除逻辑
  scenes.value = scenes.value.filter(scene => scene.id !== sceneId);
};

const handleSearch = () => {
  // 搜索逻辑（由computed自动处理）
};

const handleRefresh = () => {
  // 刷新逻辑
  selectedFilter.value = 'all';
  searchKeyword.value = '';
  message.success('已刷新');
};
</script>

<style lang="less" scoped>
.scene-management {
  padding: 0 40px;
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .title {
      font-size: 20px;
      font-weight: 600;
      color: #001529;
    }

    .action-buttons {
      display: flex;
    }
  }

  .filter-bar {
    display: flex;
    align-items: center;
    margin-bottom: 24px;
    padding: 16px;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
}
</style>