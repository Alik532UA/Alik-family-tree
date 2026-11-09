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
});
