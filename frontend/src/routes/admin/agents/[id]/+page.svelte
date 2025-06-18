<script lang="ts">
	import AgentForm from '../AgentForm.svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<AgentForm agentUser={data.agentUser} {form} isEdit={true} />
