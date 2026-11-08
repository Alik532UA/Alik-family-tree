import { dev } from '$app/environment';

export interface LogEntry {
	level: 'debug' | 'info' | 'warn' | 'error';
	topic: string;
	message: string;
	details?: unknown;
	timestamp: number;
}

class LogService {
	entries = $state<LogEntry[]>([]);

	debug(topic: string, message: string, details?: unknown) {
		if (dev) {
			console.debug(`[${topic}] ${message}`, details ?? '');
		}
	}

	info(topic: string, message: string, details?: unknown) {
		const entry: LogEntry = { level: 'info', topic, message, details, timestamp: Date.now() };
		this.entries.push(entry);
		if (dev) {
			console.info(`[${topic}] ${message}`, details ?? '');
		}
	}

	warn(topic: string, message: string, details?: unknown) {
		const entry: LogEntry = { level: 'warn', topic, message, details, timestamp: Date.now() };
		this.entries.push(entry);
		console.warn(`[${topic}] ${message}`, details ?? '');
	}

	error(topic: string, message: string, details?: unknown) {
		const entry: LogEntry = { level: 'error', topic, message, details, timestamp: Date.now() };
		this.entries.push(entry);
		console.error(`[${topic}] ${message}`, details ?? '');
	}
}

export const logService = new LogService();

