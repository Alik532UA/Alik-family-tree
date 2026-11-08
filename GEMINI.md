# Guidelines for Gemini in Alik-family-tree

- Primary architectural documentation: `PROJECT-CONTEXT.md` and `AGENTS.md`.
- Strict TypeScript: maintain `"strict": true`, `"noUncheckedIndexedAccess": true`.
- Zero raw plaintext credentials: only SHA-256 validation via `privacy.svelte.ts`.
- Check all quality gates before completion: `npm run check`, `npm run lint`, `npm run test:unit`, `npm run audit:ci`.
