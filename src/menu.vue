<!-- menu.vue -->
<template>
  <el-button-group>
    <el-popover placement="bottom" width="200" trigger="hover" hide-after="50">
      <template #reference>
        <el-button @click="toggleMenu('surrounding')">周边</el-button>
      </template>
      <p>以当前地图中心为搜索点，进行周边搜索</p>
    </el-popover>

    <el-popover placement="bottom" width="200" trigger="hover" hide-after="50">
      <template #reference>
        <el-button @click="openFindPath">路线</el-button>
      </template>
      <p>输入起点、终点，获取路线</p>
    </el-popover>

    <el-popover placement="bottom" width="200" trigger="hover" hide-after="50">
      <template #reference>
        <el-button @click="toggleMenu('location')">位置</el-button>
      </template>
      <p>获取当前位置，或手动指定位置</p>
    </el-popover>

    <el-popover placement="bottom" width="200" trigger="hover" hide-after="50">
      <template #reference>
        <el-button @click="emitToggleWeather">天气</el-button>
      </template>
      <p>以当前地图中心为搜索点，获取天气信息</p>
    </el-popover>

    <el-popover placement="bottom" width="200" trigger="hover" hide-after="50">
      <template #reference>
        <el-button @click="openInfo">关于</el-button>
      </template>
      <p>项目相关信息</p>
    </el-popover>

    <div v-show="activeMenu === 'location'" class="location-menu">
      <el-button @click="requestCurrentLocation">获取当前位置</el-button>
      <el-button @click="handleManualLocation">手动选择位置</el-button>
    </div>
    <div v-show="activeMenu === 'surrounding'" class="surrounding-menu">
      <el-button @click="handleSurrounding('餐饮')">餐饮服务</el-button>
      <el-button @click="handleSurrounding('酒店')">酒店住宿</el-button>
      <el-button @click="handleSurrounding('公交')">公共交通</el-button>
      <el-button @click="handleSurrounding('加油站')">加油站</el-button>
    </div>
  </el-button-group>

  <Surrounding ref="surroundingComponent"/>
  <find-path :visible="findPathVisible"></find-path>
  <Info :visible="infoVisible" @update:visible="infoVisible = $event"/>
</template>


<script>
import {getUserLocation} from './components/location';
import {selectManualLocation, setMapCenter} from './components/mapConfig.ts'; // 确保路径正确
import Surrounding from './components/surrounding.vue';
import FindPath from './components/find_path.vue'; // 确保导入了find_path组件
import Weather from './components/weather.vue'; // 确保导入了weather组件
import Info from './components/info.vue'; // 确保导入了info组件

export default {
  components: {
    Surrounding,
    FindPath,
    Info
  },
  data() {
    return {
      activeMenu: null,
      isSelectingLocation: false,
      findPathVisible: false,
      infoVisible: false
    };
  },
  methods: {
    toggleMenu(menu) {
      this.activeMenu = this.activeMenu === menu ? null : menu;
    },
    openFindPath() {
      this.findPathVisible = !this.findPathVisible; // 切换路线窗口的显示状态
    },
    emitToggleWeather() {
      this.$emit('toggle-weather');
    },
    handleSurrounding(category) {
      this.$refs.surroundingComponent.fetchSurroundingInfo(category);
    },
    openInfo() {
      this.infoVisible = !this.infoVisible;
    },
    async requestCurrentLocation() {
      try {
        const coords = await getUserLocation();
        setMapCenter(coords.longitude, coords.latitude, 11);
        this.$message({
          message: `获取的位置是：经度 ${coords.longitude}，纬度 ${coords.latitude}`,
          type: 'success'
        });
      } catch (error) {
        console.error('获取用户位置失败:', error);
        this.$message.error('获取用户位置失败');
      }
    },

    handleManualLocation() {
      this.isSelectingLocation = !this.isSelectingLocation; // 切换状态
      selectManualLocation(this.isSelectingLocation, (msg) => {
        this.$message({
          message: msg,
          type: 'info',
          duration: 5000
        });
      }, () => {
        // 添加一个新的回调来处理状态更新
        this.isSelectingLocation = false;
      });
    }

  }
};
</script>


<style scoped>
.menu-container {
  position: absolute;
  display: flex;
  justify-content: flex-start;
  padding: 0px;
  background-color: #ffffff; /* 背景颜色为白色 */
  border-radius: 20px;
  z-index: 100;
  top: 10px;
  left: 10px;
  height: 50px;
}

.el-button {
  width: 90px;
  height: 50px;
  background-color: #ffffff; /* 按钮默认背景为白色 */
  color: #000000; /* 文字颜色为黑色 */
  transition: background-color 0.3s, box-shadow 0.3s, transform 0.3s, color 0.3s; /* 添加过渡效果 */
  border: none; /* 移除边框 */
}

.el-button:hover {
  background-color: #e0e0e0; /* 鼠标悬停时的背景色为浅灰 */
  box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.1); /* 阴影效果更微妙 */
  transform: scale(1.05); /* 鼠标悬停时放大效果 */
}

.el-button:active {
  background-color: #000000; /* 点击时背景变为黑色 */
  color: #ffffff; /* 点击时文字变为白色 */
  transform: scale(0.95); /* 点击时的缩放效果更加明显 */
}

.el-button:last-child {
  margin-right: 0;
}

#weather {
  display: flex;
  justify-content: center;
  align-items: center;
  top: 10px;
  right: 200px;
  z-index: 10;
}

.location-menu {
  position: absolute;
  z-index: 100;
  background-color: white;
  border: 1px solid #ccc;
  top: 100%; /* 设置次级菜单紧跟按钮组下方 */
  left: 176px; /* 根据实际情况调整 */
  display: flex;
  flex-direction: column;
  padding: 10px;
  border-radius: 5px;
}

.location-menu > .el-button {
  margin: 5px 0; /* 按钮上下间距 */
  flex-grow: 1; /* 使按钮宽度充满容器 */
  border-radius: 8px; /* 增加边框半径 */
}

.location-menu > .el-button:first-child {
  margin-right: 0; /* 第一个按钮右侧无间隙 */

}

.location-menu > .el-button:last-child {
  margin-left: 0; /* 第二个按钮左侧无间隙 */

}

.surrounding-menu {
  position: absolute;
  z-index: 100;
  background-color: white;
  border: 1px solid #ccc;
  top: 100%; /* 设置次级菜单紧跟按钮组下方 */
  left: 0px; /* 根据实际情况调整 */
  display: flex;
  flex-direction: column;
  padding: 10px;
  border-radius: 5px;
}

.surrounding-menu > .el-button {
  margin: 5px 0; /* 按钮上下间距 */
  flex-grow: 1; /* 使按钮宽度充满容器 */
  border-radius: 5px; /* 增加边框半径 */
}

.surrounding-menu > .el-button:first-child {
  margin-right: 0; /* 第一个按钮右侧无间隙 */
}

.surrounding-menu > .el-button:last-child {
  margin-left: 0; /* 第二个按钮左侧无间隙 */
}


</style>
