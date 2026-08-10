import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getEstudanteByUserId } from "@/lib/queries/aluno";
import { getQuestoesErradas } from "@/lib/queries/banco";
import { SubNavBanco } from "@/components/aluno/SubNavBanco";

export default async function RevisaoBancoPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const estudante = await getEstudanteByUserId(session.user.id);
  if (!estudante) redirect("/login");
  if (!estudante.perfilIntensidade) redirect("/aluno/questoes/perfil");

  const erradas = await getQuestoesErradas(estudante.id);

  return (
    <div>
      <h1 className="font-display text-2xl mb-1">Revisão</h1>
      <p className="text-sm text-ink-soft mb-4">Pratique o que você errou e melhore seus pontos fracos.</p>
      <SubNavBanco />

      {erradas.length === 0 ? (
        <p className="text-sm text-ink-faint">Nenhuma questão para revisar. Continue praticando!</p>
      ) : (
        <div className="flex flex-col gap-3">
          {erradas.map((t) => (
            <div key={t.id} className="bg-surface border border-border rounded-2xl p-4">
              <div className="font-mono text-[11px] font-bold uppercase text-terracotta mb-1">
                {t.questao.prova} · {t.questao.materia}
              </div>
              <p className="text-sm mb-2 whitespace-pre-line">{t.questao.enunciado}</p>
              <div className="text-xs font-bold text-ink-soft">
                Sua resposta: <span className="text-terracotta">{t.respostaEscolhida}</span> · Correta:{" "}
                <span className="text-teal">{t.questao.respostaCorreta}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
