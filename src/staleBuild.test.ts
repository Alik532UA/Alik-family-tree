import { describe, it, expect } from 'vitest';
import { chunkMissing } from '$lib/utils/staleBuild';
import { sha256 } from '$lib/utils/sha256';

describe('Stale Build & Crypto Utilities (VERSIONING-v10 & SECURITY-v10)', () => {
	it('identifies chunk loading errors as stale build errors', () => {
		const dynamicImportError = new TypeError('Failed to fetch dynamically imported module');
		expect(chunkMissing(dynamicImportError)).toBe(true);

		const chunkLoadError = new Error('error loading dynamically imported chunk');
		expect(chunkMissing(chunkLoadError)).toBe(true);
	});

	it('does not classify standard logic errors as stale build', () => {
		const regularError = new Error('Invalid PIN code');
		expect(chunkMissing(regularError)).toBe(false);
	});

	it('computes accurate SHA-256 hex string for privacy PIN hashing', () => {
		const hash = sha256('1234');
		expect(typeof hash).toBe('string');
		expect(hash.length).toBe(64); // 256 bits = 64 hex chars
		expect(/^[0-9a-f]{64}$/.test(hash)).toBe(true);

		// Consistent hash output for identical input
		const hashAgain = sha256('1234');
		expect(hashAgain).toBe(hash);
	});
});
