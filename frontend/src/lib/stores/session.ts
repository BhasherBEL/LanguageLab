import { get, writable } from 'svelte/store';

function localWritable(name: string, start: string) {
	const stored = localStorage.getItem(name);
	const w = writable(stored || start);
	w.subscribe((value) => localStorage.setItem(name, value));

	return w;
}

const accessToken = localWritable('accessToken', '');
const refreshToken = localWritable('refreshToken', '');
const username = localWritable('username', '');
const type = localWritable('type', '');
const id = localWritable('id', '');

export default {
	accessToken,
	refreshToken,
	username,
	type,
	id,
	isLoggedIn: get(accessToken) !== ''
};
