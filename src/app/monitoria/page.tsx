import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Star } from "@/components/ui/Star";
import { Button } from "@/components/ui/Button";
import { getConteudoSite } from "@/lib/queries/admin";

export default async function MonitoriaPage() {
  const conteudo = await getConteudoSite();

  return (
    <div>
      <Header />
      <section className="max-w-[760px] mx-auto px-6 py-14">
        <span className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-wide text-terracotta uppercase mb-4">
          <Star className="w-2.5 h-2.5" />
          Monitoria
        </span>
        <h1 className="font-display text-[clamp(2rem,5vw,2.8rem)] leading-[1.05] mb-6">
          Reforço individual, além da sala de aula.
        </h1>
        {conteudo?.monitoriaTexto ? (
          <p className="text-lg text-ink-soft mb-10 whitespace-pre-line">
            {conteudo.monitoriaTexto}
          </p>
        ) : (
          <>
            <p className="text-lg text-ink-soft mb-6">
              Além das aulas regulares, todo estudante da Rede Esperançar pode pedir
              monitoria individual com os professores das disciplinas que está
              cursando — um espaço combinado só entre o aluno e o professor, para
              tirar dúvidas com calma e no ritmo de cada um.
            </p>
            <p className="text-base text-ink-soft mb-10">
              O pedido é feito direto pelo portal do estudante: o professor sugere
              três horários possíveis, o aluno escolhe o que funciona melhor, e o
              encontro acontece por videochamada, num link fixo do próprio núcleo.
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
