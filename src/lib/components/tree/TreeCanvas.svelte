<script lang="ts">
	// src/lib/components/tree/TreeCanvas.svelte
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { familyTreeData, peopleById, type Person } from '$lib/data/familyTree';
	import { treeViewport } from '$lib/controllers/treeViewport.svelte';

	let containerEl = $state<HTMLDivElement | null>(null);

	onMount(() => {
		if (!containerEl) return;
		const rect = containerEl.getBoundingClientRect();
		treeViewport.initContainer(rect.width, rect.height);

		const ro = new ResizeObserver((entries) => {
			for (const entry of entries) {
				treeViewport.containerWidth = entry.contentRect.width;
				treeViewport.containerHeight = entry.contentRect.height;
			}
		});
		ro.observe(containerEl);
		return () => ro.disconnect();
	});

	function handleMouseDown(event: MouseEvent) {
		if (event.button !== 0) return; // Only left click for dragging
		treeViewport.startDrag(event.clientX, event.clientY);
	}

	function handleMouseMove(event: MouseEvent) {
		treeViewport.drag(event.clientX, event.clientY);
	}

	function handleMouseUp() {
		treeViewport.endDrag();
	}

	function handleWheel(event: WheelEvent) {
		event.preventDefault();
		if (!containerEl) return;
		const rect = containerEl.getBoundingClientRect();
		const mouseX = event.clientX - rect.left;
		const mouseY = event.clientY - rect.top;
		treeViewport.zoomAt(mouseX, mouseY, event.deltaY);
	}

	// Touch gestures for mobile/tablet
	let initialPinchDistance = 0;
	let initialTouchScale = 1;

	function handleTouchStart(event: TouchEvent) {
		if (event.touches.length === 1 && event.touches[0]) {
			treeViewport.startDrag(event.touches[0].clientX, event.touches[0].clientY);
		} else if (event.touches.length === 2 && event.touches[0] && event.touches[1]) {
			const dx = event.touches[0].clientX - event.touches[1].clientX;
			const dy = event.touches[0].clientY - event.touches[1].clientY;
			initialPinchDistance = Math.hypot(dx, dy);
			initialTouchScale = treeViewport.scale;
		}
	}

	function handleTouchMove(event: TouchEvent) {
		if (event.touches.length === 1 && event.touches[0]) {
			treeViewport.drag(event.touches[0].clientX, event.touches[0].clientY);
		} else if (event.touches.length === 2 && event.touches[0] && event.touches[1] && initialPinchDistance > 0 && containerEl) {
			const dx = event.touches[0].clientX - event.touches[1].clientX;
			const dy = event.touches[0].clientY - event.touches[1].clientY;
			const currentDistance = Math.hypot(dx, dy);
			const ratio = currentDistance / initialPinchDistance;
			const rect = containerEl.getBoundingClientRect();
			const midX = (event.touches[0].clientX + event.touches[1].clientX) / 2 - rect.left;
			const midY = (event.touches[0].clientY + event.touches[1].clientY) / 2 - rect.top;
			
			const newScale = Math.min(Math.max(initialTouchScale * ratio, 0.08), 3.0);
			const canvasX = (midX - treeViewport.panX) / treeViewport.scale;
			const canvasY = (midY - treeViewport.panY) / treeViewport.scale;
			treeViewport.scale = newScale;
			treeViewport.panX = midX - canvasX * newScale;
			treeViewport.panY = midY - canvasY * newScale;
		}
	}

	function handleTouchEnd() {
		treeViewport.endDrag();
		initialPinchDistance = 0;
	}

	function handlePersonClick(person: Person, event: MouseEvent) {
		event.stopPropagation();
		treeViewport.selectPerson(person.id);
	}
</script>

<div
	bind:this={containerEl}
	class="tree-canvas-viewport"
	class:dragging={treeViewport.isDragging}
	role="region"
	aria-label="Полотно генеалогічного древа"
	tabindex="0"
	onmousedown={handleMouseDown}
	onmousemove={handleMouseMove}
	onmouseup={handleMouseUp}
	onmouseleave={handleMouseUp}
	onwheel={handleWheel}
	ontouchstart={handleTouchStart}
	ontouchmove={handleTouchMove}
	ontouchend={handleTouchEnd}
>
	<!-- Transform container -->
	<div
		class="tree-content-layer"
		style="transform: translate3d({treeViewport.panX}px, {treeViewport.panY}px, 0) scale({treeViewport.scale});"
	>
		<!-- 1. The original vector graphic from DrawIO -->
		<img
			src="{base}/svg/family-tree.svg"
			alt="Генеалогічне древо"
			class="tree-svg-image"
			width="21360"
			height="2143"
			draggable="false"
		/>

		<!-- 2. Interactive SVG overlay for high-fidelity clicking, hovering, and relationship lines -->
		<svg
			class="tree-interactive-overlay"
			viewBox="0 0 21360 2143"
			width="21360"
			height="2143"
		>
			<!-- Active Relationship Highlights -->
			{#if treeViewport.selectedPerson}
				{@const sel = treeViewport.selectedPerson}
				<!-- Connection lines to parents -->
				{#each sel.parents as pId}
					{@const parent = peopleById.get(pId)}
					{#if parent}
						<path
							d="M {sel.svgCoords.x + sel.svgCoords.width / 2} {sel.svgCoords.y} C {sel.svgCoords.x + sel.svgCoords.width / 2} {(sel.svgCoords.y + parent.svgCoords.y + parent.svgCoords.height) / 2}, {parent.svgCoords.x + parent.svgCoords.width / 2} {(sel.svgCoords.y + parent.svgCoords.y + parent.svgCoords.height) / 2}, {parent.svgCoords.x + parent.svgCoords.width / 2} {parent.svgCoords.y + parent.svgCoords.height}"
							class="relationship-line parent-line"
						/>
					{/if}
				{/each}

				<!-- Connection lines to children -->
				{#each sel.children as cId}
					{@const child = peopleById.get(cId)}
					{#if child}
						<path
							d="M {sel.svgCoords.x + sel.svgCoords.width / 2} {sel.svgCoords.y + sel.svgCoords.height} C {sel.svgCoords.x + sel.svgCoords.width / 2} {(sel.svgCoords.y + sel.svgCoords.height + child.svgCoords.y) / 2}, {child.svgCoords.x + child.svgCoords.width / 2} {(sel.svgCoords.y + sel.svgCoords.height + child.svgCoords.y) / 2}, {child.svgCoords.x + child.svgCoords.width / 2} {child.svgCoords.y}"
							class="relationship-line child-line"
						/>
					{/if}
				{/each}
			{/if}

			<!-- Interactive hotspots for each person node -->
			{#each familyTreeData.people as person (person.id)}
				{@const isSelected = treeViewport.selectedPerson?.id === person.id}
				{@const isHighlighted = treeViewport.highlightedIds.has(person.id)}
				{@const isParent = treeViewport.selectedPerson?.parents.includes(person.id)}
				{@const isChild = treeViewport.selectedPerson?.children.includes(person.id)}
				{@const isSpouse = treeViewport.selectedPerson?.spouses.includes(person.id)}
				{@const isSibling = treeViewport.selectedPerson?.siblings.includes(person.id)}

				<g
					class="person-hotspot"
					class:selected={isSelected}
					class:highlighted={isHighlighted}
					class:related-parent={isParent}
					class:related-child={isChild}
					class:related-spouse={isSpouse}
					class:related-sibling={isSibling}
					transform="translate({person.svgCoords.x}, {person.svgCoords.y})"
					onclick={(e) => handlePersonClick(person, e)}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							treeViewport.selectPerson(person.id);
						}
					}}
					role="button"
					tabindex="0"
					aria-label="{person.name}"
				>
					<!-- Clickable bounding box with subtle outline -->
					<rect
						width={person.svgCoords.width}
						height={person.svgCoords.height}
						rx="9"
						ry="9"
						class="hotspot-rect"
					/>

					{#if isSelected}
						<!-- Highlight Ring -->
						<rect
							x="-6"
							y="-6"
							width={person.svgCoords.width + 12}
							height={person.svgCoords.height + 12}
							rx="14"
							ry="14"
							class="selected-ring"
						/>
					{/if}
				</g>
			{/each}
		</svg>
	</div>
</div>

<style>
	.tree-canvas-viewport {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
		background: var(--color-bg);
		cursor: grab;
		user-select: none;
		touch-action: none;
	}

	.tree-canvas-viewport.dragging {
		cursor: grabbing;
	}

	.tree-content-layer {
		position: absolute;
		top: 0;
		left: 0;
		transform-origin: 0 0;
		will-change: transform;
	}

	.tree-svg-image {
		display: block;
		pointer-events: none;
	}

	.tree-interactive-overlay {
		position: absolute;
		top: 0;
		left: 0;
		pointer-events: none;
	}

	.person-hotspot {
		pointer-events: all;
		cursor: pointer;
	}

	.hotspot-rect {
		fill: rgba(0, 0, 0, 0.001);
		stroke: transparent;
		stroke-width: 3;
		transition: stroke 0.15s ease, fill 0.15s ease;
	}

	.person-hotspot:hover .hotspot-rect {
		stroke: var(--color-accent);
		fill: rgba(37, 99, 235, 0.08);
	}

	.person-hotspot.highlighted .hotspot-rect {
		stroke: #eab308;
		stroke-width: 5;
		fill: rgba(234, 179, 8, 0.15);
	}

	.person-hotspot.related-parent .hotspot-rect {
		stroke: #3b82f6;
		stroke-width: 4;
		stroke-dasharray: 6 3;
	}

	.person-hotspot.related-child .hotspot-rect {
		stroke: #10b981;
		stroke-width: 4;
		stroke-dasharray: 6 3;
	}

	.person-hotspot.related-spouse .hotspot-rect {
		stroke: #ec4899;
		stroke-width: 4;
		stroke-dasharray: 6 3;
	}

	.person-hotspot.related-sibling .hotspot-rect {
		stroke: #8b5cf6;
		stroke-width: 3;
		stroke-dasharray: 4 2;
	}

	.selected-ring {
		fill: none;
		stroke: var(--color-accent);
		stroke-width: 4;
		filter: drop-shadow(0 0 8px rgba(37, 99, 235, 0.6));
		animation: pulse-ring 2s infinite ease-in-out;
	}

	@keyframes pulse-ring {
		0%, 100% {
			transform: scale(1);
			opacity: 0.9;
		}
		50% {
			transform: scale(1.02);
			opacity: 1;
		}
	}

	.relationship-line {
		fill: none;
		stroke-width: 4;
		stroke-linecap: round;
		pointer-events: none;
	}

	.parent-line {
		stroke: #3b82f6;
		stroke-dasharray: 8 4;
		animation: dash 1s linear infinite;
	}

	.child-line {
		stroke: #10b981;
		stroke-dasharray: 8 4;
		animation: dash 1s linear infinite;
	}

	@keyframes dash {
		to {
			stroke-dashoffset: -12;
		}
	}
</style>

