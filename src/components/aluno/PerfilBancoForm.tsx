"use client";

import { useActionState, useState } from "react";
import { salvarPerfilBanco } from "@/actions/banco";

const PERFIS = [
  { valor: "SEM_PRESSAO", nome: "Sem pressão", desc: "Estude o essencial, sem estresse." },
  { valor: "EQUILIBRISTA", nome: "Equilibrista", desc: "Bom ritmo, muito foco, sem perrengue." },
  { valor: "MONSTRAO", nome: "Monstrão", desc: "Estude tudo e mais um pouco pra garantir." },
];

const QUANTIDADES = [10, 15, 20, 30, 50];

export function PerfilBancoForm({
  cursoDesejado,
  universidadeDesejada,
}: {
  cursoDesejado: string | null;
  universidadeDesejada: string | null;
}) {
  const [error, action, pending] = useActionState(salvarPerfilBanco, undefined);
  const [perfil, setPerfil] = useState("EQUILIBRISTA");
  const [lingua, setLingua] = useState("Inglês");
  const [qtd, setQtd] = useState(20);

  return (
    <form action={action} className="flex flex-col gap-7">
      <input type="hidden" name="perfilIntensidade" value={perfil} />
      <input type="hidden" name="linguaEstrangeira" value={lingua} />
      <input type="hidden" name="questoesPorDia" value={qtd} />

      <div>
        <div className="font-bold text-sm mb-3">Em qual perfil você se encaixa melhor?</div>
        <div className="grid sm:grid-cols-3 gap-3">
          {PERFIS.map((p) => (
            <button
              key={p.valor}
              type="button"
              onClick={() => setPerfil(p.valor)}
              className={`text-left rounded-2xl border-2 p-4 ${
                perfil === p.valor ? "border-teal bg-teal/5" : "border-border"
              }`}
            >
              <div className="font-extrabold text-sm mb-1">{p.nome}</div>
              <div className="text-xs text-ink-soft">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="font-bold text-sm mb-3">Qual língua você vai fazer no Enem?</div>
        <div className="flex gap-2">
          {["Inglês", "Espanhol"].map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLingua(l)}
              className={`font-bold text-sm px-5 py-2.5 rounded-full border ${
                lingua === l ? "bg-teal/10 border-teal text-teal" : "border-border-strong text-ink-soft"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="font-bold text-sm mb-1">Quantas questões por dia?</div>
        <p className="text-xs text-ink-faint mb-3">Pequeno e constante bate grande e esporádico.</p>
        <div className="flex gap-2">
          {QUANTIDADES.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setQtd(q)}
              className={`font-bold text-sm w-14 h-11 rounded-full border ${
                qtd === q ? "bg-ink border-ink text-paper" : "border-border-strong text-ink-soft"
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-ink-faint uppercase tracking-wide mb-1">
          Curso dos sonhos (opcional)
        </label>
        <input
          name="cursoDesejado"
          defaultValue={cursoDesejado ?? ""}
          placeholder="Ex: Medicina"
          className="w-full rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-ink-faint uppercase tracking-wide mb-1">
          Faculdade dos sonhos (opcional)
        </label>
        <input
          name="universidadeDesejada"
          defaultValue={universidadeDesejada ?? ""}
          placeholder="Ex: UERJ"
          className="w-full rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-ink"
        />
      </div>

      {error && <p className="text-sm font-semibold text-terracotta">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="font-extrabold text-sm py-3.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Começar →"}
      </button>
    </form>
  );
}
