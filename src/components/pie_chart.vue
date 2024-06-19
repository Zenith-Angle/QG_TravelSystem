<template>
  <div ref="chartContainer"
       style="width: 300px; height: 300px;  top: 20%; left: 10%;"></div>
</template>

<script setup>
import {ref, onMounted, watch} from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  landmarkName: String
});

const chartContainer = ref(null);
let chartInstance = null;

const loadChartData = async (landmarkName) => {
  if (!landmarkName) return;

  try {
    // 动态导入 JSON 文件
    const module = await import(`./landmark_emotion/${landmarkName}_predictionsemotion.json`);
    const emotionMapping = {
      "0": "Negative",
      "1": "Positive"
    };
    const formattedData = module.default.map(item => ({
      name: emotionMapping[item.name] || "Unknown", // 使用映射将 '1' 和 '0' 转换为 'Positive' 和 'Negative'
      value: item.value
    }));
    updateChart(formattedData);
  } catch (error) {
    console.error("Failed to load chart data:", error);
    updateChart([]); // 在错误情况下更新图表为空
  }
};


const updateChart = (data) => {
  if (!chartInstance) {
    chartInstance = echarts.init(chartContainer.value);
  }
  chartInstance.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        name: 'Emotion Distribution',
        type: 'pie',
        radius: '50%',
        data: data.map(item => ({name: item.name, value: item.value})),
        emphasis: {
          itemStyle: {
            shadowBlur: 20,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
            scale: 1.1 // 当鼠标悬停时部分放大
          }
        },
        selectedMode: 'single', // 允许选中单个部分
        selectedOffset: 10 // 选中部分时偏移的量，使选中的部分更为明显
      }
    ],
    // 添加动画效果
    animationEasing: 'elasticOut',
    animationDelayUpdate: function (idx) {
      return idx * 50;
    }
  });
};


watch(() => props.landmarkName, (newVal) => {
  loadChartData(newVal);
}, {immediate: true});

onMounted(() => {
  chartInstance = echarts.init(chartContainer.value);
  chartInstance.setOption({series: [{type: 'pie', data: []}]}); // 初始化为空的饼图
});
</script>

<style scoped>

</style>
