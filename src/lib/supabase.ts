import { createClient } from "@supabase/supabase-js";

// User's own Supabase project — auth only. Publishable key is safe in the browser.
const SUPABASE_URL = "https://kcbxmflpsyxtqmkmfxgf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_G3YJyOpz8uQHS-YmU-PYRQ_dag9La_g";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: typeof window !== "undefined",
    autoRefreshToken: typeof window !== "undefined",
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});
