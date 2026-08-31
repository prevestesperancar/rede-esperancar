"use client";

import { useState } from "react";

type Questao = {
  id: string;
  enunciado: string;
  imagemUrl: string | null;
  opcaoA: string;
  opcaoB: string;
  opcaoC: string;
  opcaoD: string;
  opcaoE: string | null;
  respostaCorreta: string;
  subtema: string | null;
};

export function QuestaoDoSimulado({
  numero,
  acertos,
  erros,
  percentualErro,
  questao,
}: {
  numero: number;
  acertos: number;
  erros: number;
  percentualErro: number;
  questao: Questao | null;
}) {
  const [aberta, setAberta] = useState(false);

  const alternativas: [string, string][] = [
    ["A", questao?.opcaoA ?? ""],
    ["B", questao?.opcaoB ?? ""],
    ["C", questao?.opcaoC ?? ""],
    ["D", questao?.opcaoD ?? ""],
    ...(questao?.opcaoE ? ([["E", questao.opcaoE]] as [string, string][]) : []),
  ];

  return (
    <div>
      <button
        type="button"
        onClick={() => questao && setAberta((v) => !v)}
        disabled={!questao}
        className="flex items-center gap-2 text-xs w-full text-left disabled:cursor-default"
      >
        <span
          className={`font-mono font-bold w-8 ${questao ? "underline decoration-dotted text-terracotta" : ""}`}
        >
          Q{numero}
        </span>
        <div className="flex-1 h-2 rounded-full bg-paper overflow-hidden">
          <div className="h-full bg-terracotta" style={{ width: `${percentualErro}%` }} />
        </div>
        <span className="text-ink-faint w-32 text-right flex-shrink-0">
          {acertos} acertos · {erros} erros ({percentualErro}% erro)
        </span>
      </button>

      {aberta && questao && (
        <div className="mt-2 mb-1 ml-10 bg-paper rounded-xl p-3.5 text-xs">
          {questao.subtema && (
            <p className="text-[11px] font-bold text-terracotta mb-2">{questao.subtema}</p>
          )}
          <p className="whitespace-pre-line mb-3">{questao.enunciado}</p>
          {questao.imagemUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={questao.imagemUrl}
              alt={`Imagem da questão ${numero}`}
              className="rounded-lg border border-border mb-3 max-w-full"
            />
          )}
          <div className="flex flex-col gap-1">
            {alternativas.map(([letra, texto]) => (
              <div
                key={letra}
                className={`rounded-lg px-2.5 py-1.5 ${
                  letra === questao.respostaCorreta
                    ? "bg-teal/10 font-bold text-teal"
                    : "bg-surface"
                }`}
              >
                {letra}) {texto}
                {letra === questao.respostaCorreta && " ✓"}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
