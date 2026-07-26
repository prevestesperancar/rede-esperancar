"use client";

import { useActionState } from "react";
import { atualizarConteudoSite } from "@/actions/admin";

export function ConteudoSiteForm({
  quemSomosTexto,
  contatoEmail,
  contatoTelefone,
  contatoEndereco,
}: {
  quemSomosTexto: string | null;
  contatoEmail: string | null;
  contatoTelefone: string | null;
  contatoEndereco: string | null;
}) {
  const [message, action, pending] = useActionState(atualizarConteudoSite, undefined);

  return (
    <form action={action} className="flex flex-col gap-4 max-w-2xl">
      <div>
        <label className="block text-xs font-bold text-ink-faint uppercase tracking-wide mb-1">
          Texto da página &ldquo;Quem somos nós&rdquo;
        </label>
        <textarea
          name="quemSomosTexto"
          defaultValue={quemSomosTexto ?? ""}
          rows={8}
          placeholder="Deixe em branco para usar o texto padrão do site."
          className="w-full rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink resize-none"
        />
      </div>
      <div className="font-extrabold text-sm mt-2 pt-4 border-t border-border">
        Contato geral da rede
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          name="contatoEmail"
          type="email"
          defaultValue={contatoEmail ?? ""}
          placeholder="contato@esperancar.org"
          className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
        />
        <input
          name="contatoTelefone"
          defaultValue={contatoTelefone ?? ""}
          placeholder="Telefone/WhatsApp geral"
          className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
        />
      </div>
      <input
        name="contatoEndereco"
        defaultValue={contatoEndereco ?? ""}
        placeholder="Endereço geral (opcional)"
        className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
      />
      {message && <p className="text-sm font-semibold text-teal">{message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start font-extrabold text-sm px-5 py-2.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Salvar conteúdo"}
      </button>
    </form>
  );
}
