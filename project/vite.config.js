import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import angular from '@analogjs/vite-plugin-angular';


export default defineConfig({
    plugins: [
        laravel({
            // input: ['resources/css/app.css', 'resources/js/app.js'],
            input: ['resources/crud-angular/src/main.ts'],
            refresh: true,
        }),
        angular({
            tsconfig: './tsconfig.json'
        }),
        tailwindcss(),
    ],
    optimizeDeps: {
        include: ['zone.js']
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,
        hmr: {
            host: 'localhost'
        },
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});

// command: npm run dev -- --host
