<!-- App.vue 是整个应用的根组件，包含了顶部栏和地图组件 -->
<template>
  <div id="app">
    <!-- 顶部栏组件，包含搜索、菜单、天气等功能 -->
    <top-bar></top-bar>

    <!-- 地图组件，包含图例、缩放、指北针、图层切换等功能 -->
    <map-container></map-container>

    <landmarks></landmarks>
  </div>
</template>

<script>
// 导入自定义组件
import topBar from "./top_bar.vue";
import MapContainer from './map.vue';
import Landmarks from "@/components/landmarks.vue";

export default {
  components: {
    Landmarks,
    topBar,
    MapContainer,
  },
}
</script>

<style>
#app {
  /* 确保 app 填满整个视窗，没有滚动条，这对地图应用很重要 */
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

</style>
