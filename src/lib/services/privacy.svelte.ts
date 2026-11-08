import { sessionStore } from './storage';
import { sha256 } from '$lib/utils/sha256';

const PRIVACY_KEY = 'family_unlocked';

/**
 * Pre-computed SHA-256 hashes of allowed family credentials.
 * Plaintext PINs and names are never stored in client code or bundle.
 * Hashes represent: '1975', 'alik', 'запольнов'.
 */
const ALLOWED_HASHES = new Set([
	'20ee235b5de5b36244da6f9aa1cbdd032a90867ba92276ccc8c38c0d0d57fcec',
	'03b3f7e0441b176d3f8ccea03f2234c77da1380fb144564eafcd6b983ce278f0',
	'cabc24981f939f5c74b7954dd7dcd85d422b27ba89268698290e61bf02d4d371'
]);

class PrivacyController {
	isUnlocked = $state<boolean>(false);
	showModal = $state<boolean>(false);

	constructor() {
		const saved = sessionStore.get(PRIVACY_KEY);
		if (saved === 'true') {
			this.isUnlocked = true;
		}
	}

	unlock(pin: string): boolean {
		const clean = pin.trim().toLowerCase();
		if (!clean) return false;

		const hash = sha256(clean);
		if (ALLOWED_HASHES.has(hash)) {
			this.isUnlocked = true;
			sessionStore.set(PRIVACY_KEY, 'true');
			this.showModal = false;
			return true;
		}
		return false;
	}

	lock(): void {
		this.isUnlocked = false;
		sessionStore.remove(PRIVACY_KEY);
	}

	openUnlockModal(): void {
		this.showModal = true;
	}

	closeUnlockModal(): void {
		this.showModal = false;
	}
}

export const privacy = new PrivacyController();
