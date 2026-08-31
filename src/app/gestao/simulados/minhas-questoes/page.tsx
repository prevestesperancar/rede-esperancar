import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSimuladosDoNucleo, getNucleoNome, getEstatisticasSimuladoPorSecoes } from "@/lib/queries/gestao";
import { secoesDaMateria } from "@/lib/materia-secao";

export default async function MinhasQuestoesSimuladoPage() {
  const session = await auth();
  if (!session?.user?.nucleoId) redirect("/login");
  if (session.user.role !== "PROFESSOR") redirect("/gestao/simulados");

  const [usuario, simulados, nucleoNome] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id }, select: { materia: true } }),
    getSimuladosDoNucleo(session.user.nucleoId),
    getNucleoNome(session.user.nucleoId),
  ]);

  const secoes = secoesDaMateria(usuario?.materia);

  return (
    <div>
      <div className="font-mono text-xs font-bold text-terracotta uppercase tracking-wide mb-1.5">
        {nucleoNome}
      </div>
      <h1 className="font-display text-2xl mb-1">Simulados — {usuario?.materia || "minha matéria"}</h1>
      <p className="text-sm text-ink-soft mb-6">
        Questões e estatísticas dos simulados, na parte que cai da sua matéria.
      </p>

      {secoes.length === 0 ? (
        <p className="text-sm text-ink-faint">
          Sua matéria ({usuario?.materia || "não definida"}) ainda não está mapeada pra nenhum bloco da
          prova. Peça pra coordenação conferir seu cadastro.
        </p>
      ) : simulados.length === 0 ? (
        <p className="text-sm text-ink-faint">Nenhum simulado cadastrado ainda.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {await Promise.all(
            simulados.map(async (s) => {
              const stats = await getEstatisticasSimuladoPorSecoes(s.id, secoes);
              if (!stats || stats.totalQuestoesSecao === 0) return null;

              return (
                <div key={s.id} className="bg-surface border border-border rounded-[18px] p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                    <div>
                      <div className="font-extrabold text-base">{stats.simuladoNome}</div>
                      <div className="text-xs text-ink-faint font-mono">
                        {stats.simuladoData.toLocaleDateString("pt-BR")} · {stats.totalQuestoesSecao}{" "}
                        questão(ões) da sua parte · seções: {secoes.join(", ")}
                      </div>
                    </div>
                    {stats.arquivoProva && (
                      <a
                        href={stats.arquivoProva}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-xs px-4 py-2 rounded-full bg-yellow text-yellow-ink"
                      >
                        📄 Ver prova completa (PDF)
                      </a>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <div className="text-[11px] font-bold text-ink-faint uppercase tracking-wide mb-2">
                        Questão a questão
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {stats.questoes.map((q) => (
                          <div key={q.numero} className="flex items-center gap-2 text-xs">
                            <span className="font-mono font-bold w-8">Q{q.numero}</span>
                            <div className="flex-1 h-2 rounded-full bg-paper overflow-hidden">
                              <div
                                className="h-full bg-terracotta"
                                style={{ width: `${q.percentualErro}%` }}
                              />
                            </div>
                            <span className="text-ink-faint w-32 text-right">
                              {q.acertos} acertos · {q.erros} erros ({q.percentualErro}% erro)
                            </span>
                          </div>
                        ))}
                      </div>
                      {stats.questoes.length > 0 && (
                        <p className="text-xs text-ink-faint mt-2">
                          Questão com mais erro:{" "}
                          <strong>
                            Q
                            {
                              [...stats.questoes].sort((a, b) => b.percentualErro - a.percentualErro)[0]
                                .numero
                            }
                          </strong>{" "}
                          — considere reforçar esse conteúdo.
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-4">
                      <div>
                        <div className="text-[11px] font-bold text-teal uppercase tracking-wide mb-2">
                          Melhor desempenho (nessa parte)
                        </div>
                        <div className="flex flex-col gap-1">
                          {stats.melhoresAlunos.map((a) => (
                            <div
                              key={a.nomeCompleto}
                              className="flex items-center justify-between text-xs bg-teal/5 rounded-lg px-2.5 py-1.5"
                            >
                              <span className="font-semibold truncate">{a.nomeCompleto}</span>
                              <span className="font-mono font-bold text-teal flex-shrink-0">
                                {a.acertos}/{a.totalSecao} ({a.percentual}%)
                              </span>
                            </div>
                          ))}
                          {stats.melhoresAlunos.length === 0 && (
                            <p className="text-xs text-ink-faint">Nenhum cartão lançado ainda.</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-terracotta uppercase tracking-wide mb-2">
                          Precisa de mais apoio (nessa parte)
                        </div>
                        <div className="flex flex-col gap-1">
                          {stats.pioresAlunos.map((a) => (
                            <div
                              key={a.nomeCompleto}
                              className="flex items-center justify-between text-xs bg-terracotta/5 rounded-lg px-2.5 py-1.5"
                            >
                              <span className="font-semibold truncate">{a.nomeCompleto}</span>
                              <span className="font-mono font-bold text-terracotta flex-shrink-0">
                                {a.acertos}/{a.totalSecao} ({a.percentual}%)
                              </span>
                            </div>
                          ))}
                          {stats.pioresAlunos.length === 0 && (
                            <p className="text-xs text-ink-faint">Nenhum cartão lançado ainda.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
