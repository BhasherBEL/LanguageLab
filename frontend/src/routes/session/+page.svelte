<script lang="ts">
	import { page } from '$app/stores';
	import { getSessionAPI } from '$lib/api/sessions';
	import Chatbox from '$lib/components/sessions/chatbox.svelte';
	import Session from '$lib/types/session';
	import { getBaseURL } from '$lib/utils/login';
	import { onMount } from 'svelte';
	import { t } from '$lib/services/i18n';
	import { user } from '$lib/types/user';
	import { AcademicCap, Icon, Sparkles, User } from 'svelte-hero-icons';
	export let data;

	let session: Session | null = null;

	onMount(async () => {
		const param = $page.url.searchParams.get('id');
		if (!param) {
			window.location.href = getBaseURL();
			return;
		}

		const id = parseInt(param);

		if (!id) return;
		else {
			session = Session.parse(await getSessionAPI(id));
		}
	});
</script>

{#if session}
	<div class="h-full grid lg:grid-cols-4">
		<div class="flex flex-col justify-evenly m-8">
			<div class="border-2 rounded-lg p-2">
				<h2 class="text-center font-bold text-xl">#{session.id}</h2>
				<div class="mb-2">{$t('session.participants')}:</div>
				<ul>
					{#each session.users as sessionUser (sessionUser.id)}
						<li class="list-disc list-inside">
							<div class="inline-flex space-x-2">
								{#if sessionUser.type == 0}
									<Icon src={Sparkles} class="w-5" />
								{:else if sessionUser.type == 1}
									<Icon src={AcademicCap} class="w-5" />
								{:else}
									<Icon src={User} class="w-5" />
								{/if}

								<span class:font-bold={sessionUser === $user}>{sessionUser.nickname}</span>
							</div>
						</li>
					{/each}
				</ul>
			</div>
		</div>
		<div class="flex flex-row flex-grow col-span-2">
			<Chatbox {session} token={data.token} />
		</div>
		<div class=""></div>
	</div>
{/if}
