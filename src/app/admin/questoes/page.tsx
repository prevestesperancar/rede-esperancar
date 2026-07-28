import { getTodasQuestoes, getTodasDisciplinas } from "@/lib/queries/banco";
import { NovaQuestaoForm } from "@/components/gestao/NovaQuestaoForm";
import { ApagarQuestaoButton } from "@/components/gestao/ApagarQuestaoButton";

export default async function AdminQuestoesPage() {
  const [questoes, disciplinas] = await Promise.all([getTodasQuestoes(), getTodasDisciplinas()]);

  return (
    <div>
      <h1 className="font-display text-2xl mb-1">Banco de questões</h1>
      <p className="text-sm text-ink-soft mb-7">
        Questões de múltipla escolha (ENEM/UERJ) usadas no simulado dinâmico do portal do aluno.
      </p>

      <div className="bg-surface border border-border rounded-[18px] p-5 mb-7">
        <div className="font-extrabold text-sm mb-3">Nova questão</div>
        <NovaQuestaoForm disciplinas={disciplinas} />
      </div>

      <div className="bg-surface border border-border rounded-[18px] divide-y divide-border">
        {questoes.map((q) => (
          <div key={q.id} className="p-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="font-mono text-[11px] font-bold text-terracotta uppercase tracking-wide mb-1">
                {q.prova} · {q.materia} {q.ano ? `· ${q.ano}` : ""}
              </div>
              <div className="text-sm line-clamp-2">{q.enunciado}</div>
              <div className="text-xs text-ink-faint mt-1">Resposta: {q.respostaCorreta}</div>
            </div>
            <ApagarQuestaoButton questaoId={q.id} />
          </div>
        ))}
        {questoes.length === 0 && (
          <p className="text-sm text-ink-faint p-4">Nenhuma questão cadastrada ainda.</p>
        )}
      </div>
    </div>
  );
}
