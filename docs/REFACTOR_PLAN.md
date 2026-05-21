Refactor plan: safe incremental steps to reach target layout

Phase 1 — Stabilize (current, low risk)
- Rotate leaked keys and remove them from history.
- Enforce Clerk-first as already applied: update docs, enforce env checks, require auth on expensive endpoints.
- Add CI checks to prevent future secret commits.

Phase 2 — Consolidate (medium risk)
- Create `backend/` and progressively move code from `functions/` (keep old folder until cutover).
- Standardize config loading in `backend/config/*` (env validation, secrets retrieval).
- Add Dockerfiles and Compose for local reproducible environment.

Phase 3 — Harden (high risk)
- Add job queue for image generation (Redis + worker). Replace synchronous calls with queued jobs.
- Add centralized logging and tracing (Sentry, Datadog).

Phase 4 — Cutover
- Deploy `backend/` to production host (Cloud Run / ECS / Fly / DigitalOcean App Platform). Update frontend env `VITE_BACKEND_API_URL`.
- Retire `functions/` after traffic migration.
