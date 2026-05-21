Backend migration summary

What I did:
- Created `backend/` as a safe wrapper that delegates to `functions/src/` implementation.
- Added `backend/package.json`, `backend/.env.example`, `backend/server.js`, and `backend/src/app.js` (re-exports).
- Updated root `package.json` scripts to use `backend` for dev and build commands.

Why this approach:
- Safe, incremental: preserves all original logic and runtime behavior.
- Keeps imports unchanged inside `functions/src/` so no mass refactor required.

Next steps to complete full migration:
1. Move `functions/src/*` into `backend/src/` and update internal relative imports if desired.
2. Remove `functions/` after verification and update any CI/deploy scripts.
3. Run tests and lint: `npm --prefix backend run lint` and `npm --prefix frontend run lint`.
