"use client";

import { useActionState } from "react";
import { criarQuestaoBanco } from "@/actions/gestao";

const inputClass =
  "w-full rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink";
const labelClass = "block text-xs font-bold text-ink-faint uppercase tracking-wide mb-1";

export function NovaQuestaoForm({ disciplinas }: { disciplinas: { id: string; nome: string }[] }) {
  const [message, action, pending] = useActionState(criarQuestaoBanco, undefined);

  return (
    <form action={action} className="flex flex-col gap-3">
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Prova</label>
          <select name="prova" required className={`${inputClass} bg-surface`}>
            <option value="">Selecione</option>
            <option value="ENEM">ENEM</option>
            <option value="UERJ">UERJ</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Matéria</label>
          <select name="materia" required className={`${inputClass} bg-surface`}>
            <option value="">Selecione</option>
            {disciplinas.map((d) => (
              <option key={d.id} value={d.nome}>
                {d.nome}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Ano</label>
          <input name="ano" type="number" placeholder="2024" className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Enunciado</label>
        <textarea name="enunciado" required rows={4} className={inputClass} />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Alternativa A</label>
          <input name="opcaoA" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Alternativa B</label>
          <input name="opcaoB" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Alternativa C</label>
          <input name="opcaoC" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Alternativa D</label>
          <input name="opcaoD" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Alternativa E (opcional)</label>
          <input name="opcaoE" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Resposta correta</label>
          <select name="respostaCorreta" required className={`${inputClass} bg-surface`}>
            <option value="">Selecione</option>
            {["A", "B", "C", "D", "E"].map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>
      {message && (
        <p className={`text-sm font-semibold ${message === "Questão adicionada!" ? "text-teal" : "text-terracotta"}`}>
          {message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="self-start font-extrabold text-sm px-5 py-2.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Adicionar questão"}
      </button>
    </form>
  );
}
