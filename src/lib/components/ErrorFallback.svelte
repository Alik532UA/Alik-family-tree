<script lang="ts">
	import { base } from '$app/paths';
	import { RefreshCw, Home, AlertTriangle } from 'lucide-svelte';

	interface Props {
		onretry: () => void;
	}

	let { onretry }: Props = $props();
</script>

<div class="error-fallback-container" role="alert" aria-live="assertive">
	<div class="error-fallback-card">
		<div class="error-icon-box">
			<AlertTriangle size={36} class="warning-icon" aria-hidden="true" />
		</div>

		<h2 class="error-title">Щось пішло не так</h2>

		<p class="error-description">
			Виникла неочікувана помилка при відображенні дерева. Спробуйте оновити сторінку або
			повернутися на головну.
		</p>

		<div class="error-actions">
			<button type="button" class="action-btn retry-btn" onclick={onretry}>
				<RefreshCw size={16} aria-hidden="true" />
				<span>Спробувати знову</span>
			</button>

			<a href={base || '/'} class="action-btn home-link">
				<Home size={16} aria-hidden="true" />
				<span>На головну</span>
			</a>
		</div>
	</div>
</div>

<style>
	.error-fallback-container {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 50vh;
		width: 100%;
		padding: 2rem 1rem;
		box-sizing: border-box;
		position: relative;
		z-index: 10;
	}

	.error-fallback-card {
		max-width: 440px;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 2rem 1.5rem;
		background: var(--theme-panel, rgba(30, 30, 30, 0.9));
		backdrop-filter: blur(16px);
		border: 1px solid var(--theme-border, rgba(255, 255, 255, 0.15));
		border-radius: 16px;
		box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
		color: var(--theme-text, #ffffff);
	}

	.error-icon-box {
		width: 56px;
		height: 56px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: rgba(234, 179, 8, 0.15);
		border: 1px solid rgba(234, 179, 8, 0.3);
		margin-bottom: 1rem;
		color: #eab308;
	}

	.error-title {
		font-size: 1.3rem;
		font-weight: 700;
		margin: 0 0 0.5rem;
	}

	.error-description {
		font-size: 0.9rem;
		line-height: 1.5;
		margin: 0 0 1.5rem;
		opacity: 0.8;
	}

	.error-actions {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		justify-content: center;
		width: 100%;
	}

	.action-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		min-height: 40px;
		padding: 0.5rem 1.25rem;
		border-radius: 10px;
		font-size: 0.85rem;
		font-weight: 600;
		text-decoration: none;
		cursor: pointer;
		transition:
			transform 0.15s ease,
			background-color 0.15s ease;
	}

	.retry-btn {
		background: var(--theme-accent, #3b82f6);
		color: #ffffff;
		border: none;
	}

	.retry-btn:hover {
		opacity: 0.9;
		transform: translateY(-1px);
	}

	.home-link {
		background: rgba(255, 255, 255, 0.08);
		color: inherit;
		border: 1px solid var(--theme-border, rgba(255, 255, 255, 0.2));
	}

	.home-link:hover {
		background: rgba(255, 255, 255, 0.15);
		transform: translateY(-1px);
	}
</style>
