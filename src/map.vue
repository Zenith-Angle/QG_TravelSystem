<template>
  <div id="map"></div>
  <div id="coordinates">
    {{ longitude }}, {{ latitude }}
  </div>
  <el-button @click="clearTempLayer" id="clear-layer-button">
    清空图层
  </el-button>
  <div id="layers">
    <!-- 弹出对话框的按钮 -->
    <el-button @click="dialogVisible = true" id="layer-button">
      <img src="./assets/images/图层.svg" alt="图层切换" class="layer-icon">
    </el-button>

    <!-- 对话框内容 -->
    <el-dialog title="选择图层" class="layer-dialog" v-model="dialogVisible"
               :draggable="true" :modal="false" :center="true"
               style="width: 600px">

        <el-button-group class="layer_button_group">

          <el-tooltip content="天地图矢量图层" placement="top">
            <el-button  class="each_layer"
                style="display:flex;height: 90px;width: 160px; padding: 10px; flex: 1;margin: 5px"
                @click="switchLayer('tdtVecLayer')">
              <img src="./assets/images/天地图矢量图层.png" alt="矢量图层" class="layer-image">
              </el-button>
          </el-tooltip>

          <el-tooltip content="天地图影像底图" placement="top">
            <el-button class="each_layer"
                style="display:flex;height: 90px;width: 160px; padding: 10px;flex: 1;margin: 5px"
                @click="switchLayer('tdtImgLayer')">
              <img src="./assets/images/天地图影像图层.png" alt="影像图层" class="layer-image">
              </el-button>
          </el-tooltip>

          <el-tooltip content="天地图地形晕染" placement="top">
            <el-button class="each_layer"
                style="display:flex;height: 90px;width: 160px; padding: 10px; flex: 1;margin: 5px"
                @click="switchLayer('tdtTerLayer')">
              <img src="./assets/images/天地图地形晕染.png" alt="地形晕染" class="layer-image">
              </el-button>
          </el-tooltip>
        </el-button-group>

        <el-button-group class="layer_button_group" >
          <!-- 热力图按钮 -->
          <el-tooltip content="热力图" placement="bottom">
            <el-button class="each_layer"
                       style="display:flex;height: 90px;width: 160px; padding: 10px; flex: 1;margin: 5px"
                       @click="switchLayer('HotPoint')">
              <img src="./assets/images/热力图.png" alt="热力图" class="layer-image">
            </el-button>
          </el-tooltip>

          <!-- 交通图按钮 -->
          <el-tooltip content="交通图" placement="bottom">
            <el-button class="each_layer"
                       style="display:flex;height: 90px;width: 160px; padding: 10px; flex: 1;margin: 5px"
                       @click="switchLayer('roads')">
              <img src="./assets/images/交通图.png" alt="交通图" class="layer-image">
            </el-button>
          </el-tooltip>
          <el-tooltip content="OpenStreetMap" placement="bottom">
            <el-button class="each_layer"
                  style="display:flex;height: 90px;width: 160px; padding: 10px; flex: 1;margin: 5px"
                  @click="switchLayer('osmLayer')">
              <img src="./assets/images/OSM.png" alt="OSM" class="layer-image">
            </el-button>
          </el-tooltip>
        </el-button-group>
    </el-dialog>
  </div>


</template>

<script setup lang="ts">
import {provide, ref, onMounted, watchEffect, Ref} from 'vue';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import TileLayer from '@arcgis/core/layers/TileLayer';
import TileInfo from '@arcgis/core/layers/support/TileInfo';
import WebTileLayer from '@arcgis/core/layers/WebTileLayer';
import Compass from '@arcgis/core/widgets/Compass';
import ScaleBar from '@arcgis/core/widgets/ScaleBar';
import Sketch from '@arcgis/core/widgets/Sketch';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import WMSLayer from '@arcgis/core/layers/WMSLayer';
import {ElDropdown, ElDropdownMenu, ElDropdownItem} from 'element-plus';
import {baseMapView, tempLayer} from './components/mapConfig';
import LayerList from '@arcgis/core/widgets/LayerList';



const tiandituKey = "2550d947faf678cd19951d530bf273d8";

let longitude = ref('');
let latitude = ref('');
let view: MapView;
let sketchVisible = ref(false);
const graphicsLayer = new GraphicsLayer();
let sketch; // 将 sketch 声明在这里
let dialogVisible = ref(false);  // 使用 ref 使 dialogVisible 成为响应式变量
let selectedLayer = ref('');  // 创建一个响应式引用来存储当前选中的图层

// 封装清空临时图层的函数
function clearTempLayer() {
  tempLayer.removeAll();
}

// 封装鼠标移动监视器
function setupPointerMoveListener(view) {
  view.on('pointer-move', event => {
    const point = view.toMap(event);
    longitude.value = point.longitude.toFixed(6);  // 显示经度，保留6位小数
    latitude.value = point.latitude.toFixed(6);    // 显示纬度，保留6位小数
  });
}

// 封装指北针功能
function addCompass(view) {
  const compass = new Compass({view: view});
  view.ui.add(compass, "top-right"); // 将指北针控件添加到地图的右上角
}

// 封装比例尺控件功能
function addScaleBar(view) {
  const scaleBar = new ScaleBar({view: view});
  view.ui.add(scaleBar, "bottom-left"); // 创建比例尺控件并添加到左下角
}

// 封装缩放控件的位置调整
function moveZoomControl(view) {
  view.ui.move("zoom", "bottom-left"); // 内置的缩放控件调整位置到左下角
}


onMounted(() => {
  const mapViewDetails = baseMapView('map', selectedLayer);
  view = mapViewDetails.view;

  // 调用封装的功能
  setupPointerMoveListener(view);
  addCompass(view);
  addScaleBar(view);
  moveZoomControl(view);

  provide('mapView', view);  // 提供 mapView 实例
});

function switchLayer(layer) {
  selectedLayer.value = layer;
  console.log('当前选中的图层是：', selectedLayer.value);
}

// 使用 provide 函数来提供 selectedLayer
provide('selectedLayer', selectedLayer);


</script>

<style>
#map {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 0;
}

/* 右下角鼠标经纬度样式*/
#coordinates {
  position: absolute;
  bottom: 15px;
  right: 0px;
  background: rgba(255, 255, 255, 0.6); /* 轻色背景，0.8透明度 */
  color: black; /* 深色字体 */
  padding: 5px 10px;
  border-radius: 4px;
  backdrop-filter: blur(2px); /* 添加高斯模糊效果 */
}


/* 设置指北针控件的样式和位置 */
.esri-ui-top-right .esri-compass {
  position: absolute;
  width: 50px;
  height: 50px;
  background: rgb(99, 107, 125); /* 白色背景 */
  border-radius: 25%;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 100px;
  right: 5px;
}


/* 设置缩放部件容器的背景和透明度*/
.esri-ui-bottom-left .esri-zoom {
  position: absolute;
  background: rgb(99, 107, 125); /* 白色背景 */
  border-radius: 25%;
  display: flex;
  justify-content: center;
  align-items: center;
  bottom: 30px;
  left: 0px;
}



#layer-button {
  width: 50px;
  height: 50px;
  border-radius: 25%;
  background: rgb(229, 231, 236, 0.8);
  position: absolute;
  top: 320px;
  left: 15px;
}

.layer-icon {
  width: 40px;
  height: 40px;
}

.layer-dialog {
  position: absolute;
  top:2%;
  right: 20%;
  height: 400px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  border-radius: 10px;
}

.layer-dialog .el-dialog__header {
  text-align: center;
  font-weight: bold;
}
#layer-list {
  display: flex; /* 使用flex布局使子元素填充flex容器 */
  flex-direction: column;/* 设置子元素水平排列 */
  background-color: aliceblue;


}

.layer_button_group {
  display: flex;
  flex-direction: row; /* 保持水平排列 */
  align-items: center; /* 垂直居中 */
  width: 95%; /* 占满父容器宽度 */
  padding: 5px; /* 添加一些内部间距 */
  background-color: aliceblue;
  margin: 10px;
}

.each_layer {
  display:flex;
  height: 120px;
  width: 180px;
  padding: 10px;
  flex: 1;
  margin: 10px;
}

.layer_button_group > :first-child {
  margin-left: 0;
}

.layer-image {
  width: 100%;
  height: 100%;
}

#clear-layer-button {
  position: absolute;
  bottom: 60px;
  left: 50px;
  height: 40px;
  border-radius: 10px;
  z-index: 10;
}
</style>
