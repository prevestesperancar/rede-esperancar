import Link from "next/link";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Star } from "@/components/ui/Star";
import { getNucleos } from "@/lib/queries/site";

export default async function MapaPage() {
  const nucleos = await getNucleos();

  return (
    <div>
      <Header />
      <section className="max-w-[1000px] mx-auto px-6 py-14">
        <span className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-wide text-terracotta uppercase mb-4">
          <Star className="w-2.5 h-2.5" />
          Mapa das unidades
        </span>
        <h1 className="font-display text-[clamp(2rem,5vw,2.8rem)] leading-[1.05] mb-6">
          Encontre o pré-vestibular mais perto de você.
        </h1>

        {nucleos.length === 0 ? (
          <p className="text-sm text-ink-faint">Nenhum núcleo cadastrado ainda.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {nucleos.map((n) => {
              const query =
                n.latitude && n.longitude
                  ? `${n.latitude},${n.longitude}`
                  : encodeURIComponent(`${n.endereco ?? n.bairro}, ${n.cidade}, ${n.estado}`);
              return (
                <div key={n.id} className="bg-surface border border-border rounded-[18px] overflow-hidden">
                  <iframe
                    title={`Mapa — ${n.nome}`}
                    src={`https://www.google.com/maps?q=${query}&output=embed`}
                    className="w-full h-48 border-0"
                    loading="lazy"
                  />
                  <div className="p-4">
                    <div className="font-extrabold text-base">{n.nome}</div>
                    <div className="text-sm text-ink-soft">
                      {n.bairro} · {n.cidade}, {n.estado}
                    </div>
                    <Link
                      href={`/nucleos/${n.slug}`}
                      className="inline-block mt-2 text-xs font-bold text-terracotta"
                    >
                      Ver este pré-vestibular →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
