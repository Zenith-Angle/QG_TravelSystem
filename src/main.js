import {createApp} from 'vue'
import {createPinia} from 'pinia'
import App from './App.vue'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import '@arcgis/core/assets/esri/themes/light/main.css'

// 基于根组件创建Vue实例
const app = createApp(App);
const pinia = createPinia();

// 注册ElementPlus组件和图标
app.use(ElementPlus);
app.use(pinia);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}

// 挂载Vue实例到DOM
app.mount('#app');
