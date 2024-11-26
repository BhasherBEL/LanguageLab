<script lang="ts">
	import Chatbox from '$lib/components/sessions/chatbox.svelte';
	import { user } from '$lib/types/user';
	import Gravatar from 'svelte-gravatar';
	import WeeklySurvey from '$lib/components/users/weeklySurvey.svelte';
	import { t } from '$lib/services/i18n';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	let { session, jwt } = data;
	let { onlineUsers } = session;
</script>

<div class="h-full flex lg:flex-row flex-col pt-2 lg:pt-0 border border-red-500">
	<div
		class="border rounded-xl p-4 shadow-[0_0_6px_0_rgba(0,14,156,.2)] m-2 my-0 lg:mt-2 h-fit lg:w-96 text-lg space-y-2"
	>
		<h2 class="text-center font-bold">{$t('utils.words.participants')}</h2>
		<div class="pb-2 space-y-2">
			{#each session.users as sessionUser (sessionUser.id)}
				<div class="flex space-x-2">
					<div class="rounded-full mx-2 chat-image size-6" title={sessionUser.nickname}>
						<Gravatar
							email={sessionUser.email}
							size={64}
							title={sessionUser.nickname}
							class="rounded-full border-2 {sessionUser.id == $user?.id ||
							$onlineUsers.has(sessionUser.id)
								? 'border-green-500'
								: 'border-red-500'}"
						/>
					</div>

					<span class:font-bold={sessionUser === $user}>{sessionUser.nickname}</span>
				</div>
			{/each}
		</div>
		<h2 class="text-center font-bold border-t pt-2">{$t('utils.words.topics')}</h2>
		<p class="text-center text-sm text-neutral-500 italic">{$t('sessions.noTopic')}</p>
	</div>
	<div class="flex flex-row flex-grow col-span-5">
		<Chatbox {session} {jwt} />
	</div>
</div>

{#if $user}
	<WeeklySurvey />
{/if}
