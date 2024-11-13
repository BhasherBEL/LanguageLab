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

	const hours = date.getHours().toString();
	const minutes = date.getMinutes().toString().padStart(2, '0');

	if (now.getDate() === date.getDate()) {
		return hours + ':' + minutes;
	} else if (now.getFullYear() === date.getFullYear()) {
		return date.getDate() + ' ' + getFullMonth(date.getMonth()) + ' ' + hours + ':' + minutes;
	} else {
		return (
			date.getDate() +
			' ' +
			getFullMonth(date.getMonth()) +
			' ' +
			date.getFullYear() +
			' ' +
			hours +
			':' +
			minutes
		);
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
		return ('0' + hours).slice(-2) + ':' + ('0' + minutes).slice(-2);
	}

	const day = date.getDate().toString();
	const month = getFullMonth(date.getMonth());

	if (now.getFullYear() === date.getFullYear()) {
		return day + ' ' + month + ' ' + ('0' + hours).slice(-2) + ':' + ('0' + minutes).slice(-2);
	}

	const year = date.getFullYear().toString();

	return (
		day + ' ' + month + ' ' + year + ' ' + ('0' + hours).slice(-2) + ':' + ('0' + minutes).slice(-2)
	);
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

export function displayShortTime(date: Date): string {
	return (
		('0' + date.getDate()).slice(-2) +
		'/' +
		('0' + (date.getMonth() + 1)).slice(-2) +
		'/' +
		date.getFullYear() +
		' ' +
		('0' + date.getHours()).slice(-2) +
		':' +
		('0' + date.getMinutes()).slice(-2)
	);
}

export function displayTimeSince(date: Date): string {
	const now = new Date();
	const diff = now.getTime() - date.getTime();
	const seconds = Math.floor(diff / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);
	const months = Math.floor(days / 30);
	const years = Math.floor(months / 12);
	if (years > 0) {
		return get(t)('utils.past.year', { n: years });
	} else if (months > 0) {
		return get(t)('utils.past.month', { n: months });
	} else if (days === 1) {
		return get(t)('utils.past.yesterday');
	} else if (days > 0) {
		return get(t)('utils.past.day', { n: days });
	} else {
		return get(t)('utils.past.today');
	}
}
