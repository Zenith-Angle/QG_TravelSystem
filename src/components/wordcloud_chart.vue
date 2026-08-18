<template>
  <canvas ref="wordcloudContainer" width="300" height="300"
          style="width: 300px; height: 300px; top: 50%; left: 10%; position: absolute;"></canvas>
</template>

<script setup>
import {ref, onMounted, onBeforeUnmount, watch} from 'vue';
import WordCloud from 'wordcloud';

const props = defineProps({
  landmarkName: String
});

const wordcloudContainer = ref(null);

const loadWordcloudData = async (landmarkName) => {
  if (!landmarkName) return;

  try {
    // 动态导入 JSON 文件
    const module = await import(`./landmark_wb/${landmarkName}wb.json`);
    const data = module.default.map(item => ({
      name: item.name,
      value: item.value
    }));
    renderWordcloud(data);
  } catch (error) {
    console.error("Failed to load wordcloud data:", error);
    renderWordcloud([]);
  }
};

const renderWordcloud = (data) => {
  if (!wordcloudContainer.value) return;
  WordCloud.stop();
  const context = wordcloudContainer.value.getContext('2d');
  context.clearRect(0, 0, 300, 300);
  const ranked = data
      .map(item => ({name: String(item.name), value: Number(item.value)}))
      .filter(item => item.name && Number.isFinite(item.value) && item.value > 0)
      .sort((left, right) => right.value - left.value)
      .slice(0, 80);
  const logarithms = ranked.map(item => Math.log1p(item.value));
  const minimum = Math.min(...logarithms);
  const maximum = Math.max(...logarithms);
  const sizeFor = value => maximum === minimum
      ? 24
      : 12 + ((Math.log1p(value) - minimum) / (maximum - minimum)) * 36;
  WordCloud(wordcloudContainer.value, {
    list: ranked.map(item => [item.name, sizeFor(item.value)]),
    gridSize: 8,
    weightFactor: 1,
    rotateRatio: 0.5,
    rotationSteps: 4,
    color: () => `rgb(${[0, 0, 0].map(() => Math.round(Math.random() * 160)).join(',')})`,
    backgroundColor: 'transparent',
    drawOutOfBound: false,
    abortThreshold: 1000
  });
};

watch(() => props.landmarkName, (newVal) => {
  loadWordcloudData(newVal);
});

onMounted(() => {
  loadWordcloudData(props.landmarkName);
});

onBeforeUnmount(() => {
  WordCloud.stop();
});
</script>

<style scoped>
</style>
