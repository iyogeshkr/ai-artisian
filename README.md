# AI Artisan

AI Artisan is a React storefront for traditional craft sellers. The repository has been refactored to a Clerk-first architecture; see `docs/ARCHITECTURE.md` for the recommended production layout and migration steps.

## Architecture & Deployment

See `docs/ARCHITECTURE.md` for the target repo layout and `docs/DEPLOYMENT.md` for environment and deployment instructions.

## Local development (frontend)

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend uses Clerk for authentication and Supabase for database and storage (Clerk-first). The canonical Supabase schema is `supabase/clerk_schema.sql`.

## Image generation

The app uses Hugging Face's `black-forest-labs/FLUX.1-schnell` model behind Edge Functions. Requests should return JSON that includes base64 image data, mime type, model, and provider metadata.

## Notes

- Frontend API calls now go through the Express backend deployed on Railway.
Clerk JWTs are attached to authenticated requests and verified by server-side code.
- The old Firebase hosting/functions path is no longer the target deployment model.
