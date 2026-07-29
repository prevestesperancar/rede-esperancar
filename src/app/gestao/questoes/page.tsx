import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTodasQuestoes, getTodasDisciplinas } from "@/lib/queries/banco";
import { getDisciplinasDoProfessor } from "@/lib/queries/gestao";
import { NovaQuestaoForm } from "@/components/gestao/NovaQuestaoForm";
import { ApagarQuestaoButton } from "@/components/gestao/ApagarQuestaoButton";

export default async function GestaoQuestoesPage({
  searchParams,
}: {
  searchParams: Promise<{ prova?: string; materia?: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role === "APOIO_PSICOSSOCIAL") redirect("/gestao");

  const { prova, materia } = await searchParams;

  const [todasQuestoes, todasDisciplinas, disciplinasDoProfessor] = await Promise.all([
    getTodasQuestoes(),
    getTodasDisciplinas(),
    session.user.role === "PROFESSOR" ? getDisciplinasDoProfessor(session.user.id) : Promise.resolve(null),
  ]);

  // Professor só vê/cadastra questões das próprias disciplinas.
  const disciplinas = disciplinasDoProfessor ?? todasDisciplinas;
  const materiasPermitidas = disciplinasDoProfessor ? new Set(disciplinasDoProfessor.map((d) => d.nome)) : null;

  const questoes = todasQuestoes.filter((q) => {
    if (materiasPermitidas && !materiasPermitidas.has(q.materia)) return false;
    if (prova && q.prova !== prova) return false;
    if (materia && q.materia !== materia) return false;
    return true;
  });

  return (
    <div>
      <h1 className="font-display text-2xl mb-1">Banco de questões</h1>
      <p className="text-sm text-ink-soft mb-7">
        Questões de múltipla escolha (ENEM/UERJ) usadas no simulado dinâmico do portal do aluno.
        {disciplinasDoProfessor
          ? " Mostrando só as questões das suas disciplinas."
          : " Essas questões são compartilhadas entre todos os núcleos."}
      </p>

      <div className="bg-surface border border-border rounded-[18px] p-5 mb-7">
        <div className="font-extrabold text-sm mb-3">Nova questão</div>
        <NovaQuestaoForm disciplinas={disciplinas} />
      </div>

      <form className="flex flex-wrap gap-2.5 mb-4">
        <select
          name="prova"
          defaultValue={prova ?? ""}
          className="rounded-full border border-border-strong px-4 py-2.5 text-sm outline-none focus:border-ink bg-surface"
        >
          <option value="">Todas as provas</option>
          <option value="ENEM">ENEM</option>
          <option value="UERJ">UERJ</option>
        </select>
        <select
          name="materia"
          defaultValue={materia ?? ""}
          className="rounded-full border border-border-strong px-4 py-2.5 text-sm outline-none focus:border-ink bg-surface"
        >
          <option value="">Todas as matérias</option>
          {disciplinas.map((d) => (
            <option key={d.id} value={d.nome}>
              {d.nome}
            </option>
          ))}
        </select>
        <button type="submit" className="font-extrabold text-sm px-5 py-2.5 rounded-full bg-yellow text-yellow-ink">
          Filtrar
        </button>
      </form>

      <div className="bg-surface border border-border rounded-[18px] divide-y divide-border">
        {questoes.map((q) => (
          <div key={q.id} className="p-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="font-mono text-[11px] font-bold text-terracotta uppercase tracking-wide mb-1">
                {q.prova} · {q.materia} {q.ano ? `· ${q.ano}` : ""} {q.subtema ? `· ${q.subtema}` : ""}
              </div>
              <div className="text-sm line-clamp-2">{q.enunciado}</div>
              <div className="text-xs text-ink-faint mt-1">Resposta: {q.respostaCorreta}</div>
            </div>
            <ApagarQuestaoButton questaoId={q.id} />
          </div>
        ))}
        {questoes.length === 0 && (
          <p className="text-sm text-ink-faint p-4">Nenhuma questão encontrada.</p>
        )}
      </div>
    </div>
  );
}
