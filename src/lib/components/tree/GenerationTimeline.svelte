<script lang="ts">
	// src/lib/components/tree/GenerationTimeline.svelte
	import { familyTreeData } from '$lib/data/familyTree';
	import { treeViewport } from '$lib/controllers/treeViewport.svelte';

	const generations = [
		{ gen: 1, label: 'Покоління 1', note: '1800-ті (Алентій)', y: 2 },
		{ gen: 2, label: 'Покоління 2', note: 'Олександр Алент.', y: 160 },
		{ gen: 3, label: 'Покоління 3', note: '38 осіб', y: 580 },
		{ gen: 4, label: 'Покоління 4', note: '55 осіб', y: 846 },
		{ gen: 5, label: 'Покоління 5', note: '55 осіб', y: 1000 },
		{ gen: 6, label: 'Покоління 6', note: '25 осіб', y: 1170 },
		{ gen: 7, label: 'Покоління 7', note: '1975 рік (6 осіб)', y: 1360 },
		{ gen: 8, label: 'Покоління 8', note: 'Сучасне (Алік)', y: 2077 }
	];

	function selectGeneration(g: (typeof generations)[number]) {
		treeViewport.activeGeneration = g.gen;
		// Find people in this generation
		const peopleInGen = familyTreeData.people.filter((p) => p.generation === g.gen);
		if (peopleInGen.length > 0) {
			// Center horizontally around the average X of this generation
			const avgX = peopleInGen.reduce((acc, p) => acc + p.svgCoords.x, 0) / peopleInGen.length;
			treeViewport.centerOnCoords(avgX, g.y);
		}
	}
</script>

<div class="gen-timeline-container" role="toolbar" aria-label="Шкала поколінь">
	<div class="timeline-track">
		{#each generations as g}
			<button
				type="button"
				class="gen-step-btn"
				class:active={treeViewport.activeGeneration === g.gen}
				onclick={() => selectGeneration(g)}
				title="{g.label}: {g.note}"
			>
				<span class="gen-num">{g.gen}</span>
				<span class="gen-text">{g.label}</span>
			</button>
		{/each}
	</div>
</div>

<style>
	.gen-timeline-container {
		display: flex;
		align-items: center;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 20px;
		padding: 4px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
		max-width: 100%;
		overflow-x: auto;
	}

	.timeline-track {
		display: flex;
		align-items: center;
		gap: 2px;
	}

	.gen-step-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 4px 10px;
		font-size: 12px;
		font-weight: 500;
		background: transparent;
		color: var(--color-text-muted);
		border: none;
		border-radius: 14px;
		white-space: nowrap;
		transition: all 0.15s ease;
	}

	.gen-step-btn:hover {
		color: var(--color-text);
		background: var(--color-surface-hover);
	}

	.gen-step-btn.active {
		background: var(--color-accent);
		color: var(--color-on-accent);
		font-weight: 600;
	}

	.gen-num {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.1);
		font-size: 10px;
		font-weight: 700;
	}

	.gen-step-btn.active .gen-num {
		background: rgba(255, 255, 255, 0.25);
	}

	@media (max-width: 768px) {
		.gen-text {
			display: none;
		}
		.gen-step-btn {
			padding: 4px 8px;
		}
	}
</style>
