import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [svelte(), tailwindcss()],
    optimizeDeps: {
        exclude: ['@tailwindcss/vite']
    },
    server: {
        proxy: {
            '/api/ticktick/auth': {
                target: 'https://api.ticktick.com/oauth/token',
                changeOrigin: true,
                rewrite: (path) => ''
            },
            '/api/ticktick': {
                target: 'https://api.ticktick.com',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/ticktick/, '/open/v1')
            }
        }
    }
})