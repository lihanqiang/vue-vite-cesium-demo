<template>
    <router-view/>
</template>
<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(() => {
  const loadingElement = document.getElementById('loadingPage');
  if (loadingElement) {
    (loadingElement as HTMLElement).remove();
  }
});
</script>
<style lang="less">
html,
body,
#app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
