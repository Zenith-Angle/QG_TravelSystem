<template>
  <div ref="wordcloudContainer"
       style="width: 300px; height: 300px; top: 50%; left: 10%; position: absolute;"></div>
</template>

<script setup>
import {ref, onMounted, watch} from 'vue';
import * as echarts from 'echarts';
import 'echarts-wordcloud';

const props = defineProps({
  landmarkName: String
});

const wordcloudContainer = ref(null);
let wordcloudChart = null;

const loadWordcloudData = async (landmarkName) => {
  if (!landmarkName) return;

  try {
    // 动态导入 JSON 文件
    const module = await import(`./landmark_wb/${landmarkName}wb.json`);
    const data = module.default.map(item => ({
      name: item.name,
      value: item.value
    }));
    updateWordcloudChart(data);
  } catch (error) {
    console.error("Failed to load wordcloud data:", error);
    updateWordcloudChart([]); // 在错误情况下更新图表为空
  }
};

const updateWordcloudChart = (data) => {
  if (!wordcloudChart) {
    wordcloudChart = echarts.init(wordcloudContainer.value);
  }
  wordcloudChart.setOption({
    tooltip: {},
    series: [{
      type: 'wordCloud',
      shape: 'circle',
      left: 'center',
      top: 'center',
      width: '100%',
      height: '100%',
      right: null,
      bottom: null,
      sizeRange: [12, 60],
      rotationRange: [-90, 90],
      rotationStep: 45,
      gridSize: 8,
      drawOutOfBound: false,
      textStyle: {
        normal: {
          fontFamily: 'miSans',
          fontWeight: 'bold',
          color: function () {
            return 'rgb(' + [
              Math.round(Math.random() * 160),
              Math.round(Math.random() * 160),
              Math.round(Math.random() * 160)
            ].join(',') + ')';
          }
        }
      },
      data: data
    }],
    animationEasing: 'cubicInOut',
    animationDuration: 1500
  });
};

watch(() => props.landmarkName, (newVal) => {
  loadWordcloudData(newVal);
}, {immediate: true});

onMounted(() => {
  wordcloudChart = echarts.init(wordcloudContainer.value);
  wordcloudChart.setOption({
    series: [{type: 'wordCloud', data: []}]  // 初始化为空的词云图
  });
});
</script>

<style scoped>
</style>
