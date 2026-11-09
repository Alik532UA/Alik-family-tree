import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

describe('Accessibility & Semantics Invariants (ACCESSIBILITY-v10)', () => {
	it('layout contains skip-link to main content', () => {
		const layout = readFileSync(path.resolve('src/routes/+layout.svelte'), 'utf8');
		expect(layout).toMatch(/href="#main-content"/);
		expect(layout).toMatch(/class="skip-link"/);
		expect(layout).toMatch(/id="main-content"/);
	});

	it('main content has tabindex="-1" for keyboard programmatic focus', () => {
		const layout = readFileSync(path.resolve('src/routes/+layout.svelte'), 'utf8');
		expect(layout).toMatch(/<main[^>]*tabindex="-1"/);
	});

	it('error page provides accessible heading and landmark navigation', () => {
		expect(existsSync(path.resolve('src/routes/+error.svelte'))).toBe(true);
		const errorPage = readFileSync(path.resolve('src/routes/+error.svelte'), 'utf8');
		expect(errorPage).toMatch(/<h1[^>]*>/);
		expect(errorPage).toMatch(/class="btn/);
	});

	it('app.html declares lang attribute on html tag', () => {
		const appHtml = readFileSync(path.resolve('src/app.html'), 'utf8');
		expect(appHtml).toMatch(/<html\s+lang="[a-zA-Z-]+"/);
	});

	it('interactive buttons in SiteHeader have accessible labels or titles', () => {
		const headerPath = path.resolve('src/lib/components/SiteHeader.svelte');
		if (existsSync(headerPath)) {
			const header = readFileSync(headerPath, 'utf8');
			const buttons = header.match(/<button[\s\S]*?<\/button>/gi) || [];
			for (const btn of buttons) {
				const hasAriaLabel = /aria-label=/i.test(btn);
				const hasTitle = /title=/i.test(btn);
				const hasText = />\s*[\wА-Яа-яЇїІіЄєҐґ]/i.test(btn);
				expect(hasAriaLabel || hasTitle || hasText).toBe(true);
			}
		}
	});
});
