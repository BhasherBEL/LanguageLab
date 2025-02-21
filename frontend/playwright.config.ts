import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './tests',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: 2,
	workers: 1,
	reporter: 'html',
	use: {
		baseURL: 'http://127.0.0.1:5173',
		trace: 'on-first-retry'
	},

	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		},
		{
			name: 'firefox',
			use: { ...devices['Desktop Firefox'] }
		}
	],

	webServer: {
		command:
			'cd ../backend/app && source .env/bin/activate && JWT_SECRET_KEY=bonjour JWT_REFRESH_SECRET_KEY=bonjour ALLOWED_ORIGINS=http://127.0.0.1:5173 uvicorn main:app --no-reload',
		url: 'http://127.0.0.1:8000/docs',
		reuseExistingServer: !process.env.CI,
		timeout: 120000
	}
});
