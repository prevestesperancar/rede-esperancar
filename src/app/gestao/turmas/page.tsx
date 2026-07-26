import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getTurmasDoNucleo,
  getProfessoresDoNucleo,
  getFrequenciaGeralTurma,
  getNucleoNome,
} from "@/lib/queries/gestao";
import { apagarDisciplinaGrade } from "@/actions/gestao";
import { NovaDisciplinaGradeForm } from "@/components/gestao/NovaDisciplinaGradeForm";
import { NovaTurmaForm } from "@/components/gestao/NovaTurmaForm";
import { EditarTurmaForm } from "@/components/gestao/EditarTurmaForm";
import { ToggleTurmaAtivaButton } from "@/components/gestao/ToggleTurmaAtivaButton";
import { ApagarItemButton } from "@/components/gestao/ApagarItemButton";

export default async function TurmasPage() {
  const session = await auth();
  if (!session?.user?.nucleoId) redirect("/login");

  const [turmas, professores, nucleoNome] = await Promise.all([
    getTurmasDoNucleo(session.user.nucleoId),
    getProfessoresDoNucleo(session.user.nucleoId),
    getNucleoNome(session.user.nucleoId),
  ]);

  const frequencias = await Promise.all(
    turmas.map((t) => getFrequenciaGeralTurma(t.id))
  );

  return (
    <div>
      <div className="flex items-start justify-between mb-7 gap-4 flex-wrap">
        <div>
          <div className="font-mono text-xs font-bold text-terracotta uppercase tracking-wide mb-1.5">
            {nucleoNome}
          </div>
          <h1 className="font-display text-2xl">Turmas</h1>
        </div>
      </div>

      <NovaTurmaForm />

      {turmas.map((turma, i) => {
        const pct = Math.min(
          100,
          Math.round((turma.matriculas.length / turma.capacidade) * 100)
        );
        const freq = frequencias[i];

        return (
          <div
            key={turma.id}
            className="bg-surface border border-border rounded-[18px] p-5 mb-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-extrabold text-base">
                {turma.nome} — {turma.periodo}
              </h3>
              <div className="flex items-center gap-2">
                <ToggleTurmaAtivaButton turmaId={turma.id} ativo={turma.ativo} />
                <span className="text-[11px] font-bold uppercase text-teal bg-teal/10 px-2.5 py-1 rounded-full">
                  {turma.matriculas.length}/{turma.capacidade} vagas
                </span>
              </div>
            </div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-teal rounded-full"
                style={{ width: `${pct}%` }}
              />
            </div>

            <EditarTurmaForm
              turmaId={turma.id}
              nome={turma.nome}
              periodo={turma.periodo}
              capacidade={turma.capacidade}
              whatsappLink={turma.whatsappLink}
            />

            <div className="grid sm:grid-cols-2 gap-4 mb-4 mt-4">
              <div className="bg-paper rounded-2xl p-3.5">
                <div className="font-mono text-[11px] font-bold uppercase text-ink-faint mb-1">
                  Frequência geral da turma
                </div>
                <div className="font-display text-xl">
                  {freq.percentual !== null ? `${freq.percentual}%` : "—"}
                </div>
                <div className="text-xs text-ink-faint">
                  {freq.total > 0
                    ? `${freq.presentes}/${freq.total} presenças registradas`
                    : "Nenhum registro de frequência ainda."}
                </div>
              </div>
              <div className="bg-paper rounded-2xl p-3.5">
                <div className="font-mono text-[11px] font-bold uppercase text-ink-faint mb-1">
                  Matriculados
                </div>
                <div className="font-display text-xl">{turma.matriculas.length}</div>
                <div className="text-xs text-ink-faint">de {turma.capacidade} vagas</div>
              </div>
            </div>

            <div className="text-sm font-bold mb-2">Grade de horários</div>
            <div className="flex flex-col">
              {turma.disciplinas.map((d) => (
                <div
                  key={d.id}
                  className="grid grid-cols-[100px_90px_minmax(0,1.2fr)_minmax(0,1fr)_auto] items-center gap-2.5 py-2.5 border-b border-border last:border-b-0 text-sm"
                >
                  <span className="font-mono text-xs text-ink-faint">
                    {d.diaSemana}
                  </span>
                  <span className="font-mono text-xs text-ink-faint">
                    {d.horaInicio}–{d.horaFim}
                  </span>
                  <span className="font-bold min-w-0 [overflow-wrap:anywhere]">
                    {d.disciplina.nome}
                  </span>
                  <span className="text-ink-soft text-xs min-w-0 [overflow-wrap:anywhere]">
                    {d.professor.nome}
                  </span>
                  <ApagarItemButton
                    id={d.id}
                    action={apagarDisciplinaGrade}
                    confirmMessage="Remover esta aula da grade?"
                  />
                </div>
              ))}
              {turma.disciplinas.length === 0 && (
                <p className="text-sm text-ink-faint">Grade ainda vazia.</p>
              )}
            </div>
            <NovaDisciplinaGradeForm
              turmaId={turma.id}
              professores={professores.map((p) => ({ id: p.id, nome: p.nome }))}
            />

            <div className="text-sm font-bold mb-2 mt-5">
              Matriculados nesta turma
            </div>
            {turma.matriculas.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-2.5 py-2 border-b border-border last:border-b-0 text-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-teal" />
                {m.estudante.user.nome}
              </div>
            ))}
            {turma.matriculas.length === 0 && (
              <p className="text-sm text-ink-faint">
                Nenhuma matrícula aprovada ainda.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
