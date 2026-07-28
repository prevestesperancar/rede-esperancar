import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Star } from "@/components/ui/Star";
import { getGaleriaEventosPublica } from "@/lib/queries/site";

export default async function EventosPage() {
  const fotos = await getGaleriaEventosPublica();

  return (
    <div>
      <Header />
      <section className="max-w-[1000px] mx-auto px-6 py-14">
        <span className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-wide text-terracotta uppercase mb-4">
          <Star className="w-2.5 h-2.5" />
          Eventos
        </span>
        <h1 className="font-display text-[clamp(2rem,5vw,2.8rem)] leading-[1.05] mb-6">
          O que rolou pelos nossos núcleos.
        </h1>
        <p className="text-lg text-ink-soft mb-10">
          Um pouco dos encontros, mutirões e comemorações da Rede Esperançar — direto do Instagram
          de cada núcleo.
        </p>

        {fotos.length === 0 ? (
          <p className="text-sm text-ink-faint">Nenhuma foto de evento publicada ainda.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            {fotos.map((f) => (
              <div key={f.id} className="rounded-2xl overflow-hidden bg-surface border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={f.imagemUrl}
                  alt={f.legenda ?? "Foto de evento da Rede Esperançar"}
                  className="w-full aspect-square object-cover"
                />
                <div className="p-3">
                  {f.legenda && <div className="text-sm font-semibold">{f.legenda}</div>}
                  <div className="text-xs text-ink-faint font-mono mt-0.5">
                    {f.nucleo?.nome ?? "Rede Esperançar"} · {f.data.toLocaleDateString("pt-BR")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
