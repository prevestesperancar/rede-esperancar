import Link from "next/link";
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
      <h1 className="font-display text-2xl mb-1">Plano de estudos</h1>
      <p className="text-sm font-semibold text-ink-soft mb-6">
        Gerado a partir da grade da sua turma — um dia da semana pra revisar cada matéria antes da aula de sábado.
      </p>

      <div className="grid grid-cols-[repeat(6,minmax(160px,1fr))] gap-3 overflow-x-auto pb-2">
        {cronograma.map(({ dia, disciplina }) => {
          const chave = disciplina ? `${semana}-${dia}-${disciplina.id}` : null;
          const concluido = chave ? concluidosSet.has(chave) : false;
          return (
            <div key={dia} className="flex flex-col gap-3">
              <div className="font-mono text-xs font-bold text-terracotta uppercase text-center">{dia}</div>

              {disciplina ? (
                <Link
                  href={`/aluno/questoes/simulado?prova=ENEM&materias=${encodeURIComponent(
                    disciplina.nome
                  )}&qtd=10`}
                  className="bg-surface border border-border rounded-2xl p-3"
                >
                  <div className="font-mono text-[10px] font-bold uppercase text-ink-faint mb-1">
                    Nivelamento
                  </div>
                  <div className="font-bold text-xs">{disciplina.nome}</div>
                  <div className="text-[11px] text-ink-faint mt-0.5">10 questões</div>
                </Link>
              ) : (
                <div className="bg-surface border border-border rounded-2xl p-3">
                  <div className="text-[11px] text-ink-faint">Sem matéria na grade ainda</div>
                </div>
              )}

              {disciplina && (
                <div className="bg-surface border border-border rounded-2xl p-3">
                  <div className="font-bold text-xs mb-2">Revisar {disciplina.nome}</div>
                  {chave && <ConcluirEstudoButton chave={chave} concluido={concluido} />}
                </div>
              )}
            </div>
          );
        })}
        <div className="flex flex-col gap-3">
          <div className="font-mono text-xs font-bold text-terracotta uppercase text-center">Sábado</div>
          <div className="bg-yellow/10 border border-yellow/30 rounded-2xl p-3">
            <div className="font-mono text-[10px] font-bold uppercase text-yellow-ink mb-1">Ao vivo</div>
            <div className="font-bold text-xs">Aula presencial — {turma.nome}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
