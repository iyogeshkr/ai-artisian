import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

const missingSupabaseError = {
  message:
    "Supabase is not configured for this deployment. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in Vercel and .env.local.",
};

function createNoopQueryResult({ data = null, error = null } = {}) {
  const response = Promise.resolve({ data, error });

  const chain = {
    select() {
      return chain;
    },
    eq() {
      return chain;
    },
    in() {
      return chain;
    },
    order() {
      return chain;
    },
    limit() {
      return chain;
    },
    maybeSingle() {
      return chain;
    },
    single() {
      return chain;
    },
    then(onFulfilled, onRejected) {
      return response.then(onFulfilled, onRejected);
    },
    catch(onRejected) {
      return response.catch(onRejected);
    },
    finally(onFinally) {
      return response.finally(onFinally);
    },
  };

  return chain;
}

function createNoopSupabaseClient() {
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({
        data: {
          subscription: {
            unsubscribe() {},
          },
        },
      }),
      signInWithOAuth: async () => ({ data: null, error: missingSupabaseError }),
      signInWithPassword: async () => ({ data: null, error: missingSupabaseError }),
      signOut: async () => ({ error: null }),
      signUp: async () => ({ data: { user: null }, error: missingSupabaseError }),
    },
    from() {
      return {
        delete() {
          return createNoopQueryResult({ error: missingSupabaseError });
        },
        insert() {
          return createNoopQueryResult({ error: missingSupabaseError });
        },
        select() {
          return createNoopQueryResult();
        },
        update() {
          return createNoopQueryResult({ error: missingSupabaseError });
        },
        upsert() {
          return createNoopQueryResult({ error: missingSupabaseError });
        },
      };
    },
    functions: {
      invoke: async () => ({ data: null, error: missingSupabaseError }),
    },
  };
}

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    })
  : createNoopSupabaseClient();

if (!supabaseUrl || !supabaseKey) {
  // Keep production rendering alive even when the deployment is missing secrets.
  console.warn(missingSupabaseError.message);
}
