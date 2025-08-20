<script lang="ts">
	import Session from '$lib/types/session';
	import { t } from '$lib/services/i18n';
	import { displayTime } from '$lib/utils/date';
	import { ArrowDownTray, ArrowRightStartOnRectangle, Icon } from 'svelte-hero-icons';
	import config from '$lib/config';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let sessions: Session[] = data.sessions;
</script>

<h1 class="text-xl font-bold m-5 text-center">{$t('header.admin.sessions')}</h1>

<div class="my-4 mx-auto">
	<a
		class="btn btn-primary btn-sm"
		title="Download"
		href={`${config.API_URL}/v1/sessions/download/messages`}
	>
		{$t('session.downloadAllMessages')}
	</a>
	<a
		class="btn btn-primary btn-sm"
		title="Download"
		href={`${config.API_URL}/v1/sessions/download/metadata`}
	>
		{$t('session.downloadAllMetadata')}
	</a>
	<a
		class="btn btn-primary btn-sm"
		title="Download"
		href={`${config.API_URL}/v1/sessions/download/feedbacks`}
	>
		{$t('session.downloadAllFeedbacks')}
	</a>
</div>

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
		{#each sessions.slice().reverse() as session (session.id)}
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
						href={`${config.API_URL}/v1/sessions/${session.id}/download/messages`}
					>
						<Icon src={ArrowDownTray} size="16" />
					</a>
				</td>
			</tr>
		{/each}
	</tbody>
</table>
