<script lang="ts">
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import Icon from "@iconify/svelte";
import { onMount } from "svelte";

type DateLike = Date | string;

export let published: DateLike;
export let updated: DateLike | undefined = undefined;
export let expiry: boolean | undefined = true;
export let expiryDays: number | undefined = undefined;

const DEFAULT_DAYS = 365;

let expired = false;
let days = 0;

const toDate = (value: DateLike | undefined | null): Date | null => {
	if (!value) return null;
	if (value instanceof Date) return value;
	const d = new Date(value);
	return Number.isNaN(d.getTime()) ? null : d;
};

const compute = () => {
	if (!expiry) {
		expired = false;
		return;
	}

	const base = toDate(updated) ?? toDate(published);
	if (!base) {
		expired = false;
		return;
	}

	const limit =
		typeof expiryDays === "number" && expiryDays > 0
			? expiryDays
			: DEFAULT_DAYS;

	const diffMs = Date.now() - base.getTime();
	days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
	expired = days >= limit;
};

onMount(compute);

const formatExpiredSince = (d: number) =>
	i18n(I18nKey.expiredSince).replace("{days}", String(d));
</script>

{#if expired}
<div class="mb-3 flex items-center gap-2 text-50 text-xs md:text-sm">
	<div class="meta-icon">
		<Icon icon="material-symbols:history-rounded" class="text-xl" />
	</div>

	<div class="flex flex-col gap-0.5 leading-tight">
		<div class="font-medium text-75">
			{formatExpiredSince(days)}
		</div>
		<p>{i18n(I18nKey.expiredDisclaimer)}</p>
	</div>
</div>
{/if}
