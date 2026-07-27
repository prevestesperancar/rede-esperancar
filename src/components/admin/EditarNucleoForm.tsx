"use client";

import { useActionState } from "react";
import { editarNucleoAdmin } from "@/actions/admin";

const inputClass =
  "w-full rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink";
const labelClass = "block text-xs font-bold text-ink-faint uppercase tracking-wide mb-1";

export function EditarNucleoForm({
  nucleoId,
  nome,
  cidade,
  estado,
  bairro,
  endereco,
  descricao,
  ativo,
}: {
  nucleoId: string;
  nome: string;
  cidade: string;
  estado: string;
  bairro: string;
  endereco: string | null;
  descricao: string | null;
  ativo: boolean;
}) {
  const [message, action, pending] = useActionState(editarNucleoAdmin, undefined);

  return (
    <form action={action} className="flex flex-col gap-4 max-w-xl">
      <input type="hidden" name="nucleoId" value={nucleoId} />
      <div>
        <label className={labelClass}>Nome</label>
        <input name="nome" defaultValue={nome} required className={inputClass} />
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Cidade</label>
          <input name="cidade" defaultValue={cidade} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Estado</label>
          <input name="estado" defaultValue={estado} required maxLength={2} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Bairro</label>
          <input name="bairro" defaultValue={bairro} required className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Endereço</label>
        <input name="endereco" defaultValue={endereco ?? ""} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Descrição</label>
        <textarea
          name="descricao"
          defaultValue={descricao ?? ""}
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" name="ativo" defaultChecked={ativo} className="w-4 h-4" />
        Núcleo ativo (aparece no site)
      </label>

      {message && <p className="text-sm text-terracotta font-semibold">{message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start font-extrabold text-sm px-6 py-3 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Salvar alterações"}
      </button>
    </form>
  );
}
