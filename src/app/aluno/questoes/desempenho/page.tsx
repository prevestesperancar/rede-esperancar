import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getEstudanteByUserId } from "@/lib/queries/aluno";
import { getResumoAtividadeBanco, getDesempenhoPorMateria } from "@/lib/queries/banco";
import { SubNavBanco } from "@/components/aluno/SubNavBanco";

function corAcerto(acerto: number) {
  if (acerto >= 75) return "text-teal";
  if (acerto >= 50) return "text-yellow-ink";
  return "text-terracotta";
}

export default async function DesempenhoBancoPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const estudante = await getEstudanteByUserId(session.user.id);
  if (!estudante) redirect("/login");
  if (!estudante.perfilIntensidade) redirect("/aluno/questoes/perfil");

  const [resumo, porMateria] = await Promise.all([
    getResumoAtividadeBanco(estudante.id),
    getDesempenhoPorMateria(estudante.id),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl mb-1">Desempenho</h1>
      <p className="text-sm text-ink-soft mb-4">Onde você está, onde precisa chegar.</p>
      <SubNavBanco />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-surface border border-border rounded-2xl p-4">
          <div className="font-mono text-[11px] font-bold uppercase text-ink-faint mb-1">Acerto geral</div>
          <div className="font-display text-2xl">{resumo.acertoGeral}%</div>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-4">
          <div className="font-mono text-[11px] font-bold uppercase text-ink-faint mb-1">
            Total de questões
          </div>
          <div className="font-display text-2xl">{resumo.totalRespondidas}</div>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-4">
          <div className="font-mono text-[11px] font-bold uppercase text-ink-faint mb-1">Streak</div>
          <div className="font-display text-2xl">{resumo.streak} dia(s)</div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-[18px] p-5">
        <h3 className="font-extrabold text-[15px] mb-3">Acerto por matéria</h3>
        {porMateria.length === 0 ? (
          <p className="text-sm text-ink-faint">Pratique em mais matérias para ver o detalhamento.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {porMateria.map((m) => (
              <div key={m.materia} className="flex items-center justify-between gap-3">
                <div className="text-sm font-bold flex-1">{m.materia}</div>
                <div className="text-xs text-ink-faint">{m.total} questão(ões)</div>
                <div className={`font-mono font-bold text-sm w-12 text-right ${corAcerto(m.acerto)}`}>
                  {m.acerto}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
