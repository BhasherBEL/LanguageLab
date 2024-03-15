export function getFullMonth(id: number): string {
	switch (id) {
		case 0:
			return 'janvier';
		case 1:
			return 'février';
		case 2:
			return 'mars';
		case 3:
			return 'avril';
		case 4:
			return 'mai';
		case 5:
			return 'juin';
		case 6:
			return 'juillet';
		case 7:
			return 'août';
		case 8:
			return 'septembre';
		case 9:
			return 'octobre';
		case 10:
			return 'novembre';
		case 11:
			return 'décembre';
		default:
			return '??';
	}
}

export function displayDate(date: Date): string {
	if (date === null) return '';

	const now = new Date();

	if (now.getDate() === date.getDate()) {
		return date.getHours() + ':' + date.getMinutes();
	} else if (now.getFullYear() === date.getFullYear()) {
		return (
			date.getDate() +
			' ' +
			getFullMonth(date.getMonth()) +
			' ' +
			date.getHours() +
			':' +
			date.getMinutes()
		);
	} else {
		return (
			date.getDate() +
			' ' +
			getFullMonth(date.getMonth()) +
			' ' +
			date.getFullYear() +
			' ' +
			date.getHours() +
			':' +
			date.getMinutes()
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
