import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 关键修复：显式配置依赖优化，解决 Rollup 无法解析 Firebase v9/v10+ 的子路径导入问题
  optimizeDeps: {
    include: [
      'firebase/app',
      'firebase/firestore',
      'firebase/auth',
    ],
  },
  
  // 确保生产环境中也能解析这些模块（可选，但推荐）
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
});
