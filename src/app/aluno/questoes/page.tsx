import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getEstudanteByUserId } from "@/lib/queries/aluno";
import { getResumoAtividadeBanco, getMateriaMaisFraca } from "@/lib/queries/banco";
import { SubNavBanco } from "@/components/aluno/SubNavBanco";

const NOME_PERFIL: Record<string, string> = {
  SEM_PRESSAO: "Sem pressão",
  EQUILIBRISTA: "Equilibrista",
  MONSTRAO: "Monstrão",
};

export default async function BancoQuestoesHomePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const estudante = await getEstudanteByUserId(session.user.id);
  if (!estudante) redirect("/login");
  if (!estudante.perfilIntensidade) redirect("/aluno/questoes/perfil");

  const [resumo, materiaFraca] = await Promise.all([
    getResumoAtividadeBanco(estudante.id),
    getMateriaMaisFraca(estudante.id),
  ]);

  const meta = estudante.questoesPorDia ?? 20;
  const percentualMeta = Math.min(100, Math.round((resumo.respondidasHoje / meta) * 100));

  return (
    <div>
      <h1 className="font-display text-2xl mb-1">Banco de questões</h1>
      <p className="text-sm text-ink-soft mb-4">
        Perfil:{" "}
        <span className="font-bold">
          {NOME_PERFIL[estudante.perfilIntensidade] ?? estudante.perfilIntensidade}
        </span>{" "}
        ·{" "}
        <Link href="/aluno/questoes/perfil" className="text-terracotta font-bold">
          editar
        </Link>
      </p>
      <SubNavBanco />

      <div className="bg-ink text-paper rounded-[22px] p-6 mb-6 flex items-center justify-between flex-wrap gap-5">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-yellow text-yellow-ink font-bold text-xs px-3 py-1 rounded-full mb-3">
            🔥 Streak de {resumo.streak} dia(s)
          </div>
          <div className="font-display text-3xl mb-1">
            {resumo.respondidasHoje} de {meta}
          </div>
          <div className="text-teal font-extrabold text-sm mb-4">questões hoje</div>
          <Link
            href="/aluno/questoes/praticar"
            className="inline-flex font-extrabold text-sm px-5 py-3 rounded-full bg-yellow text-yellow-ink"
          >
            Resolver questões →
          </Link>
        </div>
        <div className="w-24 h-24 rounded-full border-4 border-teal/30 flex items-center justify-center flex-shrink-0">
          <span className="font-display text-xl">{percentualMeta}%</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-surface border border-border rounded-2xl p-4">
          <div className="font-mono text-[11px] font-bold uppercase text-ink-faint mb-1">
            Acerto geral
          </div>
          <div className="font-display text-2xl">{resumo.acertoGeral}%</div>
          <div className="text-xs text-ink-faint mt-0.5">
            {resumo.totalRespondidas} questão(ões) respondida(s)
          </div>
        </div>
        {materiaFraca && (
          <div className="bg-yellow/15 border border-yellow rounded-2xl p-4">
            <div className="font-mono text-[11px] font-bold uppercase text-ink-faint mb-1">
              Recomendado pra você
            </div>
            <div className="font-extrabold text-sm mb-2">{materiaFraca.materia} é sua matéria-chave</div>
            <Link
              href="/aluno/questoes/praticar"
              className="inline-flex font-bold text-xs px-4 py-2 rounded-full bg-ink text-paper"
            >
              Começar agora →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
