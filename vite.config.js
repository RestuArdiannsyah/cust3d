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
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              // Gunakan API key dari .env
              proxyReq.setHeader('key', env.VITE_API_KEY_RAJA_ONGKIR);
              console.log('🔑 API Key:', env.VITE_API_KEY_RAJA_ONGKIR ? 'Loaded' : 'Missing');
            });
          }
        }
      }
    }
  };
});