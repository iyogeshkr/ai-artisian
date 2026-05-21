import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
let supabaseAuthTokenGetter = null;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Supabase is not configured for this deployment. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY) in your environment."
  );
}

async function authenticatedFetch(input, init = {}) {
  let token;
  try {
    token = await supabaseAuthTokenGetter?.();
  } catch (err) {
    console.error("[Supabase] Failed to get Clerk token:", err?.message || err);
  }

  const headers = new Headers(init.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  } else {
    console.warn("[Supabase] No Clerk token available for authenticated request", {
      url: input,
      hasTokenGetter: !!supabaseAuthTokenGetter,
    });
  }

  return fetch(input, {
    ...init,
    headers,
  });
}

export function setSupabaseAuthTokenGetter(getter) {
  supabaseAuthTokenGetter = typeof getter === "function" ? getter : null;
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: true,
    persistSession: true,
  },
  global: {
    fetch: authenticatedFetch,
  },
});
