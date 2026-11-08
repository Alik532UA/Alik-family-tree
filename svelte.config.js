// svelte.config.js — канонічний файл (CODE-QUALITY § 1.1.1): частини позначені файлом-власником
import adapter from '@sveltejs/adapter-static';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

// DEPLOY-ENVIRONMENTS § 3.1: база з BASE_PATH; `??`, а не `||`: порожній рядок (власний домен) — законне значення.
const basePath = /** @type {'' | `/${string}`} */ (process.env.BASE_PATH ?? '/Alik-family-tree');
// DEPLOY-ENVIRONMENTS § 3.3: Pages віддає лише кореневий 404.html
const fallback = process.env.VITE_ENV === 'dev' ? undefined : '404.html';

// VERSIONING § 4.5: ім'я збірки нове для кожного деплою.
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
/** Коротке sha коміту: однакове для того самого коду, нове для кожного деплою. */
function commit() {
	if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7);
	try {
		return execSync('git rev-parse --short HEAD', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
	} catch {
		return 'local';
	}
}
const VERSION_NAME = `${pkg.version}+${commit()}`;

// SECURITY § 6.1, § 6.3.1: хеші інлайн-скриптів app.html — над текстом, яким його бачить браузер.
const asBrowserSees = (text) => text.replace(/\r\n?/g, '\n');

/**
 * Хеші інлайн-скриптів app.html — з файлу, під час збірки, а не рядком у конфігу.
 * @returns {Array<`sha256-${string}`>}
 */
const inlineScriptHashes = () => {
	try {
		return [...readFileSync(new URL('./src/app.html', import.meta.url), 'utf8').matchAll(/<script\b(?![^>]*\ssrc\s*=)[^>]*>([\s\S]*?)<\/script\s*>/gi)].map(
			(m) => /** @type {`sha256-${string}`} */ (`sha256-${createHash('sha256').update(asBrowserSees(m[1] ?? '')).digest('base64')}`)
		);
	} catch {
		return [];
	}
};

/** Значення `kit.csp` канонічного конфігу. @type {import('@sveltejs/kit').KitConfig['csp']} */
const csp = {
	mode: 'auto',
	directives: {
		'default-src': ['self'],
		'script-src': [
			'self',
			...inlineScriptHashes()
		],
		'style-src': ['self', 'unsafe-inline'],
		'img-src': [
			'self',
			'data:'
		],
		'connect-src': [
			'self'
		],
		'object-src': ['none'],
		'base-uri': ['self'],
		'form-action': ['self']
	}
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// CODE-QUALITY § 1.1.1: руни для коду проєкту; бібліотеки з node_modules — у власному режимі.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		adapter: adapter({ pages: 'build', assets: 'build', fallback }),
		paths: { base: basePath, relative: false },
		version: { name: VERSION_NAME, pollInterval: 60_000 },
		prerender: { entries: ['*'] },
		csp
	}
};

export default config;

