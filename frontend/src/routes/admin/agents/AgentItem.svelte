<script lang="ts">
	import { enhance } from '$app/forms';
	import { t } from '$lib/services/i18n';
	import { Icon, PencilSquare, Trash } from 'svelte-hero-icons';

	let { agent }: { agent: any } = $props();

	function truncateText(text: string, maxLength: number = 50): string {
		if (text.length <= maxLength) return text;
		return text.substring(0, maxLength) + '...';
	}
</script>

<tr>
	<td>{agent.id}</td>
	<td>{agent.nickname}</td>
	<td>{agent.agent_user.model}</td>
	<td>
		<span title={agent.agent_user.system_prompt}>
			{truncateText(agent.agent_user.system_prompt)}
		</span>
	</td>
	<td>
		{#if agent.agent_user.is_in_pool}
			<span class="text-green-600">✓</span>
		{:else}
			<span class="text-red-600">✗</span>
		{/if}
	</td>
	<td>
		{#if agent.is_active}
			<span class="text-green-600">✓</span>
		{:else}
			<span class="text-red-600">✗</span>
		{/if}
	</td>
	<td class="py-3 px-6 flex justify-center space-x-4 items-center">
		<a
			href="/admin/agents/{agent.id}"
			class="btn btn-icon bg-gray-200 text-gray-600 hover:bg-gray-300 rounded-full p-2 transition-all"
			aria-label={$t('button.edit')}
		>
			<Icon src={PencilSquare} class="w-5 h-5" />
		</a>

		<form
			method="POST"
			action="?/delete"
			use:enhance={() => {
				return ({ update }) => {
					if (confirm($t('agents.confirm_delete'))) {
						update();
					}
				};
			}}
			class="inline"
		>
			<input type="hidden" name="agent_id" value={agent.id} />
			<button
				type="submit"
				class="btn btn-icon bg-gray-200 text-gray-400 hover:bg-gray-300 hover:text-red-500 rounded-full p-2 transition-all"
				aria-label={$t('button.delete')}
			>
				<Icon src={Trash} class="w-5 h-5" />
			</button>
		</form>
	</td>
</tr>
