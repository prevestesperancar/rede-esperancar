import Link from "next/link";
import { notFound } from "next/navigation";
import { getNucleoAdminById } from "@/lib/queries/admin";
import { EditarNucleoForm } from "@/components/admin/EditarNucleoForm";

export default async function EditarNucleoPage({
  params,
}: {
  params: Promise<{ nucleoId: string }>;
}) {
  const { nucleoId } = await params;
  const nucleo = await getNucleoAdminById(nucleoId);
  if (!nucleo) notFound();

  return (
    <div>
      <Link href="/admin" className="text-sm font-bold text-ink-soft hover:text-ink">
        ← Núcleos
      </Link>
      <h1 className="font-display text-2xl mt-3 mb-7">Editar núcleo</h1>
      <EditarNucleoForm
        nucleoId={nucleo.id}
        nome={nucleo.nome}
        cidade={nucleo.cidade}
        estado={nucleo.estado}
        bairro={nucleo.bairro}
        endereco={nucleo.endereco}
        descricao={nucleo.descricao}
        ativo={nucleo.ativo}
      />
    </div>
  );
}
