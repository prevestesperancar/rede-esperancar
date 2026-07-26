"use client";

import { useState, useActionState } from "react";
import { editarMonitoria } from "@/actions/gestao";

const DIAS_SEMANA = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo",
];

export function EditarMonitoriaForm({
  monitoriaId,
  diaSemana,
  horaInicio,
  horaFim,
  materiais,
  link,
  disciplinaId,
  disciplinas,
}: {
  monitoriaId: string;
  diaSemana: string;
  horaInicio: string;
  horaFim: string;
  materiais: string | null;
  link: string | null;
  disciplinaId: string | null;
  disciplinas: { id: string; nome: string }[];
}) {
  const [aberto, setAberto] = useState(false);
  const [message, action, pending] = useActionState(editarMonitoria, undefined);

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="text-xs font-bold text-terracotta"
      >
        Remarcar
      </button>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-2 mt-2 w-full">
      <input type="hidden" name="monitoriaId" value={monitoriaId} />
      <div className="grid grid-cols-3 gap-2">
        <select
          name="diaSemana"
          defaultValue={diaSemana}
          className="rounded-lg border border-border-strong px-2 py-1.5 text-xs outline-none focus:border-ink bg-surface"
        >
          {DIAS_SEMANA.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <input
          name="horaInicio"
          type="time"
          defaultValue={horaInicio}
          className="rounded-lg border border-border-strong px-2 py-1.5 text-xs outline-none focus:border-ink"
        />
        <input
          name="horaFim"
          type="time"
          defaultValue={horaFim}
          className="rounded-lg border border-border-strong px-2 py-1.5 text-xs outline-none focus:border-ink"
        />
      </div>
      <select
        name="disciplinaId"
        defaultValue={disciplinaId ?? ""}
        className="rounded-lg border border-border-strong px-2 py-1.5 text-xs outline-none focus:border-ink bg-surface"
      >
        <option value="">Matéria (opcional)</option>
        {disciplinas.map((d) => (
          <option key={d.id} value={d.id}>
            {d.nome}
          </option>
        ))}
      </select>
      <input
        name="materiais"
        defaultValue={materiais ?? ""}
        placeholder="Materiais"
        className="rounded-lg border border-border-strong px-2 py-1.5 text-xs outline-none focus:border-ink"
      />
      <input
        name="link"
        defaultValue={link ?? ""}
        placeholder="Link da aula"
        className="rounded-lg border border-border-strong px-2 py-1.5 text-xs outline-none focus:border-ink"
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="font-bold text-xs px-3 py-1.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
        >
          {pending ? "Salvando…" : "Salvar"}
        </button>
        <button
          type="button"
          onClick={() => setAberto(false)}
          className="text-xs font-bold text-ink-faint"
        >
          Cancelar
        </button>
        {message && <span className="text-xs text-teal font-semibold">{message}</span>}
      </div>
    </form>
  );
}
