// src/lib/controllers/treeLayout.svelte.ts — Поколінно-кластерний рушій розміщення та авто-відступів
import { familyTreeData, peopleById, type Person } from '$lib/data/familyTree';

export interface CardRect {
	id: string;
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface TreeLine {
	id: string;
	unionId: string;
	sourceId: string;
	targetId: string;
	type: 'spouse' | 'child';
	pathD: string;
}

// Generate smooth rounded orthogonal Manhattan paths
export function createOrthogonalPath(
	x1: number,
	y1: number,
	x2: number,
	y2: number,
	midY: number,
	radius = 8
): string {
	// If perfectly vertical
	if (Math.abs(x1 - x2) < 2) {
		return `M ${x1} ${y1} L ${x2} ${y2}`;
	}

	// If perfectly horizontal
	if (Math.abs(y1 - y2) < 2) {
		return `M ${x1} ${y1} L ${x2} ${y2}`;
	}

	const r = Math.min(radius, Math.abs(x1 - x2) / 2, Math.abs(y1 - midY) / 2, Math.abs(y2 - midY) / 2);
	const signX = x2 > x1 ? 1 : -1;
	const signY1 = midY > y1 ? 1 : -1;
	const signY2 = y2 > midY ? 1 : -1;

	// Segment 1: from (x1, y1) down to (x1, midY - r*signY1)
	// Corner 1: quad curve to (x1 + r*signX, midY)
	// Segment 2: horizontal to (x2 - r*signX, midY)
	// Corner 2: quad curve to (x2, midY + r*signY2)
	// Segment 3: to (x2, y2)
	return [
		`M ${x1} ${y1}`,
		`L ${x1} ${midY - r * signY1}`,
		`Q ${x1} ${midY} ${x1 + r * signX} ${midY}`,
		`L ${x2 - r * signX} ${midY}`,
		`Q ${x2} ${midY} ${x2} ${midY + r * signY2}`,
		`L ${x2} ${y2}`
	].join(' ');
}

export class TreeLayoutController {
	readonly CARD_WIDTH = 132;
	readonly CARD_HEIGHT = 66;
	readonly UNION_WIDTH = 50;
	readonly UNION_HEIGHT = 28;

	// Canvas bounds
	canvasWidth = $state<number>(21500);
	canvasHeight = $state<number>(2300);

	// Custom reactive programmatic offsets for each node (allows moving via code)
	offsets = $state<Record<string, { dx: number; dy: number }>>({});

	// Generational Y-center lines
	readonly generationY: Record<number, number> = {
		1: 2,
		2: 247,
		3: 577,
		4: 836,
		5: 1003,
		6: 1175,
		7: 1369,
		8: 2077
	};

	// 1975 dashed timeline line Y coordinate
	readonly timeline1975Y = 992;

	// Dynamic reactive positions of all people
	personPositions = $derived.by<Map<string, CardRect>>(() => {
		const map = new Map<string, CardRect>();
		for (const person of familyTreeData.people) {
			const offset = this.offsets[person.id] || { dx: 0, dy: 0 };
			map.set(person.id, {
				id: person.id,
				x: person.svgCoords.x + offset.dx,
				y: person.svgCoords.y + offset.dy,
				width: this.CARD_WIDTH,
				height: this.CARD_HEIGHT
			});
		}
		return map;
	});

	// Dynamic reactive positions of all unions
	unionPositions = $derived.by<Map<string, CardRect>>(() => {
		const map = new Map<string, CardRect>();
		for (const union of familyTreeData.unions || []) {
			const offset = this.offsets[union.id] || { dx: 0, dy: 0 };
			map.set(union.id, {
				id: union.id,
				x: union.svgCoords.x + offset.dx,
				y: union.svgCoords.y + offset.dy,
				width: this.UNION_WIDTH,
				height: this.UNION_HEIGHT
			});
		}
		return map;
	});

	// Dynamic reactive orthogonal connection lines
	lines = $derived.by<TreeLine[]>(() => {
		const result: TreeLine[] = [];
		const peopleMap = this.personPositions;
		const unionsMap = this.unionPositions;

		for (const union of familyTreeData.unions || []) {
			const uPos = unionsMap.get(union.id);
			if (!uPos) continue;

			const uCenterX = uPos.x + uPos.width / 2;
			const uCenterY = uPos.y + uPos.height / 2;
			const uTopY = uPos.y;
			const uBottomY = uPos.y + uPos.height;

			// 1. Lines from Spouses (Parents) to Union Pill
			for (const spouseId of union.spouses) {
				const sPos = peopleMap.get(spouseId);
				if (!sPos) continue;

				const sCenterX = sPos.x + sPos.width / 2;
				const sBottomY = sPos.y + sPos.height;

				// If spouse is above union pill
				if (sBottomY <= uCenterY + 4) {
					const midY = (sBottomY + uTopY) / 2;
					const pathD = createOrthogonalPath(sCenterX, sBottomY, uCenterX, uTopY, midY, 6);
					result.push({
						id: `line-${spouseId}-${union.id}`,
						unionId: union.id,
						sourceId: spouseId,
						targetId: union.id,
						type: 'spouse',
						pathD
					});
				} else {
					// Spouse is approximately side-by-side with union pill
					const sY = sPos.y + sPos.height / 2;
					if (sPos.x < uPos.x) {
						// Spouse is on left
						const pathD = `M ${sPos.x + sPos.width} ${sY} L ${uPos.x} ${uCenterY}`;
						result.push({
							id: `line-${spouseId}-${union.id}`,
							unionId: union.id,
							sourceId: spouseId,
							targetId: union.id,
							type: 'spouse',
							pathD
						});
					} else {
						// Spouse is on right
						const pathD = `M ${sPos.x} ${sY} L ${uPos.x + uPos.width} ${uCenterY}`;
						result.push({
							id: `line-${spouseId}-${union.id}`,
							unionId: union.id,
							sourceId: spouseId,
							targetId: union.id,
							type: 'spouse',
							pathD
						});
					}
				}
			}

			// 2. Lines from Union Pill to Children
			if (union.children.length > 0) {
				// Intermediate bus Y below union pill
				const childrenPositions = union.children
					.map((cId) => peopleMap.get(cId))
					.filter((c): c is CardRect => c !== undefined);

				if (childrenPositions.length > 0) {
					// Common intermediate horizontal bus
					const minChildY = Math.min(...childrenPositions.map((c) => c.y));
					const busY = Math.min(uBottomY + 22, (uBottomY + minChildY) / 2);

					for (const cPos of childrenPositions) {
						const cCenterX = cPos.x + cPos.width / 2;
						const cTopY = cPos.y;

						const pathD = createOrthogonalPath(uCenterX, uBottomY, cCenterX, cTopY, busY, 6);
						result.push({
							id: `line-${union.id}-${cPos.id}`,
							unionId: union.id,
							sourceId: union.id,
							targetId: cPos.id,
							type: 'child',
							pathD
						});
					}
				}
			}
		}

		return result;
	});

	// Programmatic mutation API (allows easily moving nodes in code)
	setNodeOffset(id: string, dx: number, dy: number): void {
		this.offsets[id] = { dx, dy };
	}

	shiftBranch(branchName: string, dx: number, dy: number): void {
		for (const person of familyTreeData.people) {
			if (person.branch.toLowerCase().includes(branchName.toLowerCase())) {
				const current = this.offsets[person.id] || { dx: 0, dy: 0 };
				this.offsets[person.id] = { dx: current.dx + dx, dy: current.dy + dy };
			}
		}
	}

	resetOffsets(): void {
		this.offsets = {};
	}

	// Auto-space siblings under a union
	autoSpaceSiblings(unionId: string, gap = 20): void {
		const union = (familyTreeData.unions || []).find((u) => u.id === unionId);
		if (!union || union.children.length <= 1) return;

		const children = union.children
			.map((id) => peopleById.get(id))
			.filter((p): p is Person => p !== undefined)
			.sort((a, b) => a.svgCoords.x - b.svgCoords.x);

		if (children.length === 0) return;

		const totalWidth = children.length * this.CARD_WIDTH + (children.length - 1) * gap;
		const uPos = this.unionPositions.get(unionId);
		const uCenterX = uPos ? uPos.x + uPos.width / 2 : children[0]!.svgCoords.x;
		const startX = uCenterX - totalWidth / 2;

		children.forEach((child, idx) => {
			const targetX = startX + idx * (this.CARD_WIDTH + gap);
			const dx = targetX - child.svgCoords.x;
			this.setNodeOffset(child.id, dx, 0);
		});
	}
}

export const treeLayout = new TreeLayoutController();

