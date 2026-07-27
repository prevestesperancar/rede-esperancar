import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Marquee } from "@/components/site/Marquee";
import { CapaCarrossel } from "@/components/site/CapaCarrossel";
import { Star } from "@/components/ui/Star";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import {
  getEventosPublicos,
  getMateriaisPublicos,
  getNucleos,
  getSiteStats,
  getDepoimentosPublicos,
} from "@/lib/queries/site";

const PASSOS = [
  {
    titulo: "Bora conhecer a rede",
    desc: "Descubra os núcleos perto de você e como cada um se organiza.",
  },
  {
    titulo: "Garanta sua vaga",
    desc: "Preencha a inscrição do núcleo escolhido e aguarde a confirmação.",
  },
  {
    titulo: "Venha esperançar com a gente!",
    desc: "Acesse aulas, materiais e o apoio da sua turma no portal.",
  },
  {
    titulo: "Ocupe a universidade",
    desc: "Chegue ao vestibular e ao Enem com uma rede inteira na torcida!",
  },
];

const DEPOIMENTO_BG = ["bg-ink", "bg-terracotta", "bg-teal"];

function formatDate(d: Date) {
  return d
    .toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
    .toUpperCase()
    .replace(".", "");
}

export default async function Home() {
  const [stats, nucleos, materiais, eventos, depoimentos] = await Promise.all([
    getSiteStats(),
    getNucleos(),
    getMateriaisPublicos(3),
    getEventosPublicos(),
    getDepoimentosPublicos(),
  ]);

  const fotosCapa = nucleos
    .filter((n) => n.fotoUrl)
    .map((n) => ({ id: n.id, nome: n.nome, fotoUrl: n.fotoUrl as string }));

  return (
    <div>
      <Header />

      <section className="max-w-[1180px] mx-auto px-6 pt-9 pb-16 w-full">
        <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-wide text-terracotta uppercase mb-4">
              <Star className="w-2.5 h-2.5" />
              Pré-vestibular social e gratuito
            </span>
            <h1 className="font-display text-[clamp(2.1rem,5.2vw,3.6rem)] leading-[1.05] text-balance">
              Vem <span className="bg-yellow px-2">esperançar</span> com a
              gente!
            </h1>
            <blockquote className="mt-6 pl-4 border-l-[3px] border-yellow max-w-[50ch] text-[15px] leading-relaxed text-ink-soft italic">
              &ldquo;É preciso ter esperança, mas ter esperança do verbo
              esperançar; porque tem gente que tem esperança do verbo esperar.
              E esperança do verbo esperar não é esperança, é espera.
              Esperançar é se levantar, esperançar é ir atrás, esperançar é
              construir, esperançar é não desistir! Esperançar é levar
              adiante, esperançar é juntar-se com outros para fazer de outro
              modo…&rdquo;
              <cite className="block mt-2.5 not-italic font-bold text-xs text-terracotta font-mono">
                — Paulo Freire
              </cite>
            </blockquote>
            <div className="flex flex-wrap gap-3.5 mt-8">
              <Button href="/nucleos">Encontrar meu pré-vestibular →</Button>
              <Button href="/quem-somos" variant="ghost">
                Conhecer a Rede
              </Button>
            </div>
          </div>
          {fotosCapa.length > 0 ? (
            <CapaCarrossel fotos={fotosCapa} />
          ) : (
            <div className="relative rounded-[18px] overflow-hidden shadow-lg aspect-[4/3]">
              <Image
                src="/images/nucleo-maracana.jpg"
                alt="Turma do Esperançar Maracanã na mobilização Todos Pela UERJ"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-b border-border py-7">
        <div className="max-w-[1180px] mx-auto px-6 flex flex-wrap justify-between gap-5">
          <div className="flex-1 min-w-[140px]">
            <div className="font-mono font-bold text-3xl text-terracotta">
              {String(stats.nucleos).padStart(2, "0")}
            </div>
            <div className="text-[13px] font-semibold text-ink-soft mt-0.5">
              Núcleos ativos
            </div>
          </div>
          <div className="flex-1 min-w-[140px]">
            <div className="font-mono font-bold text-3xl text-terracotta">
              {stats.estudantes}
            </div>
            <div className="text-[13px] font-semibold text-ink-soft mt-0.5">
              Estudantes na rede
            </div>
          </div>
          <div className="flex-1 min-w-[140px]">
            <div className="font-mono font-bold text-3xl text-terracotta">
              {String(stats.cidades).padStart(2, "0")}
            </div>
            <div className="text-[13px] font-semibold text-ink-soft mt-0.5">
              Cidades atendidas
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1180px] mx-auto px-6 py-16 w-full">
        <div className="mb-9">
          <span className="flex items-center gap-1.5 font-mono text-xs font-bold text-teal uppercase tracking-wide mb-2.5">
            <Star className="w-2 h-2" />
            Encontre seu lugar
          </span>
          <h2 className="font-display text-[clamp(1.5rem,3.2vw,2.1rem)]">
            Qual núcleo mais próximo de você?
          </h2>
        </div>
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
                {nucleo.bairro}, {nucleo.cidade} — {nucleo.estado}
              </div>
              <div className="flex gap-4 mt-4 pt-4 border-t border-border text-[13px] text-ink-soft">
                <span>{nucleo.turmas.length} turma(s)</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-[1180px] mx-auto px-6 py-14 w-full">
        <div className="mb-9">
          <span className="flex items-center gap-1.5 font-mono text-xs font-bold text-teal uppercase tracking-wide mb-2.5">
            <Star className="w-2 h-2" />
            Sua trajetória
          </span>
          <h2 className="font-display text-[clamp(1.5rem,3.2vw,2.1rem)]">
            Venha fazer parte!
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PASSOS.map((passo, i) => (
            <div key={i}>
              <div className="h-1 w-8 bg-yellow rounded-sm mb-3.5" />
              <span className="font-mono font-bold text-[13px] text-ink-faint">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="font-extrabold text-base mt-2.5 mb-2">
                {passo.titulo}
              </div>
              <p className="text-sm text-ink-soft">{passo.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-[1180px] mx-auto px-6 py-14 w-full">
        <div className="mb-9">
          <span className="flex items-center gap-1.5 font-mono text-xs font-bold text-teal uppercase tracking-wide mb-2.5">
            <Star className="w-2 h-2" />
            Quem já passou por aqui
          </span>
          <h2 className="font-display text-[clamp(1.5rem,3.2vw,2.1rem)]">
            Histórias da rede
          </h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          {depoimentos.map((d, i) => (
            <div
              key={d.id}
              className={`${DEPOIMENTO_BG[i % DEPOIMENTO_BG.length]} text-paper rounded-[18px] p-6 relative overflow-hidden`}
            >
              <Star className="w-5 h-5 absolute top-4 right-4 opacity-90" />
              <p className="text-[15px] leading-relaxed">&ldquo;{d.quote}&rdquo;</p>
              <div className="flex items-center gap-2.5 mt-5">
                <div className="w-[38px] h-[38px] rounded-full overflow-hidden relative flex-shrink-0 bg-white/20 flex items-center justify-center font-display text-xs">
                  {d.fotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={d.fotoUrl} alt={d.nome} className="w-full h-full object-cover" />
                  ) : (
                    d.nome.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase()
                  )}
                </div>
                <div>
                  <div className="font-extrabold text-sm">{d.nome}</div>
                  <div className="text-xs opacity-75 font-mono">
                    {[d.curso, d.universidade].filter(Boolean).join(" · ")}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {depoimentos.length === 0 && (
            <p className="text-sm text-ink-faint">Nenhuma história cadastrada ainda.</p>
          )}
        </div>
      </section>

      {materiais.length > 0 && (
        <section className="max-w-[1180px] mx-auto px-6 py-14 w-full">
          <div className="mb-9 flex items-end justify-between gap-5 flex-wrap">
            <div>
              <span className="flex items-center gap-1.5 font-mono text-xs font-bold text-teal uppercase tracking-wide mb-2.5">
                <Star className="w-2 h-2" />
                Acesso livre
              </span>
              <h2 className="font-display text-[clamp(1.5rem,3.2vw,2.1rem)]">
                Materiais gratuitos
              </h2>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {materiais.map((m) => (
              <div
                key={m.id}
                className="bg-surface border border-border rounded-[18px] p-[22px] shadow-sm"
              >
                <div className="font-extrabold text-base mb-1.5">
                  {m.titulo}
                </div>
                <p className="text-[13px] text-ink-soft mb-3.5">
                  {m.descricao}
                </p>
                <a
                  href={m.arquivoUrl}
                  className="text-[13px] font-bold text-terracotta"
                >
                  Baixar PDF →
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {eventos.length > 0 && (
        <section className="max-w-[1180px] mx-auto px-6 py-14 w-full">
          <div className="mb-9">
            <span className="flex items-center gap-1.5 font-mono text-xs font-bold text-teal uppercase tracking-wide mb-2.5">
              <Star className="w-2 h-2" />
              Agenda
            </span>
            <h2 className="font-display text-[clamp(1.5rem,3.2vw,2.1rem)]">
              Próximos eventos
            </h2>
          </div>
          <div className="flex flex-col rounded-[18px] overflow-hidden border border-border">
            {eventos.map((e) => (
              <div
                key={e.id}
                className="flex items-center gap-5 px-5 py-4 bg-surface border-b border-border last:border-b-0"
              >
                <div className="font-mono font-bold text-[13px] text-terracotta w-[70px] flex-shrink-0">
                  {formatDate(e.data)}
                </div>
                <div className="font-bold text-[15px] flex-1">{e.titulo}</div>
                <div className="text-[13px] text-ink-faint hidden sm:block">
                  {e.local}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-[1180px] mx-auto px-6 py-14 w-full">
        <div className="bg-ink text-paper rounded-[28px] px-10 py-14 text-center">
          <h2 className="font-display text-[clamp(1.6rem,4vw,2.4rem)] max-w-[22ch] mx-auto text-paper">
            &ldquo;O jovem só perde a luta que ele não faz. Ser rebelde é ter
            ação, é se movimentar.&rdquo;
            <cite className="block mt-3.5 not-italic font-mono text-[13px] font-bold opacity-70">
              — Luiz Inácio Lula da Silva
            </cite>
          </h2>
          <p className="mt-3.5 max-w-[44ch] mx-auto text-paper/70">
            Bora encontrar o pré-vestibular mais perto de você. Ninguém entra
            sozinho, a gente entra junto!
          </p>
          <div className="flex flex-wrap gap-3.5 mt-7 justify-center">
            <Button href="/nucleos">Encontrar meu pré-vestibular →</Button>
            <Button href="/contato" variant="ghost" className="!text-paper !border-paper/40">
              Falar com a Rede
            </Button>
          </div>
        </div>
      </section>

      <Marquee />

      <Footer />
    </div>
  );
}
