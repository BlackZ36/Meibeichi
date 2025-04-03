import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
server: {
    host: true, // Cho phép truy cập từ bên ngoài
    port: 3001, // Cổng đang chạy React
    strictPort: true, // Đảm bảo chạy đúng cổng
    allowedHosts: [".ngrok-free.app"], // Cho phép tất cả các host từ ngrok
  },
});
