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
	const isDST = isInDST(new Date(dateStr + 'Z'));

	const offset = isDST ? '+02:00' : '+01:00';

	return new Date(dateStr + offset);
}

function isInDST(date: Date): boolean {
	const year = date.getUTCFullYear();

	// Calculate the last Sunday in March
	const startOfDST = new Date(Date.UTC(year, 2, 31));
	const startDay = startOfDST.getUTCDay();
	const lastSundayMarch = 31 - startDay;
	const startOfDSTDate = new Date(Date.UTC(year, 2, lastSundayMarch, 1));

	// Calculate the last Sunday in October
	const endOfDST = new Date(Date.UTC(year, 9, 31));
	const endDay = endOfDST.getUTCDay();
	const lastSundayOctober = 31 - endDay;
	const endOfDSTDate = new Date(Date.UTC(year, 9, lastSundayOctober, 1));

	return date >= startOfDSTDate && date < endOfDSTDate;
}
