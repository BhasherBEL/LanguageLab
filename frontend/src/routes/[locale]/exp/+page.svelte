<script lang="ts">
	import User from '$lib/types/user.js';

	export let data;
	const user = User.parseFromServer(data);
</script>

<div>Hello world {user?.nickname}</div>
