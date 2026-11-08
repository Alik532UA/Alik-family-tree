// src/lib/controllers/theme.svelte.ts — THEME-SWITCHER § 2
import { createContext } from 'svelte';
import { browser } from '$app/environment';
import { storage } from '$lib/services/storage';
import { colorSchemeFor, isTheme, THEME_KEY, THEMES, type Theme } from './colorScheme';

export class ThemeController {
	choice = $state<Theme | null>(null);
	previewed = $state<Theme | null>(null);

	shown = $derived.by<Theme>(() => {
		if (this.previewed) return this.previewed;
		if (this.choice) return this.choice;
		// System preference
		if (browser && window.matchMedia('(prefers-color-scheme: dark)').matches) {
			return 'dark';
		}
		return 'light';
	});

	constructor() {
		if (browser) {
			const saved = storage.get(THEME_KEY);
			if (saved && isTheme(saved)) {
				this.choice = saved;
			}
			this.applyToDocument();
		}
	}

	choose(theme: Theme | null): void {
		this.choice = theme;
		this.previewed = null;
		if (theme) {
			storage.set(THEME_KEY, theme);
		} else {
			storage.remove(THEME_KEY);
		}
		this.triggerTransition();
		this.applyToDocument();
	}

	preview(theme: Theme | null): void {
		this.previewed = theme;
		this.applyToDocument();
	}

	next(): void {
		const current = this.choice ?? this.shown;
		const idx = THEMES.indexOf(current);
		const nextTheme = THEMES[(idx + 1) % THEMES.length] ?? 'light';
		this.choose(nextTheme);
	}

	private triggerTransition(): void {
		if (!browser) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		document.documentElement.classList.add('theme-shifting');
		setTimeout(() => {
			document.documentElement.classList.remove('theme-shifting');
		}, 400);
	}

	applyToDocument(): void {
		if (!browser) return;
		const active = this.previewed ?? this.choice;
		if (active) {
			document.documentElement.setAttribute('data-theme', active);
		} else {
			document.documentElement.removeAttribute('data-theme');
		}
		const meta = document.querySelector('meta[name="color-scheme"]');
		if (meta) {
			meta.setAttribute('content', colorSchemeFor(active));
		}
	}
}

const [getThemeContext, setThemeContext] = createContext<ThemeController>();
export const getTheme = getThemeContext;
export const setTheme = setThemeContext;
export const themeController = new ThemeController();

