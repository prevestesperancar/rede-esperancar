import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Star } from "@/components/ui/Star";
import { Button } from "@/components/ui/Button";
import { getSiteStats } from "@/lib/queries/site";
import { getConteudoSite } from "@/lib/queries/admin";

export default async function QuemSomosPage() {
  const [stats, conteudo] = await Promise.all([getSiteStats(), getConteudoSite()]);

  return (
    <div>
      <Header />
      <section className="max-w-[760px] mx-auto px-6 py-14">
        <span className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-wide text-terracotta uppercase mb-4">
          <Star className="w-2.5 h-2.5" />
          Quem somos nós
        </span>
        <h1 className="font-display text-[clamp(2rem,5vw,2.8rem)] leading-[1.05] mb-6">
          Uma rede de pré-vestibulares sociais e gratuitos.
        </h1>
        {conteudo?.quemSomosTexto ? (
          <p className="text-lg text-ink-soft mb-10 whitespace-pre-line">
            {conteudo.quemSomosTexto}
          </p>
        ) : (
          <>
            <p className="text-lg text-ink-soft mb-6">
              A Rede Esperançar reúne pré-vestibulares sociais espalhados pelo Rio
              de Janeiro, todos tocados por voluntários — ex-alunos, professores e
              coordenadores que acreditam numa certeza urgente: a universidade
              pública foi construída pelo povo e precisa ser ocupada pelo povo.
            </p>
            <p className="text-base text-ink-soft mb-10">
              O nome vem de um verbo: esperançar, de Paulo Freire. Não é esperar
              parado — é se levantar, ir atrás, construir e não desistir, junto
              com outras pessoas. É assim que a gente entende a preparação para o
              Enem e os vestibulares: como um mutirão, não uma corrida solitária.
            </p>
          </>
        )}

        <div className="grid grid-cols-3 gap-5 mb-10 border-y border-border py-7">
          <div>
            <div className="font-mono font-bold text-3xl text-terracotta">
              {String(stats.nucleos).padStart(2, "0")}
            </div>
            <div className="text-[13px] font-semibold text-ink-soft mt-0.5">
              Núcleos ativos
            </div>
          </div>
          <div>
            <div className="font-mono font-bold text-3xl text-terracotta">
              {stats.estudantes}
            </div>
            <div className="text-[13px] font-semibold text-ink-soft mt-0.5">
              Estudantes na rede
            </div>
          </div>
          <div>
            <div className="font-mono font-bold text-3xl text-terracotta">
              {String(stats.cidades).padStart(2, "0")}
            </div>
            <div className="text-[13px] font-semibold text-ink-soft mt-0.5">
              Cidades atendidas
            </div>
          </div>
        </div>

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
