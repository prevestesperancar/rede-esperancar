"use client";

import { useActionState } from "react";
import { atualizarGoogleSheetsNucleo } from "@/actions/gestao";

export function GoogleSheetsNucleoForm({ googleSheetsUrl }: { googleSheetsUrl: string | null }) {
  const [message, action, pending] = useActionState(atualizarGoogleSheetsNucleo, undefined);

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input
        name="googleSheetsUrl"
        type="url"
        defaultValue={googleSheetsUrl ?? ""}
        placeholder="Link da planilha do Google Sheets"
        className="flex-1 min-w-[220px] rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
      />
      <button
        type="submit"
        disabled={pending}
        className="font-extrabold text-sm px-5 py-2.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Salvar"}
      </button>
      {message && <span className="text-xs text-teal font-semibold">{message}</span>}
    </form>
  );
}
