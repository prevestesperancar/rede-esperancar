import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getMateriasDisponiveis } from "@/lib/queries/banco";
import { SelecaoSimuladoForm } from "@/components/aluno/SelecaoSimuladoForm";
import { SubNavBanco } from "@/components/aluno/SubNavBanco";

export default async function PraticarBancoPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [materiasEnem, materiasUerj] = await Promise.all([
    getMateriasDisponiveis("ENEM"),
    getMateriasDisponiveis("UERJ"),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl mb-1">Banco de questões</h1>
      <p className="text-sm text-ink-soft mb-4">
        Monte seu simulado: escolha a prova, as matérias e quantas questões quer responder.
      </p>
      <SubNavBanco />

      <Link
        href="/aluno/questoes/simulado-completo"
        className="block bg-ink text-paper rounded-2xl p-4 mb-6"
      >
        <div className="font-mono text-[11px] font-bold uppercase text-teal mb-1">Simulado oficial</div>
        <div className="font-extrabold text-sm">
          Quer treinar no formato real do Enem, com cronômetro e divisão em Dia 1/Dia 2? →
        </div>
      </Link>

      <div className="font-bold text-sm mb-3">Simulado rápido</div>
      <SelecaoSimuladoForm materiasEnem={materiasEnem} materiasUerj={materiasUerj} />
    </div>
  );
}
