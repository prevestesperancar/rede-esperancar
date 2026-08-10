import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getEstudanteByUserId } from "@/lib/queries/aluno";
import { ObjetivoEstudoForm } from "@/components/aluno/ObjetivoEstudoForm";

export default async function ObjetivoEstudoPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const estudante = await getEstudanteByUserId(session.user.id);
  if (!estudante) redirect("/login");

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-paper">
      <div className="max-w-sm w-full bg-surface border border-border rounded-[18px] p-6">
        <h1 className="font-display text-xl mb-1">Olá! Vamos focar no que você precisa 🎯</h1>
        <p className="text-sm text-ink-soft mb-6">Só uma pergunta rápida antes de começar.</p>
        <ObjetivoEstudoForm nomeAtual={estudante.user.nome} />
      </div>
    </div>
  );
}
