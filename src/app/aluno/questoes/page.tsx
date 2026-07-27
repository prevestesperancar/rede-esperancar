import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getMateriasDisponiveis } from "@/lib/queries/banco";
import { SelecaoSimuladoForm } from "@/components/aluno/SelecaoSimuladoForm";

export default async function AlunoQuestoesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [materiasEnem, materiasUerj] = await Promise.all([
    getMateriasDisponiveis("ENEM"),
    getMateriasDisponiveis("UERJ"),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl mb-1">Banco de questões</h1>
      <p className="text-sm text-ink-soft mb-6">
        Monte seu simulado: escolha a prova, as matérias e quantas questões quer responder.
      </p>

      <SelecaoSimuladoForm materiasEnem={materiasEnem} materiasUerj={materiasUerj} />
    </div>
  );
}
