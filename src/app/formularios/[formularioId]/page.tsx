import { notFound } from "next/navigation";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getFormularioPublico } from "@/lib/queries/formularios";
import { FormularioPublicoForm } from "@/components/site/FormularioPublicoForm";
import type { Campo } from "@/actions/formularios";

export default async function FormularioPublicoPage({
  params,
}: {
  params: Promise<{ formularioId: string }>;
}) {
  const { formularioId } = await params;
  const formulario = await getFormularioPublico(formularioId);
  if (!formulario) notFound();

  const campos: Campo[] = JSON.parse(formulario.campos);

  return (
    <div>
      <Header />
      <section className="max-w-[560px] mx-auto px-6 py-14">
        <h1 className="font-display text-2xl mb-1">{formulario.titulo}</h1>
        {formulario.descricao && (
          <p className="text-sm text-ink-soft mb-7">{formulario.descricao}</p>
        )}

        {formulario.ativo ? (
          <div className="bg-surface border border-border rounded-[18px] p-6">
            <FormularioPublicoForm formularioId={formulario.id} campos={campos} />
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-[18px] p-6 text-center">
            <p className="text-sm text-ink-soft">Esse formulário não está mais recebendo respostas.</p>
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
