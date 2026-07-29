import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Star } from "@/components/ui/Star";
import { getGaleriaEventosPublica, getEventosPublicos } from "@/lib/queries/site";

function formatDate(data: Date) {
  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default async function EventosPage() {
  const [fotos, proximosEventos] = await Promise.all([
    getGaleriaEventosPublica(),
    getEventosPublicos(),
  ]);

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
            {fotos.map((f) => {
              const Wrapper = f.instagramUrl
                ? ({ children }: { children: React.ReactNode }) => (
                    <a href={f.instagramUrl!} target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  )
                : ({ children }: { children: React.ReactNode }) => <>{children}</>;
              return (
                <div key={f.id} className="rounded-2xl overflow-hidden bg-surface border border-border">
                  <Wrapper>
                    {f.imagemUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={f.imagemUrl}
                        alt={f.legenda ?? "Foto de evento da Rede Esperançar"}
                        className="w-full aspect-square object-cover"
                      />
                    ) : (
                      <div className="w-full aspect-square flex items-center justify-center text-4xl bg-paper">
                        📸
                      </div>
                    )}
                  </Wrapper>
                  <div className="p-3">
                    {f.legenda && <div className="text-sm font-semibold">{f.legenda}</div>}
                    <div className="text-xs text-ink-faint font-mono mt-0.5">
                      {f.nucleo?.nome ?? "Rede Esperançar"} · {f.data.toLocaleDateString("pt-BR")}
                    </div>
                    {f.instagramUrl && (
                      <a
                        href={f.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-terracotta"
                      >
                        Ver no Instagram →
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {proximosEventos.length > 0 && (
          <div className="mt-14">
            <h2 className="font-display text-xl mb-4">Próximos eventos</h2>
            <div className="flex flex-col rounded-[18px] overflow-hidden border border-border">
              {proximosEventos.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center gap-5 px-5 py-4 bg-surface border-b border-border last:border-b-0"
                >
                  <div className="font-mono font-bold text-[13px] text-terracotta w-[70px] flex-shrink-0">
                    {formatDate(e.data)}
                  </div>
                  <div className="font-bold text-[15px] flex-1">{e.titulo}</div>
                  <div className="text-[13px] text-ink-faint hidden sm:block">{e.local}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
