<script lang="ts">
	import { getSessionsAPI } from '$lib/api/sessions';
	import Session from '$lib/types/session';
	import { onMount } from 'svelte';
	import { t } from '$lib/services/i18n';
	import { displayTime } from '$lib/utils/date';
	import { ArrowDownTray, ArrowRightStartOnRectangle, Icon } from 'svelte-hero-icons';
	import config from '$lib/config';

	let sessions: Session[] = [];

	onMount(async () => {
		sessions = Session.parseAll(await getSessionsAPI());
	});
</script>

<h1 class="text-xl font-bold m-5 text-center">{$t('header.admin.sessions')}</h1>
<table class="table">
	<thead>
		<tr>
			<th>#</th>
			<th>{$t('utils.words.date')}</th>
			<th>{$t('users.type.tutors')}</th>
			<th>{$t('users.type.students')}</th>
			<th># {$t('utils.words.messages')}</th>
			<th>{$t('utils.words.actions')}</th>
		</tr>
	</thead>
	<tbody>
		{#each sessions.toReversed() as session (session.id)}
			<tr>
				<td>{session.id}</td>
				<td>{displayTime(session.start_time)}</td>
				<td>
					{session.users
						.filter((u) => u.is_tutor || u.is_admin)
						.map((u) => u.nickname)
						.join(', ')}
				</td>
				<td>
					{session.users
						.filter((u) => !u.is_tutor && !u.is_admin)
						.map((u) => u.nickname)
						.join(', ')}
				</td>
				<td>
					{session.length}
				</td>
				<td class="p-0">
					<a class="btn btn-primary btn-sm test" title="Join" href={`/session?id=${session.id}`}>
						<Icon src={ArrowRightStartOnRectangle} size="16" />
					</a>
					<a
						class="btn btn-primary btn-sm"
						title="Download"
						href={`${config.API_URL}/sessions/${session.id}/download/messages`}
					>
						<Icon src={ArrowDownTray} size="16" />
					</a>
				</td>
			</tr>
		{/each}
	</tbody>
</table>
