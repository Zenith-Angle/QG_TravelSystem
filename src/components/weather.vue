<!-- weather.vue -->
<template>
  <div id="weather" style="position: absolute; top: 10px; right: 200px; z-index: 10;">
    <el-card class="box-card">
      <template #header>
        <div class="clearfix title">
          <span>天气信息</span>
        </div>
      </template>
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
import {mapCenter} from './mapConfig';
import {qweatherApiHost, qweatherApiKey} from '@/config';

function getQWeatherApiHost() {
  const configuredHost = qweatherApiHost;
  if (!configuredHost) throw new Error('未配置 VITE_QWEATHER_API_HOST');

  const candidate = configuredHost.includes('://') ? configuredHost : `https://${configuredHost}`;
  const url = new URL(candidate);
  const isQWeatherHost = url.hostname.toLowerCase().endsWith('.qweatherapi.com');
  if (url.protocol !== 'https:' || !isQWeatherHost || url.username || url.password || url.port
      || (url.pathname !== '/' && url.pathname !== '')) {
    throw new Error('VITE_QWEATHER_API_HOST 必须是 qweatherapi.com 下的纯 HTTPS Host');
  }
  return url.origin;
}

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
      try {
        const apiHost = getQWeatherApiHost();
        const [response_weather, response_city] = await Promise.all([
          axios.get(`${apiHost}/v7/weather/now`, {
            params: {location},
            headers: {'X-QW-Api-Key': qweatherApiKey},
            timeout: 10000
          }),
          axios.get(`${apiHost}/geo/v2/city/lookup`, {
            params: {location},
            headers: {'X-QW-Api-Key': qweatherApiKey},
            timeout: 10000
          })
        ]);
        if (response_weather.data?.code === '200' && response_weather.data.now) {
          this.weatherText = response_weather.data.now.text;
          this.temperature = response_weather.data.now.temp;
          this.feelsLike = response_weather.data.now.feelsLike;
          this.humidity = response_weather.data.now.humidity;
          this.precip = response_weather.data.now.precip;
          this.obsTime = response_weather.data.now.obsTime.substring(0, 16); // 截取前16个字符
        } else {
          throw new Error('天气接口返回格式无效');
        }
        if (response_city.data?.code === '200' && response_city.data.location?.[0]) {
          this.city = response_city.data.location[0].name;
        } else {
          throw new Error('城市接口返回格式无效');
        }
      }
      catch (error) {
        if (error instanceof Error && error.message.includes('VITE_QWEATHER_API_HOST')) {
          console.warn(error.message);
          this.$message.error('请先在 .env.local 配置和风天气专属 API Host');
        } else {
          console.error('Error fetching weather data:', error);
          this.$message.error('天气查询失败，请稍后重试');
        }
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
