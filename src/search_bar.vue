<template>
  <div class="search-wrapper" :class="{ 'search-active': searchActive }">
    <el-input
        ref="searchInput"
        v-model="searchQuery"
        v-show="searchActive"
        class="search-input"
        placeholder="请输入行政区名称或经纬度"
        @blur="searchActive = false"
        @keyup.enter="searchMap(searchQuery)"
    />
    <el-button @click="toggleSearch">
      <!-- 使用 SVG 图像作为按钮图标 -->
      <img :src="searchIcon" alt="搜索" class="button-icon">
    </el-button>
  </div>
</template>


<script>
import {setMapCenter} from './components/mapConfig';
import {clearTempGraphics, drawPoint} from './components/temp_layer';
import axios from 'axios';
import searchIcon from '@/assets/images/搜索.svg';
import {amapWebServiceKey} from '@/config';
import {isValidCoordinate} from '@/utils/security.js';

const amapKey = amapWebServiceKey;

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
      this.searchActive = !this.searchActive;
      if (this.searchActive) {
        this.$nextTick(() => {
          this.$refs.searchInput.focus();
        });
      }
    },
    searchMap(keyword) {
      keyword = keyword.trim();
      if (!keyword) {
        this.$message.warning('请输入行政区名称或经纬度');
        return;
      }
      const latLngPattern = /^\s*([-+]?\d{1,2}(\.\d+)?),\s*([-+]?\d{1,3}(\.\d+)?)\s*$/;
      const match = keyword.match(latLngPattern);

      if (match) {
        const lat = parseFloat(match[1]);// 纬度
        const lng = parseFloat(match[3]);// 经度
        if (!isValidCoordinate(lat, lng)) {
          this.$message.error('纬度应在 -90 到 90，经度应在 -180 到 180');
          return;
        }
        clearTempGraphics();
        setMapCenter(lng, lat, 11);
        drawPoint('administrative', [[lng, lat]], {
          name: '自定义位置',
          address: `经度: ${lng}, 纬度: ${lat}`,
          level: '自定义'
        });
      } else {
        const url = `https://restapi.amap.com/v3/config/district?keywords=${encodeURIComponent(keyword)}&key=${amapKey}&subdistrict=0&extensions=base`;
        axios.get(url, {timeout: 10000})
            .then(response => {
              if (response.data?.status === '1' && Array.isArray(response.data.districts) && response.data.districts.length > 0) {
                const {center, name, level} = response.data.districts[0];
                const [lng, lat] = center.split(',').map(Number);
                if (!isValidCoordinate(lat, lng)) throw new Error('行政区接口返回了无效坐标');
                clearTempGraphics();
                setMapCenter(lng, lat, 11);
                drawPoint('administrative', [[lng, lat]], {name, address: center, level});
              } else {
                this.$message.warning('未找到匹配的行政区');
              }
            })
            .catch(error => {
              console.error('API Error:', error);
              this.$message.error('搜索失败，请稍后重试');
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
