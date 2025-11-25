<template>
  <a-layout class="layout">
    <Header class="header"></Header>
    <a-layout-content>
      <router-view />
    </a-layout-content>
  </a-layout>
</template>
<script lang="ts" setup>
import Header from './Header.vue'

</script>
<style scoped lang="less">
@header-height: 46px;

.layout {
  width: 100vw;
  overflow: hidden;

  .header {
    width: 100%;
    height: @header-height;
    line-height: @header-height;
  }

  .ant-layout-content {
    width: 100%;
    height: calc(100vh - @header-height);
  }
}
</style>