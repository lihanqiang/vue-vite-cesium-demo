<template>
  <a-row :gutter="24">
    <!-- 场景卡片 -->
    <a-col v-for="scene in scenes" :key="scene.id" :xs="24" :sm="12" :md="8" :lg="6">
      <SceneCard :scene="scene" @edit="handleEdit" @delete="handleDelete" />
    </a-col>

    <!-- 添加场景卡片 -->
    <a-col :xs="24" :sm="12" :md="8" :lg="6">
      <div
        class="scene-card-add border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer h-full"
        @click="handleAdd">
        <h3 class="add-title">创建新场景</h3>
        <p class="add-desc">设置新的飞行区域和任务参数</p>
      </div>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import SceneCard from './SceneCard.vue';

// 定义props和emits
const props = defineProps<{
  scenes: {
    id: number;
    name: string;
    location: string;
    status: 'active' | 'pending' | 'archived' | 'emergency';
    updateTime: string;
    operator: string;
    image: string;
  }[];
}>();

const emit = defineEmits<{
  (e: 'edit', scene: typeof props.scenes[0]): void;
  (e: 'delete', sceneId: number): void;
  (e: 'add'): void;
}>();

// 事件处理函数
const handleEdit = (scene: typeof props.scenes[0]) => {
  emit('edit', scene);
};

const handleDelete = (sceneId: number) => {
  emit('delete', sceneId);
};

const handleAdd = () => {
  emit('add');
};
</script>

<style lang="less" scoped>
.scene-card-add {
  .add-icon {
    font-size: 32px;
    color: #1890ff;
    margin-bottom: 8px;
  }

  .add-title {
    font-size: 16px;
    font-weight: 600;
    color: #001529;
    margin-bottom: 4px;
  }

  .add-desc {
    font-size: 12px;
    color: #999;
  }
}
</style>