/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			textUnderlineOffset: {
				6: '6px'
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