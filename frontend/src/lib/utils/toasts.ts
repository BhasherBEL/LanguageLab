import { toast } from '@zerodevx/svelte-toast';

export function toastAlert(title: string, subtitle: string = '', persistant: boolean = false) {
	if (typeof window === 'undefined') return;
	toast.push(`<strong>${title}</strong><br>${subtitle}`, {
		theme: {
			'--toastBackground': '#ff4d4f',
			'--toastBarBackground': '#d32f2f',
			'--toastColor': '#fff'
		},
		initial: persistant ? 0 : 1,
		next: 0,
		duration: 10000,
		pausable: true
	});
}

export function toastWarning(title: string, subtitle: string = '', persistant: boolean = false) {
	if (typeof window === 'undefined') return;
	toast.push(`<strong>${title}</strong><br>${subtitle}`, {
		theme: {
			'--toastBackground': '#faad14',
			'--toastBarBackground': '#d48806',
			'--toastColor': '#fff'
		},
		initial: persistant ? 0 : 1,
		next: 0,
		duration: 5000,
		pausable: true
	});
}

export function toastSuccess(title: string, subtitle: string = '', persistant: boolean = false) {
	if (typeof window === 'undefined') return;
	toast.push(`<strong>${title}</strong><br>${subtitle}`, {
		theme: {
			'--toastBackground': '#52c41a',
			'--toastBarBackground': '#389e0d',
			'--toastColor': '#fff'
		},
		initial: persistant ? 0 : 1,
		next: 0,
		duration: 3000,
		pausable: true
	});
}
