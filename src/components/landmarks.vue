<template>
  <div>
    <el-drawer
        :title="selectedLandmark.name || 'Landmark Information'"
        v-model="dialogVisible"
        :direction="drawerDirection"
        :size="drawerSize"
        :modal="false"
        @close="resetDialog"
    >
      <!-- 添加按钮组 -->
      <el-button-group class="drawer-buttons">
        <el-button :type="showPieChart ? 'primary' : 'default'" @click="togglePieChart">
          饼图
        </el-button>
        <el-button :type="showWordcloudChart ? 'primary' : 'default'"
                   @click="toggleWordcloudChart">词云图
        </el-button>
      </el-button-group>

      <!-- 这里加载异步组件，显示具体地标的信息 -->
      <component :is="asyncComponent"/>
      <span class="drawer-footer">
        <el-button @click="resetDialog">Close</el-button>
      </span>
    </el-drawer>

    <!-- 饼图组件放置在页面中间偏左上 -->
    <pie-chart v-if="showPieChart" :landmarkName="selectedLandmark.name"
               style="position: absolute; top: 10%; left: 10%;"/>

    <!-- 词云图组件放置在页面中间偏右下 -->
    <wordcloud-chart v-if="showWordcloudChart" :landmarkName="selectedLandmark.name"
                     style="position: absolute; bottom: 10%; right: 10%;"/>
  </div>
</template>

<script setup>
import {ref, onMounted, onUnmounted, defineAsyncComponent} from 'vue';
import {view, setMapCenter} from './mapConfig';
import PieChart from './pie_chart.vue';
import WordcloudChart from './wordcloud_chart.vue';

const selectedLandmark = ref({name: ''});
const dialogVisible = ref(false); // 初始化为 false
const drawerDirection = ref('rtl'); // 右侧滑出
const drawerSize = ref('500px'); // 设定抽屉宽度
let asyncComponent = ref(null);
let clickHandler = null; // 初始化事件处理器

// 定义显示图表的状态
const showPieChart = ref(false);
const showWordcloudChart = ref(false);

function openLandmarkDialog(landmark) {
  console.log('Opening drawer with landmark:', landmark); // 调试日志
  console.log('Drawer visible before:', dialogVisible.value); // 输出抽屉可见性状态
  selectedLandmark.value = landmark;
  dialogVisible.value = true;

  // 重置图表显示状态
  showPieChart.value = false;
  showWordcloudChart.value = false;

  // 根据地标名称动态加载 Vue 组件
  asyncComponent.value = defineAsyncComponent(() =>
      import(`./landmarks_details/${landmark.name}.vue`).catch(error => {
        console.error('Failed to load component:', error);
        // return import('./src/components/ErrorComponent.vue'); // 加载一个错误处理组件
      })
  );

  console.log('Drawer visible after:', dialogVisible.value); // 输出抽屉可见性状态
}

function resetDialog() {
  dialogVisible.value = false;
  selectedLandmark.value = {name: ''};
  asyncComponent.value = null;
  showPieChart.value = false;
  showWordcloudChart.value = false;
}

function handleMapClick(event) {
  if (view) {
    view.hitTest(event).then(response => {
      const landmarkResults = response.results.filter(result =>
          result.graphic.layer.id === 'Landmarks' && result.graphic.attributes
      );

      console.log('Hit test results:', landmarkResults); // 调试日志

      if (landmarkResults.length > 0) {
        const graphic = landmarkResults[0].graphic;
        console.log('Selected graphic attributes:', graphic.attributes); // 调试日志

        // 打开抽屉并显示地标信息
        openLandmarkDialog({
          name: graphic.attributes.name,
        });

        // 移动地图中心到点击要素的位置
        const {longitude, latitude} = graphic.geometry;
        setMapCenter(longitude, latitude, 12);
      }
    }).catch(error => {
      console.error("Error during hitTest:", error);
    });
  } else {
    console.error("MapView is not initialized.");
  }
}

// 切换饼图显示状态
function togglePieChart() {
  showPieChart.value = !showPieChart.value;
}

// 切换词云图显示状态
function toggleWordcloudChart() {
  showWordcloudChart.value = !showWordcloudChart.value;
}

onMounted(() => {
  if (view) {
    console.log("MapView is initialized and ready for interaction.");
    clickHandler = view.on("click", handleMapClick);
  } else {
    console.error("MapView is not initialized.");
  }
});

onUnmounted(() => {
  if (clickHandler) {
    clickHandler.remove();
  }
});
</script>

<style>
/* 添加样式以确保 el-drawer 能正确显示 */
.drawer-footer {
  text-align: right;
  padding: 10px 20px;
}

.drawer-buttons {
  text-align: center;
  margin-bottom: 10px;
}
</style>
