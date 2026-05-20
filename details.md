# AI Artisan Interview Cheat-Sheet

## One-line summary
AI Artisan is a React-based storefront for craft sellers that uses Supabase for auth/data, serverless backend functions for API calls, and Hugging Face image generation to turn a seller's prompt into product-ready design variants.

## 30-second explanation
The user opens the design generator in the frontend, picks a craft type, style, and color palette, then submits an optional description. The frontend sends that payload through `apiClient` to the backend `generate-design` endpoint. The backend validates the request, applies auth and rate limits, builds multiple prompt variants, calls the image generation service, and returns three generated designs as base64 images. The frontend renders them, lets the user retry or share, and can push the design into the artisan/storefront flow.

## How the project works end to end
1. User enters onboarding and design preferences in `frontend/src/pages/DesignGeneratorPage.jsx`.
2. `frontend/src/services/designService.js` calls `/generate-design` through `frontend/src/services/apiClient.js`.
3. `apiClient.js` attaches the Supabase session token automatically when the user is signed in.
4. The backend route in `functions/src/routes/imageRoutes.js` validates the request, enforces auth, and rate-limits it.
5. `functions/src/controllers/imageController.js` builds prompt variants and sends them to the Hugging Face service layer.
6. `functions/src/services/huggingfaceImageService.js` either calls remote inference or runs local Diffusers/FLUX logic from `ai-server/generate.py`.
7. The backend returns generated image payloads, which the frontend converts into `data:` URLs for immediate preview.

## Main pieces to mention in interview
- `frontend/` is the user-facing React app built with Vite.
- `frontend/src/context/` holds app state for artisan profile, design data, auth, and cart.
- `frontend/src/services/` is the API layer; it isolates network calls from UI components.
- `functions/` contains the backend API, validation, auth, rate limiting, and image-generation orchestration.
- `ai-server/` contains the Python image-generation runtime and ML dependencies.
- `supabase/` contains schema and edge-function related assets.

## Why this architecture
- Keep the UI fast and simple by pushing heavy work to backend services.
- Use Supabase for auth and database so the frontend can get session handling and secure requests with less boilerplate.
- Use a Python generation service because ML libraries and image pipelines are easier to manage there.
- Separate validation, controller, and service code so the AI logic stays testable and replaceable.

## What happens in the design generator screen
- Step 1: select craft type.
- Step 2: select style.
- Step 3: select color palette.
- Step 4: optionally add a short text description.
- On submit: generate three design variants, show loading state, handle partial failures, and retry once on 503.

## Security and env details
- Secrets stay server-side in `functions/.env` or Supabase secret storage; they should never be exposed in the browser.
- `frontend/config/env.js` should only contain public client config.
- Authenticated requests carry the Supabase access token.
- Backend code applies request validation and rate limiting before any generation call.

## Good cross-question answers
- Why does the frontend call the backend through `apiClient`? To centralize auth headers, request parsing, and error handling.
- Why do we generate multiple prompts? To increase variety and give the user several design directions from one request.
- What if the model is slow or unavailable? The backend returns a controlled error, the frontend shows a retry state, and 503s can be retried once.
- Why convert image bytes to base64? It makes the response easy to render immediately in the UI without extra storage lookups.
- Why use rate limits? Image generation is expensive, so the app prevents abuse and protects costs.

## One-line demo script
"I enter a craft type, style, and palette, the app sends that to the backend, the backend generates multiple AI design options, and I can preview or share the result instantly in the storefront flow."

## If they ask about the backend split
The safest explanation is that the repo shows the AI generation system in two layers: the current frontend integration goes through Supabase-invoked functions, while `functions/` and `ai-server/` show the underlying request validation and ML execution logic. That lets you explain both the product flow and the implementation clearly.

## Remember these file names
- `frontend/src/pages/DesignGeneratorPage.jsx`
- `frontend/src/services/apiClient.js`
- `frontend/src/services/designService.js`
- `functions/src/routes/imageRoutes.js`
- `functions/src/controllers/imageController.js`
- `functions/src/services/huggingfaceImageService.js`
- `ai-server/generate.py`