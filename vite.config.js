// vite.config.js
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [tailwindcss(), react()],
    server: {
      proxy: {
        '/api/rajaongkir': {
          target: 'https://rajaongkir.komerce.id',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/rajaongkir/, ''),
          headers: {
            'key': env.VITE_API_KEY_RAJA_ONGKIR || '',
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('🔑 Proxying request to:', req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('🔑 Received response from:', req.url, 'status:', proxyRes.statusCode);
            });
          }
        }
      }
    }
  };
});