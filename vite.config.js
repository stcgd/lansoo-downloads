import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 核心修复：显式配置 Rollup 选项
  build: {
    // 告诉 Rollup 这些模块是外部的，不需要打包或解析
    rollupOptions: {
      external: [
        // 明确列出所有 Firebase 模块路径，以避免 Rollup 解析错误
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
        /^firebase\/.*/, // 保留通用匹配以防万一
      ],
    },
  },

  // 如果需要，可以配置别名以确保路径解析正确（可选，但有时候有帮助）
  resolve: {
    alias: {
      // 确保在导入时查找 node_modules
      // (通常不需要，但作为深度调试步骤可以保留)
    },
  },
});
