import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
		exclude: ['emoji-picker-element'],
		include: ['svelte-gravatar', 'svelte-waypoint']
	},
	server: {
		proxy: {
			'/api': 'http://localhost:8000'
		}
	}
});
