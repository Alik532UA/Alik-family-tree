// src/lib/controllers/toast.svelte.ts — NOTIFICATIONS § 2
export type ToastType = 'success' | 'error' | 'warn' | 'info';

export interface ToastAction {
	label: string;
	run: () => void | Promise<void>;
}

export interface ToastOptions {
	duration?: number;
	action?: ToastAction;
}

export interface ToastItem {
	id: string;
	type: ToastType;
	message: string;
	duration: number;
	action?: ToastAction;
	remaining: number;
	paused: boolean;
	createdAt: number;
}

class ToastController {
	items = $state<ToastItem[]>([]);
	private timers = new Map<string, ReturnType<typeof setInterval>>();

	show(type: ToastType, message: string, options?: ToastOptions): string {
		const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
		const duration = options?.action
			? 0
			: (options?.duration ?? (type === 'error' ? 7000 : type === 'warn' ? 5000 : 3500));

		const item: ToastItem = {
			id,
			type,
			message,
			duration,
			action: options?.action,
			remaining: duration,
			paused: false,
			createdAt: Date.now()
		};

		// Cap max items
		if (this.items.length >= 5) {
			const oldestAuto = this.items.find((t) => t.duration > 0 && !t.paused);
			if (oldestAuto) this.dismiss(oldestAuto.id);
		}

		this.items.push(item);

		if (duration > 0) {
			this.startTimer(item);
		}

		return id;
	}

	success(message: string, options?: ToastOptions) {
		return this.show('success', message, options);
	}

	info(message: string, options?: ToastOptions) {
		return this.show('info', message, options);
	}

	warn(message: string, options?: ToastOptions) {
		return this.show('warn', message, options);
	}

	error(message: string, options?: ToastOptions) {
		return this.show('error', message, options);
	}

	dismiss(id: string) {
		const timer = this.timers.get(id);
		if (timer) {
			clearInterval(timer);
			this.timers.delete(id);
		}
		this.items = this.items.filter((t) => t.id !== id);
	}

	pause(id: string) {
		const item = this.items.find((t) => t.id === id);
		if (item) item.paused = true;
	}

	resume(id: string) {
		const item = this.items.find((t) => t.id === id);
		if (item) item.paused = false;
	}

	private startTimer(item: ToastItem) {
		const step = 100;
		const timer = setInterval(() => {
			if (!item.paused) {
				item.remaining -= step;
				if (item.remaining <= 0) {
					this.dismiss(item.id);
				}
			}
		}, step);
		this.timers.set(item.id, timer);
	}
}

export const toast = new ToastController();
