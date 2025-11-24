import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 修复：针对 Rollup 无法解析 Firebase 模块的错误。
  // 必须将所有 Firebase 模块显式标记为 external，以确保构建器知道它们是外部依赖，
  // 从而解决 "Rollup failed to resolve import "firebase/app"" 的问题。
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
