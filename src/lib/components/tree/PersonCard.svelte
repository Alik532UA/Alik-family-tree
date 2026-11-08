<script lang="ts">
	// src/lib/components/tree/PersonCard.svelte — Векторна HTML-картка персони
	import type { Person } from '$lib/data/familyTree';
	import type { CardRect } from '$lib/controllers/treeLayout.svelte';

	interface Props {
		person: Person;
		rect: CardRect;
		isSelected: boolean;
		isParent: boolean;
		isChild: boolean;
		isSpouse: boolean;
		isSibling: boolean;
		isDimmed: boolean;
		isHighlighted: boolean;
		onclick: () => void;
	}

	let {
		person,
		rect,
		isSelected,
		isParent,
		isChild,
		isSpouse,
		isDimmed,
		isHighlighted,
		onclick
	}: Props = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onclick();
		}
	}
</script>

<div
	class="person-card-node"
	class:gender-male={person.gender === 'male'}
	class:gender-female={person.gender === 'female'}
	class:selected={isSelected}
	class:parent={isParent}
	class:spouse={isSpouse}
	class:child={isChild}
	class:dimmed={isDimmed}
	class:highlighted={isHighlighted}
	style="left: {rect.x}px; top: {rect.y}px; width: {rect.width}px; min-height: {rect.height}px;"
	role="button"
	tabindex="0"
	aria-label="{person.name}"
	{onclick}
	onkeydown={handleKeydown}
>
	<!-- Floating Pill Role Badge -->
	{#if isSelected}
		<span class="role-pill pill-selected">Обрано</span>
	{:else if isParent}
		<span class="role-pill pill-parent">Батько/Мати</span>
	{:else if isSpouse}
		<span class="role-pill pill-spouse">Подружжя</span>
	{:else if isChild}
		<span class="role-pill pill-child">Дитина</span>
	{/if}

	<!-- Card Content -->
	<div class="card-inner">
		<div class="name-line first-name">{person.firstName}</div>
		{#if person.middleName}
			<div class="name-line middle-name">{person.middleName}</div>
		{/if}
		<div class="name-line last-name" title="{person.maidenName ? `${person.maidenName} → ` : ''}{person.lastName}">
			{#if person.maidenName}
				<span class="maiden-part">{person.maidenName} → </span>
			{/if}
			<span class="last-name-part">{person.lastName}</span>
		</div>

		{#if person.dates}
			<div class="dates-line">{person.dates}</div>
		{/if}
	</div>
</div>

<style>
	.person-card-node {
		position: absolute;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
		padding: 3px 5px;
		border-radius: 9px;
		border: 2px solid;
		cursor: pointer;
		user-select: none;
		outline: none !important;
		-webkit-tap-highlight-color: transparent;
		transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.25s ease, border-color 0.15s ease;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
	}

	.person-card-node:focus-visible {
		box-shadow: 0 0 0 3px #2563eb;
	}

	/* Themes & Gender Colors */
	.gender-male {
		background: #dae8fc;
		border-color: #6c8ebf;
		color: #1e3a8a;
	}

	.gender-female {
		background: #f8cecc;
		border-color: #b85450;
		color: #831843;
	}

	/* Unspecified or unknown gender */
	.person-card-node:not(.gender-male):not(.gender-female) {
		background: var(--color-surface);
		border-color: var(--color-border);
		color: var(--color-text);
	}

	/* Card Typography */
	.card-inner {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		line-height: 1.15;
		gap: 1px;
	}

	.name-line {
		font-size: 11px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%;
		letter-spacing: -0.01em;
	}

	.first-name {
		font-weight: 700;
		font-size: 11.5px;
	}

	.middle-name {
		font-weight: 500;
		font-size: 10px;
		opacity: 0.95;
	}

	.last-name {
		font-weight: 600;
		font-size: 10px;
	}

	.maiden-part {
		font-size: 9px;
		opacity: 0.85;
	}

	.dates-line {
		font-size: 9px;
		font-weight: 600;
		opacity: 0.8;
		margin-top: 1px;
		letter-spacing: -0.02em;
	}

	/* Hover & Elevation */
	.person-card-node:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15);
		z-index: 25;
	}

	/* Dimming when another node is selected */
	.person-card-node.dimmed {
		opacity: 0.38;
		filter: saturate(0.65);
	}

	.person-card-node.dimmed:hover {
		opacity: 1;
		filter: none;
	}

	/* Focus Halos */
	.person-card-node.selected {
		z-index: 30;
		border-color: #2563eb;
		box-shadow: 0 0 0 3px #2563eb, 0 8px 20px rgba(37, 99, 235, 0.35);
		animation: pulse-border 2.5s infinite ease-in-out;
	}

	.person-card-node.parent {
		z-index: 28;
		border-color: #0284c7;
		box-shadow: 0 0 0 2.5px #0284c7, 0 6px 16px rgba(2, 132, 199, 0.25);
	}

	.person-card-node.spouse {
		z-index: 28;
		border-color: #c026d3;
		box-shadow: 0 0 0 2.5px #c026d3, 0 6px 16px rgba(192, 38, 211, 0.25);
	}

	.person-card-node.child {
		z-index: 28;
		border-color: #059669;
		box-shadow: 0 0 0 2.5px #059669, 0 6px 16px rgba(5, 150, 105, 0.25);
	}

	.person-card-node.highlighted {
		border-color: #eab308;
		box-shadow: 0 0 0 3px #eab308, 0 8px 20px rgba(234, 179, 8, 0.35);
	}

	/* Floating Pill Role Badges */
	.role-pill {
		position: absolute;
		top: -12px;
		left: 6px;
		padding: 1px 7px;
		border-radius: 9px;
		font-size: 9.5px;
		font-weight: 700;
		letter-spacing: 0.02em;
		color: #ffffff;
		border: 1px solid rgba(255, 255, 255, 0.4);
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.22);
		pointer-events: none;
		white-space: nowrap;
	}

	.pill-selected { background: #2563eb; }
	.pill-parent { background: #0284c7; }
	.pill-spouse { background: #c026d3; }
	.pill-child { background: #059669; }

	@keyframes pulse-border {
		0%, 100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.02);
		}
	}
</style>

