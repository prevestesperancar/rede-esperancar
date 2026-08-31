import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getSimuladosDoNucleo,
  getNucleoNome,
  getMateriasDoSimulado,
  getPercentualErroDetalhado,
} from "@/lib/queries/gestao";
import { PanoramaSimulado } from "@/components/gestao/PanoramaSimulado";
import { apagarSimulado } from "@/actions/gestao";
import { NovoSimuladoForm } from "@/components/gestao/NovoSimuladoForm";
import { LancarRespostaForm } from "@/components/gestao/LancarRespostaForm";
import { ApagarItemButton } from "@/components/gestao/ApagarItemButton";
import { ImportarCartoesRespostaForm } from "@/components/gestao/ImportarCartoesRespostaForm";
import { GabaritoEditorForm } from "@/components/gestao/GabaritoEditorForm";
import { AnexarProvaForm } from "@/components/gestao/AnexarProvaForm";
import { ResultadosSimulado } from "@/components/gestao/ResultadosSimulado";
import { conceitoUerj, rotuloConceito } from "@/lib/simulado";

export default async function SimuladosPage() {
  const session = await auth();
  if (!session?.user?.nucleoId) redirect("/login");
  if (session.user.role === "PROFESSOR") redirect("/gestao/simulados/minhas-questoes");

  const somenteLeitura = session.user.role === "APOIO_PSICOSSOCIAL";
  const podeImportarCartoes = ["COORDENACAO", "ADMIN"].includes(session.user.role);

  const [simulados, nucleoNome] = await Promise.all([
    getSimuladosDoNucleo(session.user.nucleoId),
    getNucleoNome(session.user.nucleoId),
  ]);

  const materiasPorSimulado = podeImportarCartoes
    ? new Map(
        await Promise.all(
          simulados.map(async (s) => [s.id, await getMateriasDoSimulado(s.id)] as const)
        )
      )
    : new Map<string, string[]>();

  const panoramaPorSimulado = podeImportarCartoes
    ? new Map(
        await Promise.all(
          simulados.map(async (s) => [s.id, await getPercentualErroDetalhado(s.id)] as const)
        )
      )
    : new Map<string, Awaited<ReturnType<typeof getPercentualErroDetalhado>>>();

  return (
    <div>
      <div className="font-mono text-xs font-bold text-terracotta uppercase tracking-wide mb-1.5">
        {nucleoNome}
      </div>
      <h1 className="font-display text-2xl mb-6">
        {somenteLeitura ? "Desempenho em simulados" : "Simulados"}
      </h1>
      <p className="text-xs text-ink-faint mb-6 -mt-4">
        Os cartões-resposta são identificados por nome e data de nascimento — não precisam
        corresponder a um aluno cadastrado no portal.
      </p>

      {!somenteLeitura && <NovoSimuladoForm />}

      <div className="flex flex-col gap-4">
        {simulados.map((s) => {
          const totalQuestoes = s.gabarito.split(",").length;
          return (
            <div key={s.id} className="bg-surface border border-border rounded-[18px] p-5">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <div className="font-extrabold text-base">{s.nome}</div>
                  <div className="text-xs text-ink-faint font-mono">
                    {s.data.toLocaleDateString("pt-BR")} · {totalQuestoes} questões
                  </div>
                  {!somenteLeitura && (
                    <GabaritoEditorForm
                      simuladoId={s.id}
                      gabaritoAtual={s.gabarito}
                      gabaritoIngles={s.gabaritoIngles}
                      gabaritoEspanhol={s.gabaritoEspanhol}
                      gabaritoFrances={s.gabaritoFrances}
                    />
                  )}
                </div>
                {!somenteLeitura && (
                  <ApagarItemButton
                    id={s.id}
                    action={apagarSimulado}
                    confirmMessage="Apagar este simulado e todas as respostas?"
                  />
                )}
              </div>

              <div className="mt-3.5 pt-3.5 border-t border-border">
                {somenteLeitura
                  ? s.respostas.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between py-2 border-b border-border last:border-b-0 text-sm"
                      >
                        <span className="font-semibold">{r.nomeCompleto}</span>
                        <span className="font-mono text-xs font-bold text-teal">
                          {r.nota !== null
                            ? (() => {
                                const conceito = conceitoUerj(r.nota, totalQuestoes);
                                const rotulo = rotuloConceito(conceito);
                                return `${r.nota}/${totalQuestoes} · Conceito ${conceito}${
                                  rotulo ? ` — ${rotulo}` : ""
                                }`;
                              })()
                            : "sem nota"}
                        </span>
                      </div>
                    ))
                  : s.respostas.map((r) => (
                      <LancarRespostaForm
                        key={r.id}
                        simuladoId={s.id}
                        respostaId={r.id}
                        nomeCompleto={r.nomeCompleto}
                        dataNascimento={r.dataNascimento}
                        respostasAtuais={r.respostas}
                        linguaEscolhida={r.linguaEscolhida}
                        nota={r.nota}
                        totalQuestoes={totalQuestoes}
                        corrigidoManualmente={r.corrigidoManualmente}
                        fotoCartaoResposta={r.fotoCartaoResposta}
                      />
                    ))}
                {s.respostas.length === 0 && (
                  <p className="text-sm text-ink-faint">Nenhum cartão-resposta lançado ainda.</p>
                )}
                {!somenteLeitura && (
                  <div className="mt-2">
                    <div className="text-[11px] font-bold text-ink-faint uppercase tracking-wide mb-1.5">
                      Adicionar cartão manualmente
                    </div>
                    <LancarRespostaForm simuladoId={s.id} totalQuestoes={totalQuestoes} />
                  </div>
                )}
              </div>

              {!somenteLeitura && <AnexarProvaForm simuladoId={s.id} arquivoAtual={s.arquivoProva} />}

              {podeImportarCartoes && <ImportarCartoesRespostaForm simuladoId={s.id} />}

              {podeImportarCartoes && panoramaPorSimulado.get(s.id) && (
                <div className="mt-4 pt-4 border-t border-border">
                  <PanoramaSimulado
                    porGrupo={panoramaPorSimulado.get(s.id)!.porGrupo}
                    porMateria={panoramaPorSimulado.get(s.id)!.porMateria}
                    porSubtema={panoramaPorSimulado.get(s.id)!.porSubtema}
                  />
                </div>
              )}

              {podeImportarCartoes && (
                <ResultadosSimulado
                  simuladoId={s.id}
                  materiasDisponiveis={materiasPorSimulado.get(s.id) ?? []}
                  totalQuestoes={totalQuestoes}
                  rankingGeral={s.respostas
                    .filter((r) => r.nota !== null)
                    .map((r) => {
                      const conceito = conceitoUerj(r.nota!, totalQuestoes);
                      return {
                        nomeCompleto: r.nomeCompleto,
                        nota: r.nota!,
                        conceito,
                        rotulo: rotuloConceito(conceito),
                      };
                    })
                    .sort((a, b) => b.nota - a.nota)}
                />
              )}
            </div>
          );
        })}
        {simulados.length === 0 && (
          <p className="text-sm text-ink-faint">Nenhum simulado cadastrado ainda.</p>
        )}
      </div>
    </div>
  );
}
