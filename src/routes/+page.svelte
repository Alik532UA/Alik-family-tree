<script lang="ts">
	// src/routes/+page.svelte — Головна сторінка: інтерактивне полотно генеалогічного древа
	import { onMount } from 'svelte';
	import TreeCanvas from '$lib/components/tree/TreeCanvas.svelte';
	import TreeMinimap from '$lib/components/tree/TreeMinimap.svelte';
	import TreeLegend from '$lib/components/tree/TreeLegend.svelte';
	import PersonDrawer from '$lib/components/tree/PersonDrawer.svelte';
	import GenerationTimeline from '$lib/components/tree/GenerationTimeline.svelte';
	import { treeViewport } from '$lib/controllers/treeViewport.svelte';

	onMount(() => {
		// Read hash e.g. #person-OPFhqzpYQ7s1dcnbn2dE-24
		const hash = window.location.hash;
		if (hash && hash.startsWith('#person-')) {
			const personId = hash.replace('#person-', '');
			treeViewport.selectPerson(personId);
		}
	});
</script>

<svelte:head>
	<title>Alik-family-tree | Інтерактивне генеалогічне древо</title>
	<meta name="description" content="Інтерактивне генеалогічне древо родини Запольнових, Булатів, Соколовських, Кульчицьких (183 персони, 8 поколінь)." />
</svelte:head>

<div class="tree-page-container">
	<!-- Top floating generation timeline scrubber -->
	<div class="floating-timeline-bar">
		<GenerationTimeline />
	</div>

	<!-- Interactive graphical tree canvas -->
	<TreeCanvas />

	<!-- Minimap in bottom-left -->
	<TreeMinimap />

	<!-- Legend & display toggles -->
	<TreeLegend />

	<!-- Person profile drawer -->
	<PersonDrawer
		person={treeViewport.selectedPerson}
		onclose={() => treeViewport.selectPerson(null)}
	/>
</div>

<style>
	.tree-page-container {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.floating-timeline-bar {
		position: absolute;
		top: 16px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 45;
		max-width: calc(100vw - 32px);
		pointer-events: auto;
	}

	@media (max-width: 640px) {
		.floating-timeline-bar {
			top: 8px;
		}
	}
</style>

