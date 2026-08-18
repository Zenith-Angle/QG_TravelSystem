export function getUserLocation(): Promise<GeolocationCoordinates> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('浏览器不支持地理位置功能'));
        } else {
            navigator.geolocation.getCurrentPosition(
                position => {
                    resolve(position.coords);
                },
                error => reject(error),
                {enableHighAccuracy: true, timeout: 10000, maximumAge: 30000}
            );
        }
    });
}


