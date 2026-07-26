import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getMonitoriasDoNucleo,
  getTurmasDoNucleo,
  getNucleoNome,
  getDisciplinasDoNucleo,
  getDisciplinasDoProfessor,
} from "@/lib/queries/gestao";
import { apagarMonitoria } from "@/actions/gestao";
import { NovaMonitoriaForm } from "@/components/gestao/NovaMonitoriaForm";
import { EditarMonitoriaForm } from "@/components/gestao/EditarMonitoriaForm";
import { ApagarItemButton } from "@/components/gestao/ApagarItemButton";

export default async function GestaoMonitoriasPage() {
  const session = await auth();
  if (!session?.user?.nucleoId) redirect("/login");

  const isProfessor = session.user.role === "PROFESSOR";

  const [monitorias, turmas, nucleoNome, disciplinas] = await Promise.all([
    getMonitoriasDoNucleo(session.user.nucleoId),
    getTurmasDoNucleo(session.user.nucleoId),
    getNucleoNome(session.user.nucleoId),
    isProfessor
      ? getDisciplinasDoProfessor(session.user.id)
      : getDisciplinasDoNucleo(session.user.nucleoId),
  ]);

  return (
    <div>
      <div className="flex items-start justify-between mb-7 gap-4 flex-wrap">
        <div>
          <div className="font-mono text-xs font-bold text-terracotta uppercase tracking-wide mb-1.5">
            {nucleoNome}
          </div>
          <h1 className="font-display text-2xl">Monitorias</h1>
        </div>
      </div>

      <NovaMonitoriaForm
        turmas={turmas.map((t) => ({ id: t.id, nome: t.nome }))}
        disciplinas={disciplinas.map((d) => ({ id: d.id, nome: d.nome }))}
      />

      <div className="bg-surface border border-border rounded-[18px] overflow-hidden">
        {monitorias.map((m) => (
          <div
            key={m.id}
            className="flex items-start gap-4 px-5 py-4 border-b border-border last:border-b-0"
          >
            <div className="font-mono font-bold text-xs text-terracotta w-[110px] flex-shrink-0">
              {m.diaSemana}
              <br />
              {m.horaInicio}–{m.horaFim}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm">
                {m.disciplina?.nome ?? "Monitoria"}
                {" · "}
                {m.turma ? m.turma.nome : m.global ? "Todos os prés" : "Todo o núcleo"}
              </div>
              {m.materiais && (
                <div className="text-xs text-ink-soft mt-0.5">{m.materiais}</div>
              )}
              {m.link && (
                <a href={m.link} className="text-xs font-bold text-terracotta">
                  Link da aula →
                </a>
              )}
              <div className="mt-1.5">
                <EditarMonitoriaForm
                  monitoriaId={m.id}
                  diaSemana={m.diaSemana}
                  horaInicio={m.horaInicio}
                  horaFim={m.horaFim}
                  materiais={m.materiais}
                  link={m.link}
                  disciplinaId={m.disciplinaId}
                  disciplinas={disciplinas.map((d) => ({ id: d.id, nome: d.nome }))}
                />
              </div>
            </div>
            <ApagarItemButton
              id={m.id}
              action={apagarMonitoria}
              confirmMessage="Apagar esta monitoria?"
            />
          </div>
        ))}
        {monitorias.length === 0 && (
          <p className="text-sm text-ink-faint p-5">Nenhuma monitoria ainda.</p>
        )}
      </div>
    </div>
  );
}
