// mapConfig.ts
import WebTileLayer from '@arcgis/core/layers/WebTileLayer';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import {ref, Ref, watchEffect} from 'vue';
import Point from '@arcgis/core/geometry/Point';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import SketchViewModel from "@arcgis/core/widgets/Sketch"
import Graphic from "@arcgis/core/Graphic";
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import * as webMercatorUtils from '@arcgis/core/geometry/support/webMercatorUtils';
import {tiandituKey} from "../config";
import {useMapStore} from '../stores/map';


export const mapCenter = ref([104.154319, 35.943354]); // 默认中心位置，兰州
// export const mapCenter = ref([104.698, 31.540]); // 默认中心位置，绵阳



// 天地图矢量图层
const tdtVecLayer = new WebTileLayer({
    urlTemplate: `https://t0.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={level}&TILEROW={row}&TILECOL={col}&tk=${tiandituKey}`,
    id: 'tdtVecLayer'
});
// 天地图矢量注记图层
const tdtCvaLayer = new WebTileLayer({
    urlTemplate: `https://t0.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={level}&TILEROW={row}&TILECOL={col}&tk=${tiandituKey}`,
    id: 'tdtCvaLayer'
});

// 天地图影像图层
const tdtImgLayer = new WebTileLayer({
    urlTemplate: `https://t0.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={level}&TILEROW={row}&TILECOL={col}&tk=${tiandituKey}`,
    id: 'tdtImgLayer'
});
// 天地图影像注记图层
const tdtCiaLayer = new WebTileLayer({
    urlTemplate: `https://t0.tianditu.gov.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={level}&TILEROW={row}&TILECOL={col}&tk=${tiandituKey}`,
    id: 'tdtCiaLayer'
});

//天地图地形晕染图层
const tdtTerLayer = new WebTileLayer({
    urlTemplate: `https://t0.tianditu.gov.cn/ter_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ter&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={level}&TILEROW={row}&TILECOL={col}&tk=${tiandituKey}`,
    id: 'tdtTerLayer'
});
//天地图地形晕染注记图层
const tdtCtaLayer = new WebTileLayer({
    urlTemplate: `https://t0.tianditu.gov.cn/cta_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cta&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={level}&TILEROW={row}&TILECOL={col}&tk=${tiandituKey}`,
    id: 'tdtCtaLayer'
});

//OSM图层
const osmLayer = new WebTileLayer({
    urlTemplate: 'https://tile.openstreetmap.org/{level}/{col}/{row}.png',
    id: 'osmLayer'
});

// // 新增 热点图 图层
// const HotPoint = new MapImageLayer({
//     url: 'https://qg.zenithangle.top/server/rest/services/%E6%A2%81%E6%AD%A3%E7%82%9C_%E9%9D%92%E7%94%98%E5%A4%A7%E7%8E%AF%E7%BA%BF/HotPoint/MapServer',
//     sublayers: [{
//         id: 0 // 使用id来指定子图层
//     }],
//     id: 'HotPoint'
// });

// 新增 热点图 图层
const HotPoint = new MapImageLayer({
    url: 'https://pc.geosceneenterprise40.cn/server/rest/services/QingGan/HotPoint/MapServer',
    sublayers: [{
        id: 0 // 使用id来指定子图层
    }],
    id: 'HotPoint'
});

const landmarkDefinitions = [
    {name: '青海湖', longitude: 100.2254, latitude: 36.8974},
    {name: '茶卡盐湖', longitude: 99.077, latitude: 36.692},
    {name: '大柴旦', longitude: 95.365, latitude: 37.85},
    {name: '乌素特水上雅丹地质公园', longitude: 93.6, latitude: 38.75},
    {name: '莫高窟-鸣沙山月牙泉', longitude: 94.6623, latitude: 40.1421},
    {name: '嘉峪关关城', longitude: 98.2235, latitude: 39.8001},
    {name: '张掖七彩丹霞', longitude: 100.0635, latitude: 38.973},
    {name: '卓尔山', longitude: 100.246, latitude: 38.194},
    {name: '马蹄寺景区', longitude: 100.628, latitude: 38.531}
];

// 使用随应用发布的轻量景点索引，避免核心交互依赖已失效的远端图层服务。
export const landmarks = new GraphicsLayer({
    id: 'Landmarks',
    title: 'Landmarks'
});
landmarks.addMany(landmarkDefinitions.map((landmark, index) => new Graphic({
        geometry: new Point({
            longitude: landmark.longitude,
            latitude: landmark.latitude
        }),
        attributes: {
            ObjectID: index + 1,
            Name: landmark.name
        },
        symbol: new SimpleMarkerSymbol({
            color: [219, 78, 71, 0.9],
            size: 10,
            outline: {color: [255, 255, 255, 0.9], width: 1}
        })
    })));



// //新增 道路 图层
// const road = new FeatureLayer({
//     url: 'https://qg.zenithangle.top/server/rest/services/%E6%A2%81%E6%AD%A3%E7%82%9C_%E9%9D%92%E7%94%98%E5%A4%A7%E7%8E%AF%E7%BA%BF/roads/MapServer',
//     id: 'Roads'
// });
//新增 道路 图层
const road = new FeatureLayer({
    url: 'https://pc.geosceneenterprise40.cn/server/rest/services/QingGan/roads/MapServer',
    id: 'Roads'
});



let view: MapView | null = null;
let mapStore: ReturnType<typeof useMapStore> | null = null;
let viewCleanupCallbacks: Array<() => void> = [];

export const tempLayer = new GraphicsLayer();

export function baseMapView(containerId: string, selectedLayer: Ref<string>) {
    destroyMapView();
    mapStore = useMapStore();
    if (mapStore && mapStore.mapCenter.length === 2) {
        mapCenter.value = [mapStore.mapCenter[0], mapStore.mapCenter[1]];
    }
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

    viewCleanupCallbacks.push(watchEffect(() => {
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
    }));

    viewCleanupCallbacks.push(watchEffect(() => {
        if (!mapStore) {
            return;
        }
        const [lng, lat] = mapStore.mapCenter;
        if (mapCenter.value[0] !== lng || mapCenter.value[1] !== lat) {
            mapCenter.value = [lng, lat];
        }
    }));



// 监听mapCenter的变化，当它变化时，更新地图的中心位置
    viewCleanupCallbacks.push(watchEffect(() => {
        view.center = new Point({
            longitude: mapCenter.value[0],
            latitude: mapCenter.value[1]
        });
    }));

    const dragHandle = view.on('drag', function (event) {
        // 当地图被拖动时，更新 mapCenter 的值
        if (event.action === 'end') {
            const center = view.center;
            mapCenter.value = [center.longitude, center.latitude];
            if (mapStore) {
                mapStore.moveTo(center.longitude, center.latitude, view.zoom);
            }
        }
    });
    viewCleanupCallbacks.push(() => dragHandle.remove());



    return {view, map};
}

export function destroyMapView() {
    stopManualLocation();
    viewCleanupCallbacks.forEach(cleanup => cleanup());
    viewCleanupCallbacks = [];
    view?.destroy();
    view = null;
    mapStore = null;
}

export {view}; // 导出 view 变量

export function setMapCenter(longitude: number, latitude: number, zoom: number = view?.zoom) {
    if (view) {
        // 更新 mapCenter 的值
        mapCenter.value = [longitude, latitude];
        if (mapStore) {
            mapStore.moveTo(longitude, latitude, zoom);
        }

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
let manualGraphicsLayer: GraphicsLayer | null = null;
let manualClickHandle: __esri.Handle | null = null;

function stopManualLocation() {
    manualClickHandle?.remove();
    manualClickHandle = null;

    if (sketchViewModel) {
        sketchViewModel.cancel();
        sketchViewModel.destroy();
        sketchViewModel = null;
    }

    if (manualGraphicsLayer && view?.map) {
        view.map.remove(manualGraphicsLayer);
    }
    manualGraphicsLayer = null;
}

export function selectManualLocation(enable: boolean, notify: (msg: string) => void, onComplete: () => void) {
    if (!view) {
        console.error('MapView is not initialized.');
        return;
    }

    stopManualLocation();

    if (enable) {
        manualGraphicsLayer = new GraphicsLayer();
        view.map.add(manualGraphicsLayer);

        sketchViewModel = new SketchViewModel({
            view: view,
            layer: manualGraphicsLayer,
            defaultCreateOptions: {
                mode: 'click' // 确保模式设置为 click
            }
        });

        sketchViewModel.on('create', (event) => {
            if (event.state === 'complete') {
                manualGraphicsLayer?.removeAll();
                let point = event.graphic.geometry as Point;
                point = webMercatorUtils.webMercatorToGeographic(point) as Point;
                setMapCenter(point.longitude, point.latitude, 15);
                notify(`目标经度: ${point.longitude.toFixed(3)}, 目标纬度: ${point.latitude.toFixed(3)}`);
                stopManualLocation();
                onComplete();
            }
        });

        sketchViewModel.create('point'); // 创建点

        manualClickHandle = view.on("click", function (event) {
            if (event.button === 2) {
                stopManualLocation();
                onComplete();
                notify('手动选择位置功能已关闭');
            }
        });
    } else {
        onComplete();
        notify('手动选择位置功能已关闭');
    }
}


