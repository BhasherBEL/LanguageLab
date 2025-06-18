<script lang="ts">
	import { t } from '$lib/services/i18n';
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import autosize from 'svelte-autosize';

	interface AgentUser {
		id?: number;
		nickname?: string;
		is_active?: boolean;
		agent_user?: {
			model?: string;
			system_prompt?: string;
			is_in_pool?: boolean;
		} | null;
	}

	let {
		agentUser = null,
		form,
		isEdit = false
	}: {
		agentUser?: AgentUser | null;
		form?: ActionData;
		isEdit?: boolean;
	} = $props();

	const title = $derived(isEdit ? $t('agents.edit') : $t('agents.create_new'));
	const buttonText = $derived(isEdit ? $t('button.save') : $t('button.create'));
</script>

<div class="min-w-fit max-w-6xl mx-auto mt-8">
	<div class="text-center">
		<h1 class="text-2xl font-bold">{title}</h1>
	</div>

	{#if form?.error}
		<div class="alert alert-error mb-6">
			<span>{form.error}</span>
		</div>
	{/if}

	<form method="POST" use:enhance class="space-y-6">
		{#if isEdit && agentUser?.id}
			<input type="hidden" name="agent_id" value={agentUser.id} />
		{/if}

		<div class="form-control">
			<label class="label" for="nickname">
				<span class="label-text text-lg font-medium">{$t('agents.nickname')}</span>
			</label>
			<input
				type="text"
				name="nickname"
				id="nickname"
				class="input input-bordered input-lg w-full"
				value={(form as any)?.nickname || agentUser?.nickname || ''}
				required
				placeholder={$t('agents.nickname_placeholder')}
			/>
		</div>

		<div class="form-control">
			<label class="label" for="model">
				<span class="label-text text-lg font-medium">{$t('agents.model')}</span>
			</label>
			<input
				type="text"
				name="model"
				id="model"
				class="input input-bordered input-lg w-full"
				value={(form as any)?.model || agentUser?.agent_user?.model || ''}
				required
				placeholder={$t('agents.model_placeholder')}
			/>
			<div class="label">
				<span class="label-text-alt">
					{@html $t('agents.model_help')}
				</span>
			</div>
		</div>

		<div class="form-control">
			<label class="label" for="system_prompt">
				<span class="label-text text-lg font-medium">{$t('agents.system_prompt')}</span>
			</label>
			<textarea
				name="system_prompt"
				id="system_prompt"
				use:autosize
				class="textarea textarea-bordered textarea-lg w-full h-32"
				placeholder={$t('agents.system_prompt_placeholder')}
				required
				>{(form as any)?.system_prompt || agentUser?.agent_user?.system_prompt || ''}</textarea
			>
		</div>

		<div class="form-control">
			<label class="label cursor-pointer justify-start gap-4">
				<input
					type="checkbox"
					name="is_in_pool"
					class="checkbox checkbox-lg"
					checked={(form as any)?.is_in_pool !== undefined
						? (form as any).is_in_pool
						: agentUser?.agent_user?.is_in_pool || false}
				/>
				<span class="label-text text-lg font-medium">{$t('agents.in_pool')}</span>
			</label>
			<div class="label">
				<span class="label-text-alt">
					{$t('agents.in_pool_help')}
				</span>
			</div>
		</div>

		<div class="form-control">
			<label class="label cursor-pointer justify-start gap-4">
				<input
					type="checkbox"
					name="is_active"
					class="checkbox checkbox-lg"
					checked={(form as any)?.is_active !== undefined
						? (form as any).is_active
						: agentUser?.is_active !== false}
				/>
				<span class="label-text text-lg font-medium">{$t('agents.active')}</span>
			</label>
			<div class="label">
				<span class="label-text-alt">
					{$t('agents.active_help')}
				</span>
			</div>
		</div>

		<div class="flex justify-between items-center mt-6">
			<a href="/admin/agents" class="btn btn-outline btn-lg">
				← {$t(isEdit ? 'button.cancel' : 'button.back')}
			</a>
			<div class="form-control pt-4">
				<button type="submit" class="btn btn-primary btn-lg w-fit">
					{buttonText}
				</button>
			</div>
		</div>
	</form>
</div>
