<script lang="ts">
	// src/lib/components/tree/TreeCanvas.svelte
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { familyTreeData, peopleById, type Person, type FamilyUnion } from '$lib/data/familyTree';
	import { treeViewport } from '$lib/controllers/treeViewport.svelte';

	let containerEl = $state<HTMLDivElement | null>(null);
	let activeUnionTooltip = $state<FamilyUnion | null>(null);

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

	function handleUnionClick(union: FamilyUnion, event: MouseEvent) {
		event.stopPropagation();
		if (union.spouses.length > 0 && union.spouses[0]) {
			treeViewport.selectPerson(union.spouses[0]);
		}
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	bind:this={containerEl}
	class="tree-canvas-viewport"
	class:dragging={treeViewport.isDragging}
	role="region"
	aria-label="Полотно генеалогічного древа"
	onmousedown={handleMouseDown}
	onmousemove={handleMouseMove}
	onmouseup={handleMouseUp}
	onmouseleave={handleMouseUp}
	onwheel={handleWheel}
	ontouchstart={handleTouchStart}
	ontouchmove={handleTouchMove}
	ontouchend={handleTouchEnd}
>
	<!-- Transform container with smooth glide transitions when navigating -->
	<div
		class="tree-content-layer"
		style="transform: translate3d({treeViewport.panX}px, {treeViewport.panY}px, 0) scale({treeViewport.scale});"
	>
		<!-- 1. The original vector graphic from DrawIO -->
		<img
			src="{base}/svg/family-tree.svg"
			alt="Генеалогічне древо"
			class="tree-svg-image"
			class:dimmed={treeViewport.selectedPerson !== null && treeViewport.dimUnrelated}
			width="21360"
			height="2143"
			draggable="false"
		/>

		<!-- 2. Interactive SVG overlay for high-fidelity clicking, hovering, and relationship halos -->
		<svg
			class="tree-interactive-overlay"
			viewBox="0 0 21360 2143"
			width="21360"
			height="2143"
		>
			<!-- Optional subtle direct relationship lines (Only when enabled in legend settings) -->
			{#if treeViewport.showConnectionLines && treeViewport.selectedPerson}
				{@const sel = treeViewport.selectedPerson}
				{#each sel.parents as pId}
					{@const parent = peopleById.get(pId)}
					{#if parent}
						<path
							d="M {sel.svgCoords.x + sel.svgCoords.width / 2} {sel.svgCoords.y} C {sel.svgCoords.x + sel.svgCoords.width / 2} {(sel.svgCoords.y + parent.svgCoords.y + parent.svgCoords.height) / 2}, {parent.svgCoords.x + parent.svgCoords.width / 2} {(sel.svgCoords.y + parent.svgCoords.y + parent.svgCoords.height) / 2}, {parent.svgCoords.x + parent.svgCoords.width / 2} {parent.svgCoords.y + parent.svgCoords.height}"
							class="relationship-line parent-line"
						/>
					{/if}
				{/each}

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

			<!-- Marriage/Union Pills Interactive Hotspots & Tooltips -->
			{#each familyTreeData.unions || [] as union (union.id)}
				<g
					class="union-hotspot"
					transform="translate({union.svgCoords.x}, {union.svgCoords.y})"
					onmouseenter={() => (activeUnionTooltip = union)}
					onmouseleave={() => (activeUnionTooltip = null)}
					onclick={(e) => handleUnionClick(union, e)}
					role="button"
					tabindex="0"
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							if (union.spouses.length > 0 && union.spouses[0]) treeViewport.selectPerson(union.spouses[0]);
						}
					}}
					aria-label="Союз: {union.spouseNames.join(' та ')}"
				>
					<rect
						width={union.svgCoords.width}
						height={union.svgCoords.height}
						rx="12"
						ry="12"
						class="union-rect"
					/>

					{#if activeUnionTooltip?.id === union.id}
						<!-- Tooltip floating above union pill -->
						<g class="union-tooltip-group" transform="translate({union.svgCoords.width / 2}, -16)">
							<rect
								x="-110"
								y="-48"
								width="220"
								height="44"
								rx="8"
								class="union-tooltip-bg"
							/>
							<text x="0" y="-30" class="union-tooltip-title" text-anchor="middle">
								💍 Союз: {union.spouseNames.join(' + ') || 'Шлюб'}
							</text>
							<text x="0" y="-14" class="union-tooltip-sub" text-anchor="middle">
								{#if union.childrenNames.length > 0}
									Діти: {union.childrenNames.slice(0, 2).join(', ')}{union.childrenNames.length > 2 ? '...' : ''}
								{:else}
									Натисніть для вибору родини
								{/if}
							</text>
							<polygon points="-6,-4 6,-4 0,2" class="union-tooltip-arrow" />
						</g>
					{/if}
				</g>
			{/each}

			<!-- Interactive hotspots for each person node -->
			{#each familyTreeData.people as person (person.id)}
				{@const isSelected = treeViewport.selectedPerson?.id === person.id}
				{@const isHighlighted = treeViewport.highlightedIds.has(person.id)}
				{@const isParent = treeViewport.selectedPerson?.parents.includes(person.id)}
				{@const isChild = treeViewport.selectedPerson?.children.includes(person.id)}
				{@const isSpouse = treeViewport.selectedPerson?.spouses.includes(person.id)}
				{@const isSibling = treeViewport.selectedPerson?.siblings.includes(person.id)}
				{@const isRelated = isSelected || isParent || isChild || isSpouse || isSibling}
				{@const isDimmed = treeViewport.selectedPerson !== null && treeViewport.dimUnrelated && !isRelated}

				<g
					class="person-hotspot"
					class:selected={isSelected}
					class:highlighted={isHighlighted}
					class:related-parent={isParent}
					class:related-child={isChild}
					class:related-spouse={isSpouse}
					class:related-sibling={isSibling}
					class:dimmed={isDimmed}
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
					<!-- Base invisible hotspot for mouse interactions -->
					<rect
						width={person.svgCoords.width}
						height={person.svgCoords.height}
						rx="9"
						ry="9"
						class="hotspot-rect"
					/>

					<!-- 1. Selected Person Focus Ring & Badge -->
					{#if isSelected}
						<rect
							x="-5"
							y="-5"
							width={person.svgCoords.width + 10}
							height={person.svgCoords.height + 10}
							rx="14"
							ry="14"
							class="halo-ring ring-selected"
						/>
						<g transform="translate(6, -10)">
							<rect width="56" height="18" rx="4" class="badge-bg badge-bg-selected" />
							<text x="28" y="13" class="badge-text" text-anchor="middle">Обрано</text>
						</g>
					{/if}

					<!-- 2. Parents Focus Ring & Badge -->
					{#if isParent && !isSelected}
						<rect
							x="-4"
							y="-4"
							width={person.svgCoords.width + 8}
							height={person.svgCoords.height + 8}
							rx="13"
							ry="13"
							class="halo-ring ring-parent"
						/>
						<g transform="translate(6, -10)">
							<rect width="68" height="18" rx="4" class="badge-bg badge-bg-parent" />
							<text x="34" y="13" class="badge-text" text-anchor="middle">Батько/Мати</text>
						</g>
					{/if}

					<!-- 3. Spouse Focus Ring & Badge -->
					{#if isSpouse && !isSelected}
						<rect
							x="-4"
							y="-4"
							width={person.svgCoords.width + 8}
							height={person.svgCoords.height + 8}
							rx="13"
							ry="13"
							class="halo-ring ring-spouse"
						/>
						<g transform="translate(6, -10)">
							<rect width="66" height="18" rx="4" class="badge-bg badge-bg-spouse" />
							<text x="33" y="13" class="badge-text" text-anchor="middle">Подружжя</text>
						</g>
					{/if}

					<!-- 4. Child Focus Ring & Badge -->
					{#if isChild && !isSelected}
						<rect
							x="-4"
							y="-4"
							width={person.svgCoords.width + 8}
							height={person.svgCoords.height + 8}
							rx="13"
							ry="13"
							class="halo-ring ring-child"
						/>
						<g transform="translate(6, -10)">
							<rect width="54" height="18" rx="4" class="badge-bg badge-bg-child" />
							<text x="27" y="13" class="badge-text" text-anchor="middle">Дитина</text>
						</g>
					{/if}

					<!-- 5. Search Highlight Ring -->
					{#if isHighlighted && !isSelected}
						<rect
							x="-5"
							y="-5"
							width={person.svgCoords.width + 10}
							height={person.svgCoords.height + 10}
							rx="14"
							ry="14"
							class="halo-ring ring-search"
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
		transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.tree-canvas-viewport.dragging .tree-content-layer {
		transition: none !important;
	}

	.tree-svg-image {
		display: block;
		pointer-events: none;
		transition: opacity 0.3s ease, filter 0.3s ease;
	}

	.tree-svg-image.dimmed {
		opacity: 0.65;
		filter: saturate(0.85);
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
		transition: opacity 0.3s ease;
	}

	.person-hotspot.dimmed {
		opacity: 0.28;
	}

	.person-hotspot.dimmed:hover {
		opacity: 1;
	}

	.hotspot-rect {
		fill: rgba(0, 0, 0, 0.001);
		stroke: transparent;
		stroke-width: 2;
		transition: stroke 0.15s ease, fill 0.15s ease;
	}

	.person-hotspot:hover .hotspot-rect {
		stroke: var(--color-accent);
		fill: rgba(37, 99, 235, 0.06);
	}

	/* Elegant, non-intrusive outer halo rings */
	.halo-ring {
		fill: none;
		pointer-events: none;
	}

	.ring-selected {
		stroke: #2563eb;
		stroke-width: 3.5;
		filter: drop-shadow(0 0 10px rgba(37, 99, 235, 0.65));
		animation: pulse-ring 2.5s infinite ease-in-out;
	}

	.ring-parent {
		stroke: #0284c7;
		stroke-width: 3;
		filter: drop-shadow(0 0 8px rgba(2, 132, 199, 0.5));
	}

	.ring-spouse {
		stroke: #d946ef;
		stroke-width: 3;
		filter: drop-shadow(0 0 8px rgba(217, 70, 239, 0.5));
	}

	.ring-child {
		stroke: #10b981;
		stroke-width: 3;
		filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.5));
	}

	.ring-search {
		stroke: #eab308;
		stroke-width: 4;
		filter: drop-shadow(0 0 8px rgba(234, 179, 8, 0.6));
	}

	/* Role badges in SVG */
	.badge-bg {
		pointer-events: none;
	}
	.badge-bg-selected { fill: #2563eb; }
	.badge-bg-parent { fill: #0284c7; }
	.badge-bg-spouse { fill: #d946ef; }
	.badge-bg-child { fill: #10b981; }

	.badge-text {
		font-size: 10px;
		font-family: inherit;
		font-weight: 700;
		fill: #ffffff;
		pointer-events: none;
	}

	@keyframes pulse-ring {
		0%, 100% {
			transform: scale(1);
			opacity: 0.92;
		}
		50% {
			transform: scale(1.015);
			opacity: 1;
		}
	}

	/* Union / Marriage pills */
	.union-hotspot {
		pointer-events: all;
		cursor: pointer;
	}

	.union-rect {
		fill: transparent;
		stroke: transparent;
		stroke-width: 2;
		transition: stroke 0.15s ease;
	}

	.union-hotspot:hover .union-rect {
		stroke: #ca8a04;
		stroke-width: 2.5;
	}

	.union-tooltip-group {
		pointer-events: none;
	}

	.union-tooltip-bg {
		fill: #1e293b;
		stroke: #475569;
		stroke-width: 1;
		filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.35));
	}

	.union-tooltip-title {
		font-size: 11px;
		font-weight: 700;
		fill: #f8fafc;
	}

	.union-tooltip-sub {
		font-size: 10px;
		fill: #94a3b8;
	}

	.union-tooltip-arrow {
		fill: #1e293b;
	}

	/* Optional direct lines (soft styling) */
	.relationship-line {
		fill: none;
		stroke-width: 3;
		stroke-linecap: round;
		pointer-events: none;
		opacity: 0.75;
	}

	.parent-line {
		stroke: #0284c7;
		stroke-dasharray: 6 4;
	}

	.child-line {
		stroke: #10b981;
		stroke-dasharray: 6 4;
	}
</style>
