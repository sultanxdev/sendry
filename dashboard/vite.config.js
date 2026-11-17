import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    css: {
        modules: {
            localsConvention: 'camelCase',
        },
        preprocessorOptions: {
            scss: {
                api: 'modern',
            }
        }
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        proxy: {
            '/api': {
                target: process.env.VITE_BACKEND_URL || 'http://localhost:5000',
                changeOrigin: true,
                configure: (proxy) => {
                    proxy.on('error', (err, _req, res) => {
                        if (err.code === 'ECONNREFUSED') {
                            if (res.writeHead && !res.headersSent) {
                                res.writeHead(503, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({
                                    success: false,
                                    message: 'Backend server is not running on port 5000',
                                    statusCode: 503,
                                }));
                            }
                            return;
                        }
                        console.error('[vite] Proxy error:', err);
                    });
                },
            },
        },
    },
});
