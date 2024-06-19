import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';



export default defineConfig({
  base: './',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),  // 设置 '@' 别名指向 src 目录
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://apis.map.qq.com', // 代理目标API
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
});
