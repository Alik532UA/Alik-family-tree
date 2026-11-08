<script lang="ts">
	// src/lib/components/SiteFooter.svelte — NOTIFICATIONS § 4.4
	import { toast } from '$lib/controllers/toast.svelte';

	const contactEmail = 'alikzapolnov@gmail.com';

	async function handleEmailClick(event: MouseEvent) {
		event.preventDefault();
		try {
			await navigator.clipboard.writeText(contactEmail);
			toast.success(`Електронну пошту скопійовано: ${contactEmail}`, {
				action: {
					label: 'Відкрити пошту',
					run: () => {
						window.location.href = `mailto:${contactEmail}`;
					}
				}
			});
		} catch {
			window.location.href = `mailto:${contactEmail}`;
		}
	}
</script>

<footer class="site-footer">
	<div class="footer-left">
		<span class="footer-meta"
			>Архів родини: <strong>183 особи</strong> • <strong>8 поколінь</strong> • версія 2023.02.05</span
		>
	</div>

	<div class="footer-center">
		<span class="hotkey-tip"><kbd>/</kbd> пошук</span>
		<span class="hotkey-tip"><kbd>0</kbd> скинути масштаб</span>
		<span class="hotkey-tip"><kbd>Esc</kbd> закрити</span>
	</div>

	<div class="footer-right">
		<button
			type="button"
			class="email-contact-link"
			onclick={handleEmailClick}
			title="Натисніть для копіювання пошти"
		>
			<svg
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				><rect width="20" height="16" x="2" y="4" rx="2" /><path
					d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"
				/></svg
			>
			<span>{contactEmail}</span>
		</button>
	</div>
</footer>

<style>
	.site-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 8px 16px;
		font-size: 12px;
		color: var(--color-text-muted);
		background: var(--color-surface);
		border-top: 1px solid var(--color-border);
		z-index: 40;
		flex-shrink: 0;
	}

	.footer-meta strong {
		color: var(--color-text);
	}

	.footer-center {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.hotkey-tip {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	kbd {
		font-family: inherit;
		font-size: 10px;
		font-weight: 600;
		background: var(--color-surface-hover);
		color: var(--color-text);
		border: 1px solid var(--color-border);
		padding: 1px 4px;
		border-radius: 4px;
	}

	.email-contact-link {
		display: flex;
		align-items: center;
		gap: 6px;
		background: transparent;
		border: none;
		color: var(--color-accent);
		font-size: 12px;
		cursor: pointer;
		padding: 4px 6px;
		border-radius: 4px;
		transition: background-color 0.15s;
	}
	.email-contact-link:hover {
		background: var(--color-surface-hover);
		text-decoration: underline;
	}

	@media (max-width: 768px) {
		.footer-center {
			display: none;
		}
	}
</style>
