"use client";

import { useActionState } from "react";
import { responderFormulario } from "@/actions/formularios";
import type { Campo } from "@/actions/formularios";

const inputClass =
  "w-full rounded-xl border border-border-strong px-4 py-3 text-sm outline-none focus:border-ink bg-surface";
const labelClass = "block text-sm font-semibold mb-1.5";

export function FormularioPublicoForm({
  formularioId,
  campos,
}: {
  formularioId: string;
  campos: Campo[];
}) {
  const action = responderFormulario.bind(null, formularioId);
  const [message, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {campos.map((campo) => (
        <div key={campo.id}>
          <label className={labelClass}>{campo.label}</label>
          {campo.tipo === "texto" && (
            <input name={campo.id} required={campo.obrigatorio} className={inputClass} />
          )}
          {campo.tipo === "textarea" && (
            <textarea
              name={campo.id}
              required={campo.obrigatorio}
              rows={4}
              className={`${inputClass} resize-none`}
            />
          )}
          {campo.tipo === "select" && (
            <select name={campo.id} required={campo.obrigatorio} defaultValue="" className={inputClass}>
              <option value="" disabled>
                Escolha uma opção
              </option>
              {campo.opcoes?.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          )}
          {campo.tipo === "checkbox" && (
            <select name={campo.id} required={campo.obrigatorio} defaultValue="" className={inputClass}>
              <option value="" disabled>
                Escolha uma opção
              </option>
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select>
          )}
        </div>
      ))}

      {message && <p className="text-sm text-terracotta font-semibold">{message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 inline-flex items-center justify-center gap-2 font-extrabold text-sm px-6 py-3.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Enviar →"}
      </button>
    </form>
  );
}
