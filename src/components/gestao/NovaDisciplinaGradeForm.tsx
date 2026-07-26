"use client";

import { useActionState } from "react";
import { criarDisciplinaGrade } from "@/actions/gestao";

const DIAS_SEMANA = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado 1",
  "Sábado 2",
  "Domingo",
];

export function NovaDisciplinaGradeForm({
  turmaId,
  professores,
}: {
  turmaId: string;
  professores: { id: string; nome: string }[];
}) {
  const [error, action, pending] = useActionState(criarDisciplinaGrade, undefined);

  return (
    <form action={action} className="flex flex-wrap gap-2.5 items-end mt-3 pt-3 border-t border-border">
      <input type="hidden" name="turmaId" value={turmaId} />
      <input
        name="disciplinaNome"
        placeholder="Disciplina"
        required
        className="rounded-xl border border-border-strong px-3 py-2 text-sm outline-none focus:border-ink flex-1 min-w-[140px]"
      />
      <select
        name="professorId"
        required
        className="rounded-xl border border-border-strong px-3 py-2 text-sm outline-none focus:border-ink bg-surface min-w-[140px]"
      >
        <option value="">Professor</option>
        {professores.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nome}
          </option>
        ))}
      </select>
      <select
        name="diaSemana"
        required
        defaultValue=""
        className="rounded-xl border border-border-strong px-3 py-2 text-sm outline-none focus:border-ink bg-surface min-w-[140px]"
      >
        <option value="" disabled>
          Dia
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
        className="rounded-xl border border-border-strong px-3 py-2 text-sm outline-none focus:border-ink w-[110px]"
      />
      <input
        name="horaFim"
        type="time"
        required
        className="rounded-xl border border-border-strong px-3 py-2 text-sm outline-none focus:border-ink w-[110px]"
      />
      {error && <p className="text-xs text-terracotta font-semibold w-full">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="font-bold text-xs px-4 py-2 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
      >
        {pending ? "Adicionando…" : "+ Adicionar aula"}
      </button>
    </form>
  );
}
