import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	resolve: {
		alias: {
			$lib: '/src/lib', 
			$routes: '/src/routes' 
		}
	},
	optimizeDeps: {
		exclude: ['emoji-picker-element'], 
		include: ['svelte-gravatar', 'svelte-waypoint'] 
	},
	server: {
		proxy: {
			'/api': {
				target: 'http://localhost:8000',
				changeOrigin: true, 
				secure: false 
			}
		}
	}
});
