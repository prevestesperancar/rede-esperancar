import { createClient } from "@supabase/supabase-js";

// Client do navegador — usa só a chave pública (anon), segura pra expor.
// O upload em si só funciona porque o token assinado (gerado no servidor)
// concede a permissão, não essa chave.
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const SUPABASE_UPLOADS_BUCKET = "uploads";
