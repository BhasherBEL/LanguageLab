<script lang="ts">
	import User from '$lib/types/user.js';

	export let data;

	console.log(data.user);
	const user = User.parse(data.user);
	console.log(user);
</script>

<div>Hello world {user.toJson()}</div>
