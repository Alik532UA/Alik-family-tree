<script lang="ts">
	// src/lib/components/tree/SearchBar.svelte
	import { familyTreeData, type Person } from '$lib/data/familyTree';
	import { treeViewport } from '$lib/controllers/treeViewport.svelte';

	let query = $state<string>('');
	let isOpen = $state<boolean>(false);
	let selectedIndex = $state<number>(0);
	let inputEl = $state<HTMLInputElement | null>(null);

	const searchResults = $derived.by<Person[]>(() => {
		const q = query.trim().toLowerCase();
		if (!q) return [];
		return familyTreeData.people
			.filter((p) => {
				return (
					p.name.toLowerCase().includes(q) ||
					p.fullName.toLowerCase().includes(q) ||
					(p.maidenName && p.maidenName.toLowerCase().includes(q)) ||
					p.branch.toLowerCase().includes(q) ||
					`покоління ${p.generation}`.includes(q)
				);
			})
			.slice(0, 10);
	});

	function handleInput() {
		isOpen = true;
		selectedIndex = 0;
	}

	function handleSelect(person: Person) {
		treeViewport.selectPerson(person.id);
		isOpen = false;
		query = person.name;
		inputEl?.blur();
	}

	function handleKeydown(event: KeyboardEvent) {
		// Global shortcut '/' to focus search
		if (event.key === '/' && document.activeElement !== inputEl) {
			event.preventDefault();
			inputEl?.focus();
			inputEl?.select();
			return;
		}

		if (!isOpen) return;

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			selectedIndex = (selectedIndex + 1) % Math.max(1, searchResults.length);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			selectedIndex =
				(selectedIndex - 1 + searchResults.length) % Math.max(1, searchResults.length);
		} else if (event.key === 'Enter') {
			event.preventDefault();
			const item = searchResults[selectedIndex];
			if (item) handleSelect(item);
		} else if (event.key === 'Escape') {
			isOpen = false;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="search-bar-container">
	<div class="search-input-wrapper">
		<svg
			class="search-icon"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg
		>
		<input
			bind:this={inputEl}
			type="search"
			class="search-input"
			placeholder="Пошук родича (натисніть '/')"
			bind:value={query}
			oninput={handleInput}
			onfocus={() => {
				if (query.trim()) isOpen = true;
			}}
			aria-label="Пошук родича у древі"
			aria-haspopup="listbox"
			aria-autocomplete="list"
		/>
		{#if query}
			<button
				type="button"
				class="clear-query-btn"
				onclick={() => {
					query = '';
					isOpen = false;
				}}
				aria-label="Очистити пошук"
			>
				<svg
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg
				>
			</button>
		{:else}
			<kbd class="search-kbd">/</kbd>
		{/if}
	</div>

	{#if isOpen && searchResults.length > 0}
		<div class="search-results-dropdown" role="listbox">
			{#each searchResults as person, idx (person.id)}
				<button
					type="button"
					class="search-result-item"
					class:active={idx === selectedIndex}
					role="option"
					aria-selected={idx === selectedIndex}
					onclick={() => handleSelect(person)}
				>
					<div class="result-info">
						<span class="result-name">{person.name}</span>
						{#if person.maidenName}
							<span class="result-maiden">(дівоче: {person.maidenName})</span>
						{/if}
					</div>
					<div class="result-badges">
						<span class="result-branch">{person.branch}</span>
						<span class="result-gen">Пок. {person.generation}</span>
					</div>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.search-bar-container {
		position: relative;
		width: 100%;
		max-width: 320px;
	}

	.search-input-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-icon {
		position: absolute;
		left: 10px;
		color: var(--color-text-muted);
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		padding: 7px 32px 7px 32px;
		font-size: 13px;
		background: var(--color-surface);
		color: var(--color-text);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		outline: none;
		transition:
			border-color 0.2s,
			box-shadow 0.2s;
	}

	.search-input:focus {
		border-color: var(--color-accent);
		box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
	}

	.search-kbd {
		position: absolute;
		right: 10px;
		font-size: 11px;
		font-weight: 600;
		background: var(--color-surface-hover);
		color: var(--color-text-muted);
		padding: 1px 5px;
		border-radius: 4px;
		border: 1px solid var(--color-border);
		pointer-events: none;
	}

	.clear-query-btn {
		position: absolute;
		right: 8px;
		background: transparent;
		border: none;
		color: var(--color-text-muted);
		padding: 4px;
		border-radius: 4px;
		display: flex;
		align-items: center;
	}

	.search-results-dropdown {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		right: 0;
		z-index: 999;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
		overflow: hidden;
		max-height: 340px;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
	}

	.search-result-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 12px;
		background: transparent;
		border: none;
		border-bottom: 1px solid var(--color-border);
		text-align: left;
		cursor: pointer;
		transition: background-color 0.1s ease;
	}

	.search-result-item:last-child {
		border-bottom: none;
	}

	.search-result-item:hover,
	.search-result-item.active {
		background: var(--color-surface-hover);
	}

	.result-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.result-name {
		font-size: 13px;
		font-weight: 600;
		color: var(--color-text);
	}

	.result-maiden {
		font-size: 11px;
		color: var(--color-accent);
	}

	.result-badges {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.result-branch {
		font-size: 10px;
		font-weight: 600;
		padding: 2px 6px;
		border-radius: 10px;
		background: var(--color-surface-hover);
		color: var(--color-text-muted);
		border: 1px solid var(--color-border);
	}

	.result-gen {
		font-size: 10px;
		font-weight: 600;
		color: var(--color-accent);
	}
</style>
