import {createApp} from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import '@arcgis/core/assets/esri/themes/light/main.css'
import esriConfig from '@arcgis/core/config'
import keys from './keys.json'

// 动态加载高德地图API
function loadAMapScript() {
    return new Promise((resolve, reject) => {
        if (typeof AMap !== 'undefined') {
            resolve(AMap);
            return;
        }
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = `https://webapi.amap.com/maps?v=1.4.15&key=9fcc75122f1545a52212f2c1f953900b`;
        script.onerror = reject;
        script.onload = () => {
            resolve(AMap);
        };
        document.head.appendChild(script);
    });
}

// 基于根组件创建Vue实例
const app = createApp(App);

// 注册ElementPlus组件和图标
app.use(ElementPlus);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}

// 添加密钥到Vue全局属性
app.config.globalProperties.$keys = keys;

// 如果有router的设置，确保router已经导入
// import router from './router'
// app.use(router);

// 挂载Vue实例到DOM
loadAMapScript().then(() => {
    app.config.globalProperties.$AMap = AMap;
    app.mount('#app');
}).catch((error) => {
    console.error('高德地图API加载失败:', error);
});
