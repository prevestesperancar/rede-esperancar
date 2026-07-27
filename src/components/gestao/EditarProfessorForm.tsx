"use client";

import { useActionState } from "react";
import { atualizarProfessor } from "@/actions/gestao";

export function EditarProfessorForm({
  professorId,
  nome,
  email,
  telefone,
  materia,
  fotoUrl,
}: {
  professorId: string;
  nome: string;
  email: string;
  telefone: string | null;
  materia: string | null;
  fotoUrl?: string | null;
}) {
  const [message, action, pending] = useActionState(atualizarProfessor, undefined);

  return (
    <form action={action} className="bg-surface border border-border rounded-[18px] p-5 flex flex-col gap-3">
      <input type="hidden" name="professorId" value={professorId} />
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-ink-faint uppercase tracking-wide mb-1">
            Nome
          </label>
          <input
            name="nome"
            defaultValue={nome}
            required
            className="w-full rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-ink-faint uppercase tracking-wide mb-1">
            WhatsApp
          </label>
          <input
            name="telefone"
            defaultValue={telefone ?? ""}
            placeholder="(21) 99999-0000"
            className="w-full rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold text-ink-faint uppercase tracking-wide mb-1">
          E-mail
        </label>
        <input
          name="email"
          type="email"
          defaultValue={email}
          required
          className="w-full rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-ink-faint uppercase tracking-wide mb-1">
          Matéria
        </label>
        <input
          name="materia"
          defaultValue={materia ?? ""}
          placeholder="Ex: Matemática"
          className="w-full rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-ink-faint uppercase tracking-wide mb-1">
          Foto
        </label>
        {fotoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fotoUrl}
            alt={nome}
            className="w-16 h-16 rounded-full object-cover mb-2"
          />
        )}
        <input
          name="foto"
          type="file"
          accept="image/*"
          className="w-full rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink file:mr-3 file:rounded-full file:border-0 file:bg-yellow file:text-yellow-ink file:font-bold file:text-xs file:px-3 file:py-1.5"
        />
        {fotoUrl && (
          <label className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-ink-soft">
            <input type="checkbox" name="removerFoto" />
            Remover foto
          </label>
        )}
      </div>
      {message && <p className="text-sm font-semibold text-teal">{message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start font-extrabold text-sm px-5 py-2.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Salvar alterações"}
      </button>
    </form>
  );
}
