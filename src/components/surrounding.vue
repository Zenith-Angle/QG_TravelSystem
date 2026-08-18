<template>
  <!-- 省略，需要根据具体情况添加模板内容 -->
</template>

<script>
import axios from 'axios';
import {mapCenter} from './mapConfig';
import {reverseGeocodeCurrentLocation} from './GeoCode_and_ReverseGeocode';
import {clearTempGraphics, drawPoint, drawRange} from './temp_layer';
import {amapWebServiceKey} from '@/config';
import {parseLngLatString} from '@/utils/security.js';
const radius = 5000;

export default {
  data() {
    return {
      category: null,  // 当前选中的周边信息类别
      surroundingResults: [],  // 查询结果
    };
  },
  methods: {
    handleSurrounding(category) {
      this.fetchSurroundingInfo(category);
    },

    async fetchSurroundingInfo(category) {
      this.category = category;
      try {
        const geocodeInfo = await reverseGeocodeCurrentLocation();
        if (geocodeInfo && geocodeInfo.status === '1') {
          const location = mapCenter.value.join(',');
          const response = await axios.get(`https://restapi.amap.com/v3/place/around`, {
            params: {
              location: location,
              radius: radius,
              key: amapWebServiceKey,
              keywords: category,
              offset: 20,
              page: 1,
              extensions: 'base',
              sortrule: 'weight'
            },
            timeout: 10000
          });
          if (response.data?.status !== '1' || !Array.isArray(response.data.pois)) {
            throw new Error(response.data?.info || '周边搜索返回格式无效');
          }
          clearTempGraphics();
          drawRange(location, radius);
          this.surroundingResults = response.data.pois;
          this.surroundingResults.forEach(result => {
            const coordinates = parseLngLatString(result.location);
            if (!coordinates) return;
            const [longitude, latitude] = coordinates;
            if (category === '餐饮') {
              drawPoint("food", [[longitude, latitude]], {
                name: result.name,
                address: `${result.pname} ${result.cityname} ${result.adname} ${result.address}`,
                type: result.type,
                distance: result.distance
              });
            } else if (category === '酒店') {
              drawPoint("hotel", [[longitude, latitude]], {
                name: result.name,
                address: `${result.pname} ${result.cityname} ${result.adname} ${result.address}`,
                type: result.type,
                distance: result.distance
              });
            } else if (category === '公交') {
              drawPoint("traffic", [[longitude, latitude]], {
                name: result.name,
                address: `${result.pname} ${result.cityname} ${result.adname} ${result.address}`,
                type: result.type,
                distance: result.distance
              });
            } else if (category === '加油站') {
              drawPoint('GasStation', [[longitude, latitude]], {
                name: result.name,
                address: `${result.pname} ${result.cityname} ${result.adname} ${result.address}`,
                type: result.type,
                distance: result.distance
              });
            } else {
              console.error('未知的周边信息类别:', category);
            }
          });
        } else {
          throw new Error(geocodeInfo?.info || '无法识别当前地图中心');
        }
      } catch (error) {
        console.error('获取周边信息失败:', error);
        this.$message.error('获取周边信息失败');
      }
    },
  }
};
</script>

<style scoped>
/* 省略，可以根据需求添加样式 */
</style>
