AI Artisan — Recommended Production Architecture

Target repository layout

AI-Artisan/
├── frontend/            # Vite React app (current frontend)
├── backend/             # Express functions / API (functions currently)
├── docs/                # Operational docs, migration guides
├── assets/              # Shared static assets / images
├── scripts/             # Devops and migration scripts
├── docker/              # Dockerfiles and compose templates
└── README.md

High-level goals
- Single auth provider: Clerk (frontend + backend verification)
- Supabase: database + storage only (Clerk-first schema)
- One canonical backend: consolidate Express code from `functions` into `backend/`
- Frontend: keep `frontend/` as-is, standardize env names and CI/CD

Mapping from current repo
- `frontend/` -> `frontend/` (no change)
- `functions/` -> `backend/` (consolidate over time; keep copy until cutover)
- `supabase/clerk_schema.sql` -> deploy as canonical schema
- `supabase/schema.sql` -> archived / deprecated (do not deploy)
- `clerk-nextjs/`, `ai-artisan/`, `ai-server/` -> review and archive or integrate into microservices plan

Incremental migration strategy
1. Keep current structure; implement Clerk-first changes and tests (done partially).
2. Add CI checks and secret management (see docs/DEPLOYMENT.md).
3. Create `backend/` and gradually move code from `functions/` (preserve git history).
4. Once `backend/` is fully verified, retire `functions/` and update deployment pipelines.

Operational notes
- Do not commit any `.env` files. Use provider secret stores (Vercel, Firebase, Supabase, or GitHub Actions secrets).
- Rotate leaked keys and purge them from repo history.
