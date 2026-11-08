import { describe, it, expect } from 'vitest';
import { familyTreeData, peopleById } from '$lib/data/familyTree';

describe('Family Tree Dataset Integrity', () => {
	it('contains 183 parsed persons from the archive', () => {
		expect(familyTreeData.people.length).toBe(183);
		expect(familyTreeData.meta.totalPeople).toBe(183);
	});

	it('spans 8 generations', () => {
		expect(familyTreeData.meta.totalGenerations).toBe(8);
		const gens = new Set(familyTreeData.people.map((p) => p.generation));
		expect(gens.size).toBe(8);
	});

	it('contains Alik Zapolnov in generation 8 with verified parents', () => {
		const alik = peopleById.get('OPFhqzpYQ7s1dcnbn2dE-24');
		expect(alik).toBeDefined();
		expect(alik?.name).toContain('Алік');
		expect(alik?.generation).toBe(8);
		expect(alik?.parents.length).toBe(2);

		const parentNames = alik?.parents.map((pId) => peopleById.get(pId)?.name);
		expect(parentNames).toContain('Ігор Веніаминович Запольнов');
		expect(parentNames).toContain('Ольга Іванівна Запольнова');
	});

	it('contains root ancestor Alentiy Zapolnov in generation 1', () => {
		const alentiy = familyTreeData.people.find((p) => p.generation === 1);
		expect(alentiy).toBeDefined();
		expect(alentiy?.name).toContain('Алентій Запольнов');
	});
});

