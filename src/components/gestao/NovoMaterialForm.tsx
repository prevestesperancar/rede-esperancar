"use client";

import { useActionState } from "react";
import { criarMaterial } from "@/actions/gestao";

const TIPO_LABEL: Record<string, string> = {
  SLIDE: "Slide",
  EXERCICIO: "Exercício",
  VIDEO: "Vídeo",
  OUTRO: "Outro",
};

export function NovoMaterialForm({ disciplinas }: { disciplinas: { id: string; nome: string }[] }) {
  const [error, action, pending] = useActionState(criarMaterial, undefined);

  return (
    <form action={action} className="bg-surface border border-border rounded-[18px] p-5 mb-6 flex flex-col gap-3">
      <div className="font-extrabold text-[15px]">Novo material</div>
      <input
        name="titulo"
        placeholder="Título"
        required
        className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
      />
      <textarea
        name="descricao"
        placeholder="Descrição"
        rows={2}
        className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink resize-none"
      />
      <div className="grid sm:grid-cols-3 gap-3">
        <select
          name="disciplinaId"
          defaultValue=""
          className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink bg-surface"
        >
          <option value="">Sem disciplina</option>
          {disciplinas.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nome}
            </option>
          ))}
        </select>
        <input
          name="aula"
          placeholder="Aula (ex: Aula 3 — Funções)"
          className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
        />
        <select
          name="tipo"
          defaultValue="OUTRO"
          className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink bg-surface"
        >
          {Object.entries(TIPO_LABEL).map(([valor, label]) => (
            <option key={valor} value={valor}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-bold text-ink-faint uppercase tracking-wide mb-1">
          Arquivo (PDF, imagem, link de vídeo em anexo...)
        </label>
        <input
          name="arquivo"
          type="file"
          required
          className="w-full rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink file:mr-3 file:rounded-full file:border-0 file:bg-yellow file:text-yellow-ink file:font-bold file:text-xs file:px-3 file:py-1.5"
        />
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" name="publico" className="w-4 h-4" />
        Tornar público (aparece no site, em &ldquo;Materiais gratuitos&rdquo;)
      </label>
      {error && <p className="text-sm text-terracotta font-semibold">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start font-extrabold text-sm px-5 py-2.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
      >
        {pending ? "Adicionando…" : "Adicionar material"}
      </button>
    </form>
  );
}
