<script lang="ts">
	import AgentForm from '../AgentForm.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<AgentForm {form} isEdit={false} />
