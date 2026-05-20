import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdminConfig } from "../config/env.js";

let supabaseAdminClient;

export function getSupabaseAdminClient() {
  if (!supabaseAdminClient) {
    const { serviceRoleKey, url } = getSupabaseAdminConfig();

    supabaseAdminClient = createClient(url, serviceRoleKey, {
      auth: { persistSession: false },
    });
  }

  return supabaseAdminClient;
}
