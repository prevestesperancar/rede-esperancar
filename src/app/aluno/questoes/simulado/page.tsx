import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getQuestoesAleatorias } from "@/lib/queries/banco";
import { QuizRunner } from "@/components/aluno/QuizRunner";

export default async function SimuladoPage({
  searchParams,
}: {
  searchParams: Promise<{ prova?: string; materias?: string; qtd?: string; duracao?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { prova, materias, qtd, duracao } = await searchParams;
  if (!prova || !materias || !qtd) redirect("/aluno/questoes");

  const questoes = await getQuestoesAleatorias(
    prova,
    materias.split(","),
    Number(qtd)
  );

  if (questoes.length === 0) {
    return (
      <div>
        <p className="text-sm text-ink-soft">
          Não encontramos questões suficientes para essa seleção. Volte e tente outras matérias.
        </p>
      </div>
    );
  }

  return (
    <QuizRunner
      questoes={questoes.map((q) => ({
        id: q.id,
        materia: q.materia,
        enunciado: q.enunciado,
        imagemUrl: q.imagemUrl,
        opcoes: [
          { letra: "A", texto: q.opcaoA },
          { letra: "B", texto: q.opcaoB },
          { letra: "C", texto: q.opcaoC },
          { letra: "D", texto: q.opcaoD },
          ...(q.opcaoE ? [{ letra: "E", texto: q.opcaoE }] : []),
        ],
        respostaCorreta: q.respostaCorreta,
      }))}
      duracaoMinutos={duracao ? Number(duracao) : undefined}
    />
  );
}
