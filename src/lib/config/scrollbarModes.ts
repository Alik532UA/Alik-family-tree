// src/lib/config/scrollbarModes.ts — SCROLLBAR § 2.2
export const SCROLLBAR_KEY = 'scrollbar_mode';

export type ScrollbarMode = 'always' | 'wide' | 'native' | 'off';

export const SCROLLBAR_MODES: readonly ScrollbarMode[] = [
	'always',
	'wide',
	'native',
	'off'
] as const;

export const DEFAULT_MODE: ScrollbarMode = 'wide';

export function firstFrame(storagePrefix: string): string {
	return JSON.stringify({
		key: storagePrefix + SCROLLBAR_KEY,
		fallback: DEFAULT_MODE,
		paints: {
			always: 'always',
			wide: 'wide',
			native: 'never',
			off: 'never'
		},
		queries: {
			fine: '(pointer: fine)',
			forced: '(forced-colors: active)',
			wide: '(min-width: 1024px)'
		}
	});
}
