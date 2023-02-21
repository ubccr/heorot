import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  build: {
    outDir: "build",
  },
  server: {
    host: true,
    port: 3000,
  },
  plugins: [react()],
})
