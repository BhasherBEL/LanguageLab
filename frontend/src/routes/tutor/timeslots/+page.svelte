<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/services/i18n';
	import Timeslots from '$lib/components/users/timeslots.svelte';
	import { user } from '$lib/types/user';
	import { toastWarning } from '$lib/utils/toasts';
	import { Icon, Calendar, QuestionMarkCircle } from 'svelte-hero-icons';

	$: lastTimeslots = 0n;
	$: timeslots = 0n;
	$: calcom_link = '';
	$: last_calcom_link = '';
	let ready = false;
	let sent = false;

	onMount(async () => {
		if ($user != null) {
			timeslots = $user.availability;
			lastTimeslots = timeslots;
			calcom_link = $user.calcom_link || '';
			last_calcom_link = calcom_link;
			ready = true;
		}
	});

	async function send() {
		if (!calcom_link || calcom_link.length == 0) {
			toastWarning($t('timeslots.calcomWarning'));
			return;
		}

		const res = $user?.setAvailability(timeslots, calcom_link);

		if (!res) return;

		lastTimeslots = timeslots;
		last_calcom_link = calcom_link;
		sent = true;
		setTimeout(() => (sent = false), 3000);
	}
</script>

<svelte:head>
	<script>
		(function (C, A, L) {
			let p = function (a, ar) {
				a.q.push(ar);
			};
			let d = C.document;
			C.Cal =
				C.Cal ||
				function () {
					let cal = C.Cal;
					let ar = arguments;
					if (!cal.loaded) {
						cal.ns = {};
						cal.q = cal.q || [];
						d.head.appendChild(d.createElement('script')).src = A;
						cal.loaded = true;
					}
					if (ar[0] === L) {
						const api = function () {
							p(api, arguments);
						};
						const namespace = ar[1];
						api.q = api.q || [];
						if (typeof namespace === 'string') {
							cal.ns[namespace] = cal.ns[namespace] || api;
							p(cal.ns[namespace], ar);
							p(cal, ['initNamespace', namespace]);
						} else p(cal, ar);
						return;
					}
					p(cal, ar);
				};
		})(window, 'https://app.cal.com/embed/embed.js', 'init');
		Cal('init');
	</script>
</svelte:head>

<div class="max-w-screen-md mx-auto p-2">
	<h2 class="my-4 text-xl">{$t('timeslots.setAvailabilities')}</h2>
	{#if ready}
		<div class="form-control mt-4">
			<label class="label" for="calcom">
				<span class="label-text">
					{$t('timeslots.calcom')}
					<a
						href="https://forge.uclouvain.be/sbibauw/languagelab/-/blob/93897d67f63ec81ebbe13b10035e4cd5a3a09071/docs/cal.com.md"
						target="_blank"
					>
						<Icon
							src={QuestionMarkCircle}
							class="w-5 h-5 cursor-pointer inline"
							title="Documentation"
							solid
						/>
					</a>
				</span>
			</label>
			<div class="input flex items-center">
				<Icon src={Calendar} class="w-5 h-5 mr-2 opacity-70" solid />
				<input
					type="text"
					id="calcom"
					class="grow"
					placeholder="username/tutoring"
					bind:value={calcom_link}
				/>
			</div>
		</div>

		<div class="form-control mt-4">
			<button class="button" data-cal-link={calcom_link}>{$t('button.tryit')}</button>
			<button
				class="button mt-4"
				disabled={sent || (lastTimeslots === timeslots && calcom_link === last_calcom_link)}
				on:click={send}>{$t(sent ? 'button.updated' : 'button.update')}</button
			>
		</div>
	{/if}
</div>
