import { describe, it, expect } from 'vitest';
import { THEMES, SCHEME, isTheme, colorSchemeFor } from '$lib/controllers/colorScheme';

describe('Theme Controller Constants', () => {
	it('defines 5 product themes including sepia, meadow, sky', () => {
		expect(THEMES).toContain('light');
		expect(THEMES).toContain('dark');
		expect(THEMES).toContain('sepia');
		expect(THEMES).toContain('meadow');
		expect(THEMES).toContain('sky');
	});

	it('maps light-derived themes to only light', () => {
		expect(SCHEME.light).toBe('only light');
		expect(SCHEME.sepia).toBe('only light');
		expect(SCHEME.meadow).toBe('only light');
		expect(SCHEME.sky).toBe('only light');
		expect(SCHEME.dark).toBe('dark');
	});

	it('validates theme strings', () => {
		expect(isTheme('light')).toBe(true);
		expect(isTheme('invalid')).toBe(false);
	});

	it('returns correct colorScheme string', () => {
		expect(colorSchemeFor(null)).toBe('light dark');
		expect(colorSchemeFor('dark')).toBe('dark');
		expect(colorSchemeFor('sepia')).toBe('only light');
	});
});

