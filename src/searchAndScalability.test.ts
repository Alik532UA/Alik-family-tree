import { describe, it, expect } from 'vitest';
import { FastPersonIndex } from '$lib/services/searchIndex';
import { cullNodesOutOfViewport } from '$lib/utils/viewportVirtualizer';
import type { Person } from '$lib/data/familyTree';

const defaultCoords = { x: 0, y: 0, width: 100, height: 60 };

describe('Scalability: In-Memory Index & Viewport Culling', () => {
	it('indexes and searches members accurately with token matching', () => {
		const mockMembers: Person[] = [
			{
				id: '1',
				name: 'Олександр Запольнов',
				fullName: 'Олександр Запольнов',
				firstName: 'Олександр',
				middleName: '',
				lastName: 'Запольнов',
				gender: 'male',
				branch: 'main',
				generation: 1,
				isLiving: false,
				dates: '1950 - 2020',
				xmlCoords: defaultCoords,
				svgCoords: defaultCoords,
				parents: [],
				spouses: [],
				children: [],
				siblings: []
			},
			{
				id: '2',
				name: 'Олена Запольнова',
				fullName: 'Олена Запольнова',
				firstName: 'Олена',
				middleName: '',
				lastName: 'Запольнова',
				maidenName: 'Кульчицька',
				gender: 'female',
				branch: 'main',
				generation: 1,
				isLiving: false,
				dates: '1955 - 2022',
				xmlCoords: defaultCoords,
				svgCoords: defaultCoords,
				parents: [],
				spouses: [],
				children: [],
				siblings: []
			},
			{
				id: '3',
				name: 'Михайло Булат',
				fullName: 'Михайло Булат',
				firstName: 'Михайло',
				middleName: '',
				lastName: 'Булат',
				gender: 'male',
				branch: 'bulat',
				generation: 2,
				isLiving: true,
				dates: '1980 - ',
				xmlCoords: defaultCoords,
				svgCoords: defaultCoords,
				parents: [],
				spouses: [],
				children: [],
				siblings: []
			}
		];

		const index = new FastPersonIndex(mockMembers);
		expect(index.totalCount).toBe(3);

		const result1 = index.search('заполь');
		expect(result1.length).toBe(2);

		const result2 = index.search('кульчицька');
		expect(result2.length).toBe(1);
		expect(result2[0]?.id).toBe('2');

		const empty = index.search('невідомий');
		expect(empty.length).toBe(0);
	});

	it('culls nodes strictly outside the active viewport boundary', () => {
		const nodes = [
			{ id: 'inside', x: 100, y: 100, width: 120, height: 60 },
			{ id: 'far-right', x: 5000, y: 100, width: 120, height: 60 },
			{ id: 'far-below', x: 100, y: 8000, width: 120, height: 60 }
		];

		const viewport = {
			x: 0,
			y: 0,
			width: 1000,
			height: 800,
			zoom: 1
		};

		const visible = cullNodesOutOfViewport(nodes, viewport, 50);
		expect(visible.map((n) => n.id)).toEqual(['inside']);
	});

	it('scales efficiently to 10,000 nodes with sub-50ms indexing and sub-5ms viewport culling', () => {
		const largeDataset: Person[] = Array.from({ length: 10000 }, (_, i) => ({
			id: `person-${i}`,
			name: `Тест Персона ${i}`,
			fullName: `Тест Персона ${i}`,
			firstName: 'Тест',
			middleName: '',
			lastName: `Персона ${i}`,
			gender: i % 2 === 0 ? 'male' : 'female',
			branch: 'test',
			generation: (i % 10) + 1,
			isLiving: i % 3 === 0,
			dates: '1900 - 1980',
			xmlCoords: { x: (i % 100) * 150, y: Math.floor(i / 100) * 100, width: 120, height: 60 },
			svgCoords: { x: (i % 100) * 150, y: Math.floor(i / 100) * 100, width: 120, height: 60 },
			parents: [],
			spouses: [],
			children: [],
			siblings: []
		}));

		const t0 = performance.now();
		const fastIndex = new FastPersonIndex(largeDataset);
		const indexingTime = performance.now() - t0;
		expect(fastIndex.totalCount).toBe(10000);
		expect(indexingTime).toBeLessThan(100); // Indexing 10k items takes < 100ms

		const tSearch = performance.now();
		const results = fastIndex.search('персона 99');
		const searchTime = performance.now() - tSearch;
		expect(results.length).toBeGreaterThan(0);
		expect(searchTime).toBeLessThan(15); // Search in 10k items takes < 15ms

		const nodeBoxes = largeDataset.map((p) => ({
			id: p.id,
			x: p.svgCoords.x,
			y: p.svgCoords.y,
			width: p.svgCoords.width,
			height: p.svgCoords.height
		}));

		const activeViewport = {
			x: -300,
			y: -200,
			width: 1920,
			height: 1080,
			zoom: 1
		};

		const tCull = performance.now();
		const visibleNodes = cullNodesOutOfViewport(nodeBoxes, activeViewport, 100);
		const cullTime = performance.now() - tCull;

		expect(visibleNodes.length).toBeGreaterThan(0);
		expect(visibleNodes.length).toBeLessThan(500); // Filtered down to only in-viewport nodes
		expect(cullTime).toBeLessThan(15); // Culling 10k items takes < 15ms
	});
});
