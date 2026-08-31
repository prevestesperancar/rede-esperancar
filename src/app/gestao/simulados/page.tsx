import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getSimuladosDoNucleo,
  getEstudantesParaSimulado,
  getNucleoNome,
} from "@/lib/queries/gestao";
import { apagarSimulado } from "@/actions/gestao";
import { NovoSimuladoForm } from "@/components/gestao/NovoSimuladoForm";
import { LancarRespostaForm } from "@/components/gestao/LancarRespostaForm";
import { ApagarItemButton } from "@/components/gestao/ApagarItemButton";
import { ImportarCartoesRespostaForm } from "@/components/gestao/ImportarCartoesRespostaForm";

export default async function SimuladosPage() {
  const session = await auth();
  if (!session?.user?.nucleoId) redirect("/login");

  const somenteLeitura = session.user.role === "APOIO_PSICOSSOCIAL";
  const podeImportarCartoes = ["COORDENACAO", "ADMIN"].includes(session.user.role);

  const [simulados, estudantes, nucleoNome] = await Promise.all([
    getSimuladosDoNucleo(session.user.nucleoId),
    getEstudantesParaSimulado(session.user.nucleoId),
    getNucleoNome(session.user.nucleoId),
  ]);

  return (
    <div>
      <div className="font-mono text-xs font-bold text-terracotta uppercase tracking-wide mb-1.5">
        {nucleoNome}
      </div>
      <h1 className="font-display text-2xl mb-6">
        {somenteLeitura ? "Desempenho em simulados" : "Simulados"}
      </h1>

      {!somenteLeitura && <NovoSimuladoForm />}

      <div className="flex flex-col gap-4">
        {simulados.map((s) => {
          const respostasPorEstudante = new Map(s.respostas.map((r) => [r.estudanteId, r]));
          return (
            <div key={s.id} className="bg-surface border border-border rounded-[18px] p-5">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <div className="font-extrabold text-base">{s.nome}</div>
                  <div className="text-xs text-ink-faint font-mono">
                    {s.data.toLocaleDateString("pt-BR")} · gabarito: {s.gabarito}
                  </div>
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
                  ? estudantes.map((e) => {
                      const resposta = respostasPorEstudante.get(e.id);
                      return (
                        <div
                          key={e.id}
                          className="flex items-center justify-between py-2 border-b border-border last:border-b-0 text-sm"
                        >
                          <span className="font-semibold">{e.nome}</span>
                          <span className="font-mono text-xs font-bold text-teal">
                            {resposta?.nota !== undefined && resposta?.nota !== null
                              ? resposta.nota.toFixed(1)
                              : "sem resposta lançada"}
                          </span>
                        </div>
                      );
                    })
                  : estudantes.map((e) => {
                      const resposta = respostasPorEstudante.get(e.id);
                      return (
                        <LancarRespostaForm
                          key={e.id}
                          simuladoId={s.id}
                          estudanteId={e.id}
                          estudanteNome={e.nome}
                          respostaId={resposta?.id}
                          respostasAtuais={resposta?.respostas}
                          nota={resposta?.nota}
                          corrigidoManualmente={resposta?.corrigidoManualmente}
                          fotoCartaoResposta={resposta?.fotoCartaoResposta}
                        />
                      );
                    })}
                {estudantes.length === 0 && (
                  <p className="text-sm text-ink-faint">Nenhum estudante matriculado ainda.</p>
                )}
              </div>

              {podeImportarCartoes && <ImportarCartoesRespostaForm simuladoId={s.id} />}
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
