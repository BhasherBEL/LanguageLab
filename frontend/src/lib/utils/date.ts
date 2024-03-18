import { _ } from '$lib/services/i18n';
import { get } from 'svelte/store';

export function getFullMonth(id: number): string {
	switch (id) {
		case 0:
			return get(_)('utils.month.january');
		case 1:
			return get(_)('utils.month.february');
		case 2:
			return get(_)('utils.month.march');
		case 3:
			return get(_)('utils.month.april');
		case 4:
			return get(_)('utils.month.may');
		case 5:
			return get(_)('utils.month.june');
		case 6:
			return get(_)('utils.month.july');
		case 7:
			return get(_)('utils.month.august');
		case 8:
			return get(_)('utils.month.september');
		case 9:
			return get(_)('utils.month.october');
		case 10:
			return get(_)('utils.month.november');
		case 11:
			return get(_)('utils.month.december');
		default:
			return '??';
	}
}

export function displayDate(date: Date): string {
	if (date === null) return '';

	const now = new Date();

	const hours = date.getHours().toString().padStart(2, '0');
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

	if (now.getTime() - date.getTime() < 1000 * 60 * 60) {
		if (now.getTime() - date.getTime() < 1000 * 60) {
			const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

			if (seconds === 0) return 'now';

			return seconds + 's';
		}

		const minutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

		return minutes + 'm';
	}

	const hours = date.getHours().toString().padStart(2, '0');
	const minutes = date.getMinutes().toString().padStart(2, '0');

	return hours + ':' + minutes;
}
