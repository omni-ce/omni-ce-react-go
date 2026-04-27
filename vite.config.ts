import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const limit_size_chunk = 10 // MB

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1024 * 1024 * limit_size_chunk,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // chunk per file react-icons
          if (id.includes('node_modules/react-icons/ai')) return 'icons-ai'
          if (id.includes('node_modules/react-icons/bi')) return 'icons-bi'
          if (id.includes('node_modules/react-icons/bs')) return 'icons-bs'
          if (id.includes('node_modules/react-icons/cg')) return 'icons-cg'
          if (id.includes('node_modules/react-icons/ci')) return 'icons-ci'
          if (id.includes('node_modules/react-icons/di')) return 'icons-di'
          if (id.includes('node_modules/react-icons/fa6')) return 'icons-fa6'
          if (id.includes('node_modules/react-icons/fa')) return 'icons-fa'
          if (id.includes('node_modules/react-icons/fc')) return 'icons-fc'
          if (id.includes('node_modules/react-icons/fi')) return 'icons-fi'
          if (id.includes('node_modules/react-icons/gi')) return 'icons-gi'
          if (id.includes('node_modules/react-icons/go')) return 'icons-go'
          if (id.includes('node_modules/react-icons/gr')) return 'icons-gr'
          if (id.includes('node_modules/react-icons/hi2')) return 'icons-hi2'
          if (id.includes('node_modules/react-icons/hi')) return 'icons-hi'
          if (id.includes('node_modules/react-icons/im')) return 'icons-im'
          if (id.includes('node_modules/react-icons/io5')) return 'icons-io5'
          if (id.includes('node_modules/react-icons/io')) return 'icons-io'
          if (id.includes('node_modules/react-icons/lia')) return 'icons-lia'
          if (id.includes('node_modules/react-icons/lib')) return 'icons-lib'
          if (id.includes('node_modules/react-icons/lu')) return 'icons-lu'
          if (id.includes('node_modules/react-icons/md')) return 'icons-md'
          if (id.includes('node_modules/react-icons/pi')) return 'icons-pi'
          if (id.includes('node_modules/react-icons/ri')) return 'icons-ri'
          if (id.includes('node_modules/react-icons/rx')) return 'icons-rx'
          if (id.includes('node_modules/react-icons/si')) return 'icons-si'
          if (id.includes('node_modules/react-icons/sl')) return 'icons-sl'
          if (id.includes('node_modules/react-icons/tb')) return 'icons-tb'
          if (id.includes('node_modules/react-icons/tfi')) return 'icons-tfi'
          if (id.includes('node_modules/react-icons/ti')) return 'icons-ti'
          if (id.includes('node_modules/react-icons/vsc')) return 'icons-vsc'
          if (id.includes('node_modules/react-icons/wi')) return 'icons-wi'

          if (id.includes('node_modules')) return 'vendor'
          if (id.includes('/src/pages/')) return 'pages'
        },
      },
    },
  },
  // import alias
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    watch: {
      ignored: [
        '**/*.go',
        '**/go.mod',
        '**/go.sum',
        '**/vendor/**',
        '**/bin/**',
        '**/tmp/**',
      ],
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'prompt',
      injectRegister: false,

      pwaAssets: {
        disabled: false,
        config: true,
      },

      manifest: {
        name: 'flash-builder-pwa-name',
        short_name: 'flash-builder-pwa-short-name',
        description: 'flash-builder-pwa-description',
        theme_color: '#ffffff',
      },

      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        maximumFileSizeToCacheInBytes: 1024 * 1024 * limit_size_chunk,
      },

      devOptions: {
        enabled: false,
        navigateFallback: 'index.html',
        suppressWarnings: true,
        type: 'module',
      },
    }),
  ],
})
