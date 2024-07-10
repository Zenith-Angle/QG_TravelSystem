// mapConfig.ts
import WebTileLayer from '@arcgis/core/layers/WebTileLayer';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import WMSLayer from '@arcgis/core/layers/WMSLayer';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import {ref, inject, Ref, onMounted, watchEffect} from 'vue';
import {getUserLocation} from './location';
import {Point} from '@arcgis/core/geometry';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import SketchViewModel from "@arcgis/core/widgets/Sketch"
import Graphic from "@arcgis/core/Graphic";
import * as webMercatorUtils from '@arcgis/core/geometry/support/webMercatorUtils';
import {Polyline, Polygon} from '@arcgis/core/geometry';
import {SimpleLineSymbol, SimpleFillSymbol, SimpleMarkerSymbol} from '@arcgis/core/symbols';
import * as os from "node:os";
import {watch} from "vue";
import keys from "../keys.json";


// 在 mapConfig.ts 中访问 selectedLayer
const selectedLayer = inject<string>('selectedLayer');

export const mapCenter = ref([104.154319, 35.943354]); // 默认中心位置，兰州
// export const mapCenter = ref([104.698, 31.540]); // 默认中心位置，绵阳



// 使用 keys 对象中的 tiandituKey
const tiandituKey = keys.tiandituKey;


// 天地图矢量图层
const tdtVecLayer = new WebTileLayer({
    urlTemplate: `http://t0.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={level}&TILEROW={row}&TILECOL={col}&tk=${tiandituKey}`,
    id: 'tdtVecLayer'
});
// 天地图矢量注记图层
const tdtCvaLayer = new WebTileLayer({
    urlTemplate: `http://t0.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={level}&TILEROW={row}&TILECOL={col}&tk=${tiandituKey}`,
    id: 'tdtCvaLayer'
});

// 天地图影像图层
const tdtImgLayer = new WebTileLayer({
    urlTemplate: `http://t0.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={level}&TILEROW={row}&TILECOL={col}&tk=${tiandituKey}`,
    id: 'tdtImgLayer'
});
// 天地图影像注记图层
const tdtCiaLayer = new WebTileLayer({
    urlTemplate: `http://t0.tianditu.gov.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={level}&TILEROW={row}&TILECOL={col}&tk=${tiandituKey}`,
    id: 'tdtCiaLayer'
});

//天地图地形晕染图层
const tdtTerLayer = new WebTileLayer({
    urlTemplate: `http://t0.tianditu.gov.cn/ter_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ter&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={level}&TILEROW={row}&TILECOL={col}&tk=${tiandituKey}`,
    id: 'tdtTerLayer'
});
//天地图地形晕染注记图层
const tdtCtaLayer = new WebTileLayer({
    urlTemplate: `http://t0.tianditu.gov.cn/cta_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cta&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={level}&TILEROW={row}&TILECOL={col}&tk=${tiandituKey}`,
    id: 'tdtCtaLayer'
});

//OSM图层
const osmLayer = new WebTileLayer({
    urlTemplate: 'https://tile.openstreetmap.org/{level}/{col}/{row}.png',
    id: 'osmLayer'
});

// 新增 热点图 图层
const HotPoint = new MapImageLayer({
    url: 'https://qg.zenithangle.top/server/rest/services/%E6%A2%81%E6%AD%A3%E7%82%9C_%E9%9D%92%E7%94%98%E5%A4%A7%E7%8E%AF%E7%BA%BF/HotPoint/MapServer',
    sublayers: [{
        id: 0 // 使用id来指定子图层
    }],
    id: 'HotPoint'
});



// 新增 景点图 图层
const landmarks: FeatureLayer = new FeatureLayer({
    url: 'https://qg.zenithangle.top/server/rest/services/%E6%A2%81%E6%AD%A3%E7%82%9C_%E9%9D%92%E7%94%98%E5%A4%A7%E7%8E%AF%E7%BA%BF/landmarks/MapServer',
    id: 'Landmarks'
});



//新增 道路 图层
const road = new FeatureLayer({
    url: 'https://qg.zenithangle.top/server/rest/services/%E6%A2%81%E6%AD%A3%E7%82%9C_%E9%9D%92%E7%94%98%E5%A4%A7%E7%8E%AF%E7%BA%BF/roads/MapServer',
    id: 'Roads'
});




let view: MapView | null = null;

export const tempLayer = new GraphicsLayer();

export function baseMapView(containerId: string, selectedLayer: Ref<string>) {
    const map = new Map();



    view = new MapView({
        container: containerId,
        map: map,
        center: mapCenter.value,  // 使用响应式中心位置
        zoom: 10,
        constraints: {
            minZoom: 3,
            maxZoom: 18
        }
    });

    watchEffect(() => {
        let layers;
        switch (selectedLayer.value) {
            case 'tdtVecLayer':
                layers = [tdtVecLayer, tdtCvaLayer,landmarks];
                break;
            case 'tdtImgLayer':
                layers = [tdtImgLayer, tdtCiaLayer,landmarks];
                break;
            case 'tdtTerLayer':
                layers = [tdtTerLayer, tdtCtaLayer,landmarks];
                break;
            case 'osmLayer':
                layers = [osmLayer,landmarks];
                break;
            case 'HotPoint':
                layers = [tdtVecLayer, tdtCvaLayer,HotPoint];
                break;
            case'roads':
                layers = [tdtVecLayer, tdtCvaLayer,road];
                break;
            default:
                layers = [tdtVecLayer, tdtCvaLayer,landmarks]; // 默认使用矢量图层
        }
        map.removeAll(); // 移除地图上的所有图层
        layers.forEach(layer => map.add(layer)); // 添加新选中的图层
        map.add(tempLayer); // 添加临时图层
        // 确保 tempLayer 保持在最顶层
        if (map.layers.includes(tempLayer)) {
            map.reorder(tempLayer, map.layers.length - 1);
        }
    });



// 监听mapCenter的变化，当它变化时，更新地图的中心位置
    watchEffect(() => {
        view.center = new Point({
            longitude: mapCenter.value[0],
            latitude: mapCenter.value[1]
        });
    });

    view.on('drag', function (event) {
        // 当地图被拖动时，更新 mapCenter 的值
        if (event.action === 'end') {
            const center = view.center;
            mapCenter.value = [center.longitude, center.latitude];
        }
    });



    return {view, map};
}

export {view}; // 导出 view 变量

export function setMapCenter(longitude: number, latitude: number, zoom: number = view?.zoom) {
    if (view) {
        // 更新 mapCenter 的值
        mapCenter.value = [longitude, latitude];

        // 使用 goto 方法更新地图中心和缩放级别
        view.goTo({
            center: [longitude, latitude],
            zoom: zoom
        }, {
            duration: 1000  // 动画持续时间，单位为毫秒
        });
    }
}


let sketchViewModel: SketchViewModel | null = null;

export function selectManualLocation(enable: boolean, notify: (msg: string) => void, onComplete: () => void) {
    if (!view) {
        console.error('MapView is not initialized.');
        return;
    }

    if (sketchViewModel) {
        sketchViewModel.cancel(); // 取消创建
        sketchViewModel.destroy(); // 销毁 SketchViewModel 实例
        sketchViewModel = null;
    }

    if (enable) {
        const graphicsLayer = new GraphicsLayer();
        view.map.add(graphicsLayer); // 添加图形层到地图

        sketchViewModel = new SketchViewModel({
            view: view,
            layer: graphicsLayer,
            defaultCreateOptions: {
                mode: 'click' // 确保模式设置为 click
            }
        });

        sketchViewModel.on('create', (event) => {
            if (event.state === 'complete') {
                sketchViewModel.layer.removeAll(); // 清除草图图层
                let point = event.graphic.geometry as Point;
                point = webMercatorUtils.webMercatorToGeographic(point) as Point;
                setMapCenter(point.longitude, point.latitude, 15); // 使用转换后的经纬度更新地图中心
                notify(`目标经度: ${point.longitude.toFixed(3)}, 目标纬度: ${point.latitude.toFixed(3)}`);
                notify(`当前仍处于手动选择位置模式，点击右键可退出`);
                onComplete(); // 调用 onComplete 回调来更新状态
            }
        });

        sketchViewModel.create('point'); // 创建点

        // 添加鼠标右键点击事件监听，用于退出选择模式
        view.on("click", function (event) {
            if (event.button === 2) { // 检查是否是鼠标右键
                if (sketchViewModel) {
                    sketchViewModel.cancel(); // 取消当前创建
                    onComplete(); // 调用 onComplete 更新状态
                    notify('手动选择位置功能已关闭');
                }
            }
        });
    } else {
        if (sketchViewModel) {
            sketchViewModel.cancel(); // 取消当前创建
            onComplete(); // 确保在关闭时也调用 onComplete
            notify('手动选择位置功能已关闭');
        }
    }
}


