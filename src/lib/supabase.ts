import { createClient } from "@supabase/supabase-js";

// Client de admin (service role) — só usado no servidor, nunca exposto ao navegador.
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export const SUPABASE_UPLOADS_BUCKET = "uploads";
