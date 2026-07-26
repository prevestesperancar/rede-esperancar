import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { InscricaoForm } from "@/components/site/InscricaoForm";
import { getNucleoBySlug } from "@/lib/queries/site";

export default async function InscricaoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const nucleo = await getNucleoBySlug(slug);
  if (!nucleo) notFound();

  const turmasComVaga = nucleo.turmas.filter(
    (t) => t.matriculas.length < t.capacidade
  );

  return (
    <div>
      <Header />
      <section className="max-w-[560px] mx-auto px-6 py-14">
        <Link
          href={`/nucleos/${nucleo.slug}`}
          className="text-sm font-bold text-ink-soft hover:text-ink"
        >
          ← {nucleo.nome}
        </Link>
        <h1 className="font-display text-2xl mt-3 mb-1">
          Inscrever-se neste núcleo
        </h1>
        <p className="text-sm text-ink-soft mb-7">
          Preencha seus dados. Sua inscrição fica pendente até a coordenação
          do núcleo aprovar.
        </p>

        {turmasComVaga.length > 0 ? (
          <div className="bg-surface border border-border rounded-[18px] p-6">
            <InscricaoForm
              turmas={turmasComVaga.map((t) => ({
                id: t.id,
                nome: t.nome,
                periodo: t.periodo,
              }))}
            />
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-[18px] p-6 text-center">
            <p className="text-sm text-ink-soft">
              Não há vagas disponíveis neste núcleo no momento.
            </p>
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
