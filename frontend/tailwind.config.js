/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			animation: {
				'highlight-scroll': 'highlight-scroll 1.5s ease-in-out'
			},
			keyframes: {
				'highlight-scroll': {
					'0%': { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
					'50%': { backgroundColor: 'rgba(255, 255, 0, 0.2)' },
					'100%': { backgroundColor: 'transparent' }
				}
			}
		}
	},
	plugins: [require('daisyui')],
	daisyui: {
		themes: [
			'bumblebee',
			{
				ucl: {
					primary: '#032f5d',
					info: '#0000ff',
					success: '#00ff00',
					warning: '#ffcc00',
					error: '#ff0000'
				}
			}
		],
		logs: false
	}
};
