import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Star } from "@/components/ui/Star";
import { Button } from "@/components/ui/Button";
import { getConteudoSite } from "@/lib/queries/admin";

export default async function CotasEPermanenciaPage() {
  const conteudo = await getConteudoSite();

  return (
    <div>
      <Header />
      <section className="max-w-[760px] mx-auto px-6 py-14">
        <span className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-wide text-terracotta uppercase mb-4">
          <Star className="w-2.5 h-2.5" />
          Cotas e permanência
        </span>
        <h1 className="font-display text-[clamp(2rem,5vw,2.8rem)] leading-[1.05] mb-6">
          Passar na universidade é o primeiro passo. Ficar é o segundo.
        </h1>
        {conteudo?.cotasTexto ? (
          <p className="text-lg text-ink-soft mb-10 whitespace-pre-line">
            {conteudo.cotasTexto}
          </p>
        ) : (
          <>
            <p className="text-lg text-ink-soft mb-6">
              A lei de cotas garante vagas em universidades públicas para
              estudantes de escola pública, pretos, pardos, indígenas e de baixa
              renda. Mas entrar é só o começo: manter-se na universidade exige
              apoio financeiro, psicológico e de rede — e é sobre isso que também
              trabalhamos.
            </p>
            <p className="text-base text-ink-soft mb-10">
              Ao longo da preparação, ajudamos os estudantes a entender as
              modalidades de cota disponíveis em cada vestibular, os programas de
              assistência estudantil (bolsa permanência, moradia, alimentação) e a
              se conectar com coletivos de estudantes cotistas dentro das
              universidades.
            </p>
          </>
        )}
        <div className="flex flex-wrap gap-3.5">
          <Button href="/nucleos">Encontrar meu pré-vestibular →</Button>
          <Button href="/contato" variant="ghost">
            Falar com a Rede
          </Button>
        </div>
      </section>
      <Footer />
    </div>
  );
}
