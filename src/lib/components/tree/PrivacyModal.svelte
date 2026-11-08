<script lang="ts">
	// src/lib/components/tree/PrivacyModal.svelte
	import { privacy } from '$lib/services/privacy.svelte';
	import { toast } from '$lib/controllers/toast.svelte';

	let pinInput = $state<string>('');
	let hasError = $state<boolean>(false);

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const success = privacy.unlock(pinInput);
		if (success) {
			toast.success('Сімейний доступ успішно активовано!');
			pinInput = '';
			hasError = false;
		} else {
			hasError = true;
			toast.error('Невірний пароль або PIN-код родини.');
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			privacy.closeUnlockModal();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if privacy.showModal}
	<div class="privacy-modal-overlay">
		<button
			type="button"
			class="privacy-backdrop-btn"
			aria-label="Закрити модальне вікно"
			onclick={() => privacy.closeUnlockModal()}
		></button>

		<div
			class="privacy-modal-dialog"
			role="dialog"
			tabindex="-1"
			aria-labelledby="privacy-modal-title"
			aria-modal="true"
		>
			<div class="modal-header">
				<div class="modal-icon-badge">
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path
							d="M7 11V7a5 5 0 0 1 10 0v4"
						/></svg
					>
				</div>
				<div class="modal-title-group">
					<h3 id="privacy-modal-title" class="modal-title">Сімейний доступ</h3>
					<p class="modal-subtitle">Захист персональних даних живих родичів</p>
				</div>
				<button
					type="button"
					class="modal-close-btn"
					onclick={() => privacy.closeUnlockModal()}
					aria-label="Закрити діалог"
				>
					<svg
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg
					>
				</button>
			</div>

			<form onsubmit={handleSubmit} class="modal-form">
				<p class="modal-desc">
					З метою захисту приватності живих членів родини, точні дати, контакти та особисті замітки
					доступні лише для членів сім'ї. Введіть родинний код (наприклад, <strong>1975</strong>).
				</p>

				<div class="form-group">
					<label for="family-pin-input" class="form-label">Родинний пароль або PIN:</label>
					<input
						id="family-pin-input"
						type="password"
						class="form-input"
						class:error={hasError}
						placeholder="Введіть код"
						bind:value={pinInput}
						required
					/>
					{#if hasError}
						<span class="error-msg">Невірний код. Спробуйте ще раз.</span>
					{/if}
				</div>

				<div class="modal-actions">
					<button
						type="button"
						class="btn btn-secondary"
						onclick={() => privacy.closeUnlockModal()}
					>
						Скасувати
					</button>
					<button type="submit" class="btn btn-primary"> Відкрити доступ </button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	.privacy-modal-overlay {
		position: fixed;
		inset: 0;
		z-index: 10001;
		background: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 16px;
		backdrop-filter: blur(4px);
		animation: fade-in 0.15s ease-out;
	}

	.privacy-backdrop-btn {
		position: absolute;
		inset: 0;
		background: transparent;
		border: none;
		cursor: default;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.privacy-modal-dialog {
		position: relative;
		z-index: 2;
		background: var(--color-surface);
		color: var(--color-text);
		border: 1px solid var(--color-border);
		border-radius: 14px;
		width: 100%;
		max-width: 440px;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
		overflow: hidden;
	}

	.modal-header {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px;
		border-bottom: 1px solid var(--color-border);
		background: var(--color-surface-hover);
	}

	.modal-icon-badge {
		width: 40px;
		height: 40px;
		border-radius: 10px;
		background: rgba(234, 179, 8, 0.15);
		color: #ca8a04;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.modal-title-group {
		flex: 1;
	}

	.modal-title {
		font-size: 16px;
		font-weight: 700;
		margin: 0;
	}

	.modal-subtitle {
		font-size: 12px;
		color: var(--color-text-muted);
		margin: 2px 0 0;
	}

	.modal-close-btn {
		background: transparent;
		border: none;
		color: var(--color-text-muted);
		padding: 4px;
		border-radius: 6px;
	}
	.modal-close-btn:hover {
		color: var(--color-text);
		background: var(--color-surface);
	}

	.modal-form {
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.modal-desc {
		font-size: 13px;
		color: var(--color-text);
		line-height: 1.5;
		margin: 0;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.form-label {
		font-size: 12px;
		font-weight: 600;
		color: var(--color-text);
	}

	.form-input {
		padding: 8px 12px;
		font-size: 14px;
		border-radius: 8px;
		outline: none;
	}
	.form-input:focus {
		border-color: var(--color-accent);
		box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
	}
	.form-input.error {
		border-color: var(--color-danger);
	}

	.error-msg {
		font-size: 12px;
		color: var(--color-danger);
	}

	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
		margin-top: 8px;
	}

	.btn {
		padding: 8px 16px;
		font-size: 13px;
		font-weight: 600;
		border-radius: 8px;
		border: none;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.btn-secondary {
		background: var(--color-surface-hover);
		color: var(--color-text);
		border: 1px solid var(--color-border);
	}
	.btn-secondary:hover {
		background: var(--color-border);
	}

	.btn-primary {
		background: var(--color-accent);
		color: var(--color-on-accent);
	}
	.btn-primary:hover {
		opacity: 0.9;
	}
</style>
