import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getEstudanteByUserId } from "@/lib/queries/aluno";
import { PerfilBancoForm } from "@/components/aluno/PerfilBancoForm";

export default async function PerfilBancoPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const estudante = await getEstudanteByUserId(session.user.id);
  if (!estudante) redirect("/login");

  return (
    <div>
      <h1 className="font-display text-2xl mb-1">Vamos focar no que você precisa 🎯</h1>
      <p className="text-sm text-ink-soft mb-7">
        Só algumas perguntas rápidas pra calibrar suas recomendações.
      </p>
      <PerfilBancoForm
        cursoDesejado={estudante.cursoDesejado}
        universidadeDesejada={estudante.universidadeDesejada}
      />
    </div>
  );
}
