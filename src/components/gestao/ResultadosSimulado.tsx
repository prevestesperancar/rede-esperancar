"use client";

import { useState, useTransition } from "react";
import { buscarResultadosSimuladoPorMaterias } from "@/actions/gestao";
import { QuestaoDoSimulado } from "@/components/gestao/QuestaoDoSimulado";

type RankingGeral = { nomeCompleto: string; nota: number; conceito: string; rotulo: string };
type EstatisticasPorMateria = Awaited<ReturnType<typeof buscarResultadosSimuladoPorMaterias>>;

export function ResultadosSimulado({
  simuladoId,
  materiasDisponiveis,
  rankingGeral,
  totalQuestoes,
}: {
  simuladoId: string;
  materiasDisponiveis: string[];
  rankingGeral: RankingGeral[];
  totalQuestoes: number;
}) {
  const [selecionadas, setSelecionadas] = useState<string[]>([]);
  const [modo, setModo] = useState<"geral" | "materias">("geral");
  const [dados, setDados] = useState<EstatisticasPorMateria | null>(null);
  const [pending, startTransition] = useTransition();

  function alternarMateria(materia: string) {
    const novaSelecao = selecionadas.includes(materia)
      ? selecionadas.filter((m) => m !== materia)
      : [...selecionadas, materia];
    setSelecionadas(novaSelecao);
    setModo("materias");
    startTransition(async () => {
      if (novaSelecao.length === 0) {
        setDados(null);
        return;
      }
      const resultado = await buscarResultadosSimuladoPorMaterias(simuladoId, novaSelecao);
      setDados(resultado);
    });
  }

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <div className="text-[11px] font-bold text-ink-faint uppercase tracking-wide mb-2">
        Resultados — filtrar por matéria
      </div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        <button
          type="button"
          onClick={() => setModo("geral")}
          className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
            modo === "geral"
              ? "bg-ink text-paper border-ink"
              : "bg-surface border-border-strong"
          }`}
        >
          Geral (prova completa)
        </button>
        {materiasDisponiveis.map((materia) => (
          <button
            key={materia}
            type="button"
            onClick={() => alternarMateria(materia)}
            className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
              selecionadas.includes(materia) && modo === "materias"
                ? "bg-terracotta text-paper border-terracotta"
                : "bg-surface border-border-strong"
            }`}
          >
            {materia}
          </button>
        ))}
      </div>

      {modo === "geral" && (
        <div>
          <div className="text-[11px] font-bold text-ink-faint uppercase tracking-wide mb-2">
            Ranking geral ({rankingGeral.length} aluno(s))
          </div>
          <div className="flex flex-col gap-1 max-h-96 overflow-y-auto">
            {rankingGeral.map((a, i) => (
              <div
                key={a.nomeCompleto + i}
                className="flex items-center justify-between text-xs bg-paper rounded-lg px-3 py-2"
              >
                <span className="font-semibold truncate">
                  {i + 1}. {a.nomeCompleto}
                </span>
                <span className="font-mono font-bold text-ink flex-shrink-0">
                  {a.nota}/{totalQuestoes} · Conceito {a.conceito}
                  {a.rotulo ? ` — ${a.rotulo}` : ""}
                </span>
              </div>
            ))}
            {rankingGeral.length === 0 && (
              <p className="text-xs text-ink-faint">Nenhum cartão-resposta com nota lançado ainda.</p>
            )}
          </div>
        </div>
      )}

      {modo === "materias" && (
        <div>
          {selecionadas.length === 0 ? (
            <p className="text-xs text-ink-faint">Escolha uma ou mais matérias acima pra ver o resultado.</p>
          ) : pending || !dados ? (
            <p className="text-xs text-ink-faint">Calculando…</p>
          ) : dados.totalQuestoesSecao === 0 ? (
            <p className="text-xs text-ink-faint">Nenhuma questão cadastrada pra essa combinação de matérias.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <div className="text-[11px] font-bold text-ink-faint uppercase tracking-wide mb-2">
                  Questão a questão ({dados.totalQuestoesSecao} questões — {selecionadas.join(", ")})
                </div>
                <div className="flex flex-col gap-1.5">
                  {dados.questoes.map((q) => (
                    <QuestaoDoSimulado
                      key={q.numero}
                      numero={q.numero}
                      acertos={q.acertos}
                      erros={q.erros}
                      percentualErro={q.percentualErro}
                      questao={q.questao}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold text-ink-faint uppercase tracking-wide mb-2">
                  Ranking nessa parte ({dados.totalAlunosRankeados} aluno(s))
                </div>
                <div className="flex flex-col gap-1 max-h-96 overflow-y-auto">
                  {dados.melhoresAlunos.map((a, i) => (
                    <div
                      key={a.nomeCompleto + i}
                      className="flex items-center justify-between text-xs bg-teal/5 rounded-lg px-2.5 py-1.5"
                    >
                      <span className="font-semibold truncate">
                        {i + 1}. {a.nomeCompleto}
                      </span>
                      <span className="font-mono font-bold text-teal flex-shrink-0">
                        {a.acertos}/{a.totalSecao} ({a.percentual}%)
                      </span>
                    </div>
                  ))}
                  {dados.melhoresAlunos.length === 0 && (
                    <p className="text-xs text-ink-faint">Nenhum cartão lançado ainda.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
