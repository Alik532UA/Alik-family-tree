import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const rootDir = process.cwd();
const packageJsonPath = resolve(rootDir, 'package.json');
const staticVersionPath = resolve(rootDir, 'static/app-version.json');
const tsVersionPath = resolve(rootDir, 'src/lib/config/version.ts');

const syncOnly = process.argv.includes('--sync-only');

const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
const [major, minor, patch] = pkg.version.split('.');
const newVersion = syncOnly ? pkg.version : [major, minor, String(Number(patch) + 1)].join('.');

if (!syncOnly) {
	pkg.version = newVersion;
	writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, '\t')}\n`);
}

writeFileSync(staticVersionPath, `${JSON.stringify({ version: newVersion }, null, '\t')}\n`);
writeFileSync(tsVersionPath, `export const APP_VERSION = '${newVersion}';\n`);

console.log(`[bump-version] Version synchronized: ${newVersion}`);
