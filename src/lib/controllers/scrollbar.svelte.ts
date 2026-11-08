// src/lib/controllers/scrollbar.svelte.ts — SCROLLBAR § 2.1
import { browser } from '$app/environment';
import { storage } from '$lib/services/storage';
import { DEFAULT_MODE, SCROLLBAR_KEY, type ScrollbarMode } from '$lib/config/scrollbarModes';

class ScrollbarController {
	mode = $state<ScrollbarMode>(DEFAULT_MODE);
	menuOpen = $state<boolean>(false);
	menuPosition = $state<{ x: number; y: number }>({ x: 0, y: 0 });

	hidesNative = $derived.by<boolean>(() => {
		if (!browser) return false;
		if (this.mode === 'native' || this.mode === 'off') return false;
		if (window.matchMedia('(forced-colors: active)').matches) return false;
		if (!window.matchMedia('(pointer: fine)').matches) return false;
		if (this.mode === 'wide') {
			return window.matchMedia('(min-width: 1024px)').matches;
		}
		return true;
	});

	init(): void {
		if (!browser) return;
		const saved = storage.get(SCROLLBAR_KEY);
		if (
			saved &&
			(saved === 'always' || saved === 'wide' || saved === 'native' || saved === 'off')
		) {
			this.mode = saved as ScrollbarMode;
		}
	}

	setMode(mode: ScrollbarMode): void {
		this.mode = mode;
		storage.set(SCROLLBAR_KEY, mode);
	}

	openMenu(x: number, y: number): void {
		this.menuPosition = { x, y };
		this.menuOpen = true;
	}

	closeMenu(): void {
		this.menuOpen = false;
	}
}

export const scrollbar = new ScrollbarController();
