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
    // 🔥 关键修复：修改模块解析字段优先级
    // 强制 Rollup 优先查找 'module' (ESM) 和其他 ESM 兼容字段，
    // 以正确处理 Firebase v9/v10+ 的模块化导入，避免 CommonJS 错误。
    mainFields: ['module', 'jsnext:main', 'jsnext', 'browser', 'main'],
  },

  // 生产构建配置 (Rollup)
  build: {
    // 确保 Rollup 能够处理 CommonJS 模块
    commonjsOptions: {
      include: [/node_modules/],
    },
    
    // 移除上一次尝试的 external 配置，以确保 Firebase 被正确打包，而不是被外部化。
    rollupOptions: {},
  },
});
