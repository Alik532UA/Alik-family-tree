// Auto-generated from init-base/Генеалогічне древо-2023.02.05
export interface SvgCoords {
	x: number;
	y: number;
	width: number;
	height: number;
}

export type Gender = 'male' | 'female' | 'unknown';

export interface Person {
	id: string;
	name: string;
	fullName: string;
	firstName: string;
	middleName: string;
	lastName: string;
	maidenName?: string;
	gender: Gender;
	branch: string;
	generation: number;
	isLiving: boolean;
	xmlCoords: SvgCoords;
	svgCoords: SvgCoords;
	parents: string[];
	spouses: string[];
	children: string[];
	siblings: string[];
}

export interface FamilyUnion {
	id: string;
	spouses: string[];
	children: string[];
	spouseNames: string[];
	childrenNames: string[];
	svgCoords: SvgCoords;
}

export interface FamilyTreeMeta {
	version: string;
	updatedAt: string;
	totalPeople: number;
	totalGenerations: number;
	canvasSize: {
		width: number;
		height: number;
	};
	branchStats: Record<string, number>;
	generationStats: Record<number, number>;
	genderStats: Record<Gender, number>;
}

export interface FamilyTreeData {
	meta: FamilyTreeMeta;
	people: Person[];
	unions: FamilyUnion[];
}

import rawData from './familyTree.json';

export const familyTreeData = rawData as FamilyTreeData;
export const peopleById = new Map<string, Person>(
	familyTreeData.people.map((p) => [p.id, p])
);
export const unionsById = new Map<string, FamilyUnion>(
	(familyTreeData.unions || []).map((u) => [u.id, u])
);
