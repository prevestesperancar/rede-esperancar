import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logout } from "@/actions/auth";
import { getSimuladosComAlunos } from "@/lib/queries/gestao";
import { getResultadosSimuladosPorNomes } from "@/actions/consulta";
import { RankingComGabarito } from "@/components/site/RankingComGabarito";

export default async function VisualizadorPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "VISUALIZADOR_SIMULADO") redirect("/login");

  const acessos = await prisma.acessoAlunoSimulado.findMany({ where: { userId: session.user.id } });
  const nomesPermitidos = acessos.map((a) => a.nomeCompleto);

  const [simulados, resultados] = await Promise.all([
    getSimuladosComAlunos(nomesPermitidos),
    getResultadosSimuladosPorNomes(nomesPermitidos),
  ]);

  return (
    <div className="max-w-4xl mx-auto p-5">
      <div className="flex items-center justify-between mb-7">
        <h1 className="font-display text-2xl">Resultados de simulado</h1>
        <form action={logout}>
          <button type="submit" className="text-xs font-bold text-ink-faint underline">
            Sair
          </button>
        </form>
      </div>

      {simulados.length === 0 ? (
        <p className="text-sm text-ink-faint">Nenhum resultado de simulado encontrado ainda.</p>
      ) : (
        <div className="flex flex-col gap-8">
          {simulados.map((s) => {
            const resultadosDoSimulado = resultados.filter((r) => r.simuladoId === s.id);
            return (
              <div key={s.id} className="bg-surface border border-border rounded-[18px] p-5">
                <div className="font-extrabold text-base mb-1">{s.nome}</div>
                <div className="text-xs text-ink-faint font-mono mb-4">
                  {s.data.toLocaleDateString("pt-BR")}
                </div>
                <RankingComGabarito resultados={resultadosDoSimulado} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
