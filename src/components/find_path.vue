<template>
  <div id="find-path" v-show="visible"
       style="position: absolute; top: 10px; right: 400px; z-index: 100;">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>查找路线</span>
      </div>
      <el-form @submit.native.prevent="findPath">
        <el-form-item label="起点">
          <el-input v-model="startLocation" placeholder="请输入起点"></el-input>
        </el-form-item>
        <el-form-item label="终点">
          <el-input v-model="endLocation" placeholder="请输入终点"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="findPath" class="full-width-button">确定
          </el-button>
        </el-form-item>
      </el-form>
      <el-form-item class="button-row">
        <el-button type="primary" @click="getFiveDayRoute" class="half-width-button">
          五日路线
        </el-button>
        <el-button type="primary" @click="getSevenDayRoute" class="half-width-button">
          七日路线
        </el-button>
      </el-form-item>
      <el-alert
          v-if="showAlert"
          title="请输入完整的起点和终点"
          type="error"
          show-icon
          @close="showAlert = false"
          style="margin-top: 10px;"
      ></el-alert>
    </el-card>
  </div>
</template>

<script>
import {geocodeLocation} from '../components/GeoCode';
import {drawPolyline, drawPoint, drawGrid} from './temp_layer.ts';
import {
  calculateMidpoint,
  calculateDistance,
  getZoomLevelByDistance
} from './map_calculate.ts';
import {setMapCenter} from './mapConfig.ts';
import keys from '@/keys';

const AMAP_KEY = keys.AMAP_KEY;

export default {
  props: ['visible'], // 接收从父组件传递的可见性状态
  data() {
    return {
      startLocation: '',
      endLocation: '',
      showAlert: false
    };
  },
  watch: {
    visible(newVal) {
      this.$el.style.display = newVal ? 'block' : 'none'; // 根据visible的值显示或隐藏组件
    }
  },
  methods: {
    async findPath() {
      if (!this.startLocation || !this.endLocation) {
        this.showAlert = true;
        return;
      }
      const startGeocodeResult = await geocodeLocation(this.startLocation);
      const endGeocodeResult = await geocodeLocation(this.endLocation);

      if (startGeocodeResult.status === '1' && endGeocodeResult.status === '1') {
        const startLngLat = startGeocodeResult.geocodes[0].location;
        const endLngLat = endGeocodeResult.geocodes[0].location;

        console.log('起点经纬度:', startLngLat);
        console.log('终点经纬度:', endLngLat);

        // 构建请求体以获取 avoidpolygons 数据
        const requestBody = {
          lon1: startLngLat.split(',')[0],
          lat1: startLngLat.split(',')[1],
          lon2: endLngLat.split(',')[0],
          lat2: endLngLat.split(',')[1]
        };

        let avoidpolygons = '';
        try {
          const response = await fetch('http://139.155.138.81:8000/process_coordinates', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
          });
          const polygons = await response.text(); // 获取返回的多边形字符串
          avoidpolygons = polygons.replace(/"/g, ''); // 去除所有引号
        } catch (error) {
          console.error('处理多边形数据失败:', error);
        }

        drawGrid(avoidpolygons);

        // 构造高德地图API的URL
        let url = `https://restapi.amap.com/v3/direction/driving?origin=${startLngLat}&destination=${endLngLat}&extensions=all&output=json&key=${AMAP_KEY}`;
        if (avoidpolygons) {
          url += `&avoidpolygons=${avoidpolygons}`;
        }

        try {
          const routeResponse = await fetch(url);
          const routeData = await routeResponse.json();

          if (routeData.route.paths[0]) {
            const steps = routeData.route.paths[0].steps;
            steps.forEach(step => {
              drawPolyline('road', step.polyline, {
                instruction: step.instruction,
                orientation: step.orientation,
                road: step.road,
                distance: step.distance,
                action: step.action,
                assistantAction: step.assistant_action || ''
              });
            });
            // 绘制起点，传递起点名称
            drawPoint('StartEnd', [[parseFloat(startLngLat.split(',')[0]), parseFloat(startLngLat.split(',')[1])]], {name: this.startLocation});
            // 绘制终点，传递终点名称
            drawPoint('StartEnd', [[parseFloat(endLngLat.split(',')[0]), parseFloat(endLngLat.split(',')[1])]], {name: this.endLocation});

            // 计算中点和距离
            const {latitude, longitude} = calculateMidpoint(
                parseFloat(startLngLat.split(',')[1]),
                parseFloat(startLngLat.split(',')[0]),
                parseFloat(endLngLat.split(',')[1]),
                parseFloat(endLngLat.split(',')[0])
            );
            const distance = calculateDistance(
                parseFloat(startLngLat.split(',')[1]),
                parseFloat(startLngLat.split(',')[0]),
                parseFloat(endLngLat.split(',')[1]),
                parseFloat(endLngLat.split(',')[0])
            );

            // 获取对应距离的缩放级别
            const zoomLevel = getZoomLevelByDistance(distance);

            // 调整地图中心和缩放级别
            setMapCenter(longitude, latitude, zoomLevel);

          }
        } catch (error) {
          console.error('请求高德地图API失败:', error);
        }
      } else {
        console.error('地理编码失败:', startGeocodeResult.info, endGeocodeResult.info);
      }
    },
    async getFiveDayRoute() {
      const url = `https://restapi.amap.com/v3/direction/driving?key=${AMAP_KEY}&origin=101.777795,36.616621&destination=101.777795,36.616621&extensions=base&strategy=0&waypoints=101.094385,36.437716;100.589133,36.912518;99.081063,36.766919;97.361528,37.369865;95.359955,37.859676;94.809145,40.041189;98.223482,39.795477;100.063450,38.972996;101.114466,37.838519;101.373496,37.615750;101.611524,37.388567`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.route.paths[0]) {
          this.drawRoute(data.route.paths[0]);
        }
      } catch (error) {
        console.error('请求五日路线失败:', error);
      }

      setMapCenter(94.579734, 38.884967,7)
    },
    async getSevenDayRoute() {
      const url =
          `https://restapi.amap.com/v3/direction/driving?key=${AMAP_KEY}&origin=103.834228,36.060798&destination=94.809145,40.041189&extensions=base&strategy=0&waypoints=100.449858,38.924766;98.2882,39.77325;94.662328,40.142066;101.777795,36.616621;100.589133,36.912518;99.081063,36.766919;95.448807,37.845823`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.route.paths[0]) {
          this.drawRoute(data.route.paths[0]);
        }
      } catch (error) {
        console.error('请求七日路线失败:', error);
      }
      setMapCenter(98.375510, 38.425972, 7)
    },
    drawRoute(path) {
      path.steps.forEach(step => {
        drawPolyline('road', step.polyline, {
          instruction: step.instruction,
          orientation: step.orientation,
          road: step.road,
          distance: step.distance,
          action: step.action,
          assistantAction: step.assistant_action || ''
        });
      });
    }
  }
};
</script>

<style scoped>
.box-card {
  position: fixed;
  padding: 15px;
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(2px);
  left: 130px;
  height: auto;
  top: 80px;
}

.box-card .clearfix {
  text-align: center; /* 让标题居中 */
  font-size: 20px; /* 增大字体大小 */
  margin-bottom: 15px; /* 上移标题 */
}

.el-form-item {
  margin-bottom: 20px; /* 增加表单项的下边，使其看起来更加宽敞 */
}

.el-form-item label {
  font-size: 18px; /* 增大标签的字体大小 */
}

.full-width-button {
  display: flex; /* 使用flex布局 */
  justify-content: center; /* 在横向上居中 */
  width: 100%; /* 按钮宽度 */
  height: 40px; /* 增大按钮的高度 */
  font-size: 18px; /* 增大按钮的字体大小 */
  border-radius: 15px;
  margin: 0 auto; /* 水平居中 */
}

.button-row {
  display: flex;
  justify-content: space-between;
}

.half-width-button {
  flex: 1; /* 使两个按钮大小相等 */
  height: 40px; /* 增大按钮的高度 */
  font-size: 18px; /* 增大按钮的字体大小 */
  border-radius: 15px;
  margin-right: 10px; /* 添加右边距以分隔两个按钮 */
}

.half-width-button:last-child {
  margin-right: 0; /* 移除最后一个按钮的右边距 */
}
</style>
