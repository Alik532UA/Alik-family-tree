// src/app.d.ts — канонічний файл (CODE-QUALITY § 1.1.1); файл-модуль (`export {}`), тож глобальне оголошується в `declare global`
declare global {
	/** VERSIONING § 2.1: версія з package.json, підставлена `define` у vite.config.ts. */
	const __APP_VERSION__: string;

	namespace App {
		/** ERROR-HANDLING § 2.4: поля, які повертає handleError і передає error(). */
		interface Error {
			message: string;
			code?: string;
			errorId?: string;
		}
	}
}

export {};
