import Link from "next/link";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Star } from "@/components/ui/Star";
import { getNucleos } from "@/lib/queries/site";
import { getConteudoSite } from "@/lib/queries/admin";

export default async function ContatoPage() {
  const [nucleos, conteudo] = await Promise.all([getNucleos(), getConteudoSite()]);

  return (
    <div>
      <Header />
      <section className="max-w-[640px] mx-auto px-6 py-14">
        <span className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-wide text-terracotta uppercase mb-4">
          <Star className="w-2.5 h-2.5" />
          Contato
        </span>
        <h1 className="font-display text-[clamp(1.8rem,4.4vw,2.6rem)] mb-6">
          Fala com a gente
        </h1>
        <p className="text-base text-ink-soft mb-8">
          Cada núcleo da rede tem sua própria coordenação. O jeito mais rápido
          de tirar uma dúvida é falar direto com o núcleo mais perto de você.
        </p>

        <div className="flex flex-col gap-3.5 mb-10">
          {nucleos.map((n) => (
            <Link
              key={n.id}
              href={`/nucleos/${n.slug}`}
              className="bg-surface border border-border rounded-2xl p-4 flex items-center justify-between hover:-translate-y-0.5 transition-transform"
            >
              <div>
                <div className="font-extrabold text-sm">{n.nome}</div>
                <div className="text-xs text-ink-faint font-mono">
                  {n.cidade} — {n.estado}
                </div>
              </div>
              <span className="text-sm font-bold text-terracotta">Ver núcleo →</span>
            </Link>
          ))}
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-1.5">
          <div className="font-extrabold text-sm mb-1">Contato geral da rede</div>
          <a
            href={`mailto:${conteudo?.contatoEmail ?? "contato@esperancar.org"}`}
            className="text-sm text-terracotta font-bold"
          >
            {conteudo?.contatoEmail ?? "contato@esperancar.org"}
          </a>
          {conteudo?.contatoTelefone && (
            <div className="text-sm text-ink-soft">{conteudo.contatoTelefone}</div>
          )}
          {conteudo?.contatoEndereco && (
            <div className="text-sm text-ink-soft">{conteudo.contatoEndereco}</div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
