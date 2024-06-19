// map_calculate.ts

// 计算两点之间的中点
export function calculateMidpoint(lat1: number, lon1: number, lat2: number, lon2: number): {
    latitude: number,
    longitude: number
} {
    return {
        latitude: (lat1 + lat2) / 2,
        longitude: (lon1 + lon2) / 2
    };
}

// Haversine 公式计算两点之间的距离（单位：米）
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // 地球半径，单位：米
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}


// 根据距离确定地图的缩放级别
export function getZoomLevelByDistance(distance: number): number {
    if (distance > 500000) { // 距离大于500公里
        return 6;
    } else if (distance > 100000) { // 距离大于100公里
        return 7;
    } else if (distance > 50000) { // 距离大于50公里
        return 9;
    } else if (distance > 20000) { // 距离大于20公里
        return 10;
    } else if (distance > 10000) { // 距离大于10公里
        return 11;
    } else if (distance > 5000) { // 距离大于5公里
        return 12;
    } else if (distance > 2000) { // 距离大于2公里
        return 13;
    } else if (distance > 1000) { // 距离大于1公里
        return 14;
    } else if (distance > 500) { // 距离大于500米
        return 15;
    } else { // 距离小于500米
        return 16;
    }
}
