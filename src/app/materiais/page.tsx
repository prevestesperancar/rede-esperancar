import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Star } from "@/components/ui/Star";
import { getMateriaisPublicos } from "@/lib/queries/site";

export default async function MateriaisPage() {
  const materiais = await getMateriaisPublicos();

  return (
    <div>
      <Header />
      <section className="max-w-[1180px] mx-auto px-6 py-14">
        <span className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-wide text-terracotta uppercase mb-4">
          <Star className="w-2.5 h-2.5" />
          Acesso livre
        </span>
        <h1 className="font-display text-[clamp(1.8rem,4.4vw,2.6rem)] mb-8">
          Materiais gratuitos
        </h1>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {materiais.map((m) => (
            <div
              key={m.id}
              className="bg-surface border border-border rounded-[18px] p-[22px] shadow-sm"
            >
              <div className="font-extrabold text-base mb-1.5">{m.titulo}</div>
              <p className="text-[13px] text-ink-soft mb-3.5">{m.descricao}</p>
              <a href={m.arquivoUrl} className="text-[13px] font-bold text-terracotta">
                Baixar PDF →
              </a>
            </div>
          ))}
          {materiais.length === 0 && (
            <p className="text-sm text-ink-faint">Nenhum material disponível ainda.</p>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
