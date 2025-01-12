<script lang="ts">
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import '../app.css';
	import { t } from '$lib/services/i18n';
	import Header from './Header.svelte';
	import type { PageData } from './$types';
	import { toastSuccess } from '$lib/utils/toasts';

	let { data, children }: { data: PageData; children: any } = $props();
	let user = data.user;

	user?.sessions_added.subscribe((sessions) => {
		if (sessions.length > 0) {
			let lastSession = sessions[sessions.length - 1];
			toastSuccess(
				$t('home.sessionAdded', {
					users: lastSession.users
						.filter((u) => u.id != user?.id)
						.map((user) => user.nickname)
						.join(', ')
				})
			);
		}
	});
</script>

<svelte:head>
	<title>{$t('header.appName')}</title>
</svelte:head>

<Header {user} />

{@render children()}

<SvelteToast />
