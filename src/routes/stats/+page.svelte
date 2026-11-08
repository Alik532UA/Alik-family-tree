<script lang="ts">
	// src/routes/stats/+page.svelte — Статистика та аналітика древа
	import { familyTreeData } from '$lib/data/familyTree';

	const meta = familyTreeData.meta;
	const branches = Object.entries(meta.branchStats).sort((a, b) => b[1] - a[1]);
	const gens = Object.entries(meta.generationStats).sort((a, b) => Number(a[0]) - Number(b[0]));

	const maxBranchCount = Math.max(...branches.map((b) => b[1]));
	const maxGenCount = Math.max(...gens.map((g) => g[1]));
</script>

<svelte:head>
	<title>Статистика родинного древа | Alik-family-tree</title>
	<meta
		name="description"
		content="Аналітика та статистика поколінь та гілок родини Запольнових."
	/>
</svelte:head>

<div class="stats-page-container">
	<div class="stats-header">
		<h1 class="page-title">Статистика родинного архіву</h1>
		<p class="page-subtitle">Метрики та демографія генеалогічного древа (версія {meta.version})</p>
	</div>

	<!-- KPI Cards -->
	<div class="kpi-grid">
		<div class="kpi-card">
			<span class="kpi-label">Всього осіб</span>
			<span class="kpi-value">{meta.totalPeople}</span>
			<span class="kpi-sub">Зафіксовано в графі</span>
		</div>
		<div class="kpi-card">
			<span class="kpi-label">Глибина поколінь</span>
			<span class="kpi-value">{meta.totalGenerations}</span>
			<span class="kpi-sub">Від Алентія до Аліка</span>
		</div>
		<div class="kpi-card">
			<span class="kpi-label">Родинних зв'язків</span>
			<span class="kpi-value">323</span>
			<span class="kpi-sub">Батьківські та шлюбні ребра</span>
		</div>
		<div class="kpi-card">
			<span class="kpi-label">Основних гілок</span>
			<span class="kpi-value">{branches.length}</span>
			<span class="kpi-sub">Фамільні лінії</span>
		</div>
	</div>

	<!-- Generation Distribution Chart -->
	<div class="stats-section">
		<h2 class="section-title">Розподіл за поколіннями</h2>
		<div class="bars-container">
			{#each gens as [gen, count]}
				{@const percent = Math.round((count / maxGenCount) * 100)}
				<div class="bar-row">
					<div class="bar-label">Покоління {gen}</div>
					<div class="bar-track">
						<div class="bar-fill gen-fill" style="width: {percent}%"></div>
					</div>
					<div class="bar-val">{count} осіб</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Branch Distribution Chart -->
	<div class="stats-section">
		<h2 class="section-title">Фамільні гілки та роди</h2>
		<div class="bars-container">
			{#each branches as [branch, count]}
				{@const percent = Math.round((count / maxBranchCount) * 100)}
				<div class="bar-row">
					<div class="bar-label">{branch}</div>
					<div class="bar-track">
						<div class="bar-fill branch-fill" style="width: {percent}%"></div>
					</div>
					<div class="bar-val">{count} осіб</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Earliest Ancestors -->
	<div class="stats-section">
		<h2 class="section-title">Найдавніші засновники роду</h2>
		<div class="ancestors-grid">
			<div class="ancestor-card">
				<span class="ancestor-gen">Покоління 1 (початок XIX століття)</span>
				<h3 class="ancestor-name">Алентій Запольнов</h3>
				<p class="ancestor-desc">
					Прямий родоначальник гілки Запольнових, предок Олександра Алентивича.
				</p>
			</div>
			<div class="ancestor-card">
				<span class="ancestor-gen">Покоління 2</span>
				<h3 class="ancestor-name">Олександр Алентивич Запольнов</h3>
				<p class="ancestor-desc">Син Алентія, батько Веніамина Олександровича Запольнова.</p>
			</div>
			<div class="ancestor-card">
				<span class="ancestor-gen">Покоління 3</span>
				<h3 class="ancestor-name">Веніамин Олександрович Запольнов</h3>
				<p class="ancestor-desc">Дід Аліка, чоловік Віри Федорівни Миндру.</p>
			</div>
			<div class="ancestor-card">
				<span class="ancestor-gen">Покоління 4</span>
				<h3 class="ancestor-name">Іван Константинович Булат & Марія Соколовська</h3>
				<p class="ancestor-desc">Батьки Ольги Іванівни Запольнової (матері Аліка).</p>
			</div>
		</div>
	</div>
</div>

<style>
	.stats-page-container {
		max-width: 1000px;
		margin: 0 auto;
		width: 100%;
		padding: 24px 16px;
		overflow-y: auto;
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 24px;
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

	.kpi-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 16px;
	}

	.kpi-card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 12px;
		padding: 18px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.kpi-label {
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.kpi-value {
		font-size: 32px;
		font-weight: 800;
		color: var(--color-accent);
		line-height: 1.1;
	}

	.kpi-sub {
		font-size: 11px;
		color: var(--color-text-muted);
	}

	.stats-section {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 12px;
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.section-title {
		font-size: 16px;
		font-weight: 700;
		margin: 0;
	}

	.bars-container {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.bar-row {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.bar-label {
		width: 120px;
		font-size: 13px;
		font-weight: 500;
		flex-shrink: 0;
	}

	.bar-track {
		flex: 1;
		height: 18px;
		background: var(--color-surface-hover);
		border-radius: 6px;
		overflow: hidden;
	}

	.bar-fill {
		height: 100%;
		border-radius: 6px;
		transition: width 0.3s ease;
	}

	.gen-fill {
		background: var(--color-accent);
	}

	.branch-fill {
		background: #10b981;
	}

	.bar-val {
		width: 70px;
		text-align: right;
		font-size: 13px;
		font-weight: 600;
		color: var(--color-text-muted);
		flex-shrink: 0;
	}

	.ancestors-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 14px;
	}

	.ancestor-card {
		padding: 14px;
		background: var(--color-surface-hover);
		border: 1px solid var(--color-border);
		border-radius: 10px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.ancestor-gen {
		font-size: 11px;
		font-weight: 700;
		color: var(--color-accent);
	}

	.ancestor-name {
		font-size: 15px;
		font-weight: 700;
		margin: 0;
	}

	.ancestor-desc {
		font-size: 12px;
		color: var(--color-text-muted);
		margin: 0;
		line-height: 1.4;
	}
</style>
