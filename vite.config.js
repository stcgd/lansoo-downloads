import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 关键修复：设置应用的公共基础路径（Base Public Path）。
  // 部署在如 GitHub Pages 等子目录环境时（例如在 /repo-name/ 下），必须配置此项，
  // 否则应用将无法加载JS/CSS/图片等资源，导致空白页。
  // 我们根据您观察到的跳转路径，将其设置为 /lansoo-downloads/
  base: '/lansoo-downloads/', 
  
  // 修复：针对 Rollup 无法解析 Firebase 模块的错误。
  build: {
    rollupOptions: {
      external: [
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
      ],
    },
  },
  
  // 保持配置精简，移除了别名和不必要的路径配置。
});
