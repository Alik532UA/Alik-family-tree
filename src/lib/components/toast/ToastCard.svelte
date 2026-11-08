<script lang="ts">
	// src/lib/components/toast/ToastCard.svelte — NOTIFICATIONS § 2
	import type { ToastItem } from '$lib/controllers/toast.svelte';

	interface Props {
		item: ToastItem;
		ondismiss: (id: string) => void;
		onpause: (id: string) => void;
		onresume: (id: string) => void;
	}

	let { item, ondismiss, onpause, onresume }: Props = $props();

	const progressPercent = $derived.by(() => {
		if (item.duration <= 0) return 0;
		return Math.max(0, Math.min(100, (item.remaining / item.duration) * 100));
	});
</script>

<div
	class="toast-card toast-{item.type}"
	role="status"
	aria-live="polite"
	onmouseenter={() => onpause(item.id)}
	onmouseleave={() => onresume(item.id)}
	onfocusin={() => onpause(item.id)}
	onfocusout={() => onresume(item.id)}
>
	<div class="toast-content">
		<div class="toast-icon">
			{#if item.type === 'success'}
				<svg
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"><path d="M20 6 9 17l-5-5" /></svg
				>
			{:else if item.type === 'error'}
				<svg
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line
						x1="12"
						y1="16"
						x2="12.01"
						y2="16"
					/></svg
				>
			{:else if item.type === 'warn'}
				<svg
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					><path
						d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
					/><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg
				>
			{:else}
				<svg
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line
						x1="12"
						y1="8"
						x2="12.01"
						y2="8"
					/></svg
				>
			{/if}
		</div>

		<div class="toast-message">{item.message}</div>

		{#if item.action}
			<button
				type="button"
				class="toast-action-btn"
				onclick={() => {
					void item.action?.run();
					ondismiss(item.id);
				}}
			>
				{item.action.label}
			</button>
		{/if}

		<button
			type="button"
			class="toast-close-btn"
			aria-label="Закрити сповіщення"
			onclick={() => ondismiss(item.id)}
		>
			<svg
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12" /></svg
			>
		</button>
	</div>

	{#if item.duration > 0}
		<div class="toast-progress-track">
			<div class="toast-progress-bar" style="width: {progressPercent}%"></div>
		</div>
	{/if}
</div>

<style>
	.toast-card {
		display: flex;
		flex-direction: column;
		background: var(--color-surface);
		color: var(--color-text);
		border: 1px solid var(--color-border);
		border-radius: 10px;
		box-shadow: 0 10px 20px -3px rgba(0, 0, 0, 0.2);
		overflow: hidden;
		min-width: 280px;
		max-width: 420px;
		pointer-events: auto;
	}

	.toast-content {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 14px;
	}

	.toast-icon {
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}

	.toast-success .toast-icon {
		color: var(--color-success);
	}
	.toast-error .toast-icon {
		color: var(--color-danger);
	}
	.toast-warn .toast-icon {
		color: var(--color-warning);
	}
	.toast-info .toast-icon {
		color: var(--color-accent);
	}

	.toast-message {
		flex: 1;
		font-size: 13px;
		line-height: 1.4;
	}

	.toast-action-btn {
		background: var(--color-accent);
		color: var(--color-on-accent);
		border: none;
		border-radius: 6px;
		padding: 4px 8px;
		font-size: 12px;
		font-weight: 600;
	}

	.toast-close-btn {
		background: transparent;
		border: none;
		color: var(--color-text-muted);
		padding: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
	}
	.toast-close-btn:hover {
		color: var(--color-text);
		background: var(--color-surface-hover);
	}

	.toast-progress-track {
		height: 3px;
		background: var(--color-surface-hover);
		width: 100%;
	}

	.toast-progress-bar {
		height: 100%;
		background: var(--color-accent);
		transition: width 0.1s linear;
	}
	.toast-success .toast-progress-bar {
		background: var(--color-success);
	}
	.toast-error .toast-progress-bar {
		background: var(--color-danger);
	}
	.toast-warn .toast-progress-bar {
		background: var(--color-warning);
	}
</style>
