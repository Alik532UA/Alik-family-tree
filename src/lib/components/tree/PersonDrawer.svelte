<script lang="ts">
	// src/lib/components/tree/PersonDrawer.svelte
	import { peopleById, type Person } from '$lib/data/familyTree';
	import { treeViewport } from '$lib/controllers/treeViewport.svelte';
	import { privacy } from '$lib/services/privacy.svelte';
	import { toast } from '$lib/controllers/toast.svelte';

	interface Props {
		person: Person | null;
		onclose: () => void;
	}

	let { person, onclose }: Props = $props();

	function jumpTo(id: string) {
		treeViewport.selectPerson(id);
	}

	async function copyPersonLink() {
		if (!person) return;
		const url = `${window.location.origin}${window.location.pathname}#person-${person.id}`;
		try {
			await navigator.clipboard.writeText(url);
			toast.success(`Посилання на ${person.name} скопійовано`);
		} catch {
			toast.info(`ID персони: ${person.id}`);
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && person) {
			onclose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if person}
	<aside
		class="person-drawer"
		aria-label="Картка персони: {person.name}"
	>
		<div class="drawer-header">
			<div class="drawer-header-left">
				<span class="branch-pill branch-{person.branch.toLowerCase()}">{person.branch}</span>
				<span class="gen-pill">Покоління {person.generation}</span>
				{#if person.gender !== 'unknown'}
					<span class="gender-pill">{person.gender === 'female' ? 'Жінка' : 'Чоловік'}</span>
				{/if}
			</div>
			<button
				type="button"
				class="drawer-close-btn"
				onclick={onclose}
				aria-label="Закрити картку"
			>
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
			</button>
		</div>

		<div class="drawer-body">
			<!-- Name & Avatar Block -->
			<div class="person-profile-header">
				<div class="person-avatar" class:female={person.gender === 'female'}>
					{#if person.gender === 'female'}
						<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/><circle cx="12" cy="8" r="3" fill="currentColor"/></svg>
					{:else}
						<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/></svg>
					{/if}
				</div>
				<div class="person-names-block">
					<h2 class="person-name">{person.name}</h2>
					{#if person.maidenName}
						<div class="person-maiden-name">
							Дівоче прізвище: <strong>{person.maidenName}</strong>
						</div>
					{/if}
					{#if person.dates}
						<div class="person-dates-badge">
							🗓️ Роки життя: <strong>{person.dates}</strong>
						</div>
					{/if}
					{#if person.fullName !== person.name}
						<div class="person-alt-name">{person.fullName}</div>
					{/if}
				</div>
			</div>

			<!-- Privacy Shield Notification if living -->
			{#if person.isLiving}
				<div class="privacy-banner" class:unlocked={privacy.isUnlocked}>
					<div class="privacy-icon">
						{#if privacy.isUnlocked}
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
						{:else}
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
						{/if}
					</div>
					<div class="privacy-text">
						{#if privacy.isUnlocked}
							<span class="privacy-status">Сімейний доступ відкрито:</span> усі конфіденційні деталі доступні
						{:else}
							<span class="privacy-status">Захист даних живих родичів:</span> особисті контакти та деталі приховані
						{/if}
					</div>
					{#if !privacy.isUnlocked}
						<button
							type="button"
							class="privacy-unlock-btn"
							onclick={() => privacy.openUnlockModal()}
						>
							Ввести PIN
						</button>
					{/if}
				</div>
			{/if}

			<!-- Action buttons: Center & Share -->
			<div class="drawer-action-row">
				<button
					type="button"
					class="action-btn"
					onclick={() => treeViewport.centerOnPerson(person.id)}
				>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>
					Фокусувати
				</button>
				<button
					type="button"
					class="action-btn"
					onclick={copyPersonLink}
				>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
					Поділитися
				</button>
			</div>

			<!-- Relatives Section -->
			<div class="relatives-section">
				<!-- Parents -->
				<div class="rel-group">
					<div class="rel-group-title">Батьки ({person.parents.length})</div>
					{#if person.parents.length > 0}
						<div class="rel-cards-list">
							{#each person.parents as parentId}
								{@const p = peopleById.get(parentId)}
								{#if p}
									<button
										type="button"
										class="rel-card parent-rel-card"
										onclick={() => jumpTo(p.id)}
									>
										<span class="rel-card-name">{p.name}</span>
										<span class="rel-card-badge">Покоління {p.generation}</span>
									</button>
								{/if}
							{/each}
						</div>
					{:else}
						<div class="rel-empty">Відомості про батьків відсутні у графі</div>
					{/if}
				</div>

				<!-- Spouses -->
				{#if person.spouses.length > 0}
					<div class="rel-group">
						<div class="rel-group-title">Подружжя ({person.spouses.length})</div>
						<div class="rel-cards-list">
							{#each person.spouses as spouseId}
								{@const sp = peopleById.get(spouseId)}
								{#if sp}
									<button
										type="button"
										class="rel-card spouse-rel-card"
										onclick={() => jumpTo(sp.id)}
									>
										<span class="rel-card-name">{sp.name}</span>
										<span class="rel-card-badge">Подружжя</span>
									</button>
								{/if}
							{/each}
						</div>
					</div>
				{/if}

				<!-- Children -->
				<div class="rel-group">
					<div class="rel-group-title">Діти ({person.children.length})</div>
					{#if person.children.length > 0}
						<div class="rel-cards-list">
							{#each person.children as childId}
								{@const ch = peopleById.get(childId)}
								{#if ch}
									<button
										type="button"
										class="rel-card child-rel-card"
										onclick={() => jumpTo(ch.id)}
									>
										<span class="rel-card-name">{ch.name}</span>
										<span class="rel-card-badge">Покоління {ch.generation}</span>
									</button>
								{/if}
							{/each}
						</div>
					{:else}
						<div class="rel-empty">Діти не вказані</div>
					{/if}
				</div>

				<!-- Siblings -->
				{#if person.siblings.length > 0}
					<div class="rel-group">
						<div class="rel-group-title">Брати та сестри ({person.siblings.length})</div>
						<div class="rel-cards-list">
							{#each person.siblings as sibId}
								{@const sib = peopleById.get(sibId)}
								{#if sib}
									<button
										type="button"
										class="rel-card sibling-rel-card"
										onclick={() => jumpTo(sib.id)}
									>
										<span class="rel-card-name">{sib.name}</span>
										<span class="rel-card-badge">Покоління {sib.generation}</span>
									</button>
								{/if}
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</aside>
{/if}

<style>
	.person-drawer {
		position: absolute;
		top: 16px;
		right: 16px;
		bottom: 16px;
		width: 380px;
		max-width: calc(100vw - 32px);
		z-index: 60;
		background: var(--color-surface);
		color: var(--color-text);
		border: 1px solid var(--color-border);
		border-radius: 14px;
		box-shadow: 0 16px 36px rgba(0, 0, 0, 0.25);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		animation: slide-in 0.2s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes slide-in {
		from {
			opacity: 0;
			transform: translateX(30px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.drawer-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 16px;
		border-bottom: 1px solid var(--color-border);
		background: var(--color-surface-hover);
	}

	.drawer-header-left {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-wrap: wrap;
	}

	.branch-pill {
		font-size: 11px;
		font-weight: 700;
		padding: 2px 8px;
		border-radius: 12px;
		background: var(--color-accent);
		color: var(--color-on-accent);
	}

	.gen-pill, .gender-pill {
		font-size: 11px;
		font-weight: 600;
		padding: 2px 7px;
		border-radius: 12px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		color: var(--color-text-muted);
	}

	.drawer-close-btn {
		background: transparent;
		border: none;
		color: var(--color-text-muted);
		padding: 4px;
		border-radius: 6px;
		display: flex;
		align-items: center;
	}
	.drawer-close-btn:hover {
		color: var(--color-text);
		background: var(--color-surface);
	}

	.drawer-body {
		flex: 1;
		overflow-y: auto;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.person-profile-header {
		display: flex;
		gap: 12px;
		align-items: flex-start;
	}

	.person-avatar {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: var(--color-surface-hover);
		border: 2px solid var(--color-accent);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-accent);
		flex-shrink: 0;
	}

	.person-avatar.female {
		border-color: #ec4899;
		color: #ec4899;
	}

	.person-names-block {
		flex: 1;
	}

	.person-name {
		font-size: 18px;
		font-weight: 700;
		margin: 0 0 4px;
		line-height: 1.3;
	}

	.person-maiden-name {
		font-size: 13px;
		color: var(--color-accent);
		margin-bottom: 2px;
	}

	.person-dates-badge {
		font-size: 12px;
		color: var(--color-text-muted);
		margin-bottom: 3px;
	}

	.person-alt-name {
		font-size: 12px;
		color: var(--color-text-muted);
	}

	.privacy-banner {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 12px;
		border-radius: 8px;
		background: rgba(234, 179, 8, 0.12);
		border: 1px solid rgba(234, 179, 8, 0.4);
		font-size: 12px;
	}

	.privacy-banner.unlocked {
		background: rgba(22, 163, 74, 0.12);
		border-color: rgba(22, 163, 74, 0.4);
	}

	.privacy-icon {
		color: #ca8a04;
		flex-shrink: 0;
	}

	.privacy-banner.unlocked .privacy-icon {
		color: #16a34a;
	}

	.privacy-text {
		flex: 1;
		line-height: 1.3;
	}

	.privacy-status {
		font-weight: 600;
	}

	.privacy-unlock-btn {
		background: #ca8a04;
		color: #ffffff;
		border: none;
		border-radius: 4px;
		padding: 4px 8px;
		font-size: 11px;
		font-weight: 600;
		flex-shrink: 0;
	}

	.drawer-action-row {
		display: flex;
		gap: 8px;
	}

	.action-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 8px 12px;
		font-size: 13px;
		font-weight: 600;
		background: var(--color-surface-hover);
		color: var(--color-text);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		transition: all 0.15s ease;
	}

	.action-btn:hover {
		background: var(--color-accent);
		color: var(--color-on-accent);
		border-color: var(--color-accent);
	}

	.relatives-section {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.rel-group {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.rel-group-title {
		font-size: 12px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);
	}

	.rel-cards-list {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.rel-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 12px;
		background: var(--color-surface-hover);
		color: var(--color-text);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		text-align: left;
		transition: all 0.15s ease;
	}

	.rel-card:hover {
		border-color: var(--color-accent);
		background: var(--color-surface);
		transform: translateX(2px);
	}

	.parent-rel-card {
		border-left: 3px solid #3b82f6;
	}

	.spouse-rel-card {
		border-left: 3px solid #ec4899;
	}

	.child-rel-card {
		border-left: 3px solid #10b981;
	}

	.sibling-rel-card {
		border-left: 3px solid #8b5cf6;
	}

	.rel-card-name {
		font-size: 13px;
		font-weight: 600;
	}

	.rel-card-badge {
		font-size: 11px;
		color: var(--color-text-muted);
	}

	.rel-empty {
		font-size: 12px;
		color: var(--color-text-muted);
		font-style: italic;
		padding: 4px 0;
	}
</style>

