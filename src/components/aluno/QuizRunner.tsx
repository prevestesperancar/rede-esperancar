"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { salvarTentativasBanco } from "@/actions/banco";

type Opcao = { letra: string; texto: string };
type Questao = {
  id: string;
  materia: string;
  enunciado: string;
  opcoes: Opcao[];
  respostaCorreta: string;
};

function formatarTempo(segundos: number) {
  const m = Math.floor(segundos / 60)
    .toString()
    .padStart(2, "0");
  const s = (segundos % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function QuizRunner({
  questoes,
  duracaoMinutos,
}: {
  questoes: Questao[];
  duracaoMinutos?: number;
}) {
  const [indice, setIndice] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [segundos, setSegundos] = useState(0);
  const [finalizado, setFinalizado] = useState(false);
  const salvouRef = useRef(false);

  const limiteSegundos = duracaoMinutos ? duracaoMinutos * 60 : null;
  const tempoExibido = limiteSegundos ? Math.max(limiteSegundos - segundos, 0) : segundos;

  useEffect(() => {
    if (!finalizado || salvouRef.current) return;
    salvouRef.current = true;
    const respondidas = questoes
      .filter((q) => respostas[q.id])
      .map((q) => ({
        questaoId: q.id,
        respostaEscolhida: respostas[q.id],
        correta: respostas[q.id] === q.respostaCorreta,
      }));
    salvarTentativasBanco(respondidas);
  }, [finalizado, questoes, respostas]);

  useEffect(() => {
    if (finalizado) return;
    const timer = setInterval(() => {
      setSegundos((s) => {
        const proximo = s + 1;
        if (limiteSegundos && proximo >= limiteSegundos) {
          setFinalizado(true);
        }
        return proximo;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [finalizado, limiteSegundos]);

  if (finalizado) {
    const acertos = questoes.filter((q) => respostas[q.id] === q.respostaCorreta).length;
    return (
      <div>
        <h1 className="font-display text-2xl mb-1">Resultado</h1>
        <p className="text-sm text-ink-soft mb-6">
          Tempo total: {formatarTempo(segundos)}
        </p>

        <div className="bg-ink text-paper rounded-[22px] p-6 text-center mb-6">
          <div className="font-display text-4xl">
            {acertos}/{questoes.length}
          </div>
          <div className="text-sm text-paper/70 mt-1">questões corretas</div>
        </div>

        <div className="flex flex-col gap-3 mb-6">
          {questoes.map((q, i) => {
            const respondida = respostas[q.id];
            const correta = respondida === q.respostaCorreta;
            return (
              <div
                key={q.id}
                className="bg-surface border border-border rounded-2xl p-4"
              >
                <div className="font-mono text-[11px] font-bold uppercase text-ink-faint mb-1">
                  Questão {i + 1} · {q.materia}
                </div>
                <div className="text-sm mb-2">{q.enunciado}</div>
                <div
                  className={`text-xs font-bold ${
                    correta ? "text-teal" : "text-terracotta"
                  }`}
                >
                  Sua resposta: {respondida ?? "não respondida"} · Correta: {q.respostaCorreta}
                </div>
              </div>
            );
          })}
        </div>

        <Link
          href="/aluno/questoes"
          className="block text-center font-extrabold text-sm py-3.5 rounded-full bg-yellow text-yellow-ink"
        >
          Fazer outro simulado
        </Link>
      </div>
    );
  }

  const questao = questoes[indice];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="font-mono text-xs font-bold text-terracotta uppercase tracking-wide">
          Questão {indice + 1}/{questoes.length} · {questao.materia}
        </div>
        <div
          className={`font-mono text-sm font-bold bg-surface border border-border rounded-full px-3.5 py-1.5 ${
            limiteSegundos && tempoExibido < 300 ? "text-terracotta border-terracotta" : ""
          }`}
        >
          ⏱ {formatarTempo(tempoExibido)}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-5 mb-5">
        <p className="text-sm mb-4 whitespace-pre-line">{questao.enunciado}</p>
        <div className="flex flex-col gap-2">
          {questao.opcoes.map((op) => (
            <button
              key={op.letra}
              type="button"
              onClick={() =>
                setRespostas((prev) => ({ ...prev, [questao.id]: op.letra }))
              }
              className={`text-left text-sm px-4 py-3 rounded-xl border ${
                respostas[questao.id] === op.letra
                  ? "bg-teal/10 border-teal text-teal font-bold"
                  : "border-border-strong"
              }`}
            >
              <span className="font-bold mr-2">{op.letra})</span>
              {op.texto}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          disabled={indice === 0}
          onClick={() => setIndice((i) => i - 1)}
          className="flex-1 font-bold text-sm py-3 rounded-full border border-border-strong text-ink-soft disabled:opacity-40"
        >
          ← Anterior
        </button>
        {indice < questoes.length - 1 ? (
          <button
            type="button"
            onClick={() => setIndice((i) => i + 1)}
            className="flex-1 font-extrabold text-sm py-3 rounded-full bg-ink text-paper"
          >
            Próxima →
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setFinalizado(true)}
            className="flex-1 font-extrabold text-sm py-3 rounded-full bg-yellow text-yellow-ink"
          >
            Finalizar simulado
          </button>
        )}
      </div>
    </div>
  );
}
