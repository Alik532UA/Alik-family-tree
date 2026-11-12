import { describe, it, expect } from 'vitest';
import { TreeViewportController } from '$lib/controllers/treeViewport.svelte';

describe('Tree Viewport & Navigation Scalability', () => {
	it('initializes with default canvas dimensions and scale', () => {
		const controller = new TreeViewportController();
		expect(controller.canvasWidth).toBe(21360);
		expect(controller.canvasHeight).toBe(2143);
		expect(controller.scale).toBe(0.65);
	});

	it('computes visible bounds correctly based on pan and zoom', () => {
		const controller = new TreeViewportController();
		controller.scale = 1.0;
		controller.panX = -1000;
		controller.panY = -500;
		controller.containerWidth = 1000;
		controller.containerHeight = 800;

		const bounds = controller.visibleBounds;
		expect(bounds.minX).toBe(1000);
		expect(bounds.minY).toBe(500);
		expect(bounds.maxX).toBe(2000);
		expect(bounds.maxY).toBe(1300);
	});

	it('accurately identifies cards inside and outside visible viewport', () => {
		const controller = new TreeViewportController();
		controller.scale = 1.0;
		controller.panX = 0;
		controller.panY = 0;
		controller.containerWidth = 1000;
		controller.containerHeight = 800;

		// Inside viewport
		expect(controller.isCardInViewport(100, 100, 200, 100, 0)).toBe(true);

		// Outside viewport (far right)
		expect(controller.isCardInViewport(5000, 100, 200, 100, 0)).toBe(false);

		// Outside viewport (far below)
		expect(controller.isCardInViewport(100, 5000, 200, 100, 0)).toBe(false);

		// With buffer margin, nearby outside nodes become visible
		expect(controller.isCardInViewport(1200, 100, 200, 100, 300)).toBe(true);
	});

	it('handles zoom levels with safe boundaries', () => {
		const controller = new TreeViewportController();
		const initialScale = controller.scale;
		controller.zoomIn();
		expect(controller.scale).toBeGreaterThan(initialScale);

		controller.resetZoom();
		expect(controller.scale).toBe(1.0);
	});
});
