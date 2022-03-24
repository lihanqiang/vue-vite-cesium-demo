<template>
  <div class="panel-wrap" :class="{ hide: !dialogVisible }">
    <slot v-if="$slots.default"></slot>
    <div class="panel" v-else>
      <header class="panel-header">
        <span>{{ props.title }}</span>
        <span class="close-btn" @click="toggle">×</span>
      </header>
      <div class="content">
        <div class="content-item" v-for="(btn, i) in btns" :key="i">
          <header class="item-header">
            {{ btn.label }}
          </header>
          <div class="content-wrap">
            <button :class="{ active: item.active }" v-for="(item, index) in btn.contents" :key="index" @click="clickHandler(item, btn)">{{ item.label }}</button>
          </div>
        </div>
      </div>
    </div>
    <aside class="bar" @click="toggle">
      <span :class="{ 'slide-in': dialogVisible }">＜</span>
    </aside>
  </div>
</template>

<script setup>
import {
  ref, reactive, watchEffect
} from 'vue'

const btns = reactive([
  {
    label: '操作',
    contents: [
      {
        id: 'billboard',
        label: '生成大量节点'
      },
      {
        id: 'sat',
        label: '显示卫星'
      },
      {
        id: 'vision',
        label: '可视域分析'
      },
      {
        id: 'visionAnalysis',
        label: '通视度分析'
      },
      {
        id: 'geojson',
        label: '加载geojson'
      },
      {
        id: 'terrain',
        label: '显示地形'
      },
      {
        id: 'spreadEllipse',
        label: '高危报警'
      },
      {
        id: 'scan',
        label: '地面雷达'
      },
      {
        id: 'flyline',
        label: '地图通联'
      },
      {
        id: 'radarStatic',
        label: '菲涅尔区'
      },
      {
        id: 'radarDynamic',
        label: '对空雷达'
      },
      {
        id: 'riverFlood',
        label: '河流淹没'
      }
    ]
  },
  {
    label: '天气',
    contents: [
      {
        id: 'rain',
        label: '雨天'
      },
      {
        id: 'snow',
        label: '下雪'
      },
      {
        id: 'fog',
        label: '雾天'
      }
    ]
  },
  {
    label: '演示',
    exclusive: true,
    contents: [
      {
        id: 'direct',
        label: '直飞'
      },
      {
        id: 'round',
        label: '绕飞'
      },
      {
        id: 'circle',
        label: '盘旋'
      },
      {
        id: 'drone',
        label: '无人机侦测(视频推流)'
      }
    ]
  }
])

const emits = defineEmits(['update:visible', 'btnClick'])

const props = defineProps({
  title: {
    type: String,
    default: '菜单'
  },
  width: {
    type: String,
    default: '30%'
  },
  visible: {
    type: Boolean,
    default: false
  }
})
const dialogVisible = ref(false)

watchEffect(() => {
  dialogVisible.value = props.visible
})

const toggle = () => {
  dialogVisible.value = !dialogVisible.value
  emits('update:visible', dialogVisible.value)
}

const clickHandler = (thisBtn, group) => {
  const { exclusive } = group
  if (exclusive) {
    group.contents.forEach((btn) => {
      if (thisBtn.id === btn.id) {
        btn.active = !btn.active
      } else {
        btn.active = false
      }
    })
  } else {
    thisBtn.active = !thisBtn.active
  }
  emits('btnClick', { ...thisBtn })
}

</script>
<style scoped lang="scss">
.panel-wrap {
  font-size: 14px;
  position: fixed;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 200px;
  height: auto;
  background: rgba(0, 0, 0, 0.4);
  transition: right 0.24s ease-in-out;
  border-radius: 5px;
  border: 1px solid steelblue;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  &.hide {
    right: -200px;
  }
  .panel {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .panel-header {
    padding: 0 0 0 10px;
    line-height: 30px;
    color: #fff;
    display: flex;
    justify-content: space-between;
    .close-btn {
      display: inline-block;
      cursor: pointer;
      width: 30px;
      height: 30px;
      font-size: 18px;
    }
  }
  .item-header {
    font-size: 12px;
    color: steelblue;
    text-align: start;
    line-height: 30px;
    border-top: 1px solid rgba(70, 131, 180, 0.596)
  }
  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0 10px;
    overflow: auto;
    .content-wrap {
      flex: 1;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      button {
        margin: 0 0 10px;
      }
    }
  }
  .bar {
    width: 20px;
    height: 30px;
    font-size: 18px;
    text-align: center;
    line-height: 30px;
    border-top-left-radius: 10px;
    border-bottom-left-radius: 10px;
    position: absolute;
    left: -21px;
    top: calc(50% - 15px);
    color: #fff;
    background: rgb(70, 131, 180);
    cursor: pointer;
    opacity: 0.6;
    transition: all 0.25s ease-in-out;
    span {
      transition: all 0.25s ease-in-out;
      &.slide-in {
        display: inline-block;
        transform: rotate(0.5turn);
      }
    }
    &:hover {
      opacity: 1;
    }
  }
  button {
    background: transparent;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    padding: 6px 12px;
    color: #fff;
    margin-bottom: 10px;
    border: 1px solid steelblue;
    transition: all 0.1s ease-in-out;
    & + button{
      margin-left: 10px;
    }
    &:hover, &.active {
      background: steelblue;
    }
  }
}
</style>
