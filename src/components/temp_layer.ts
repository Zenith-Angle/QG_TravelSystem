// 引入必要的模块
import {Point, Polyline, Polygon,} from '@arcgis/core/geometry';
import Circle from '@arcgis/core/geometry/Circle';
import {
    SimpleMarkerSymbol,
    SimpleLineSymbol,
    SimpleFillSymbol,
    PictureMarkerSymbol
} from '@arcgis/core/symbols';
import Graphic from '@arcgis/core/Graphic';
import {view, tempLayer} from './mapConfig'; // 从 mapConfig.ts 文件中导入 view 和 tempLayer
import PopupTemplate from '@arcgis/core/PopupTemplate';
import administrativeIcon from '@/assets/images/定位.svg';
import foodIcon from '@/assets/images/餐饮.svg';
import hotelIcon from '@/assets/images/酒店.svg';
import trafficIcon from '@/assets/images/公交.svg';
import gasStationIcon from '@/assets/images/加油站.svg';
import startEndIcon from '@/assets/images/起点终点.svg';
import {ref} from 'vue';

/**
 * 在地图上绘制点
 * @param {('administrative' | 'food' | 'hotel' | 'traffic' | 'GasStation')} pointType - 点的具体样式类型
 * @param {number[][]} coordinates - 点的坐标
 * @param {{name: string, address: string}} [info] - 点的附加信息（名称和地址）
 */
export function drawPoint(pointType: 'administrative' | 'food' | 'hotel' | 'traffic' | 'GasStation' | 'StartEnd', coordinates: number[][], info?: {
    name: string,
    address: string,
    pname?: string,
    cityname?: string,
    adname?: string,
    type?: string,
    distance?: string
    level?: string
}): void {
    // console.log('drawPoint called with:', pointType, coordinates, info);

    if (!view) {
        console.error('MapView is not initialized.');
        return;
    }

    if (coordinates.length > 0 && coordinates[0].length === 2) {
        const [longitude, latitude] = coordinates[0];
        const pointGeometry = new Point({
            longitude: longitude,
            latitude: latitude
        });

        const getIconSize = (scale: number): { width: string, height: string } => {
            if (scale < 5000) {
                return {width: "20px", height: "20px"};
            } else if (scale < 10000) {
                return {width: "30px", height: "30px"};
            } else {
                return {width: "40px", height: "40px"};
            }
        };

        const size = getIconSize(view.scale);
        let symbol;
        let popupTemplate;

        switch (pointType) {
            case 'administrative':
                symbol = new PictureMarkerSymbol({
                    url: administrativeIcon,
                    width: size.width,
                    height: size.height
                });
                popupTemplate = new PopupTemplate({
                    title: "行政区信息",
                    content: `名称: ${info?.name ?? ''}<br>
                              地址: ${info?.address ?? ''}<br>
                              等级: ${info?.level ?? ''}<br>
                              经度: ${longitude}<br>
                              纬度: ${latitude}`
                });
                break;
            case 'food':
                symbol = new PictureMarkerSymbol({
                    url: foodIcon,
                    width: size.width,
                    height: size.height
                });
                popupTemplate = new PopupTemplate({
                    title: "餐饮设施信息",
                    content: `名称: ${info?.name ?? ''}<br>
                              地址: ${info?.pname ?? ''} ${info?.cityname ?? ''} ${info?.adname ?? ''} ${info?.address ?? ''}<br>
                              类型: ${info?.type ?? ''}<br>
                              距离: ${info?.distance ?? ''} 米`
                });
                break;
            case 'hotel':
                symbol = new PictureMarkerSymbol({
                    url: hotelIcon,
                    width: size.width,
                    height: size.height
                });
                popupTemplate = new PopupTemplate({
                    title: "酒店信息",
                    content: `名称: ${info?.name ?? ''}<br>
                              地址: ${info?.pname ?? ''} ${info?.cityname ?? ''} ${info?.adname ?? ''} ${info?.address ?? ''}<br>
                              类型: ${info?.type ?? ''}<br>
                              距离: ${info?.distance ?? ''} 米`
                });
                break;
            case 'traffic':
                symbol = new PictureMarkerSymbol({
                    url: trafficIcon,
                    width: size.width,
                    height: size.height
                });
                popupTemplate = new PopupTemplate({
                    title: "交通设施信息",
                    content: `名称: ${info?.name ?? ''}<br>
                              地址: ${info?.pname ?? ''} ${info?.cityname ?? ''} ${info?.adname ?? ''} ${info?.address ?? ''}<br>
                              类型: ${info?.type ?? ''}<br>
                              距离: ${info?.distance ?? ''} 米`
                });
                break;
            case 'GasStation':
                symbol = new PictureMarkerSymbol({
                    url: gasStationIcon,
                    width: size.width,
                    height: size.height
                });
                popupTemplate = new PopupTemplate({
                    title: "加油站信息",
                    content: `名称: ${info?.name ?? ''}<br>
                              地址: ${info?.pname ?? ''} ${info?.cityname ?? ''} ${info?.adname ?? ''} ${info?.address ?? ''}<br>
                              类型: ${info?.type ?? ''}<br>
                              距离: ${info?.distance ?? ''} 米`
                });
                break;
            case 'StartEnd':
                symbol = new PictureMarkerSymbol({
                    url: startEndIcon, // 假设有一个专门的图标用于起点和终点
                    width: size.width,
                    height: size.height
                });
                popupTemplate = new PopupTemplate({
                    title: info?.name || '未命名地点', // 如果没有提供名称，默认显示 '未命名地点'
                    content: `经度: ${coordinates[0][0]}<br>纬度: ${coordinates[0][1]}`
                });
                break;

            default:
                console.error('Invalid point type.');
                return;
        }

        const pointGraphic = new Graphic({
            geometry: pointGeometry,
            symbol: symbol,
            popupTemplate: popupTemplate
        });

        tempLayer.add(pointGraphic);

        // 监听地图缩放事件
        view.watch('scale', (newScale) => {
            const newSize = getIconSize(newScale);
            pointGraphic.symbol = new PictureMarkerSymbol({
                url: symbol.url,
                width: newSize.width,
                height: newSize.height
            });
        });
    } else {
        console.error('Invalid coordinates for point.');
    }
}

/**
 * 在地图上绘制线，并添加弹窗
 * @param {string} polylineType - 线的类型，例如 'road'
 * @param {string} coordinatesStr - 线的坐标字符串，格式为 "经度,纬度;经度,纬度;..."
 * @param {object} info - 包含线路相关信息的对象
 */
export function drawPolyline(polylineType: string, coordinatesStr: string, info: {
    instruction: string,
    orientation: string,
    road: string,
    distance: string,
    action: string,
    assistantAction?: string
}): void {
    // console.log('drawPolyline called with:', polylineType, coordinatesStr, info);

    if (!view) {
        console.error('MapView is not initialized.');
        return;
    }

    const coordinates = coordinatesStr.split(';').map(coord => {
        const [longitude, latitude] = coord.split(',').map(Number);
        return [longitude, latitude];
    });

    const polylineGeometry = new Polyline({
        paths: [coordinates]
    });

    const getLineWidth = (scale: number): number => {
        if (scale < 5000) {
            return 2;
        } else if (scale < 10000) {
            return 4;
        } else {
            return 6;
        }
    };

    const width = getLineWidth(view.scale);
    const symbol = new SimpleLineSymbol({
        color: [74, 71, 163, 0.8],  // 蓝紫色
        width: width
    });

    const polylineGraphic = new Graphic({
        geometry: polylineGeometry,
        symbol: symbol
    });

    const popupTemplate = new PopupTemplate({
        title: `${info.road} - 行驶指示`,
        content: `方向: ${info.orientation}<br>
                  行驶指示: ${info.instruction}<br>
                  此路段距离: ${info.distance}米<br>
                  导航主要动作: ${info.action}<br>
                  ${info.assistantAction ? `导航辅助动作: ${info.assistantAction}` : ''}`
    });

    polylineGraphic.popupTemplate = popupTemplate;

    tempLayer.add(polylineGraphic);

    // 监听地图缩放事件，动态调整线宽
    view.watch('scale', (newScale) => {
        const newWidth = getLineWidth(newScale);
        polylineGraphic.symbol = new SimpleLineSymbol({
            color: symbol.color,
            width: newWidth
        });
    });
}

/**
 * 绘制多个多边形网格
 * @param {string} polygonsString - 多边形经纬度字符串，多边形之间用'|'分割，点之间用';'，坐标之间用','
 */
export function drawGrid(polygonsString: string) {
    const polygons = polygonsString.split('|').map(polygon =>
        polygon.split(';').map(point => {
            const [x, y] = point.split(',').map(parseFloat);
            return [x, y];  // 直接创建坐标对数组
        })
    );

    polygons.forEach(polygonCoords => {
        const polygon = new Polygon({
            rings: [polygonCoords],  // 使用坐标对数组直接作为rings
            spatialReference: {wkid: 4326}
        });
        const polygonGraphic = new Graphic({
            geometry: polygon,
            symbol: new SimpleFillSymbol({
                color: [251, 116, 62, 0.8],  // 橙色
                outline: {
                    color: [255, 255, 255, 0.8],
                    width: 1
                }
            })
        });
        tempLayer.add(polygonGraphic);
    });
}


/**
 * 在地图上绘制圆形范围及其中心点
 * @param {string} centerStr - 中心点坐标字符串，格式为"经度,纬度"
 * @param {number} radius - 圆的半径，单位为米
 */
export function drawRange(centerStr: string, radius: number) {
    const [longitude, latitude] = centerStr.split(',').map(parseFloat);  // 将字符串转换为经纬度数字

    const pointGeometry = new Point({
        longitude: longitude,
        latitude: latitude
    });

    // 绘制中心点
    const pointGraphic = new Graphic({
        geometry: pointGeometry,
        symbol: new SimpleMarkerSymbol({
            color: [0, 0, 255], // 蓝色
            size: "8px", // 点的大小
            outline: {
                color: [0, 0, 139], // 深蓝色
                width: 2
            }
        })
    });

    // 绘制圆
    const circle = new Circle({
        center: pointGeometry,
        radius: radius
    });

    const circleGraphic = new Graphic({
        geometry: circle,
        symbol: new SimpleFillSymbol({
            color: [135, 206, 250, 0.15],  // 淡蓝色，0.3透明度
            outline: {
                color: [0, 0, 139],  // 深蓝色
                width: 1,
                style: 'solid'
            }
        })
    });

    tempLayer.add(pointGraphic);  // 添加中心点到图层
    tempLayer.add(circleGraphic); // 添加圆到图层
}