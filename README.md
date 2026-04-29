# AI Artisan

AI Artisan is a React storefront for traditional craft sellers, built around Supabase for auth and data, Supabase Edge Functions for server logic, and Hugging Face for image generation.

## Stack

- Frontend hosting: Vercel or Netlify
- Auth: Supabase Auth
- Database: Supabase PostgreSQL
- Server logic: Supabase Edge Functions
- AI image generation: Hugging Face Inference API

## Local development

### Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

The frontend uses the Supabase client to invoke Edge Functions, so there is no separate Firebase-style API base URL.

### Supabase

Use the Supabase dashboard and CLI to manage auth, database, and Edge Functions. The shared schema lives in `supabase/schema.sql`.

## Image generation

The app uses Hugging Face's `black-forest-labs/FLUX.1-schnell` model behind Edge Functions. Requests should return JSON that includes base64 image data, mime type, model, and provider metadata.

## Notes

- Frontend API calls now go through Supabase Edge Functions.
- Supabase Auth tokens are attached automatically to authenticated requests.
- The old Firebase hosting/functions path is no longer the target deployment model.
