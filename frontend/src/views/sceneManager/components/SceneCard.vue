<template>
  <a-card class="scene-card" hoverable>
    <template #cover>
      <img :src="scene.image" alt="场景图片" class="card-image">
      <div class="status-tag">
        <a-tag :color="statusColor">{{ statusText }}</a-tag>
      </div>
      <div class="action-dropdown">
        <a-dropdown>
          <template #overlay>
            <a-menu>
              <a-menu-item @click="handleEdit">
                <span>编辑</span>
              </a-menu-item>
              <a-menu-item @click="handleDelete">
                <span>删除</span>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </template>
    <a-card-meta class="card-meta" :title="scene.name" :description="scene.location" />
    <div class="card-footer">
      <div class="update-time">更新于 {{ scene.updateTime }}</div>
      <div class="operator">操作员: {{ scene.operator }}</div>
    </div>
    <div class="card-actions">
      <a-button type="text" @click="handleEdit">查看详情</a-button>
      <a-button type="text" icon="copy" @click="handleCopy">复制</a-button>
    </div>
  </a-card>
</template>

<script setup lang="ts">

// 定义props和emits
const props = defineProps<{
  scene: {
    id: number;
    name: string;
    location: string;
    status: 'active' | 'pending' | 'archived' | 'emergency';
    updateTime: string;
    operator: string;
    image: string;
  };
}>();

const emit = defineEmits<{
  (e: 'edit', scene: typeof props.scene): void;
  (e: 'delete', sceneId: number): void;
}>();

// 处理场景状态
const statusConfig = {
  active: { text: '已激活', color: 'green' },
  pending: { text: '待审核', color: 'orange' },
  archived: { text: '已归档', color: 'gray' },
  emergency: { text: '紧急任务', color: 'red' },
};

const statusText = statusConfig[props.scene.status].text;
const statusColor = statusConfig[props.scene.status].color;

// 事件处理函数
const handleEdit = () => {
  emit('edit', props.scene);
};

const handleDelete = () => {
  emit('delete', props.scene.id);
};

const handleCopy = () => {
  // 复制逻辑
};
</script>

<style lang="less" scoped>
.scene-card {
  width: 100%;
  overflow: hidden;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }

  .card-image {
    height: 160px;
    object-fit: cover;
  }

  .status-tag {
    position: absolute;
    top: 12px;
    left: 12px;
  }

  .action-dropdown {
    position: absolute;
    top: 12px;
    right: 12px;

    .dropdown-trigger {
      font-size: 16px;
      color: #fff;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 4px;
      padding: 4px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background: rgba(0, 0, 0, 0.5);
      }
    }
  }

  .card-meta {
    margin-bottom: 12px;
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #999;
    margin-bottom: 12px;
  }

  .card-actions {
    display: flex;
    justify-content: space-between;
  }
}
</style>