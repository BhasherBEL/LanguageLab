import { t } from '$lib/services/i18n';
import { get } from 'svelte/store';

export function getFullMonth(id: number): string {
	switch (id) {
		case 0:
			return get(t)('utils.month.january');
		case 1:
			return get(t)('utils.month.february');
		case 2:
			return get(t)('utils.month.march');
		case 3:
			return get(t)('utils.month.april');
		case 4:
			return get(t)('utils.month.may');
		case 5:
			return get(t)('utils.month.june');
		case 6:
			return get(t)('utils.month.july');
		case 7:
			return get(t)('utils.month.august');
		case 8:
			return get(t)('utils.month.september');
		case 9:
			return get(t)('utils.month.october');
		case 10:
			return get(t)('utils.month.november');
		case 11:
			return get(t)('utils.month.december');
		default:
			return '??';
	}
}

export function displayDate(date: Date): string {
	if (date === null) return '';

	const now = new Date();

	if (now.getFullYear() === date.getFullYear()) {
		return date.getDate() + ' ' + getFullMonth(date.getMonth());
	} else {
		return date.getDate() + ' ' + getFullMonth(date.getMonth()) + ' ' + date.getFullYear();
	}
}

export function displayTime(date: Date): string {
	if (date === null) return '??';

	const now = new Date();

	const hours = date.getHours().toString();
	const minutes = date.getMinutes().toString().padStart(2, '0');

	if (
		now.getDate() === date.getDate() &&
		now.getFullYear() === date.getFullYear() &&
		now.getMonth() === date.getMonth()
	) {
		return hours + ':' + minutes;
	}

	const day = date.getDate().toString();
	const month = getFullMonth(date.getMonth());

	if (now.getFullYear() === date.getFullYear()) {
		return day + ' ' + month + ' ' + hours + ':' + minutes;
	}

	const year = date.getFullYear().toString();

	return day + ' ' + month + ' ' + year + ' ' + hours + ':' + minutes;
}

export function displayDuration(start: Date, end: Date): string | null {
	const duration = end.getTime() - start.getTime();

	const hours = Math.floor(duration / (1000 * 60 * 60));
	const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

	if (hours < 0 || minutes < 0) return null;

	if (hours === 0) return minutes + 'm';
	else return hours + 'h ' + minutes + 'm';
}

export function parseToLocalDate(dateStr: string): Date {
	return new Date(dateStr + 'Z');
}

export function formatToUTCDate(date: Date): string {
	return date.toISOString().split('Z')[0];
}
