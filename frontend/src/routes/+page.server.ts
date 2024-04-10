import { type ServerLoad, redirect } from '@sveltejs/kit';

export const load: ServerLoad = async ({}) => {
	redirect(301, '/fr');
};
