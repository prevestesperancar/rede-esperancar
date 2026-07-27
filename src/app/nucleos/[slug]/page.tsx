import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Star } from "@/components/ui/Star";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { getNucleoBySlug } from "@/lib/queries/site";

export default async function NucleoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const nucleo = await getNucleoBySlug(slug);

  if (!nucleo) notFound();

  const totalMatriculados = nucleo.turmas.reduce(
    (acc, t) => acc + t.matriculas.length,
    0
  );

  const professoresMap = new Map<
    string,
    { nome: string; fotoUrl: string | null; disciplinas: Set<string> }
  >();
  for (const turma of nucleo.turmas) {
    for (const td of turma.disciplinas) {
      const existing = professoresMap.get(td.professor.id);
      if (existing) {
        existing.disciplinas.add(td.disciplina.nome);
      } else {
        professoresMap.set(td.professor.id, {
          nome: td.professor.nome,
          fotoUrl: td.professor.fotoUrl,
          disciplinas: new Set([td.disciplina.nome]),
        });
      }
    }
  }
  const professores = [...professoresMap.values()];

  const initials = (nome: string) =>
    nome
      .split(" ")
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();

  return (
    <div>
      <Header />

      <section className="max-w-[1180px] mx-auto px-6 pt-9 pb-16">
        <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div>
            <Link
              href="/nucleos"
              className="text-sm font-bold text-ink-soft hover:text-ink"
            >
              ← Todos os núcleos
            </Link>
            <div className="mt-3.5">
              <Tag tone="open">Vagas abertas</Tag>
            </div>
            <h1 className="font-display text-[clamp(1.9rem,4.6vw,2.9rem)] mt-2.5 text-balance">
              {nucleo.nome}
            </h1>
            <div className="font-mono text-[13px] text-ink-faint mt-3">
              📍 {nucleo.bairro}, {nucleo.cidade} — {nucleo.estado}
            </div>
            <p className="mt-4.5 max-w-[52ch] text-lg text-ink-soft">
              {nucleo.descricao}
            </p>
            <div className="flex flex-wrap gap-3.5 mt-7">
              <Button href={`/nucleos/${nucleo.slug}/inscricao`}>Inscrever-se neste núcleo →</Button>
              {nucleo.instagram && (
                <Button href={nucleo.instagram} variant="ghost">
                  Ver no Instagram
                </Button>
              )}
            </div>
          </div>
          {nucleo.fotoUrl && (
            <div className="relative rounded-[18px] overflow-hidden shadow-lg aspect-[4/3]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={nucleo.fotoUrl}
                alt={nucleo.nome}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-b border-border py-7">
        <div className="max-w-[1180px] mx-auto px-6 flex flex-wrap justify-between gap-5">
          <div className="flex-1 min-w-[140px]">
            <div className="font-mono font-bold text-3xl text-terracotta">
              {String(nucleo.turmas.length).padStart(2, "0")}
            </div>
            <div className="text-[13px] font-semibold text-ink-soft mt-0.5">
              Turma(s) ativa(s)
            </div>
          </div>
          <div className="flex-1 min-w-[140px]">
            <div className="font-mono font-bold text-3xl text-terracotta">
              {totalMatriculados}
            </div>
            <div className="text-[13px] font-semibold text-ink-soft mt-0.5">
              Estudantes matriculados
            </div>
          </div>
          <div className="flex-1 min-w-[140px]">
            <div className="font-mono font-bold text-3xl text-terracotta">
              {professores.length}
            </div>
            <div className="text-[13px] font-semibold text-ink-soft mt-0.5">
              Professores voluntários
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1180px] mx-auto px-6 py-14">
        <div className="mb-9">
          <span className="flex items-center gap-1.5 font-mono text-xs font-bold text-teal uppercase tracking-wide mb-2.5">
            <Star className="w-2 h-2" />
            Turmas
          </span>
          <h2 className="font-display text-[clamp(1.5rem,3.2vw,2.1rem)]">
            Turmas abertas neste núcleo
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {nucleo.turmas.map((turma) => {
            const pct = Math.min(
              100,
              Math.round((turma.matriculas.length / turma.capacidade) * 100)
            );
            return (
              <div
                key={turma.id}
                className="bg-surface border border-border rounded-[18px] p-[22px] shadow-sm"
              >
                <div className="flex justify-between items-center mb-2.5">
                  <span className="font-extrabold text-[17px]">
                    {turma.nome} — {turma.periodo}
                  </span>
                  <span className="font-mono text-xs text-ink-faint">
                    {turma.matriculas.length}/{turma.capacidade} vagas
                  </span>
                </div>
                <div className="h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {professores.length > 0 && (
        <section className="max-w-[1180px] mx-auto px-6 py-14">
          <div className="mb-9">
            <span className="flex items-center gap-1.5 font-mono text-xs font-bold text-teal uppercase tracking-wide mb-2.5">
              <Star className="w-2 h-2" />
              Quem ensina aqui
            </span>
            <h2 className="font-display text-[clamp(1.5rem,3.2vw,2.1rem)]">
              Professores e coordenação
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 bg-surface border border-border rounded-[18px] p-[22px]">
            {professores.map((p) => (
              <div key={p.nome} className="text-center">
                <div className="w-16 h-16 rounded-full mx-auto mb-3 relative overflow-hidden bg-ink text-paper flex items-center justify-center font-display text-base">
                  {p.fotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.fotoUrl}
                      alt={p.nome}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    initials(p.nome)
                  )}
                </div>
                <div className="font-extrabold text-sm">{p.nome}</div>
                <div className="text-xs text-ink-soft mt-0.5">
                  {[...p.disciplinas].join(", ")}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-[1180px] mx-auto px-6 py-14">
        <div className="mb-9">
          <span className="flex items-center gap-1.5 font-mono text-xs font-bold text-teal uppercase tracking-wide mb-2.5">
            <Star className="w-2 h-2" />
            Como chegar
          </span>
          <h2 className="font-display text-[clamp(1.5rem,3.2vw,2.1rem)]">
            Endereço e horários
          </h2>
        </div>
        <div className="bg-surface border border-border rounded-[18px] p-[22px] flex flex-wrap gap-6 max-w-[640px]">
          <div className="min-w-[160px]">
            <div className="font-mono text-[11px] text-ink-faint uppercase tracking-wide mb-1">
              Endereço
            </div>
            <div className="font-bold text-sm">{nucleo.endereco}</div>
          </div>
          <div className="min-w-[160px]">
            <div className="font-mono text-[11px] text-ink-faint uppercase tracking-wide mb-1">
              Dias de aula
            </div>
            <div className="font-bold text-sm">
              {nucleo.turmas.map((t) => t.periodo).join(", ")}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1180px] mx-auto px-6 py-14">
        <div className="bg-ink text-paper rounded-[28px] px-10 py-14 text-center">
          <h2 className="font-display text-[clamp(1.6rem,4vw,2.4rem)] max-w-[22ch] mx-auto text-paper">
            Cola na turma do {nucleo.nome.split(" ").slice(-1)[0]}.
          </h2>
          <p className="mt-3.5 max-w-[44ch] mx-auto text-paper/70">
            As inscrições pro próximo semestre já estão abertas — sua vaga tá
            esperando por você.
          </p>
          <div className="flex flex-wrap gap-3.5 mt-7 justify-center">
            <Button href={`/nucleos/${nucleo.slug}/inscricao`}>Inscrever-se neste núcleo →</Button>
            {nucleo.instagram && (
              <Button
                href={nucleo.instagram}
                variant="ghost"
                className="!text-paper !border-paper/40"
              >
                Ver no Instagram
              </Button>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
