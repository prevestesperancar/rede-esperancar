import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getEstudantesDoNucleo, getNucleoInfo, getTurmasDoNucleo } from "@/lib/queries/gestao";
import { ImportarPlanilhaForm } from "@/components/gestao/ImportarPlanilhaForm";
import { FiltroStatusEstudantes } from "@/components/gestao/FiltroStatusEstudantes";
import { FiltroBolsistaEstudantes } from "@/components/gestao/FiltroBolsistaEstudantes";

const STATUS_LABEL: Record<string, string> = {
  EM_AVALIACAO: "Em avaliação",
  PRESENTE: "Ativo",
  FALTANTE: "Faltante",
  DESISTENTE: "Desistente",
  TRANSFERIDO: "Transferido",
};

const STATUS_TONE: Record<string, string> = {
  EM_AVALIACAO: "bg-terracotta/10 text-terracotta",
  PRESENTE: "bg-teal/10 text-teal",
  FALTANTE: "bg-yellow/20 text-yellow-ink",
  DESISTENTE: "bg-ink-faint/10 text-ink-faint",
  TRANSFERIDO: "bg-ink-faint/10 text-ink-faint",
};

export default async function EstudantesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; bolsista?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.nucleoId) redirect("/login");

  const { status, bolsista } = await searchParams;
  const somenteLeitura = session.user.role === "PROFESSOR";

  const [matriculas, nucleoInfo, turmas] = await Promise.all([
    getEstudantesDoNucleo(session.user.nucleoId, status, bolsista),
    getNucleoInfo(session.user.nucleoId),
    somenteLeitura ? Promise.resolve([]) : getTurmasDoNucleo(session.user.nucleoId),
  ]);
  const nucleoNome = nucleoInfo?.nome ?? "";

  if (somenteLeitura) {
    return (
      <div>
        <div className="flex items-start justify-between mb-7 gap-4 flex-wrap">
          <div>
            <div className="font-mono text-xs font-bold text-terracotta uppercase tracking-wide mb-1.5">
              {nucleoNome}
            </div>
            <h1 className="font-display text-2xl">Estudantes</h1>
          </div>
          <a
            href="/api/exportar-estudantes"
            className="font-bold text-sm px-4 py-2.5 rounded-full border border-border-strong text-ink-soft hover:text-ink"
          >
            ⬇️ Exportar lista de presença
          </a>
        </div>

        <div className="bg-surface border border-border rounded-[18px] p-5">
          {matriculas.map((m) => (
            <div
              key={m.id}
              className="grid sm:grid-cols-3 gap-2 py-3 border-b border-border last:border-b-0"
            >
              <div className="font-bold text-sm">{m.estudante.user.nome}</div>
              <div className="text-sm text-ink-soft">
                {m.estudante.user.telefone ?? m.estudante.user.email}
              </div>
              <div className="text-sm text-ink-faint">
                {m.estudante.cursoDesejado ?? "Curso não informado"}
              </div>
            </div>
          ))}
          {matriculas.length === 0 && (
            <p className="text-sm text-ink-faint py-2">
              Nenhum estudante matriculado ainda.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-7 gap-4 flex-wrap">
        <div>
          <div className="font-mono text-xs font-bold text-terracotta uppercase tracking-wide mb-1.5">
            {nucleoNome}
          </div>
          <h1 className="font-display text-2xl">Estudantes</h1>
        </div>
        <FiltroStatusEstudantes statusAtual={status} />
        <FiltroBolsistaEstudantes bolsistaAtual={bolsista} />
        <a
          href="/api/exportar-estudantes"
          className="font-bold text-sm px-4 py-2.5 rounded-full border border-border-strong text-ink-soft hover:text-ink"
        >
          ⬇️ Exportar lista de presença
        </a>
        {nucleoInfo?.googleSheetsUrl && (
          <a
            href={nucleoInfo.googleSheetsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-sm px-4 py-2.5 rounded-full border border-border-strong text-ink-soft hover:text-ink"
          >
            📊 Ver planilha de inscritos
          </a>
        )}
      </div>

      {(session.user.role === "COORDENACAO" || session.user.role === "ADMIN") && (
        <div className="bg-surface border border-border rounded-[18px] p-5 mb-4">
          <ImportarPlanilhaForm turmas={turmas} />
          <p className="text-xs text-ink-faint mt-2">
            No Google Sheets: Arquivo → Fazer download → Valores separados por vírgula (.csv).
            Depois de escolher o arquivo, diga o que cada coluna significa antes de importar —
            assim nenhum dado cai no campo errado. Nunca importe CPF, RG ou dados bancários.
            Nada é publicado na internet.
          </p>
        </div>
      )}

      <div className="bg-surface border border-border rounded-[18px] p-5">
        {matriculas.map((m) => (
          <Link
            href={`/gestao/estudantes/${m.id}`}
            key={m.id}
            className="flex items-center gap-3 py-3 border-b border-border last:border-b-0 hover:bg-paper -mx-2 px-2 rounded-xl"
          >
            <div className="w-9 h-9 rounded-full bg-ink text-paper flex items-center justify-center font-display text-xs flex-shrink-0">
              {m.estudante.user.nome
                .split(" ")
                .slice(0, 2)
                .map((p) => p[0])
                .join("")
                .toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm truncate">
                {m.estudante.user.nome}
              </div>
              <div className="text-xs text-ink-faint">
                {m.turma.nome} · {m.turma.periodo}
              </div>
            </div>
            {m.estudante.bolsista && (
              <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-full bg-yellow/20 text-yellow-ink flex-shrink-0">
                🎓 Bolsista
              </span>
            )}
            <span
              className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full flex-shrink-0 ${
                STATUS_TONE[m.estudante.status]
              }`}
            >
              {STATUS_LABEL[m.estudante.status]}
            </span>
          </Link>
        ))}
        {matriculas.length === 0 && (
          <p className="text-sm text-ink-faint py-2">
            Nenhum estudante matriculado ainda.
          </p>
        )}
        <div className="pt-3 mt-1 text-xs text-ink-faint">
          Mostrando {matriculas.length} estudante(s)
        </div>
      </div>
    </div>
  );
}
