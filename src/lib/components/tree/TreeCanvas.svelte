<script lang="ts">
	// src/lib/components/tree/TreeCanvas.svelte — Повністю векторне веб-полотно генеалогічного древа
	import { onMount } from 'svelte';
	import { familyTreeData, peopleById, type Person, type FamilyUnion } from '$lib/data/familyTree';
	import { treeViewport } from '$lib/controllers/treeViewport.svelte';
	import { treeLayout } from '$lib/controllers/treeLayout.svelte';
	import PersonCard from '$lib/components/tree/PersonCard.svelte';
	import UnionPill from '$lib/components/tree/UnionPill.svelte';

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
		} else if (
			event.touches.length === 2 &&
			event.touches[0] &&
			event.touches[1] &&
			initialPinchDistance > 0 &&
			containerEl
		) {
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

	function handlePersonClick(person: Person) {
		treeViewport.selectPerson(person.id);
	}

	function handleUnionClick(union: FamilyUnion) {
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
		style="width: {treeLayout.canvasWidth}px; height: {treeLayout.canvasHeight}px; transform: translate3d({treeViewport.panX}px, {treeViewport.panY}px, 0) scale({treeViewport.scale});"
	>
		<!-- 1. Dynamic Vector Orthogonal Connection Lines Layer -->
		<svg
			class="tree-lines-svg"
			viewBox="0 0 {treeLayout.canvasWidth} {treeLayout.canvasHeight}"
			width={treeLayout.canvasWidth}
			height={treeLayout.canvasHeight}
		>
			<!-- 1975 Dashed Timeline Guide -->
			<line
				x1="0"
				y1={treeLayout.timeline1975Y}
				x2={treeLayout.canvasWidth}
				y2={treeLayout.timeline1975Y}
				class="timeline-1975-line"
			/>
			{#each [2000, 4500, 7000, 9500, 12000, 14500, 17000, 19500] as tx}
				<text
					x={tx}
					y={treeLayout.timeline1975Y - 8}
					class="timeline-1975-text"
					text-anchor="middle"
				>
					— — — 1975 рік — — —
				</text>
			{/each}

			<!-- Dynamic Orthogonal Connection Lines (Spouses -> Unions -> Children) -->
			{#each treeLayout.lines as line (line.id)}
				{@const isFocused = Boolean(
					treeViewport.selectedPerson &&
					(treeViewport.selectedPerson.id === line.sourceId ||
						treeViewport.selectedPerson.id === line.targetId ||
						treeViewport.relatedPersonIds.has(line.sourceId) ||
						treeViewport.relatedPersonIds.has(line.targetId))
				)}
				{@const isDimmed = Boolean(
					treeViewport.selectedPerson !== null && treeViewport.dimUnrelated && !isFocused
				)}
				<path
					d={line.pathD}
					class="family-tree-line"
					class:line-focused={isFocused}
					class:line-dimmed={isDimmed}
					class:line-spouse={line.type === 'spouse'}
					class:line-child={line.type === 'child'}
				/>
			{/each}

			<!-- Optional Direct Relationship Lines (If enabled in legend) -->
			{#if treeViewport.showConnectionLines && treeViewport.selectedPerson}
				{@const sel = treeViewport.selectedPerson}
				{@const sPos = treeLayout.personPositions.get(sel.id)}
				{#if sPos}
					{#each sel.parents as pId}
						{@const pPos = treeLayout.personPositions.get(pId)}
						{#if pPos}
							<path
								d="M {sPos.x + sPos.width / 2} {sPos.y} C {sPos.x + sPos.width / 2} {(sPos.y +
									pPos.y +
									pPos.height) /
									2}, {pPos.x + pPos.width / 2} {(sPos.y + pPos.y + pPos.height) / 2}, {pPos.x +
									pPos.width / 2} {pPos.y + pPos.height}"
								class="direct-relationship-line parent-direct-line"
							/>
						{/if}
					{/each}

					{#each sel.children as cId}
						{@const cPos = treeLayout.personPositions.get(cId)}
						{#if cPos}
							<path
								d="M {sPos.x + sPos.width / 2} {sPos.y + sPos.height} C {sPos.x +
									sPos.width / 2} {(sPos.y + sPos.height + cPos.y) / 2}, {cPos.x +
									cPos.width / 2} {(sPos.y + sPos.height + cPos.y) / 2}, {cPos.x +
									cPos.width / 2} {cPos.y}"
								class="direct-relationship-line child-direct-line"
							/>
						{/if}
					{/each}
				{/if}
			{/if}
		</svg>

		<!-- 2. Dynamic HTML Union Pills Layer -->
		<div class="tree-unions-layer">
			{#each familyTreeData.unions || [] as union (union.id)}
				{@const uPos = treeLayout.unionPositions.get(union.id)}
				{#if uPos}
					<UnionPill {union} rect={uPos} onclick={() => handleUnionClick(union)} />
				{/if}
			{/each}
		</div>

		<!-- 3. Dynamic HTML Person Cards Layer -->
		<div class="tree-cards-layer">
			{#each familyTreeData.people as person (person.id)}
				{@const pPos = treeLayout.personPositions.get(person.id)}
				{@const isSelected = treeViewport.selectedPerson?.id === person.id}
				{@const isHighlighted = treeViewport.highlightedIds.has(person.id)}
				{@const isParent = treeViewport.selectedPerson?.parents.includes(person.id) || false}
				{@const isChild = treeViewport.selectedPerson?.children.includes(person.id) || false}
				{@const isSpouse = treeViewport.selectedPerson?.spouses.includes(person.id) || false}
				{@const isSibling = treeViewport.selectedPerson?.siblings.includes(person.id) || false}
				{@const isRelated = isSelected || isParent || isChild || isSpouse || isSibling}
				{@const isDimmed =
					treeViewport.selectedPerson !== null && treeViewport.dimUnrelated && !isRelated}

				{#if pPos}
					<PersonCard
						{person}
						rect={pPos}
						{isSelected}
						{isParent}
						{isChild}
						{isSpouse}
						{isSibling}
						{isDimmed}
						{isHighlighted}
						onclick={() => handlePersonClick(person)}
					/>
				{/if}
			{/each}
		</div>
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

	/* SVG Lines Layer */
	.tree-lines-svg {
		position: absolute;
		top: 0;
		left: 0;
		pointer-events: none;
		z-index: 1;
	}

	.timeline-1975-line {
		stroke: var(--color-border);
		stroke-dasharray: 8 6;
		stroke-width: 1.5;
		opacity: 0.65;
	}

	.timeline-1975-text {
		font-size: 11px;
		font-weight: 700;
		fill: var(--color-text-muted);
		opacity: 0.6;
		letter-spacing: 0.08em;
		font-family: inherit;
		user-select: none;
	}

	/* Orthogonal Family Lines */
	.family-tree-line {
		fill: none;
		stroke: #94a3b8;
		stroke-width: 1.8;
		stroke-linecap: round;
		stroke-linejoin: round;
		transition:
			stroke 0.2s ease,
			stroke-width 0.2s ease,
			opacity 0.2s ease;
		opacity: 0.8;
	}

	.family-tree-line.line-dimmed {
		opacity: 0.25;
	}

	.family-tree-line.line-focused {
		stroke: #2563eb;
		stroke-width: 2.8;
		opacity: 1;
		filter: drop-shadow(0 0 4px rgba(37, 99, 235, 0.4));
	}

	/* Direct Lines (from legend option) */
	.direct-relationship-line {
		fill: none;
		stroke-width: 3;
		stroke-linecap: round;
		pointer-events: none;
		opacity: 0.85;
	}

	.parent-direct-line {
		stroke: #0284c7;
		stroke-dasharray: 6 4;
	}

	.child-direct-line {
		stroke: #059669;
		stroke-dasharray: 6 4;
	}

	/* Layers */
	.tree-unions-layer {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 10;
	}

	.tree-cards-layer {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 20;
	}

	.tree-unions-layer :global(*),
	.tree-cards-layer :global(*) {
		pointer-events: auto;
	}
</style>
