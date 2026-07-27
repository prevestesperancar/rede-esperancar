"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const QUANTIDADES = [5, 10, 15, 20, 25, 30];

export function SelecaoSimuladoForm({
  materiasEnem,
  materiasUerj,
}: {
  materiasEnem: string[];
  materiasUerj: string[];
}) {
  const router = useRouter();
  const [prova, setProva] = useState<"ENEM" | "UERJ">("ENEM");
  const [selecionadas, setSelecionadas] = useState<string[]>([]);
  const [quantidade, setQuantidade] = useState(10);
  const [erro, setErro] = useState<string | null>(null);

  const materias = prova === "ENEM" ? materiasEnem : materiasUerj;

  function alternarMateria(m: string) {
    setSelecionadas((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  }

  function iniciar() {
    if (selecionadas.length === 0) {
      setErro("Escolha ao menos uma matéria.");
      return;
    }
    const params = new URLSearchParams({
      prova,
      materias: selecionadas.join(","),
      qtd: String(quantidade),
    });
    router.push(`/aluno/questoes/simulado?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="text-xs font-bold text-ink-faint uppercase tracking-wide mb-2">Prova</div>
        <div className="flex gap-2">
          {(["ENEM", "UERJ"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setProva(p);
                setSelecionadas([]);
              }}
              className={`font-extrabold text-sm px-5 py-2.5 rounded-full border ${
                prova === p
                  ? "bg-yellow border-yellow text-yellow-ink"
                  : "border-border-strong text-ink-soft"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs font-bold text-ink-faint uppercase tracking-wide mb-2">Matérias</div>
        {materias.length === 0 ? (
          <p className="text-sm text-ink-faint">
            Ainda não há questões de {prova} cadastradas no banco.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {materias.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => alternarMateria(m)}
                className={`text-sm font-bold px-4 py-2 rounded-full border ${
                  selecionadas.includes(m)
                    ? "bg-teal/10 border-teal text-teal"
                    : "border-border-strong text-ink-soft"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="text-xs font-bold text-ink-faint uppercase tracking-wide mb-2">
          Quantidade de questões
        </div>
        <div className="flex flex-wrap gap-2">
          {QUANTIDADES.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setQuantidade(q)}
              className={`text-sm font-bold w-12 h-10 rounded-full border ${
                quantidade === q
                  ? "bg-ink border-ink text-paper"
                  : "border-border-strong text-ink-soft"
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {erro && <p className="text-sm font-semibold text-terracotta">{erro}</p>}

      <button
        type="button"
        onClick={iniciar}
        disabled={materias.length === 0}
        className="font-extrabold text-sm py-3.5 rounded-full bg-yellow text-yellow-ink disabled:opacity-60"
      >
        Começar simulado →
      </button>
    </div>
  );
}
