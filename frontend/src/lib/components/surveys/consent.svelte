<script lang="ts">
	import { locale, t } from '$lib/services/i18n';
	export let introText: string;
</script>

<div class="join join-vertical w-full">
	<div class="join-item">
		<h2 class="text-xl font-bold text-center">{$t('register.consent.title')}</h2>
		<p class="m-5">{@html introText}</p>
	</div>
	<div class="collapse collapse-arrow join-item border border-base-300">
		<input type="radio" name="consent-accordion" checked="checked" />
		<div class="collapse-title font-medium">{$t('register.consent.participation')}</div>
		<div class="collapse-content"><p>{@html $t('register.consent.participationD')}</p></div>
	</div>
	<div class="collapse collapse-arrow join-item border border-base-300">
		<input type="radio" name="consent-accordion" />
		<div class="collapse-title font-medium">{$t('register.consent.privacy')}</div>
		<div class="collapse-content"><p>{@html $t('register.consent.privacyD')}</p></div>
	</div>
	<div class="collapse collapse-arrow join-item border border-base-300">
		<input type="radio" name="consent-accordion" />
		<div class="collapse-title font-medium">{$t('register.consent.rights')}</div>
		<div class="collapse-content">
			<p>
				{$t('register.consent.rightsD')}
				<a class="link link-primary" href="mailto:{$t('register.consent.studyData.emailD')}"
					>{$t('register.consent.studyData.emailD')}</a
				>.
			</p>
		</div>
	</div>
	<div class="collapse collapse-arrow join-item border border-base-300">
		<input type="radio" name="consent-accordion" />
		<div class="collapse-title font-medium">{$t('register.consent.studyData.title')}</div>
		<div class="collapse-content">
			<dl class="text-sm">
				<div class="sm:grid sm:grid-cols-3 sm:gap-4 mb-1">
					<dt class="font-medium">{$t('register.consent.studyData.study')}</dt>
					<dd class="text-gray-700 sm:col-span-2">{$t('register.consent.studyData.studyD')}</dd>
				</div>
				<div class="sm:grid sm:grid-cols-3 sm:gap-4 mb-1">
					<dt class="font-medium">{$t('register.consent.studyData.project')}</dt>
					<dd class="text-gray-700 sm:col-span-2">
						{$t('register.consent.studyData.projectD')}
					</dd>
				</div>
				<div class="sm:grid sm:grid-cols-3 sm:gap-4 mb-1">
					<dt class="font-medium">{$t('register.consent.studyData.university')}</dt>
					<dd class="text-gray-700 sm:col-span-2">
						{$t('register.consent.studyData.universityD')}
					</dd>
				</div>
				<div class="sm:grid sm:grid-cols-3 sm:gap-4 mb-1">
					<dt class="font-medium">{$t('register.consent.studyData.address')}</dt>
					<dd class="text-gray-700 sm:col-span-2">
						{$t('register.consent.studyData.addressD')}
					</dd>
				</div>
				<div class="sm:grid sm:grid-cols-3 sm:gap-4 mb-1">
					<dt class="font-medium">{$t('register.consent.studyData.person')}</dt>
					<dd class="text-gray-700 sm:col-span-2">
						{$t('register.consent.studyData.personD')}
					</dd>
				</div>
				<div class="sm:grid sm:grid-cols-3 sm:gap-4 mb-1">
					<dt class="font-medium">{$t('register.consent.studyData.email')}</dt>
					<dd class="text-gray-700 sm:col-span-2">
						<a href="mailto:{$t('register.consent.studyData.emailD')}" class="link"
							>{$t('register.consent.studyData.emailD')}</a
						>
					</dd>
				</div>
			</dl>
		</div>
	</div>
</div>
