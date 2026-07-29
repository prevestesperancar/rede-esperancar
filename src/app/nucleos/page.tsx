import Link from "next/link";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Tag } from "@/components/ui/Tag";
import { getNucleos } from "@/lib/queries/site";
import { MapaUnidadesClient } from "@/components/site/MapaUnidadesClient";

export default async function NucleosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const nucleos = await getNucleos(q);
  const todosNucleos = await getNucleos();
  const comCoordenadas = todosNucleos.filter(
    (n): n is typeof n & { latitude: number; longitude: number } =>
      n.latitude !== null && n.longitude !== null
  );

  return (
    <div>
      <Header />
      <section className="max-w-[1180px] mx-auto px-6 py-14">
        <h1 className="font-display text-[clamp(1.7rem,4vw,2.4rem)] mb-6">
          Qual núcleo mais próximo de você?
        </h1>
        <form action="/nucleos" className="flex gap-2.5 mb-9 max-w-[420px]">
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Digite sua cidade ou bairro..."
            className="flex-1 rounded-full border-2 border-ink px-4 py-2.5 text-sm outline-none"
          />
          <button
            type="submit"
            className="font-extrabold text-sm px-5 py-2.5 rounded-full bg-yellow text-yellow-ink"
          >
            Buscar
          </button>
        </form>

        {q && (
          <p className="text-sm text-ink-soft mb-5">
            {nucleos.length} núcleo(s) encontrado(s) para &ldquo;{q}&rdquo;.{" "}
            <Link href="/nucleos" className="font-bold text-terracotta">
              Limpar busca
            </Link>
          </p>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {nucleos.map((nucleo) => (
            <Link
              key={nucleo.id}
              href={`/nucleos/${nucleo.slug}`}
              className="block bg-surface border border-border rounded-[18px] p-[22px] shadow-sm hover:-translate-y-1 transition-transform"
            >
              <Tag tone="open">Vagas abertas</Tag>
              <div className="font-extrabold text-[17px] mt-2.5">
                {nucleo.nome}
              </div>
              <div className="text-[13px] text-ink-faint font-mono mt-1">
                {nucleo.bairro ? `${nucleo.bairro}, ` : ""}
                {nucleo.cidade} — {nucleo.estado}
              </div>
              <div className="flex gap-4 mt-4 pt-4 border-t border-border text-[13px] text-ink-soft">
                <span>{nucleo.turmas.length} turma(s)</span>
              </div>
            </Link>
          ))}
          {nucleos.length === 0 && (
            <p className="text-sm text-ink-faint">
              Nenhum núcleo encontrado. Tente outra cidade ou bairro.
            </p>
          )}
        </div>

        {comCoordenadas.length > 0 && (
          <div className="mt-14">
            <h2 className="font-display text-xl mb-4">Mapa das unidades</h2>
            <div className="rounded-[18px] overflow-hidden border border-border" style={{ height: 420 }}>
              <MapaUnidadesClient nucleos={comCoordenadas} />
            </div>
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
