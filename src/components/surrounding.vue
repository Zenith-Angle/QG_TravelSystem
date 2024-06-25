<template>
  <!-- 省略，需要根据具体情况添加模板内容 -->
</template>

<script>
import axios from 'axios';
import {mapCenter} from './mapConfig';
import {reverseGeocodeCurrentLocation} from './GeoCode_and_ReverseGeocode.ts';
import {drawPoint, drawRange} from './temp_layer.ts'; // 引入地图绘制函数
import keys from '@/keys';
const radius = 20000; // 查询半径
const location = mapCenter.value.join(',');

const AMAP_KEY = keys.AMAP_KEY;

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
        // const location = mapCenter.value.join(',');
        const geocodeInfo = await reverseGeocodeCurrentLocation(location);
        if (geocodeInfo && geocodeInfo.status === '1') {
          const adcode = geocodeInfo.regeocode.addressComponent.adcode;
          const location = mapCenter.value.join(',');
          const response = await axios.get(`https://restapi.amap.com/v3/place/around`, {
            params: {
              location: location,
              radius: radius,
              key: AMAP_KEY,
              keywords: category,
              offset: 20,
              page: 1,
              extensions: 'base',
              sortrule: 'weight'
            }
          });
          drawRange(location, radius); // 绘制查询范围
          this.surroundingResults = response.data.pois; // 注意确保这是数据结构中正确的属性名
          this.surroundingResults.forEach(result => {
            const [longitude, latitude] = result.location.split(',').map(Number);
            // 根据category设置specificType
            let specificType;
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
