import { describe, it, expect } from 'vitest';
import { treeLayout, createOrthogonalPath, createCornerPath } from '$lib/controllers/treeLayout.svelte';

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

	it('creates corner path with single smooth 90-degree curve', () => {
		const path = createCornerPath(100, 50, 200, 150, 8);
		expect(path).toContain('M 100 50');
		expect(path).toContain('Q');
		expect(path).toContain('L');
		expect(path).toContain('200 150');
	});

	it('produces strictly horizontal connection lines for side-by-side spouses', () => {
		// Union 88: Oleksandr Kulchytskyi + Tetyana Sokur
		const lineOleksandr = treeLayout.lines.find(
			(l) => l.sourceId === 'OPFhqzpYQ7s1dcnbn2dE-87' && l.unionId === 'OPFhqzpYQ7s1dcnbn2dE-88'
		);
		const lineTetyana = treeLayout.lines.find(
			(l) => l.sourceId === 'OPFhqzpYQ7s1dcnbn2dE-21' && l.unionId === 'OPFhqzpYQ7s1dcnbn2dE-88'
		);

		expect(lineOleksandr).toBeDefined();
		expect(lineTetyana).toBeDefined();

		// Check that the line is strictly horizontal (Y start === Y end, e.g. M x 1000 L x 1000)
		const partsO = lineOleksandr!.pathD.match(/M\s+[\d.]+\s+([\d.]+)\s+L\s+[\d.]+\s+([\d.]+)/);
		expect(partsO).not.toBeNull();
		expect(partsO![1]).toBe(partsO![2]); // strictly horizontal

		const partsT = lineTetyana!.pathD.match(/M\s+[\d.]+\s+([\d.]+)\s+L\s+[\d.]+\s+([\d.]+)/);
		expect(partsT).not.toBeNull();
		expect(partsT![1]).toBe(partsT![2]); // strictly horizontal
	});

	it('routes Mariia Sokolovska to Union 32 from card right edge without intersecting bottom border', () => {
		const lineMaria = treeLayout.lines.find(
			(l) => l.sourceId === 'OPFhqzpYQ7s1dcnbn2dE-4' && l.unionId === 'OPFhqzpYQ7s1dcnbn2dE-32'
		);
		expect(lineMaria).toBeDefined();
		// Must start from right edge (x >= 11130) and y around 890 (not bottom border 923)
		const match = lineMaria!.pathD.match(/M\s+([\d.]+)\s+([\d.]+)/);
		expect(match).not.toBeNull();
		const startX = parseFloat(match![1]!);
		const startY = parseFloat(match![2]!);
		expect(startX).toBeGreaterThanOrEqual(11130);
		expect(startY).toBeLessThan(920); // strictly above bottom border
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

