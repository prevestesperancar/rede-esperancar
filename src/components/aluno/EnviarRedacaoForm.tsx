"use client";

import { useActionState } from "react";
import { enviarRedacao } from "@/actions/redacao";

type Tema = {
  id: string;
  prova: string;
  titulo: string;
  textoMotivador: string | null;
  prazoEnvio: Date | null;
};

export function EnviarRedacaoForm({ temas }: { temas: Tema[] }) {
  const [message, action, pending] = useActionState(enviarRedacao, undefined);

  if (temas.length === 0) {
    return <p className="text-sm text-ink-faint">Nenhum tema disponível por enquanto.</p>;
  }

  return (
    <form action={action} className="bg-surface border border-border rounded-[18px] p-5 flex flex-col gap-3">
      <div className="font-extrabold text-[15px]">Escrever uma redação</div>
      <select
        name="temaId"
        required
        defaultValue=""
        className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink bg-surface"
      >
        <option value="" disabled>
          Escolha um tema
        </option>
        {temas.map((t) => (
          <option key={t.id} value={t.id}>
            {t.prova} — {t.titulo}
            {t.prazoEnvio ? ` (até ${t.prazoEnvio.toLocaleDateString("pt-BR")})` : ""}
          </option>
        ))}
      </select>
      <textarea
        name="textoEnviado"
        placeholder="Escreva sua redação aqui"
        required
        rows={14}
        className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink resize-none"
      />
      {message && <p className="text-sm font-semibold text-teal">{message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start font-extrabold text-sm px-5 py-2.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Enviar redação"}
      </button>
    </form>
  );
}
