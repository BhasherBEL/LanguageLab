<script lang="ts">
	import { page } from '$app/stores';
	import { getSessionAPI } from '$lib/api/sessions';
	import Chatbox from '$lib/components/sessions/chatbox.svelte';
	import Session from '$lib/types/session';
	import { getBaseURL } from '$lib/utils/login';
	import { onMount } from 'svelte';
	import { user } from '$lib/types/user';
	import Gravatar from 'svelte-gravatar';
	import WeeklySurvey from '$lib/components/users/weeklySurvey.svelte';
	import config from '$lib/config.js';
	export let data;

	let session: Session | null = null;
	$: onlineUsers = session ? session.onlineUsers : null;

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
	<div class="h-full grid lg:grid-cols-7">
		<div class="justify-evenly h-full p-2">
			<ul class="ml-2">
				{#each session.users as sessionUser (sessionUser.id)}
					<li
						class="list-disc list-inside {sessionUser.id == $user?.id ||
						$onlineUsers?.has(sessionUser.id)
							? 'marker:text-green-500'
							: 'marker:text-red-500'} marker:text-3xl"
					>
						<div class="inline-flex space-x-2">
							<div class="rounded-full mx-2 chat-image size-6" title={sessionUser.nickname}>
								<Gravatar
									email={sessionUser.email}
									size={64}
									title={sessionUser.nickname}
									class="rounded-full"
								/>
							</div>

							<span class:font-bold={sessionUser === $user}>{sessionUser.nickname}</span>
						</div>
					</li>
				{/each}
			</ul>
		</div>
		<div class="flex flex-row flex-grow col-span-5">
			<Chatbox {session} token={data.token} />
		</div>
		<div class=""></div>
	</div>
{/if}

{#if $user}
	<WeeklySurvey />
{/if}
