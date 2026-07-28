import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEstudanteByUserId, getTurmaAtivaDoEstudante } from "@/lib/queries/aluno";
import { gerarCronogramaSemanal, semanaAtualChave } from "@/lib/cronograma";
import { ConcluirEstudoButton } from "@/components/aluno/ConcluirEstudoButton";

export default async function AlunoCronogramaPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const estudante = await getEstudanteByUserId(session.user.id);
  if (!estudante) redirect("/login");

  const turma = await getTurmaAtivaDoEstudante(estudante.id);

  if (!turma) {
    return (
      <div>
        <h1 className="font-display text-2xl mb-1">Cronograma de estudos</h1>
        <p className="text-sm text-ink-faint mt-4">
          Assim que sua turma for confirmada, seu cronograma semanal aparece aqui.
        </p>
      </div>
    );
  }

  const disciplinasUnicas = [...new Map(turma.disciplinas.map((d) => [d.disciplina.id, d.disciplina])).values()];
  const cronograma = gerarCronogramaSemanal(disciplinasUnicas);
  const semana = semanaAtualChave();

  const chaves = cronograma
    .filter((c) => c.disciplina)
    .map((c) => `${semana}-${c.dia}-${c.disciplina!.id}`);

  const concluidos = chaves.length
    ? await prisma.cronogramaConclusao.findMany({
        where: { estudanteId: estudante.id, chave: { in: chaves } },
        select: { chave: true },
      })
    : [];
  const concluidosSet = new Set(concluidos.map((c) => c.chave));

  return (
    <div>
      <h1 className="font-display text-2xl mb-1">Cronograma de estudos</h1>
      <p className="text-sm font-semibold text-ink-soft mb-6">
        Gerado a partir da grade da sua turma — um dia da semana pra revisar cada matéria antes da aula de sábado.
      </p>

      <div className="flex flex-col gap-3">
        {cronograma.map(({ dia, disciplina }) => {
          const chave = disciplina ? `${semana}-${dia}-${disciplina.id}` : null;
          const concluido = chave ? concluidosSet.has(chave) : false;
          return (
            <div
              key={dia}
              className="bg-surface border border-border rounded-2xl p-4 flex items-center justify-between gap-3"
            >
              <div>
                <div className="font-mono text-xs font-bold text-terracotta uppercase">{dia}</div>
                <div className="font-extrabold text-sm mt-0.5">
                  {disciplina ? `Revisar ${disciplina.nome}` : "Sem matéria na grade ainda"}
                </div>
              </div>
              {chave && <ConcluirEstudoButton chave={chave} concluido={concluido} />}
            </div>
          );
        })}
        <div className="bg-yellow/10 border border-yellow/30 rounded-2xl p-4">
          <div className="font-mono text-xs font-bold text-yellow-ink uppercase">Sábado</div>
          <div className="font-extrabold text-sm mt-0.5">Aula presencial — {turma.nome}</div>
        </div>
      </div>
    </div>
  );
}
