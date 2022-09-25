import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/index.ts'),
      formats: ['es', 'umd'],
      name: 'Mutate'
    },
    rollupOptions: {
      external: ['vue', 'less'],
      output: {
        globals: {
          vue: 'Vue',
          less: 'Less'
        }
      }
    }
  }
})
