<script lang="ts">
	import { t } from '$lib/services/i18n';

	let { form }: { form: FormData } = $props();
</script>

<div class="flex justify-center items-center h-screen">
	<div class="flex flex-col w-full max-w-md rounded-box shadow-xl bg-base-200 gap-4 p-6">
		<h1 class="text-3xl font-bold self-center">{$t('login.title')}</h1>

		<p class="self-center text-sm">
			{$t('login.noAccountText')}
			<a href="/register" class="link link-secondary">
				{$t('login.noAccountLink')}
			</a>
		</p>
		<form method="POST">
			{#if form?.message}
				<div
					class="border-2-lg rounded border border-red-600 bg-red-200 p-2 text-center text-red-900"
				>
					{form?.message}
				</div>
			{/if}

			<label class="form-control">
				<div class="label">
					<span class="label-text">{$t('login.email')}</span>
				</div>

				<input type="text" id="email" name="email" class="input input-bordered" required />
			</label>

			<label class="form-control">
				<div class="label">
					<span class="label-text">{$t('login.password')}</span>
					<!-- TODO: forgot password
					<a class="label-text link link-secondary">{$t('login.forgotPassword')}</a> -->
				</div>

				<input
					type="password"
					id="password"
					name="password"
					class="input input-bordered"
					required
				/>
			</label>

			<div class="form-control mt-4">
				<button type="submit" class="btn btn-primary">
					{$t('login.login')}
				</button>
			</div>
		</form>
	</div>
</div>
