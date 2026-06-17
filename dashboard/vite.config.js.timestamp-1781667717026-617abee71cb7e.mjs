// vite.config.js
import { defineConfig } from "file:///D:/All%20Projects/All%20SAAS%20Projects/sendry/dashboard/node_modules/vite/dist/node/index.js";
import react from "file:///D:/All%20Projects/All%20SAAS%20Projects/sendry/dashboard/node_modules/@vitejs/plugin-react/dist/index.js";
import tailwindcss from "file:///D:/All%20Projects/All%20SAAS%20Projects/sendry/dashboard/node_modules/@tailwindcss/vite/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [tailwindcss(), react()],
  css: {
    modules: {
      localsConvention: "camelCase"
    },
    preprocessorOptions: {
      scss: {
        api: "modern"
      }
    }
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxBbGwgUHJvamVjdHNcXFxcQWxsIFNBQVMgUHJvamVjdHNcXFxcc2VuZHJ5XFxcXGRhc2hib2FyZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcQWxsIFByb2plY3RzXFxcXEFsbCBTQUFTIFByb2plY3RzXFxcXHNlbmRyeVxcXFxkYXNoYm9hcmRcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L0FsbCUyMFByb2plY3RzL0FsbCUyMFNBQVMlMjBQcm9qZWN0cy9zZW5kcnkvZGFzaGJvYXJkL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gJ0B0YWlsd2luZGNzcy92aXRlJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgICBwbHVnaW5zOiBbdGFpbHdpbmRjc3MoKSwgcmVhY3QoKV0sXG4gICAgY3NzOiB7XG4gICAgICAgIG1vZHVsZXM6IHtcbiAgICAgICAgICAgIGxvY2Fsc0NvbnZlbnRpb246ICdjYW1lbENhc2UnLFxuICAgICAgICB9LFxuICAgICAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XG4gICAgICAgICAgICBzY3NzOiB7XG4gICAgICAgICAgICAgICAgYXBpOiAnbW9kZXJuJyxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgc2VydmVyOiB7XG4gICAgICAgIGhvc3Q6ICcwLjAuMC4wJyxcbiAgICAgICAgcG9ydDogNTE3MyxcbiAgICAgICAgcHJveHk6IHtcbiAgICAgICAgICAgICcvYXBpJzoge1xuICAgICAgICAgICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NTAwMCcsXG4gICAgICAgICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXdWLFNBQVMsb0JBQW9CO0FBQ3JYLE9BQU8sV0FBVztBQUNsQixPQUFPLGlCQUFpQjtBQUV4QixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUN4QixTQUFTLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQztBQUFBLEVBQ2hDLEtBQUs7QUFBQSxJQUNELFNBQVM7QUFBQSxNQUNMLGtCQUFrQjtBQUFBLElBQ3RCO0FBQUEsSUFDQSxxQkFBcUI7QUFBQSxNQUNqQixNQUFNO0FBQUEsUUFDRixLQUFLO0FBQUEsTUFDVDtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDSixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsTUFDSCxRQUFRO0FBQUEsUUFDSixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsTUFDbEI7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUNKLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
