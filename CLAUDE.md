# Guidelines for Claude in Alik-family-tree

- Read `PROJECT-CONTEXT.md` and `AGENTS.md` before making architectural changes.
- Use Svelte 5 Runes exclusively (`$state`, `$derived`, `$props`, `$effect`).
- Respect storage prefix `alik_tree_` via `$lib/services/storage.ts`.
- Run tests via `npm run test:unit` and verification via `npm run check`.
- Preserve CSP mode hash invariants and never inline unsanitized `{@html}`.
