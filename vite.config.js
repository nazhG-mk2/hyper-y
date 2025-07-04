import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// eslint-disable-next-line no-undef
const env = loadEnv(".env", process.cwd(), "");
export default defineConfig({
  plugins: [react()],
  base: env.VITE_BASE_ROUTE,
  server: {
    port: 3000
  }
})
