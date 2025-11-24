import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 关键修复：显式配置依赖优化 (Dev Server)
  optimizeDeps: {
    include: [
      'firebase/app',
      'firebase/firestore',
      'firebase/auth',
    ],
  },
  
  // 生产构建配置 (Rollup)
  build: {
    // 确保 Rollup 能够处理 CommonJS 模块
    commonjsOptions: {
      include: [/node_modules/],
    },
    
    // 🔥 关键修复：解决 Rollup 无法解析 Firebase 子路径的错误 (Production Build)
    // 显式将所有 'firebase/*' 导入标记为外部依赖，绕过 Rollup 的解析检查。
    rollupOptions: {
        external: [
            // 使用正则表达式匹配所有 firebase/app, firebase/firestore 等导入
            /^firebase\// 
        ]
    }
  },
});
