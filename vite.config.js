import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 核心修复：移除 path 模块的导入和别名配置，以避免与构建环境的默认解析发生冲突。
  // 同时移除 Rollup 选项中的 'external' 配置，让 Vite/Rollup 正常处理 Firebase 导入。
  // 这将依赖构建工具使用其默认的 Node 模块解析能力。
  //
  // build: {
  //   rollupOptions: {
  //     external: [
  //        ...
  //     ],
  //   },
  // },
  //
  // resolve: {
  //   alias: {
  //     '@src': path.resolve(__dirname, 'src'),
  //   },
  // },
});
