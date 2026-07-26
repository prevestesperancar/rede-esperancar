import Link from "next/link";
import { getNucleosAdmin } from "@/lib/queries/admin";

export default async function AdminPage() {
  const nucleos = await getNucleosAdmin();

  return (
    <div>
      <div className="flex items-start justify-between mb-7 gap-4 flex-wrap">
        <div>
          <div className="font-mono text-xs font-bold text-terracotta uppercase tracking-wide mb-1.5">
            Visão da rede
          </div>
          <h1 className="font-display text-2xl">Núcleos</h1>
        </div>
        <Link
          href="/admin/nucleos/novo"
          className="font-extrabold text-sm px-5 py-3 rounded-full bg-yellow text-yellow-ink"
        >
          + Criar núcleo
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {nucleos.map((n) => (
          <div key={n.id} className="bg-surface border border-border rounded-[18px] p-5">
            <div className="font-extrabold text-base mb-1">{n.nome}</div>
            <div className="text-xs text-ink-faint font-mono mb-3">
              {n.bairro ? `${n.bairro}, ` : ""}
              {n.cidade} — {n.estado}
            </div>
            <div className="text-sm text-ink-soft mb-1">
              Coordenação: {n.coordenador?.nome ?? "Sem coordenador"}
            </div>
            <div className="text-sm text-ink-soft">{n.turmas.length} turma(s)</div>
            <div className="flex items-center justify-between mt-3">
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  n.ativo ? "bg-teal/10 text-teal" : "bg-ink-faint/10 text-ink-faint"
                }`}
              >
                {n.ativo ? "Ativo" : "Inativo"}
              </span>
              <Link
                href={`/admin/nucleos/${n.id}/editar`}
                className="text-xs font-bold text-terracotta"
              >
                Editar →
              </Link>
            </div>
          </div>
        ))}
        {nucleos.length === 0 && (
          <p className="text-sm text-ink-faint">Nenhum núcleo cadastrado ainda.</p>
        )}
      </div>
    </div>
  );
}
