import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getEstudanteByUserId, getMateriaisDoNucleo } from "@/lib/queries/aluno";
import { FavoritarMaterialButton } from "@/components/aluno/FavoritarMaterialButton";

const TIPO_LABEL: Record<string, string> = {
  SLIDE: "📊 Slide",
  EXERCICIO: "📝 Exercício",
  VIDEO: "🎬 Vídeo",
  OUTRO: "📎 Outro",
};

export default async function AlunoMateriaisPage({
  searchParams,
}: {
  searchParams: Promise<{ busca?: string; disciplina?: string; favoritos?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const estudante = await getEstudanteByUserId(session.user.id);
  if (!estudante) redirect("/login");

  const { busca, disciplina, favoritos } = await searchParams;

  const todosMateriais = session.user.nucleoId
    ? await getMateriaisDoNucleo(session.user.nucleoId, estudante.id)
    : [];

  const disciplinasDisponiveis = [
    ...new Set(todosMateriais.map((m) => m.disciplina?.nome).filter((n): n is string => Boolean(n))),
  ].sort();

  const materiais = todosMateriais.filter((m) => {
    if (busca) {
      const alvo = `${m.titulo} ${m.descricao ?? ""} ${m.aula ?? ""}`.toLowerCase();
      if (!alvo.includes(busca.toLowerCase())) return false;
    }
    if (disciplina && m.disciplina?.nome !== disciplina) return false;
    if (favoritos === "1" && m.favoritos.length === 0) return false;
    return true;
  });

  return (
    <div>
      <h1 className="font-display text-2xl mb-1">Materiais</h1>
      <p className="text-sm font-semibold text-ink-soft mb-5">Tudo liberado pra sua turma</p>

      <form className="flex flex-wrap gap-2.5 mb-6">
        <input
          name="busca"
          defaultValue={busca}
          placeholder="Buscar por título, aula..."
          className="flex-1 min-w-[180px] rounded-full border border-border-strong px-4 py-2.5 text-sm outline-none focus:border-ink"
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
        <label className="flex items-center gap-1.5 text-sm font-semibold px-3.5 py-2.5 rounded-full border border-border-strong">
          <input type="checkbox" name="favoritos" value="1" defaultChecked={favoritos === "1"} className="w-4 h-4" />
          ⭐ Favoritos
        </label>
        <button
          type="submit"
          className="font-extrabold text-sm px-5 py-2.5 rounded-full bg-yellow text-yellow-ink"
        >
          Filtrar
        </button>
      </form>

      <div className="flex flex-col gap-3.5">
        {materiais.map((m) => (
          <div
            key={m.id}
            className="bg-surface border border-border rounded-2xl p-4 flex items-center justify-between gap-3"
          >
            <a href={m.arquivoUrl} className="flex-1 min-w-0">
              <div className="text-[11px] font-bold uppercase text-ink-faint mb-0.5">
                {TIPO_LABEL[m.tipo] ?? TIPO_LABEL.OUTRO}
                {m.disciplina && ` · ${m.disciplina.nome}`}
              </div>
              <div className="font-extrabold text-sm">{m.titulo}</div>
              {m.aula && <div className="text-xs text-terracotta font-bold mt-0.5">{m.aula}</div>}
              <div className="text-xs text-ink-soft mt-0.5">{m.descricao}</div>
            </a>
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <FavoritarMaterialButton materialId={m.id} favorito={m.favoritos.length > 0} />
              <a
                href={m.arquivoUrl}
                className="font-bold text-xs bg-ink text-paper px-3.5 py-2 rounded-full"
              >
                Abrir
              </a>
            </div>
          </div>
        ))}
        {materiais.length === 0 && (
          <p className="text-sm text-ink-faint">Nenhum material encontrado.</p>
        )}
      </div>
    </div>
  );
}
