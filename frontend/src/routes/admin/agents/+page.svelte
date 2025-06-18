<script lang="ts">
	import { t } from '$lib/services/i18n';
	import AgentItem from './AgentItem.svelte';
	import type { PageData } from './$types';

	let { data, form }: { data: PageData; form: any } = $props();
</script>

<div class="min-w-fit max-w-6xl mx-auto mt-8">
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-2xl font-bold">{$t('agents.title')}</h1>
		<a href="/admin/agents/new" class="btn btn-primary">
			+ {$t('agents.create_new')}
		</a>
	</div>

	{#if form?.error}
		<div class="alert alert-error mb-4">
			<span>{form.error}</span>
		</div>
	{/if}

	<div class="overflow-x-auto">
		<table class="table max-w-5xl mx-auto text-center">
			<thead>
				<tr>
					<th>#</th>
					<th>{$t('agents.nickname')}</th>
					<th>{$t('agents.model')}</th>
					<th>{$t('agents.system_prompt')}</th>
					<th>{$t('agents.in_pool')}</th>
					<th>{$t('agents.active')}</th>
					<th>{$t('agents.actions')}</th>
				</tr>
			</thead>
			<tbody>
				{#each data.agents as agent (agent.id)}
					<AgentItem {agent} />
				{/each}
			</tbody>
		</table>
	</div>

	{#if data.agents.length === 0}
		<div class="text-center py-8">
			<p class="text-gray-500 mb-4">{$t('agents.no_agents_found')}</p>
		</div>
	{/if}
</div>
