import { describe, it, expect } from 'vitest';
import { translations, getTranslations } from '$lib/i18n/translations';

describe('i18n & Localization Invariants (I18N-v10)', () => {
	it('provides valid dictionaries for both uk and en locales', () => {
		expect(translations.uk).toBeDefined();
		expect(translations.en).toBeDefined();
	});

	it('guarantees complete parity of keys between uk and en dictionaries', () => {
		const ukKeys = Object.keys(translations.uk).sort();
		const enKeys = Object.keys(translations.en).sort();
		expect(ukKeys).toEqual(enKeys);

		const ukThemeKeys = Object.keys(translations.uk.theme).sort();
		const enThemeKeys = Object.keys(translations.en.theme).sort();
		expect(ukThemeKeys).toEqual(enThemeKeys);
	});

	it('safely falls back to uk if an unsupported locale is requested', () => {
		// @ts-expect-error Testing invalid locale fallback
		const result = getTranslations('fr');
		expect(result.appTitle).toBe(translations.uk.appTitle);
	});

	it('returns english dictionary when en is requested', () => {
		const result = getTranslations('en');
		expect(result.appTitle).toBe('Alik Family Genealogical Tree');
		expect(result.theme.sepia).toBe('Sepia');
	});
});
