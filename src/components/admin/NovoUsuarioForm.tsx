"use client";

import { useState, useActionState } from "react";
import { criarUsuarioAdmin } from "@/actions/admin";

const ROLES = [
  { value: "PROFESSOR", label: "Professor(a)" },
  { value: "COORDENACAO", label: "Coordenação" },
  { value: "APOIO_PSICOSSOCIAL", label: "Apoio psicossocial" },
  { value: "ADMIN", label: "Admin" },
];

export function NovoUsuarioForm({ nucleos }: { nucleos: { id: string; nome: string }[] }) {
  const [message, action, pending] = useActionState(criarUsuarioAdmin, undefined);
  const [role, setRole] = useState("PROFESSOR");

  return (
    <form action={action} className="bg-surface border border-border rounded-[18px] p-5 mb-6 flex flex-col gap-3">
      <div className="font-extrabold text-[15px]">Novo usuário</div>
      <p className="text-xs text-ink-faint">
        Estudantes entram pela inscrição pública do núcleo, não por aqui.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          name="nome"
          placeholder="Nome completo"
          required
          className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
        />
        <input
          name="email"
          type="email"
          placeholder="E-mail"
          required
          className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
        />
      </div>
      <input
        name="senha"
        type="password"
        placeholder="Senha de acesso (mín. 8, com letra e número)"
        required
        className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
      />
      <div className="grid sm:grid-cols-2 gap-3">
        <select
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink bg-surface"
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        {role !== "ADMIN" && (
          <select
            name="nucleoId"
            required
            defaultValue=""
            className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink bg-surface"
          >
            <option value="" disabled>
              Escolha o núcleo
            </option>
            {nucleos.map((n) => (
              <option key={n.id} value={n.id}>
                {n.nome}
              </option>
            ))}
          </select>
        )}
      </div>
      {message && (
        <p className={`text-sm font-semibold ${message === "Usuário criado!" ? "text-teal" : "text-terracotta"}`}>
          {message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="self-start font-extrabold text-sm px-5 py-2.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
      >
        {pending ? "Criando…" : "Criar usuário"}
      </button>
    </form>
  );
}
