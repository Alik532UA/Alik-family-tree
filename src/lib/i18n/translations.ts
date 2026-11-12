export type Locale = 'uk' | 'en';

export interface Translations {
	appTitle: string;
	searchPlaceholder: string;
	zoomIn: string;
	zoomOut: string;
	resetView: string;
	privacyModalTitle: string;
	privacyModalPrompt: string;
	privacyModalSubmit: string;
	privacyModalCancel: string;
	generation: string;
	parents: string;
	spouses: string;
	children: string;
	siblings: string;
	biography: string;
	dates: string;
	close: string;
	livingPersonProtected: string;
	unlockedNotice: string;
	theme: {
		light: string;
		dark: string;
		sepia: string;
		meadow: string;
		sky: string;
	};
}

export const translations: Record<Locale, Translations> = {
	uk: {
		appTitle: 'Родинне генеалогічне древо',
		searchPlaceholder: 'Швидкий пошук родичів за іменем, роками...',
		zoomIn: 'Збільшити масштаб',
		zoomOut: 'Зменшити масштаб',
		resetView: 'Скинути вигляд дерева',
		privacyModalTitle: 'Доступ до приватних даних',
		privacyModalPrompt: 'Введіть PIN-код для перегляду даних живих родичів:',
		privacyModalSubmit: 'Розблокувати',
		privacyModalCancel: 'Скасувати',
		generation: 'Покоління',
		parents: 'Батьки',
		spouses: 'Подружжя',
		children: 'Діти',
		siblings: 'Брати та сестри',
		biography: 'Біографія та нотатки',
		dates: 'Роки життя',
		close: 'Закрити',
		livingPersonProtected: 'Дані захищено політикою конфіденційності',
		unlockedNotice: 'Сімейний доступ активовано',
		theme: {
			light: 'Світла',
			dark: 'Темна',
			sepia: 'Сепія',
			meadow: 'Полонина',
			sky: 'Небокрай'
		}
	},
	en: {
		appTitle: 'Alik Family Genealogical Tree',
		searchPlaceholder: 'Quick search by name, year of birth...',
		zoomIn: 'Zoom In',
		zoomOut: 'Zoom Out',
		resetView: 'Reset View',
		privacyModalTitle: 'Private Family Data Access',
		privacyModalPrompt: 'Enter PIN code to view living relatives data:',
		privacyModalSubmit: 'Unlock',
		privacyModalCancel: 'Cancel',
		generation: 'Generation',
		parents: 'Parents',
		spouses: 'Spouses',
		children: 'Children',
		siblings: 'Siblings',
		biography: 'Biography & Notes',
		dates: 'Lifespan',
		close: 'Close',
		livingPersonProtected: 'Data protected by family privacy policy',
		unlockedNotice: 'Family access granted',
		theme: {
			light: 'Light',
			dark: 'Dark',
			sepia: 'Sepia',
			meadow: 'Meadow',
			sky: 'Sky'
		}
	}
};

export function getTranslations(lang: Locale = 'uk'): Translations {
	return translations[lang] || translations.uk;
}
