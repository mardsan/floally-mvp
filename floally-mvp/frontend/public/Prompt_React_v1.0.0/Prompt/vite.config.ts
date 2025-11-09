import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig((mode)=>{

  return {
    base:"",
    plugins: [react()],
    define: { 'process.env': {},},
    // define: { 'process.env': {...process.env,  ...loadEnv('dev', process.cwd())}, },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
  }
})
