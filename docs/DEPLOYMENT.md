# AI Artisan Production Deployment

## Active Production Targets

- Frontend: `frontend/` on Vercel
- Backend: `backend/server.js` on Railway
- Delegated backend runtime: `functions/src/`
- Database and storage: Supabase
- Canonical schema: `supabase/clerk_schema.sql`
- DNS/CDN/WAF: Cloudflare

## Backend Environment

Set these in Railway:

- `NODE_ENV=production`
- `CLERK_SECRET_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `HUGGING_FACE_API_KEY`
- `ALLOWED_ORIGINS=https://aiartisan.app,https://www.aiartisan.app`
- `FRONTEND_ORIGIN=https://aiartisan.app`
- `APP_ORIGIN=https://aiartisan.app`

Optional backend tuning:

- `CLERK_JWT_KEY`
- `HF_IMAGE_MODEL`
- `HF_INFERENCE_ENDPOINT`
- `HF_TIMEOUT_MS`
- `HF_MAX_RETRIES`
- `HF_RETRY_DELAY_MS`

## Frontend Environment

Set these in Vercel:

- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY` or `VITE_SUPABASE_ANON_KEY`
- `VITE_BACKEND_API_URL=https://api.aiartisan.app`
- `VITE_WHATSAPP_NUMBER`
- `VITE_CONTACT_EMAIL=orders@aiartisan.app`

Optional:

- `VITE_RUNTIME_MONITORING_URL`

## Railway

- Root directory: repository root
- Build command: `npm --prefix backend ci && npm --prefix functions ci --omit=dev`
- Start command: `node backend/server.js`
- Healthcheck path: `/health`
- Custom domain: `api.aiartisan.app`

`railway.json` already contains these settings.

## Vercel

- Root directory: `frontend`
- Install command: `npm ci`
- Build command: `npm run build`
- Output directory: `dist`
- Custom domain: `aiartisan.app`

`frontend/vercel.json` provides SPA rewrites and baseline security headers.

## Supabase

Deploy only `supabase/clerk_schema.sql`.

Do not deploy:

- `supabase/schema.sql`
- `supabase/schema_deprecated.sql`

## Smoke Tests

- `GET https://api.aiartisan.app/health`
- Open `https://aiartisan.app`
- Signup/login/logout through Clerk
- Complete artisan onboarding
- Generate AI design
- Add product
- Open `/store/:slug` logged out
- Open `/product/:id` logged out
- Confirm unknown origins are blocked by backend CORS

## Rollback

- Vercel: promote previous successful deployment.
- Railway: redeploy previous successful commit/deployment.
- Supabase: avoid destructive rollbacks; apply forward corrective migration.
- Secrets: rotate Clerk, Supabase service role, and Hugging Face tokens if exposed.
