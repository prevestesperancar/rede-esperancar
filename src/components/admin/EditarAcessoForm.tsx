"use client";

import { useState, useActionState } from "react";
import { alterarAcessoUsuario, redefinirSenhaUsuario } from "@/actions/admin";

const ROLES = [
  { value: "PROFESSOR", label: "Professor(a)" },
  { value: "COORDENACAO", label: "Coordenação" },
  { value: "APOIO_PSICOSSOCIAL", label: "Apoio psicossocial" },
  { value: "ADMIN", label: "Admin" },
];

export function EditarAcessoForm({
  userId,
  email,
  role,
  nucleoId,
  nucleos,
}: {
  userId: string;
  email: string;
  role: string;
  nucleoId: string | null;
  nucleos: { id: string; nome: string }[];
}) {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [msgAcesso, actionAcesso, pendingAcesso] = useActionState(alterarAcessoUsuario, undefined);
  const [msgSenha, actionSenha, pendingSenha] = useActionState(redefinirSenhaUsuario, undefined);

  return (
    <div className="flex flex-col gap-2">
      <form action={actionAcesso} className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="userId" value={userId} />
        <input
          name="email"
          type="email"
          defaultValue={email}
          required
          className="rounded-lg border border-border-strong px-2.5 py-1.5 text-xs outline-none focus:border-ink min-w-[200px]"
        />
        <select
          name="role"
          defaultValue={role}
          className="rounded-lg border border-border-strong px-2.5 py-1.5 text-xs outline-none focus:border-ink bg-surface"
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        <select
          name="nucleoId"
          defaultValue={nucleoId ?? ""}
          className="rounded-lg border border-border-strong px-2.5 py-1.5 text-xs outline-none focus:border-ink bg-surface"
        >
          <option value="">Sem núcleo</option>
          {nucleos.map((n) => (
            <option key={n.id} value={n.id}>
              {n.nome}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={pendingAcesso}
          className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
        >
          {pendingAcesso ? "Salvando…" : "Salvar acesso"}
        </button>
        {msgAcesso && <span className="text-[11px] text-teal font-semibold">{msgAcesso}</span>}
      </form>

      {!mostrarSenha ? (
        <button
          type="button"
          onClick={() => setMostrarSenha(true)}
          className="text-[11px] font-bold text-ink-faint self-start"
        >
          Redefinir senha
        </button>
      ) : (
        <form action={actionSenha} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="userId" value={userId} />
          <input
            name="novaSenha"
            type="password"
            placeholder="Nova senha (mín. 6 caracteres)"
            className="rounded-lg border border-border-strong px-2.5 py-1.5 text-xs outline-none focus:border-ink"
          />
          <button
            type="submit"
            disabled={pendingSenha}
            className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-terracotta/10 text-terracotta disabled:opacity-60"
          >
            {pendingSenha ? "Salvando…" : "Redefinir"}
          </button>
          {msgSenha && <span className="text-[11px] text-teal font-semibold">{msgSenha}</span>}
        </form>
      )}
    </div>
  );
}
