import GraphicsLayer = __esri.GraphicsLayer;

export function getUserLocation(): Promise<GeolocationCoordinates> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject('浏览器不支持地理位置功能');
        } else {
            navigator.geolocation.getCurrentPosition(
                position => {
                    resolve(position.coords);
                },
                () => {
                    reject('无法获取您的位置');
                }
            );
        }
    });
}


