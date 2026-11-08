// src/lib/controllers/colorScheme.ts — THEME-SWITCHER § 2
export const THEMES = ['light', 'dark', 'sepia', 'meadow', 'sky'] as const;
export type Theme = (typeof THEMES)[number];

export const SCHEME: Readonly<Record<Theme, 'only light' | 'dark'>> = {
	light: 'only light',
	dark: 'dark',
	sepia: 'only light',
	meadow: 'only light',
	sky: 'only light'
};

export const THEME_KEY = 'theme';

export const isTheme = (value: unknown): value is Theme =>
	(THEMES as readonly unknown[]).includes(value as Theme);

export function colorSchemeFor(choice: Theme | null): string {
	return choice ? SCHEME[choice] : 'light dark';
}

export function themeFirstFrame(storagePrefix: string): string {
	return JSON.stringify({ key: storagePrefix + THEME_KEY, scheme: SCHEME });
}
