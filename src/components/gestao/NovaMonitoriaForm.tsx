"use client";

import { useState, useActionState } from "react";
import { criarMonitoria } from "@/actions/gestao";

const DIAS_SEMANA = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo",
];

export function NovaMonitoriaForm({
  turmas,
  disciplinas,
}: {
  turmas: { id: string; nome: string }[];
  disciplinas: { id: string; nome: string }[];
}) {
  const [error, action, pending] = useActionState(criarMonitoria, undefined);
  const [escopo, setEscopo] = useState("turma");

  return (
    <form action={action} className="bg-surface border border-border rounded-[18px] p-5 mb-6 flex flex-col gap-3">
      <div className="font-extrabold text-[15px]">Nova monitoria</div>

      <div>
        <label className="block text-xs font-bold text-ink-faint uppercase tracking-wide mb-1">
          Quem pode participar
        </label>
        <select
          name="escopo"
          value={escopo}
          onChange={(e) => setEscopo(e.target.value)}
          className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink bg-surface"
        >
          <option value="turma">Uma turma específica</option>
          <option value="nucleo">Todo o meu núcleo</option>
          <option value="todos">Todos os prés (rede toda)</option>
        </select>
      </div>

      {escopo === "turma" && (
        <select
          name="turmaId"
          required
          className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink bg-surface"
        >
          <option value="">Escolha a turma</option>
          {turmas.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </select>
      )}

      <select
        name="disciplinaId"
        className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink bg-surface"
        defaultValue=""
      >
        <option value="">Matéria (opcional)</option>
        {disciplinas.map((d) => (
          <option key={d.id} value={d.id}>
            {d.nome}
          </option>
        ))}
      </select>

      <div className="grid sm:grid-cols-3 gap-3">
        <select
          name="diaSemana"
          required
          defaultValue=""
          className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink bg-surface"
        >
          <option value="" disabled>
            Dia da semana
          </option>
          {DIAS_SEMANA.map((dia) => (
            <option key={dia} value={dia}>
              {dia}
            </option>
          ))}
        </select>
        <input
          name="horaInicio"
          type="time"
          required
          className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
        />
        <input
          name="horaFim"
          type="time"
          required
          className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
        />
      </div>
      <input
        name="materiais"
        placeholder="Materiais da monitoria (opcional)"
        className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
      />
      <input
        name="link"
        placeholder="Link da aula (Meet, Zoom...)"
        className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
      />
      {error && <p className="text-sm text-terracotta font-semibold">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start font-extrabold text-sm px-5 py-2.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
      >
        {pending ? "Adicionando…" : "Adicionar monitoria"}
      </button>
    </form>
  );
}
