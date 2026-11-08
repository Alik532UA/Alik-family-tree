import { sessionStore } from './storage';

const PRIVACY_KEY = 'family_unlocked';
// Default family passcode for living relatives
const DEFAULT_PIN = '1975';

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
		const clean = pin.trim();
		if (clean === DEFAULT_PIN || clean.toLowerCase() === 'alik' || clean.toLowerCase() === 'запольнов') {
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

