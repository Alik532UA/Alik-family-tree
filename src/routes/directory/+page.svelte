<script lang="ts">
	// src/routes/directory/+page.svelte — Каталог родичів
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { familyTreeData, type Person } from '$lib/data/familyTree';
	import { treeViewport } from '$lib/controllers/treeViewport.svelte';

	let searchQuery = $state<string>('');
	let selectedBranch = $state<string>('Всі');
	let selectedGeneration = $state<string>('Всі');
	let sortOrder = $state<'name' | 'generation' | 'branch'>('generation');

	const branches = ['Всі', ...Object.keys(familyTreeData.meta.branchStats)];
	const generations = ['Всі', '1', '2', '3', '4', '5', '6', '7', '8'];

	const filteredPeople = $derived.by<Person[]>(() => {
		const q = searchQuery.trim().toLowerCase();
		return familyTreeData.people
			.filter((p) => {
				const matchesSearch =
					!q ||
					p.name.toLowerCase().includes(q) ||
					p.fullName.toLowerCase().includes(q) ||
					(p.maidenName && p.maidenName.toLowerCase().includes(q)) ||
					p.branch.toLowerCase().includes(q);

				const matchesBranch = selectedBranch === 'Всі' || p.branch === selectedBranch;
				const matchesGen = selectedGeneration === 'Всі' || p.generation === Number(selectedGeneration);

				return matchesSearch && matchesBranch && matchesGen;
			})
			.sort((a, b) => {
				if (sortOrder === 'generation') {
					return a.generation - b.generation || a.name.localeCompare(b.name, 'uk');
				}
				if (sortOrder === 'branch') {
					return a.branch.localeCompare(b.branch, 'uk') || a.generation - b.generation;
				}
				return a.name.localeCompare(b.name, 'uk');
			});
	});

	function viewOnTree(person: Person) {
		treeViewport.selectPerson(person.id);
		goto(`${base}/#person-${person.id}`);
	}
</script>

<svelte:head>
	<title>Каталог родини | Alik-family-tree</title>
	<meta name="description" content="Повний алфавітний та поколінний каталог родинного древа Запольнових." />
</svelte:head>

<div class="directory-page-container">
	<div class="directory-header">
		<h1 class="page-title">Каталог родичів</h1>
		<p class="page-subtitle">Всього в родинному архіві: {familyTreeData.meta.totalPeople} осіб у 8 поколіннях</p>
	</div>

	<!-- Filters & Controls Bar -->
	<div class="filters-bar">
		<div class="search-field">
			<input
				type="search"
				class="filter-input"
				placeholder="Пошук за ім'ям чи прізвищем..."
				bind:value={searchQuery}
			/>
		</div>

		<div class="filter-select-group">
			<label class="filter-label" for="branch-select">Гілка:</label>
			<select id="branch-select" class="filter-select" bind:value={selectedBranch}>
				{#each branches as b}
					<option value={b}>{b}</option>
				{/each}
			</select>
		</div>

		<div class="filter-select-group">
			<label class="filter-label" for="gen-select">Покоління:</label>
			<select id="gen-select" class="filter-select" bind:value={selectedGeneration}>
				{#each generations as g}
					<option value={g}>{g === 'Всі' ? 'Всі покоління' : `Покоління ${g}`}</option>
				{/each}
			</select>
		</div>

		<div class="filter-select-group">
			<label class="filter-label" for="sort-select">Сортування:</label>
			<select id="sort-select" class="filter-select" bind:value={sortOrder}>
				<option value="generation">За поколінням</option>
				<option value="name">За алфавітом</option>
				<option value="branch">За гілкою</option>
			</select>
		</div>
	</div>

	<div class="results-count">
		Знайдено: <strong>{filteredPeople.length}</strong> осіб
	</div>

	<!-- Directory Grid -->
	<div class="directory-grid">
		{#each filteredPeople as person (person.id)}
			<div class="person-card">
				<div class="card-top">
					<span class="branch-tag">{person.branch}</span>
					<span class="gen-tag">Пок. {person.generation}</span>
				</div>

				<h3 class="card-name">{person.name}</h3>

				{#if person.maidenName}
					<div class="card-maiden">Дівоче: <strong>{person.maidenName}</strong></div>
				{/if}

				<div class="card-relations-summary">
					<span>Батьки: <strong>{person.parents.length}</strong></span>
					<span>Подружжя: <strong>{person.spouses.length}</strong></span>
					<span>Діти: <strong>{person.children.length}</strong></span>
				</div>

				<button
					type="button"
					class="view-tree-btn"
					onclick={() => viewOnTree(person)}
				>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>
					Показати на древі
				</button>
			</div>
		{/each}
	</div>
</div>

<style>
	.directory-page-container {
		max-width: 1200px;
		margin: 0 auto;
		width: 100%;
		padding: 24px 16px;
		overflow-y: auto;
		flex: 1;
	}

	.directory-header {
		margin-bottom: 20px;
	}

	.page-title {
		font-size: 24px;
		font-weight: 800;
		margin: 0 0 6px;
	}

	.page-subtitle {
		font-size: 14px;
		color: var(--color-text-muted);
		margin: 0;
	}

	.filters-bar {
		display: flex;
		align-items: center;
		gap: 12px;
		flex-wrap: wrap;
		padding: 12px 16px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 10px;
		margin-bottom: 16px;
	}

	.search-field {
		flex: 1;
		min-width: 220px;
	}

	.filter-input {
		width: 100%;
		padding: 7px 12px;
		font-size: 13px;
		border-radius: 6px;
		border: 1px solid var(--color-border);
	}

	.filter-select-group {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.filter-label {
		font-size: 12px;
		font-weight: 600;
		color: var(--color-text-muted);
	}

	.filter-select {
		padding: 6px 10px;
		font-size: 13px;
		border-radius: 6px;
		border: 1px solid var(--color-border);
		background: var(--color-surface);
	}

	.results-count {
		font-size: 13px;
		color: var(--color-text-muted);
		margin-bottom: 14px;
	}

	.directory-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 16px;
	}

	.person-card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 10px;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
	}

	.person-card:hover {
		transform: translateY(-2px);
		border-color: var(--color-accent);
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
	}

	.card-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.branch-tag {
		font-size: 11px;
		font-weight: 700;
		padding: 2px 8px;
		border-radius: 10px;
		background: var(--color-accent);
		color: var(--color-on-accent);
	}

	.gen-tag {
		font-size: 11px;
		font-weight: 600;
		padding: 2px 6px;
		border-radius: 8px;
		background: var(--color-surface-hover);
		color: var(--color-text-muted);
		border: 1px solid var(--color-border);
	}

	.card-name {
		font-size: 16px;
		font-weight: 700;
		margin: 0;
		line-height: 1.3;
	}

	.card-maiden {
		font-size: 12px;
		color: var(--color-accent);
	}

	.card-relations-summary {
		display: flex;
		gap: 10px;
		font-size: 12px;
		color: var(--color-text-muted);
		padding: 6px 0;
		border-top: 1px solid var(--color-border);
		border-bottom: 1px solid var(--color-border);
	}

	.card-relations-summary strong {
		color: var(--color-text);
	}

	.view-tree-btn {
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
		border-radius: 6px;
		margin-top: auto;
		transition: all 0.15s ease;
	}

	.view-tree-btn:hover {
		background: var(--color-accent);
		color: var(--color-on-accent);
		border-color: var(--color-accent);
	}
</style>

