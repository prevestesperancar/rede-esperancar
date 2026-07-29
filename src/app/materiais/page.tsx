import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Star } from "@/components/ui/Star";
import { getMateriaisPublicos } from "@/lib/queries/site";

const TIPO_LABEL: Record<string, string> = {
  SLIDE: "📊 Slide",
  EXERCICIO: "📝 Exercício",
  VIDEO: "🎬 Vídeo",
  OUTRO: "📎 Material",
};

export default async function MateriaisPage({
  searchParams,
}: {
  searchParams: Promise<{ busca?: string; disciplina?: string; tipo?: string }>;
}) {
  const { busca, disciplina, tipo } = await searchParams;
  const todosMateriais = await getMateriaisPublicos();

  const disciplinasDisponiveis = [
    ...new Set(todosMateriais.map((m) => m.disciplina?.nome).filter((n): n is string => Boolean(n))),
  ].sort();

  const materiais = todosMateriais.filter((m) => {
    if (busca) {
      const alvo = `${m.titulo} ${m.descricao ?? ""} ${m.aula ?? ""}`.toLowerCase();
      if (!alvo.includes(busca.toLowerCase())) return false;
    }
    if (disciplina && m.disciplina?.nome !== disciplina) return false;
    if (tipo && m.tipo !== tipo) return false;
    return true;
  });

  return (
    <div>
      <Header />
      <section className="max-w-[1180px] mx-auto px-6 py-14">
        <span className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-wide text-terracotta uppercase mb-4">
          <Star className="w-2.5 h-2.5" />
          Acesso livre
        </span>
        <h1 className="font-display text-[clamp(1.8rem,4.4vw,2.6rem)] mb-6">
          Materiais gratuitos
        </h1>

        <form className="flex flex-wrap gap-2.5 mb-8">
          <input
            name="busca"
            defaultValue={busca}
            placeholder="Buscar por título, aula..."
            className="flex-1 min-w-[200px] rounded-full border border-border-strong px-4 py-2.5 text-sm outline-none focus:border-ink"
          />
          <select
            name="disciplina"
            defaultValue={disciplina ?? ""}
            className="rounded-full border border-border-strong px-4 py-2.5 text-sm outline-none focus:border-ink bg-surface"
          >
            <option value="">Todas as disciplinas</option>
            {disciplinasDisponiveis.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select
            name="tipo"
            defaultValue={tipo ?? ""}
            className="rounded-full border border-border-strong px-4 py-2.5 text-sm outline-none focus:border-ink bg-surface"
          >
            <option value="">Todos os tipos</option>
            {Object.entries(TIPO_LABEL).map(([valor, label]) => (
              <option key={valor} value={valor}>
                {label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="font-extrabold text-sm px-5 py-2.5 rounded-full bg-yellow text-yellow-ink"
          >
            Filtrar
          </button>
        </form>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {materiais.map((m) => (
            <div
              key={m.id}
              className="bg-surface border border-border rounded-[18px] p-[22px] shadow-sm"
            >
              <div className="text-[11px] font-bold uppercase text-terracotta mb-1.5">
                {TIPO_LABEL[m.tipo] ?? TIPO_LABEL.OUTRO}
                {m.disciplina && ` · ${m.disciplina.nome}`}
              </div>
              <div className="font-extrabold text-base mb-1">{m.titulo}</div>
              {m.aula && <div className="text-xs font-bold text-ink-soft mb-1">{m.aula}</div>}
              <p className="text-[13px] text-ink-soft mb-3.5">{m.descricao}</p>
              <a href={m.arquivoUrl} target="_blank" rel="noopener noreferrer" className="text-[13px] font-bold text-terracotta">
                Acessar →
              </a>
            </div>
          ))}
          {materiais.length === 0 && (
            <p className="text-sm text-ink-faint">Nenhum material encontrado.</p>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
