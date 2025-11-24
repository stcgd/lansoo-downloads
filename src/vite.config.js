import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 显式配置依赖优化 (Dev Server)
  optimizeDeps: {
    include: [
      // 确保 Firebase 子模块在开发环境中被预构建
      'firebase/app',
      'firebase/firestore',
      'firebase/auth',
    ],
  },
  
  resolve: {
    // 强制 Rollup 优先查找 'module' (ESM) 和其他 ESM 兼容字段
    mainFields: ['module', 'jsnext:main', 'jsnext', 'browser', 'main'],
  },

  // 生产构建配置 (Rollup)
  build: {
    // 确保 Rollup 能够处理 CommonJS 模块
    commonjsOptions: {
      include: [/node_modules/],
    },
    
    // 🔥 关键修复：根据 Rollup 错误提示，明确将 Firebase 模块化导入标记为外部依赖。
    // 这将告诉 Rollup 跳过对这些路径的解析，直接将它们保留在最终代码中。
    rollupOptions: {
      external: [
        'firebase/app',
        'firebase/firestore',
        'firebase/auth',
      ],
    },
  },
});
