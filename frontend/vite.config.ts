import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  
  // Default port 3000 to match auth-service redirect URI configuration
  const port = parseInt(env.VITE_PORT || env.PORT || '3000', 10)

  return {
    plugins: [react()],
    server: {
      port,
      host: true, // Allow access from network
      strictPort: false, // If port is in use, try next available port
    },
  }
})
