<script lang="ts">
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import { Home, ArrowLeft } from 'lucide-svelte';

	let status = $derived(page.status || 404);
	let is404 = $derived(status === 404);
</script>

<svelte:head>
	<title>{status} — {is404 ? 'Сторінку не знайдено' : 'Помилка'} · Alik Family Tree</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="error-container">
	<div class="error-card">
		<div class="error-badge">{status}</div>
		<h1 class="error-title">
			{is404 ? 'Сторінку не знайдено' : 'Непередбачена помилка'}
		</h1>
		<p class="error-text">
			{is404
				? 'Можливо, посилання застаріло або адресу було введено з помилкою.'
				: 'Виникла проблема під час завантаження генеалогічного дерева. Спробуйте оновити сторінку.'}
		</p>
		<div class="error-actions">
			<a href="{base}/" class="btn btn-primary">
				<Home size={18} />
				<span>На головне дерево</span>
			</a>
			<button type="button" class="btn btn-secondary" onclick={() => history.back()}>
				<ArrowLeft size={18} />
				<span>Назад</span>
			</button>
		</div>
	</div>
</div>

<style>
	.error-container {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: calc(100vh - 120px);
		padding: 24px;
	}

	.error-card {
		background: var(--color-bg-surface, #ffffff);
		border: 1px solid var(--color-border, #e2e8f0);
		box-shadow:
			0 10px 25px -5px rgba(0, 0, 0, 0.1),
			0 8px 10px -6px rgba(0, 0, 0, 0.1);
		border-radius: 16px;
		padding: 40px 32px;
		max-width: 480px;
		width: 100%;
		text-align: center;
	}

	:global([data-theme='dark']) .error-card {
		background: var(--color-bg-surface, #1e293b);
		border-color: var(--color-border, #334155);
	}

	.error-badge {
		display: inline-block;
		font-size: 2.75rem;
		font-weight: 800;
		color: var(--color-primary, #3b82f6);
		margin-bottom: 12px;
		line-height: 1;
	}

	.error-title {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0 0 12px;
		color: var(--color-text-main, #0f172a);
	}

	:global([data-theme='dark']) .error-title {
		color: var(--color-text-main, #f8fafc);
	}

	.error-text {
		font-size: 0.95rem;
		line-height: 1.6;
		color: var(--color-text-muted, #64748b);
		margin: 0 0 28px;
	}

	.error-actions {
		display: flex;
		gap: 12px;
		justify-content: center;
		flex-wrap: wrap;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 10px 20px;
		border-radius: 9999px;
		font-size: 0.9rem;
		font-weight: 600;
		text-decoration: none;
		border: 1px solid transparent;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.btn-primary {
		background: var(--color-primary, #3b82f6);
		color: #ffffff;
	}

	.btn-primary:hover {
		filter: brightness(1.1);
		transform: translateY(-1px);
	}

	.btn-secondary {
		background: transparent;
		border-color: var(--color-border, #cbd5e1);
		color: var(--color-text-main, #334155);
	}

	:global([data-theme='dark']) .btn-secondary {
		border-color: var(--color-border, #475569);
		color: var(--color-text-main, #e2e8f0);
	}

	.btn-secondary:hover {
		background: var(--color-bg-hover, rgba(0, 0, 0, 0.05));
	}
</style>
