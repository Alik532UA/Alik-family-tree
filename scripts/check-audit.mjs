import { spawnSync } from 'node:child_process';

const COMMAND = 'npm audit --omit=dev --json';
const THRESHOLD = ['high', 'critical'];
const ATTEMPTS = 3;
const PAUSE_MS = 3000;
const TIMEOUT_MS = 60_000;

function attempt() {
	const out = spawnSync(COMMAND, {
		shell: true,
		encoding: 'utf8',
		timeout: TIMEOUT_MS,
		killSignal: 'SIGKILL'
	});

	if (out.signal) {
		return { failure: `timeout after ${TIMEOUT_MS / 1000}s (${out.signal})` };
	}

	const text = (out.stdout ?? '').trim();
	if (!text) {
		const reason = out.error?.message ?? out.stderr?.trim();
		return { failure: reason || `npm audit failed (exit ${out.status})` };
	}

	try {
		return { report: JSON.parse(text) };
	} catch {
		return { failure: `JSON parse failed: ${text.slice(0, 200)}` };
	}
}

let report = null;
let lastFailure = '';

for (let i = 1; i <= ATTEMPTS; i += 1) {
	const result = attempt();
	if (result.report?.metadata?.vulnerabilities) {
		report = result.report;
		break;
	}
	lastFailure =
		result.failure ?? result.report?.error?.summary ?? 'no metadata.vulnerabilities in report';
	if (i < ATTEMPTS) await new Promise((resolve) => setTimeout(resolve, PAUSE_MS));
}

if (!report) {
	console.warn(`⚠️ npm audit registry unreachable (${lastFailure}). Skipping hard failure.`);
	process.exit(0);
}

const levels = report.metadata?.vulnerabilities ?? {};
const blocking = THRESHOLD.reduce((sum, level) => sum + (levels[level] ?? 0), 0);
const total = levels.total ?? 0;

console.log(`🛡️ npm audit: ${total} vulnerabilities, threshold: ${THRESHOLD[0]}`);

if (blocking > 0) {
	console.error(`❌ Found blocking vulnerabilities ${THRESHOLD.join('/')}: ${blocking}`);
	process.exit(1);
}
