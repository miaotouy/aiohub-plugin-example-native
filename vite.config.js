import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'aiohub-alias-resolver',
      enforce: 'pre',
      resolveId(source) {
        if (source.startsWith('@/')) {
          const isUI = source.includes('/components/') || source.includes('/tools/');
          return { id: isUI ? 'aiohub-ui' : 'aiohub-sdk', external: true };
        }
        return null;
      }
    }
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, '../../src'),
      'aiohub-sdk': resolve(__dirname, '../../src/services/plugin-sdk'),
      'aiohub-ui': resolve(__dirname, '../../src/services/plugin-ui')
    }
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'NativeExample.vue'),
      name: 'NativeExample',
      fileName: 'NativeExample',
      formats: ['es']
    },
    rollupOptions: {
      // 外部化依赖，不打包进组件
      external: [
        'vue',
        '@tauri-apps/api/core',
        'aiohub-sdk',
        'aiohub-ui'
      ],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    },
    outDir: 'dist',
    emptyOutDir: false
  }
});