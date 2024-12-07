<script lang="ts">
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import '../app.css';
	import { t } from '$lib/services/i18n';
	import Header from './Header.svelte';
	import type { PageData } from './$types';

	let { data, children }: { data: PageData; children: any } = $props();
	let user = data.user;
</script>

<svelte:head>
	<title>{$t('header.appName')}</title>
</svelte:head>

<Header {user} />

{@render children()}

<SvelteToast />
