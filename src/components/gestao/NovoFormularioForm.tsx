"use client";

import { useState } from "react";
import { useActionState } from "react";
import { criarFormulario } from "@/actions/formularios";

type CampoRascunho = {
  id: string;
  label: string;
  tipo: "texto" | "textarea" | "select" | "checkbox";
  opcoesTexto: string;
  obrigatorio: boolean;
};

const TIPOS = [
  { value: "texto", label: "Texto curto" },
  { value: "textarea", label: "Texto longo" },
  { value: "select", label: "Múltipla escolha" },
  { value: "checkbox", label: "Sim/Não" },
];

export function NovoFormularioForm() {
  const [error, action, pending] = useActionState(criarFormulario, undefined);
  const [campos, setCampos] = useState<CampoRascunho[]>([
    { id: crypto.randomUUID(), label: "", tipo: "texto", opcoesTexto: "", obrigatorio: true },
  ]);

  const addCampo = () =>
    setCampos((c) => [
      ...c,
      { id: crypto.randomUUID(), label: "", tipo: "texto", opcoesTexto: "", obrigatorio: true },
    ]);

  const removeCampo = (id: string) => setCampos((c) => c.filter((campo) => campo.id !== id));

  const updateCampo = (id: string, patch: Partial<CampoRascunho>) =>
    setCampos((c) => c.map((campo) => (campo.id === id ? { ...campo, ...patch } : campo)));

  const camposJson = JSON.stringify(
    campos
      .filter((c) => c.label.trim())
      .map((c) => ({
        id: c.id,
        label: c.label,
        tipo: c.tipo,
        obrigatorio: c.obrigatorio,
        ...(c.tipo === "select"
          ? { opcoes: c.opcoesTexto.split(",").map((o) => o.trim()).filter(Boolean) }
          : {}),
      }))
  );

  return (
    <form action={action} className="bg-surface border border-border rounded-[18px] p-5 mb-6 flex flex-col gap-4">
      <div className="font-extrabold text-[15px]">Novo formulário</div>
      <input type="hidden" name="campos" value={camposJson} />
      <input
        name="titulo"
        placeholder="Título do formulário"
        required
        className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
      />
      <textarea
        name="descricao"
        placeholder="Descrição (opcional)"
        rows={2}
        className="rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink resize-none"
      />

      <div className="flex flex-col gap-3">
        <div className="font-bold text-xs uppercase tracking-wide text-ink-faint">Campos</div>
        {campos.map((campo, i) => (
          <div key={campo.id} className="bg-paper rounded-xl p-3.5 flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                value={campo.label}
                onChange={(e) => updateCampo(campo.id, { label: e.target.value })}
                placeholder={`Pergunta ${i + 1}`}
                className="flex-1 rounded-lg border border-border-strong px-3 py-2 text-sm outline-none focus:border-ink bg-surface"
              />
              <select
                value={campo.tipo}
                onChange={(e) => updateCampo(campo.id, { tipo: e.target.value as CampoRascunho["tipo"] })}
                className="rounded-lg border border-border-strong px-2 py-2 text-sm outline-none focus:border-ink bg-surface"
              >
                {TIPOS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              {campos.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCampo(campo.id)}
                  className="text-xs font-bold text-terracotta px-2"
                >
                  Remover
                </button>
              )}
            </div>
            {campo.tipo === "select" && (
              <input
                value={campo.opcoesTexto}
                onChange={(e) => updateCampo(campo.id, { opcoesTexto: e.target.value })}
                placeholder="Opções separadas por vírgula"
                className="rounded-lg border border-border-strong px-3 py-2 text-sm outline-none focus:border-ink bg-surface"
              />
            )}
            <label className="flex items-center gap-2 text-xs font-semibold">
              <input
                type="checkbox"
                checked={campo.obrigatorio}
                onChange={(e) => updateCampo(campo.id, { obrigatorio: e.target.checked })}
                className="w-4 h-4"
              />
              Obrigatório
            </label>
          </div>
        ))}
        <button
          type="button"
          onClick={addCampo}
          className="self-start text-xs font-bold text-terracotta"
        >
          + Adicionar campo
        </button>
      </div>

      {error && <p className="text-sm text-terracotta font-semibold">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start font-extrabold text-sm px-5 py-2.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
      >
        {pending ? "Criando…" : "Criar formulário"}
      </button>
    </form>
  );
}
