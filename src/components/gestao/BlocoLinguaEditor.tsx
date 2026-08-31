"use client";

import { useState } from "react";
import { IDIOMAS_BLOCO_LINGUA, INICIO_BLOCO_LINGUA, FIM_BLOCO_LINGUA } from "@/lib/simulado";

const OPCOES = ["A", "B", "C", "D", "ANULADA"];

function paraArray(valor: string | null | undefined) {
  const partes = (valor ?? "").split(",").map((r) => r.trim().toUpperCase());
  return Array.from({ length: FIM_BLOCO_LINGUA - INICIO_BLOCO_LINGUA + 1 }, (_, i) => partes[i] || "A");
}

// Bloco de língua estrangeira (questões 23-27, padrão Uerj) — um gabarito
// por idioma, já que cada aluno escolhe só um na hora da prova.
export function BlocoLinguaEditor({
  gabaritoIngles,
  gabaritoEspanhol,
  gabaritoFrances,
}: {
  gabaritoIngles?: string | null;
  gabaritoEspanhol?: string | null;
  gabaritoFrances?: string | null;
}) {
  const [ingles, setIngles] = useState<string[]>(() => paraArray(gabaritoIngles));
  const [espanhol, setEspanhol] = useState<string[]>(() => paraArray(gabaritoEspanhol));
  const [frances, setFrances] = useState<string[]>(() => paraArray(gabaritoFrances));

  const blocos = [
    { nome: "gabaritoIngles", label: "Inglês", valores: ingles, set: setIngles },
    { nome: "gabaritoEspanhol", label: "Espanhol", valores: espanhol, set: setEspanhol },
    { nome: "gabaritoFrances", label: "Francês", valores: frances, set: setFrances },
  ];

  return (
    <div>
      <div className="text-xs font-bold text-ink-faint uppercase tracking-wide mb-1.5">
        Bloco de língua estrangeira (questões {INICIO_BLOCO_LINGUA} a {FIM_BLOCO_LINGUA})
      </div>
      <div className="flex flex-col gap-2.5">
        {blocos.map((bloco) => (
          <div key={bloco.nome} className="flex items-center gap-2 flex-wrap">
            <input type="hidden" name={bloco.nome} value={bloco.valores.join(",")} />
            <span className="text-xs font-bold w-16 flex-shrink-0">{bloco.label}</span>
            {bloco.valores.map((r, i) => (
              <select
                key={i}
                value={r}
                onChange={(e) =>
                  bloco.set((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))
                }
                className={`rounded-lg border px-1.5 py-1 text-xs font-bold outline-none focus:border-ink ${
                  r === "ANULADA" ? "border-terracotta text-terracotta" : "border-border-strong"
                }`}
              >
                {OPCOES.map((o) => (
                  <option key={o} value={o}>
                    {o === "ANULADA" ? "X" : o}
                  </option>
                ))}
              </select>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export { IDIOMAS_BLOCO_LINGUA };
