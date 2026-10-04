import { defineConfig, type ProxyOptions } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Vite otherwise returns an empty plain-text 500 when the API is offline.
const apiProxy: ProxyOptions = {
  target: 'http://localhost:8888',
  changeOrigin: true,
  configure(proxy) {
    proxy.on('error', (_error, _request, response) => {
      if ('writeHead' in response && !response.headersSent && !response.destroyed) {
        response.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
        response.end(JSON.stringify({ code: 'API_UNAVAILABLE', error: 'The API server is temporarily unavailable. Please retry.' }));
      }
    });
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': apiProxy,
      '/.netlify/functions': apiProxy,
    },
  },
})
