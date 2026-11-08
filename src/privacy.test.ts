import { describe, it, expect, beforeEach } from 'vitest';
import { sha256 } from '$lib/utils/sha256';
import { privacy } from '$lib/services/privacy.svelte';

describe('Privacy & Passcode Verification', () => {
	beforeEach(() => {
		privacy.lock();
	});

	it('sha256 correctly computes hex digest', () => {
		expect(sha256('1975')).toBe('20ee235b5de5b36244da6f9aa1cbdd032a90867ba92276ccc8c38c0d0d57fcec');
		expect(sha256('alik')).toBe('03b3f7e0441b176d3f8ccea03f2234c77da1380fb144564eafcd6b983ce278f0');
		expect(sha256('запольнов')).toBe(
			'cabc24981f939f5c74b7954dd7dcd85d422b27ba89268698290e61bf02d4d371'
		);
	});

	it('rejects invalid pin', () => {
		expect(privacy.isUnlocked).toBe(false);
		const result = privacy.unlock('wrong-code-0000');
		expect(result).toBe(false);
		expect(privacy.isUnlocked).toBe(false);
	});

	it('unlocks with valid passcode and updates state', () => {
		expect(privacy.isUnlocked).toBe(false);
		const result = privacy.unlock('1975');
		expect(result).toBe(true);
		expect(privacy.isUnlocked).toBe(true);
	});

	it('lock() resets privacy unlock state', () => {
		privacy.unlock('1975');
		expect(privacy.isUnlocked).toBe(true);
		privacy.lock();
		expect(privacy.isUnlocked).toBe(false);
	});
});
