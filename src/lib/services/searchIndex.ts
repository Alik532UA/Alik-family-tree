import type { Person } from '$lib/data/familyTree';

export interface IndexedPerson {
	id: string;
	name: string;
	normalizedName: string;
	birthYear?: number;
	deathYear?: number;
	gender?: string;
	keywords: string[];
}

/**
 * Fast in-memory search index for high-scale genealogical data.
 * Scales efficiently to 50,000+ records without DOM or UI blocking.
 */
export class FastPersonIndex {
	private records = new Map<string, IndexedPerson>();
	private tokenIndex = new Map<string, Set<string>>();

	constructor(members: Person[] = []) {
		if (members.length > 0) {
			this.build(members);
		}
	}

	build(members: Person[]): void {
		this.records.clear();
		this.tokenIndex.clear();

		for (const m of members) {
			const fullName =
				`${m.firstName ?? ''} ${m.middleName ?? ''} ${m.lastName ?? ''} ${m.maidenName ?? ''}`.trim();
			const normalized = fullName
				.toLowerCase()
				.normalize('NFD')
				.replace(/[\u0300-\u036f]/g, '');
			const tokens = normalized.split(/\s+/).filter(Boolean);

			// Extract birth/death years if present in dates
			let birthYear: number | undefined;
			let deathYear: number | undefined;
			if (m.dates) {
				const years = m.dates.match(/\b(1[6-9]\d{2}|20\d{2})\b/g);
				if (years && years[0]) birthYear = parseInt(years[0], 10);
				if (years && years[1]) deathYear = parseInt(years[1], 10);
			}

			const indexed: IndexedPerson = {
				id: m.id,
				name: fullName,
				normalizedName: normalized,
				birthYear,
				deathYear,
				gender: m.gender,
				keywords: tokens
			};

			this.records.set(m.id, indexed);

			for (const token of tokens) {
				if (!this.tokenIndex.has(token)) {
					this.tokenIndex.set(token, new Set());
				}
				this.tokenIndex.get(token)!.add(m.id);
			}
		}
	}

	search(query: string, limit = 20): IndexedPerson[] {
		const cleanQuery = query
			.trim()
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '');
		if (!cleanQuery) return [];

		const queryTokens = cleanQuery.split(/\s+/).filter(Boolean);
		if (queryTokens.length === 0) return [];

		const matchingIdSets = queryTokens.map((qToken) => {
			const matched = new Set<string>();
			for (const [indexedToken, ids] of this.tokenIndex.entries()) {
				if (indexedToken.includes(qToken)) {
					for (const id of ids) matched.add(id);
				}
			}
			return matched;
		});

		// Intersection of matches across all tokens
		const firstSet = matchingIdSets[0];
		if (!firstSet) return [];

		const intersectedIds: string[] = [];
		for (const id of firstSet) {
			if (matchingIdSets.every((set) => set.has(id))) {
				intersectedIds.push(id);
				if (intersectedIds.length >= limit) break;
			}
		}

		return intersectedIds
			.map((id) => this.records.get(id))
			.filter((p): p is IndexedPerson => p !== undefined);
	}

	get totalCount(): number {
		return this.records.size;
	}
}
