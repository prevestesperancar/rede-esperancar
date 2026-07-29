import Link from "next/link";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Star } from "@/components/ui/Star";
import { getNucleos } from "@/lib/queries/site";
import { MapaUnidadesClient } from "@/components/site/MapaUnidadesClient";

export default async function MapaPage() {
  const nucleos = await getNucleos();

  const comCoordenadas = nucleos.filter(
    (n): n is typeof n & { latitude: number; longitude: number } => n.latitude !== null && n.longitude !== null
  );
  const semCoordenadas = nucleos.filter((n) => n.latitude === null || n.longitude === null);

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

        {comCoordenadas.length > 0 ? (
          <div className="rounded-[18px] overflow-hidden border border-border mb-8" style={{ height: 480 }}>
            <MapaUnidadesClient nucleos={comCoordenadas} />
          </div>
        ) : (
          <p className="text-sm text-ink-faint mb-8">Nenhuma unidade com localização cadastrada ainda.</p>
        )}

        {semCoordenadas.length > 0 && (
          <div>
            <h2 className="font-extrabold text-base mb-3">Outras unidades</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {semCoordenadas.map((n) => (
                <Link
                  key={n.id}
                  href={`/nucleos/${n.slug}`}
                  className="bg-surface border border-border rounded-2xl p-4"
                >
                  <div className="font-extrabold text-sm">{n.nome}</div>
                  <div className="text-sm text-ink-soft">
                    {n.bairro} · {n.cidade}, {n.estado}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
