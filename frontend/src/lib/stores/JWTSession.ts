import { getUserAPI } from '$lib/api/users';
import User from '$lib/types/user';
import { toastAlert } from '$lib/utils/toasts';
import { get, writable } from 'svelte/store';

function localWritable(name: string, start: string) {
	const stored = localStorage.getItem(name);
	const w = writable(stored || start);
	w.subscribe((value) => localStorage.setItem(name, value));

	return w;
}

const accessToken = localWritable('accessToken', '');
const refreshToken = localWritable('refreshToken', '');
const email = localWritable('email', '');
const nickname = localWritable('nickname', '');
const type = localWritable('type', '');
const id = localWritable('id', '');
const exp = localWritable('exp', '');

const isLoggedIn = () => {
	if (get(accessToken) === '') return false;

	const expiration = parseInt(get(exp));

	if (isNaN(expiration) || expiration < Date.now() / 1000) return false;

	return true;
};

const user = () => {
	const user = User.find(parseInt(get(id)));

	return user;
};

const userOrLoad = async () => {
	const user = User.find(parseInt(get(id)));

	if (user !== undefined) {
		return user;
	}
	return await loadUser();
};

const loadUser = async () => {
	const user = User.parse(await getUserAPI(parseInt(get(id))));
	if (user === undefined && isLoggedIn()) {
		toastAlert('Failed to load user data');
	}
	return user;
};

export default {
	accessToken,
	refreshToken,
	email,
	nickname,
	type,
	id,
	exp,
	isLoggedIn,
	user,
	loadUser,
	userOrLoad
};
