/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				secondary: '#032f5d',
				secondaryHover: '#004E9C'
			},
			textUnderlineOffset: {
				6: '6px'
			}
		}
	},
	plugins: []
};
