<script lang="ts">
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import Header from '$lib/components/header.svelte';
	import '../../app.css';
	import { t } from '$lib/services/i18n';
	import User from '$lib/types/user.js';

	export let data;

	User.parseFromServer(data);
</script>

<svelte:head>
	<title>{$t('header.appName')}</title>
</svelte:head>

<Header />

<slot />

<SvelteToast />
