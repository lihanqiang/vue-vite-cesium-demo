import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import cesium from 'vite-plugin-cesium'
import babel from 'vite-babel-plugin'

const { geoserverHost } = require('./public/setting')

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'
  const proxyHost = isDev ? 'http://localhost:9999/' : geoserverHost
  return {
    plugins: [vue(), cesium(), babel()],
    base: '/',
    sourcemap: isDev,
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '~': resolve(__dirname, 'public')
      }
      // 导入时想要省略的扩展名列表。注意，不 建议忽略自定义导入类型的扩展名（例如：.vue），因为它会影响 IDE 和类型支持。
      // extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },
    optimizeDeps: {
      // include: ['axios'],
    },
    build: {
      target: 'modules',
      outDir: 'dist',
      assetsDir: 'assets',
      minify: 'terser' // 混淆器
    },
    server: {
      cors: true,
      open: false,
      host: '0.0.0.0',
      port: 9999,
      proxy: {
        '/geoserver_cobalt': {
          target: proxyHost, // 代理接口
          changeOrigin: true
        },
        '/terrain': {
          target: proxyHost, // 代理接口
          changeOrigin: true
        }
      }
    }
  }
})
