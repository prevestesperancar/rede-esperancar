import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getEstudanteByUserId,
  getTurmaAtivaDoEstudante,
  getMonitoriasDaTurma,
} from "@/lib/queries/aluno";

export default async function AlunoMonitoriasPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const estudante = await getEstudanteByUserId(session.user.id);
  if (!estudante) redirect("/login");

  const turma = await getTurmaAtivaDoEstudante(estudante.id);
  const monitorias = turma ? await getMonitoriasDaTurma(turma.id, turma.nucleoId) : [];

  return (
    <div>
      <h1 className="font-display text-2xl mb-1">Monitorias</h1>
      <p className="text-sm font-semibold text-ink-soft mb-6">
        Reforço fora do horário da aula
      </p>

      <div className="flex flex-col gap-3.5">
        {monitorias.map((m) => (
          <div key={m.id} className="bg-surface border border-border rounded-2xl p-4">
            <div className="font-mono text-xs font-bold text-terracotta">
              {m.diaSemana} · {m.horaInicio}–{m.horaFim}
            </div>
            {m.disciplina && (
              <div className="font-extrabold text-sm mt-1">{m.disciplina.nome}</div>
            )}
            {m.materiais && (
              <div className="text-sm mt-1.5">{m.materiais}</div>
            )}
            {m.link && (
              <a
                href={m.link}
                className="inline-flex items-center gap-1 mt-2.5 font-bold text-xs bg-ink text-paper px-3.5 py-2 rounded-full"
              >
                Entrar na aula →
              </a>
            )}
          </div>
        ))}
        {monitorias.length === 0 && (
          <p className="text-sm text-ink-faint">
            Nenhuma monitoria marcada por enquanto.
          </p>
        )}
      </div>
    </div>
  );
}
