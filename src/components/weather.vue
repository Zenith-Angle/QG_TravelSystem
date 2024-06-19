<!-- weather.vue -->
<template>
  <div id="weather" style="position: absolute; top: 10px; right: 200px; z-index: 10;">
    <el-card class="box-card">
      <div slot="header" class="clearfix title">
        <span>天气信息</span>
      </div>
      <div>
        <p>地点：{{ city }}</p>
        <p>当前天气：{{ weatherText }}</p>
        <p>温度：{{ temperature }}°C</p>
        <p>体感温度：{{ feelsLike }}°C</p>
        <p>相对湿度：{{ humidity }}%</p>
        <p>降水量：{{ precip }}mm</p>
        <p>观测时间：{{ obsTime }}</p>
      </div>
      <el-button type="primary" @click="fetchWeather" style="display: block; margin: auto;">查询天气</el-button>
    </el-card>
  </div>
</template>

<script>
import axios from 'axios';
import {mapCenter} from './mapConfig.ts'; // 确保路径正确
import keys from '@/keys';

const apiKey = keys.apiKey;
export default {
  data() {
    return {
      city: '',
      weatherText: '',
      temperature: '',
      feelsLike: '',
      humidity: '',
      precip: '',
      obsTime: '',
    };
  },
  methods: {
    async fetchWeather() {
       // API密钥
      const location = `${mapCenter.value[0]},${mapCenter.value[1]}`; // 使用地图中心作为地点
      const url_weather = `https://devapi.qweather.com/v7/weather/now?location=${location}&key=${apiKey}`;
      const url_city = `https://geoapi.qweather.com/v2/city/lookup?location=${location}&key=${apiKey}`;
      try {
        const response_weather = await axios.get(url_weather);
        const response_city = await axios.get(url_city);
        if (response_weather.data.code === '200') {
          this.weatherText = response_weather.data.now.text;
          this.temperature = response_weather.data.now.temp;
          this.feelsLike = response_weather.data.now.feelsLike;
          this.humidity = response_weather.data.now.humidity;
          this.precip = response_weather.data.now.precip;
          this.obsTime = response_weather.data.now.obsTime.substring(0, 16); // 截取前16个字符
        } else {
          console.error('Failed to fetch weather data:', response_weather.data);
        }
        if (response_city.data.code === '200') {
          this.city = response_city.data.location[0].name;
        } else {
          console.error('Failed to fetch city data:', response_city.data); // 新增
        }
      }
      catch (error) {
        console.error('Error fetching weather data:', error);
      }
    }
  }
};
</script>

<style scoped>
.box-card {
  position: fixed;
  padding: 20px;
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(2px);
  right: 350px;
  height: auto;
  top: 10px;
}

.title { /* 新增 */
  text-align: center; /* 文字居中 */
  font-size: 20px; /* 字号大小 */
}
</style>
