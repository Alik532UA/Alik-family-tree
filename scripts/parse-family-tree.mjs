import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

const xmlPath = resolve(rootDir, 'init-base/Генеалогічне древо-2023.02.05.drawio.xml');
const svgPath = resolve(rootDir, 'init-base/Генеалогічне древо-2023.02.05.drawio.svg');
const outJsonPath = resolve(rootDir, 'src/lib/data/familyTree.json');
const outTsPath = resolve(rootDir, 'src/lib/data/familyTree.ts');
const targetSvgPath = resolve(rootDir, 'static/svg/family-tree.svg');

// 1. Copy SVG to static/svg/family-tree.svg
copyFileSync(svgPath, targetSvgPath);
console.log('✓ Copied SVG to static/svg/family-tree.svg');

// 2. Read and parse XML
const xmlContent = readFileSync(xmlPath, 'utf8');

const cellRegex = /<mxCell\b([^>]*?)(?:\/>|>([\s\S]*?)<\/mxCell>)/g;
const attrRegex = /([a-zA-Z0-9_:]+)="([^"]*)"/g;

const cells = new Map();
let match;

while ((match = cellRegex.exec(xmlContent)) !== null) {
	const attrStr = match[1] ?? '';
	const inner = match[2] ?? '';
	const attrs = {};
	let attrMatch;
	while ((attrMatch = attrRegex.exec(attrStr)) !== null) {
		attrs[attrMatch[1]] = attrMatch[2];
	}

	const id = attrs['id'];
	if (!id) continue;

	let geometry;
	const geoMatch = /<mxGeometry\b([^>]*?)(?:\/>|>[\s\S]*?<\/mxGeometry>)/.exec(inner);
	if (geoMatch && geoMatch[1]) {
		const geoAttrs = {};
		let gMatch;
		while ((gMatch = attrRegex.exec(geoMatch[1])) !== null) {
			geoAttrs[gMatch[1]] = gMatch[2];
		}
		geometry = {
			x: parseFloat(geoAttrs['x'] || '0'),
			y: parseFloat(geoAttrs['y'] || '0'),
			width: parseFloat(geoAttrs['width'] || '0'),
			height: parseFloat(geoAttrs['height'] || '0')
		};
	}

	cells.set(id, {
		id,
		value: attrs['value'] || '',
		style: attrs['style'] || '',
		vertex: attrs['vertex'],
		edge: attrs['edge'],
		source: attrs['source'],
		target: attrs['target'],
		parent: attrs['parent'],
		geometry
	});
}

function cleanHtml(raw) {
	if (!raw) return '';
	return raw
		.replace(/<br\s*\/?>/gi, '\n')
		.replace(/&amp;nbsp;/gi, ' ')
		.replace(/&nbsp;/gi, ' ')
		.replace(/&amp;/gi, '&')
		.replace(/&lt;/gi, '<')
		.replace(/&gt;/gi, '>')
		.replace(/&quot;/gi, '"')
		.replace(/&#39;/gi, "'")
		.replace(/<[^>]+>/g, ' ')
		.replace(/[\u00A0\s]+/g, ' ')
		.trim();
}

function detectGender(firstName, middleName, lastName, maidenName) {
	const m = (middleName || '').toLowerCase();
	const l = (lastName || '').toLowerCase();
	const f = (firstName || '').toLowerCase();
	const md = (maidenName || '').toLowerCase();

	if (m.endsWith('івна') || m.endsWith('ївна') || m.endsWith('овна') || m.endsWith('евна'))
		return 'female';
	if (m.endsWith('ович') || m.endsWith('евич') || m.endsWith('ич')) return 'male';

	if (maidenName || md.length > 0) return 'female';
	if (
		l.endsWith('ова') ||
		l.endsWith('єва') ||
		l.endsWith('ська') ||
		l.endsWith('цька') ||
		l.endsWith('ина') ||
		l.endsWith('іна')
	)
		return 'female';
	if (
		l.endsWith('ов') ||
		l.endsWith('єв') ||
		l.endsWith('ський') ||
		l.endsWith('цький') ||
		l.endsWith('ин') ||
		l.endsWith('ін')
	)
		return 'male';

	const femaleNames = new Set([
		'марія',
		'ольга',
		'віра',
		'тетяна',
		'анна',
		'ганна',
		'наташа',
		'наталія',
		'олена',
		'ірина',
		'людмила',
		'галина',
		'світлана',
		'надія',
		'лаврентія'
	]);
	const maleNames = new Set([
		'алік',
		'іван',
		'олександр',
		'ігор',
		'веніамин',
		'микола',
		'петро',
		'сергій',
		'михайло',
		'василь',
		'василій',
		'дмитро',
		'валерій',
		'георгій',
		'порфирій',
		'костянтин',
		'константин',
		'володимир',
		'алентій'
	]);

	if (femaleNames.has(f)) return 'female';
	if (maleNames.has(f)) return 'male';

	return 'unknown';
}

const OFFSET_X = 10680;
const OFFSET_Y = 152;

const rawPeople = [];
const junctions = new Set();
const edges = [];

for (const cell of cells.values()) {
	if (cell.edge === '1') {
		edges.push({
			id: cell.id,
			source: cell.source,
			target: cell.target,
			label: cleanHtml(cell.value),
			style: cell.style
		});
	} else if (cell.vertex === '1') {
		const clean = cleanHtml(cell.value);
		if (!clean || clean.includes('1975 - - - -') || clean.length === 0) {
			junctions.add(cell.id);
		} else {
			rawPeople.push(cell);
		}
	}
}

function getGeneration(y) {
	if (y <= -50) return 1;
	if (y <= 200) return 2;
	if (y <= 550) return 3;
	if (y <= 750) return 4;
	if (y <= 920) return 5;
	if (y <= 1100) return 6;
	if (y <= 1400) return 7;
	return 8;
}

const personMap = new Map();

for (const raw of rawPeople) {
	const rawName = cleanHtml(raw.value);
	const lines = rawName
		.split('\n')
		.map((l) => l.trim())
		.filter(Boolean);
	const flatName = lines.join(' ').replace(/\s+/g, ' ').trim();

	// Extract dates first so they do not contaminate maiden or last names
	let dates = undefined;
	const dateRegex = /(\d{4}(?:\.\d{2}\.\d{2})?(?:\s*[-–—]\s*\d{4}(?:\.\d{2}\.\d{2})?)?)/;
	const dateMatch = flatName.match(dateRegex);
	let nameClean = flatName;
	if (dateMatch && dateMatch[1]) {
		dates = dateMatch[1].replace(/[-–—]/g, '–').replace(/\s+/g, ' ').trim();
		nameClean = flatName.replace(dateRegex, '').replace(/\s+/g, ' ').trim();
	}

	let maidenName = undefined;
	let currentName = nameClean;

	if (nameClean.includes('→')) {
		const parts = nameClean.split('→').map((p) => p.trim());
		const beforeArrow = parts[0] || '';
		const afterArrow = parts[1] || '';
		const beforeTokens = beforeArrow.split(' ').filter(Boolean);
		maidenName = beforeTokens[beforeTokens.length - 1];
		currentName = beforeTokens.slice(0, -1).join(' ') + ' ' + afterArrow;
	}

	const tokens = currentName
		.split(' ')
		.map((t) => t.trim())
		.filter(Boolean);
	let firstName = '';
	let middleName = '';
	let lastName = '';

	if (tokens.length >= 3) {
		firstName = tokens[0] || '';
		middleName = tokens[1] || '';
		lastName = tokens.slice(2).join(' ') || '';
	} else if (tokens.length === 2) {
		// Could be "First Last" or "First Patronymic" or "Title Relation"
		if (
			tokens[1]?.endsWith('ович') ||
			tokens[1]?.endsWith('івна') ||
			tokens[1]?.endsWith('евна') ||
			tokens[1]?.endsWith('ївна')
		) {
			firstName = tokens[0] || '';
			middleName = tokens[1] || '';
		} else {
			firstName = tokens[0] || '';
			lastName = tokens[1] || '';
		}
	} else if (tokens.length === 1) {
		// Single name: if it's "син" or "донька" or first name
		const single = tokens[0] || '';
		if (single.toLowerCase() === 'син' || single.toLowerCase() === 'донька') {
			firstName = single;
		} else {
			firstName = single;
		}
	}

	let branch = 'Інші гілки';
	const fullCheck = (lastName + ' ' + (maidenName || '') + ' ' + currentName).toLowerCase();
	if (fullCheck.includes('запольн')) branch = 'Запольнови';
	else if (fullCheck.includes('булат')) branch = 'Булати';
	else if (fullCheck.includes('соколовськ')) branch = 'Соколовські';
	else if (fullCheck.includes('кульчиц')) branch = 'Кульчицькі';
	else if (fullCheck.includes('миндру') || fullCheck.includes('mîndru')) branch = 'Миндру';
	else if (fullCheck.includes('трубін')) branch = 'Трубіни';
	else if (fullCheck.includes('сокур')) branch = 'Сокури';
	else if (fullCheck.includes('усов')) branch = 'Усови';

	const gx = raw.geometry?.x ?? 0;
	const gy = raw.geometry?.y ?? 0;
	const gw = raw.geometry?.width ?? 120;
	const gh = raw.geometry?.height ?? 60;

	const gen = getGeneration(gy);
	const isLiving = gen >= 7;
	const gender = detectGender(firstName, middleName, lastName, maidenName);

	personMap.set(raw.id, {
		id: raw.id,
		name: currentName,
		fullName: flatName,
		firstName,
		middleName,
		lastName,
		maidenName,
		dates,
		gender,
		branch,
		generation: gen,
		isLiving,
		xmlCoords: { x: gx, y: gy, width: gw, height: gh },
		svgCoords: { x: gx + OFFSET_X, y: gy + OFFSET_Y, width: gw, height: gh },
		parents: [],
		spouses: [],
		children: [],
		siblings: []
	});
}

// Reconstruct family graph from junctions
const unions = [];

for (const juncId of junctions) {
	const juncCell = cells.get(juncId);
	const incoming = edges
		.filter((e) => e.target === juncId && personMap.has(e.source))
		.map((e) => e.source);
	const outgoing = edges
		.filter((e) => e.source === juncId && personMap.has(e.target))
		.map((e) => e.target);

	// Spouses
	if (incoming.length >= 2) {
		for (let i = 0; i < incoming.length; i++) {
			for (let j = 0; j < incoming.length; j++) {
				if (i !== j) {
					const p1 = personMap.get(incoming[i]);
					const spId = incoming[j];
					if (p1 && spId && !p1.spouses.includes(spId)) {
						p1.spouses.push(spId);
					}
				}
			}
		}
	}

	// Parents and Children
	for (const childId of outgoing) {
		const child = personMap.get(childId);
		if (!child) continue;

		for (const parentId of incoming) {
			const parent = personMap.get(parentId);
			if (parent) {
				if (!child.parents.includes(parentId)) child.parents.push(parentId);
				if (!parent.children.includes(childId)) parent.children.push(childId);
			}
		}

		// Siblings
		for (const sibId of outgoing) {
			if (sibId !== childId && !child.siblings.includes(sibId)) {
				child.siblings.push(sibId);
			}
		}
	}

	// If this junction has geometry and connects people, register as union
	if (juncCell && juncCell.geometry && (incoming.length > 0 || outgoing.length > 0)) {
		const jx = juncCell.geometry.x ?? 0;
		const jy = juncCell.geometry.y ?? 0;
		const jw = juncCell.geometry.width ?? 50;
		const jh = juncCell.geometry.height ?? 30;

		unions.push({
			id: juncId,
			spouses: incoming,
			children: outgoing,
			spouseNames: incoming.map((id) => personMap.get(id)?.name).filter(Boolean),
			childrenNames: outgoing.map((id) => personMap.get(id)?.name).filter(Boolean),
			svgCoords: { x: jx + OFFSET_X, y: jy + OFFSET_Y, width: jw, height: jh }
		});
	}
}

const people = Array.from(personMap.values());
people.sort((a, b) => a.generation - b.generation || a.name.localeCompare(b.name, 'uk'));

const branchStats = {};
const generationStats = {};
const genderStats = { male: 0, female: 0, unknown: 0 };

for (const p of people) {
	branchStats[p.branch] = (branchStats[p.branch] || 0) + 1;
	generationStats[p.generation] = (generationStats[p.generation] || 0) + 1;
	genderStats[p.gender] = (genderStats[p.gender] || 0) + 1;
}

const exportData = {
	meta: {
		version: '2023.02.05',
		updatedAt: new Date().toISOString(),
		totalPeople: people.length,
		totalGenerations: 8,
		canvasSize: {
			width: 21360,
			height: 2143
		},
		branchStats,
		generationStats,
		genderStats
	},
	people,
	unions
};

writeFileSync(outJsonPath, JSON.stringify(exportData, null, 2), 'utf8');
console.log(`✓ Generated ${outJsonPath} with ${people.length} people and ${unions.length} unions.`);

const tsContent = `// Auto-generated from init-base/Генеалогічне древо-2023.02.05
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
	dates?: string;
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
`;

writeFileSync(outTsPath, tsContent, 'utf8');
console.log(`✓ Generated ${outTsPath}`);
