import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'index.vue'),
      name: 'NativeExample',
      fileName: 'index',
      formats: ['es']
    },
    rollupOptions: {
      // 外部化依赖，不打包进组件
      external: [
        'vue',
        'element-plus',
        '@element-plus/icons-vue',
        '@tauri-apps/api/core',
        /^@\//  // 所有 @/ 开头的导入（主应用提供）
      ],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    },
    outDir: 'dist-ui',
    emptyOutDir: true
  }
});