"use client";

import { useActionState } from "react";
import { atualizarStatusEstudante } from "@/actions/gestao";

const STATUS_OPTIONS = [
  { value: "EM_AVALIACAO", label: "Em avaliação" },
  { value: "PRESENTE", label: "Ativo" },
  { value: "FALTANTE", label: "Faltante" },
  { value: "DESISTENTE", label: "Desistente" },
  { value: "TRANSFERIDO", label: "Transferido" },
];

const inputClass =
  "w-full rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink";
const labelClass = "block text-xs font-bold text-ink-faint uppercase tracking-wide mb-1";

export function ApoioStatusForm({
  estudanteId,
  status,
}: {
  estudanteId: string;
  status: string;
}) {
  const [message, action, pending] = useActionState(atualizarStatusEstudante, undefined);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="estudanteId" value={estudanteId} />

      <div>
        <label className={labelClass}>Status do estudante</label>
        <select name="status" defaultValue={status} className={`${inputClass} bg-surface`}>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Registrar novo contato (observação)</label>
        <textarea
          name="ultimoContatoObs"
          rows={3}
          placeholder="Ex: Conversamos por telefone sobre a frequência nas aulas..."
          className={inputClass}
        />
        <p className="text-xs text-ink-faint mt-1">
          Preencher aqui registra a data de hoje como último contato.
        </p>
      </div>

      {message && <p className="text-sm font-semibold text-teal">{message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start font-extrabold text-sm px-5 py-2.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Salvar"}
      </button>
    </form>
  );
}
