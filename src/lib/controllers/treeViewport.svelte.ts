// src/lib/controllers/treeViewport.svelte.ts
import { browser } from '$app/environment';
import { peopleById, type Person } from '$lib/data/familyTree';

export class TreeViewportController {
	canvasWidth = 21360;
	canvasHeight = 2143;

	scale = $state<number>(0.65);
	panX = $state<number>(0);
	panY = $state<number>(0);

	containerWidth = $state<number>(1200);
	containerHeight = $state<number>(800);

	selectedPerson = $state<Person | null>(null);
	highlightedIds = $state<Set<string>>(new Set());
	activeGeneration = $state<number | null>(null);
	activeBranch = $state<string | null>(null);

	isDragging = $state<boolean>(false);
	private dragStartX = 0;
	private dragStartY = 0;
	private initialPanX = 0;
	private initialPanY = 0;

	constructor() {
		// Default center near modern/key generations (around Alik Запольнов at svgX ~ 7550, svgY ~ 2077 or root at 10680)
		if (browser) {
			const alik = peopleById.get('OPFhqzpYQ7s1dcnbn2dE-24');
			if (alik) {
				this.selectedPerson = alik;
			}
		}
	}

	initContainer(width: number, height: number): void {
		this.containerWidth = width;
		this.containerHeight = height;
		if (this.selectedPerson) {
			this.centerOnPerson(this.selectedPerson.id, false);
		} else {
			this.fitToScreen();
		}
	}

	selectPerson(id: string | null): void {
		if (!id) {
			this.selectedPerson = null;
			return;
		}
		const person = peopleById.get(id);
		if (person) {
			this.selectedPerson = person;
			this.centerOnPerson(id, true);
		}
	}

	centerOnPerson(id: string, smooth = true): void {
		const person = peopleById.get(id);
		if (!person) return;

		const targetScale = Math.max(this.scale, 0.85);
		const targetX = this.containerWidth / 2 - (person.svgCoords.x + person.svgCoords.width / 2) * targetScale;
		const targetY = this.containerHeight / 2 - (person.svgCoords.y + person.svgCoords.height / 2) * targetScale;

		this.scale = targetScale;
		if (smooth && browser) {
			this.panX = targetX;
			this.panY = targetY;
		} else {
			this.panX = targetX;
			this.panY = targetY;
		}
	}

	centerOnCoords(canvasX: number, canvasY: number): void {
		this.panX = this.containerWidth / 2 - canvasX * this.scale;
		this.panY = this.containerHeight / 2 - canvasY * this.scale;
	}

	zoomAt(screenX: number, screenY: number, delta: number): void {
		const oldScale = this.scale;
		const factor = delta > 0 ? 0.85 : 1.18;
		const newScale = Math.min(Math.max(oldScale * factor, 0.08), 3.0);

		// Zoom towards cursor point
		const canvasX = (screenX - this.panX) / oldScale;
		const canvasY = (screenY - this.panY) / oldScale;

		this.scale = newScale;
		this.panX = screenX - canvasX * newScale;
		this.panY = screenY - canvasY * newScale;
	}

	zoomIn(): void {
		this.zoomAt(this.containerWidth / 2, this.containerHeight / 2, -1);
	}

	zoomOut(): void {
		this.zoomAt(this.containerWidth / 2, this.containerHeight / 2, 1);
	}

	resetZoom(): void {
		this.scale = 1.0;
		if (this.selectedPerson) {
			this.centerOnPerson(this.selectedPerson.id);
		} else {
			this.panX = (this.containerWidth - this.canvasWidth * this.scale) / 2;
			this.panY = 100;
		}
	}

	fitToScreen(): void {
		if (this.containerWidth <= 0 || this.containerHeight <= 0) return;
		const scaleX = (this.containerWidth - 60) / this.canvasWidth;
		const scaleY = (this.containerHeight - 120) / this.canvasHeight;
		this.scale = Math.max(Math.min(scaleX, scaleY), 0.08);
		this.panX = (this.containerWidth - this.canvasWidth * this.scale) / 2;
		this.panY = (this.containerHeight - this.canvasHeight * this.scale) / 2;
	}

	startDrag(clientX: number, clientY: number): void {
		this.isDragging = true;
		this.dragStartX = clientX;
		this.dragStartY = clientY;
		this.initialPanX = this.panX;
		this.initialPanY = this.panY;
	}

	drag(clientX: number, clientY: number): void {
		if (!this.isDragging) return;
		const dx = clientX - this.dragStartX;
		const dy = clientY - this.dragStartY;
		this.panX = this.initialPanX + dx;
		this.panY = this.initialPanY + dy;
	}

	endDrag(): void {
		this.isDragging = false;
	}
}

export const treeViewport = new TreeViewportController();

