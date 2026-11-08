import { describe, it, expect } from 'vitest';
import { treeLayout, createOrthogonalPath } from '$lib/controllers/treeLayout.svelte';

describe('TreeLayout Controller', () => {
	it('computes positions for all 183 persons', () => {
		expect(treeLayout.personPositions.size).toBe(183);
	});

	it('computes positions for all 84 unions', () => {
		expect(treeLayout.unionPositions.size).toBe(84);
	});

	it('generates dynamic orthogonal connection lines', () => {
		expect(treeLayout.lines.length).toBeGreaterThan(100);
	});

	it('creates orthogonal path with rounded corners', () => {
		const path = createOrthogonalPath(100, 50, 200, 150, 100, 6);
		expect(path).toContain('M 100 50');
		expect(path).toContain('Q');
		expect(path).toContain('L');
		expect(path).toContain('200 150');
	});

	it('supports programmatic node offset shifting', () => {
		const sampleId = 'OPFhqzpYQ7s1dcnbn2dE-24'; // Alik
		const initialPos = treeLayout.personPositions.get(sampleId);
		expect(initialPos).toBeDefined();

		const initialX = initialPos!.x;
		treeLayout.setNodeOffset(sampleId, 50, 20);

		const updatedPos = treeLayout.personPositions.get(sampleId);
		expect(updatedPos!.x).toBe(initialX + 50);

		// Reset
		treeLayout.resetOffsets();
		const resetPos = treeLayout.personPositions.get(sampleId);
		expect(resetPos!.x).toBe(initialX);
	});
});

