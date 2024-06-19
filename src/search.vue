<template>
  <div class="search-wrapper" :class="{ 'search-active': searchActive }">
    <!-- 添加 ref 属性以支持自动聚焦 -->
    <el-input
        ref="searchInput"
        v-model="searchQuery"
        v-show="searchActive"
        class="search-input"
        placeholder="请输入行政区名称或经纬度"
        @blur="searchActive = false"
        @keyup.enter.native="searchMap(searchQuery)"
    />
    <el-button @click="toggleSearch">
      <!-- 使用 SVG 图像作为按钮图标 -->
      <img :src="searchIcon" alt="搜索" class="button-icon">
    </el-button>
  </div>
</template>


<script>
import {setMapCenter} from './components/mapConfig';
import {drawPoint} from './components/temp_layer.ts';
import axios from 'axios';
import searchIcon from '@/assets/images/搜索.svg';
import keys from '@/keys';

const tencentMapKey = keys.tencentMapKey;

axios.defaults.baseURL = '/api'
export default {
  data() {
    return {
      searchQuery: '',
      searchActive: false,
      searchIcon
    };
  },
  methods: {
    toggleSearch() {
      console.log('Toggle Search triggered');
      this.searchActive = !this.searchActive;
      if (this.searchActive) {
        this.$nextTick(() => {
          this.$refs.searchInput.focus();
        });
      }
    },
    searchMap(keyword) {
      console.log('Search Map called with:', keyword);
      // 检查输入是否是"数字,数字"形式的经纬度
      const latLngPattern = /^\s*([-+]?\d{1,2}(\.\d+)?),\s*([-+]?\d{1,3}(\.\d+)?)\s*$/;
      const match = keyword.match(latLngPattern);

      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[3]);
        console.log('Setting map center to:', lat, lng);
        setMapCenter(lng, lat, 11);
        drawPoint('point', 'administrative',[[lng, lat]], {
          name: '自定义位置',
          address: `经度: ${lng}, 纬度: ${lat}`
        });
      } else {
        // 如果不是经纬度形式，则继续搜索
        const url = `/ws/district/v1/search?keyword=${encodeURIComponent(keyword)}&key=${tencentMapKey}`;
        axios.get(url)
            .then(response => {
              console.log('API Response:', response.data);
              // 解析返回的JSON数据，获取第一个结果的经纬度、名称和地址
              const firstResult = response.data.result[0][0]
              const {lat, lng} = firstResult.location;
              const {name, address} = firstResult;

              // 使用mapConfig中的方法，将地图中心移动到那个点
              setMapCenter(lng, lat, 11);
              // 在新坐标上绘制点，并传入名称和地址信息
              drawPoint('administrative',[[lng, lat]], {name, address});
            })
            .catch(error => {
              console.error('API Error:', error);
            });
      }
    }
  }
};
</script>


<style scoped>
.search-wrapper {
  display: flex;
  align-items: center;
  position: absolute;
  z-index: 10;
  top: 10px;
  right: 20px;
  height: 50px;
}

.search-input {
  position: absolute;
  right: 50px; /* 按钮宽度 */
  width: 0;
  transition: width 0.3s ease, opacity 0.3s ease; /* 添加透明度过渡效果 */
  opacity: 0; /* 初始透明度 */
}

.search-active .search-input {
  width: 200px; /* 期望的宽度 */
  height: 50px;
  opacity: 1; /* 激活时的透明度 */
}

.el-button {
  width: 50px;
  height: 50px;
  border-radius: 15px;
}

.button-icon {
  width: 35px;
  height: 35px;
}
</style>
