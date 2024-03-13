import User from '$lib/types/user';
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
const exp = localWritable('exp', '');

export default {
	accessToken,
	refreshToken,
	username,
	type,
	id,
	exp,
	isLoggedIn: () => {
		if (get(accessToken) === '') return false;

		const expiration = parseInt(get(exp));

		if (isNaN(expiration) || expiration < Date.now() / 1000) return false;

		return true;
	},
	user: () => User.find(parseInt(get(id)))
};
