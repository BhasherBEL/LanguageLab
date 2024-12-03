declare module 'svelte-gravatar' {
	import { SvelteComponentTyped } from 'svelte';

	interface GravatarProps {
		email: string;
		size?: number;
		rating?: 'g' | 'pg' | 'r' | 'x';
		defaultImage?: string;
		forceDefault?: boolean;
	}

	export default class Gravatar extends SvelteComponentTyped<GravatarProps> {}
}
