import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getContagemQuestoesPorMaterias } from "@/lib/queries/banco";
import { SubNavBanco } from "@/components/aluno/SubNavBanco";
import {
  AREAS_DIA_1,
  AREAS_DIA_2,
  SIMULADO_COMPLETO_QUESTOES,
  SIMULADO_COMPLETO_DURACAO_MINUTOS_DIA_1,
  SIMULADO_COMPLETO_DURACAO_MINUTOS_DIA_2,
} from "@/lib/enem";

function formatarDuracao(minutos: number) {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m > 0 ? `${h}h${m}min` : `${h}h`;
}

export default async function SimuladoCompletoPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [totalDia1, totalDia2] = await Promise.all([
    getContagemQuestoesPorMaterias("ENEM", AREAS_DIA_1),
    getContagemQuestoesPorMaterias("ENEM", AREAS_DIA_2),
  ]);

  const dias = [
    {
      numero: 1,
      areas: AREAS_DIA_1,
      total: totalDia1,
      duracao: SIMULADO_COMPLETO_DURACAO_MINUTOS_DIA_1,
    },
    {
      numero: 2,
      areas: AREAS_DIA_2,
      total: totalDia2,
      duracao: SIMULADO_COMPLETO_DURACAO_MINUTOS_DIA_2,
    },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl mb-1">Simulado completo</h1>
      <p className="text-sm text-ink-soft mb-4">Treine no formato real do Enem, dividido em dois dias.</p>
      <SubNavBanco />

      <div className="grid sm:grid-cols-2 gap-4">
        {dias.map((dia) => {
          const qtd = Math.min(SIMULADO_COMPLETO_QUESTOES, dia.total);
          const disponivel = qtd > 0;
          const params = new URLSearchParams({
            prova: "ENEM",
            materias: dia.areas.join(","),
            qtd: String(qtd),
            duracao: String(dia.duracao),
          });
          return (
            <div key={dia.numero} className="bg-ink text-paper rounded-2xl p-5">
              <div className="font-mono text-[11px] font-bold uppercase text-teal mb-2">
                Dia {dia.numero}
              </div>
              <div className="font-extrabold text-sm mb-3">{dia.areas.join(" · ")}</div>
              <div className="flex gap-5 mb-4 text-sm">
                <div>
                  <div className="font-display text-xl">{qtd}</div>
                  <div className="text-[11px] text-paper/60">questões</div>
                </div>
                <div>
                  <div className="font-display text-xl">{formatarDuracao(dia.duracao)}</div>
                  <div className="text-[11px] text-paper/60">duração</div>
                </div>
              </div>
              {disponivel ? (
                <Link
                  href={`/aluno/questoes/simulado?${params.toString()}`}
                  className="inline-flex font-extrabold text-sm px-5 py-2.5 rounded-full bg-yellow text-yellow-ink"
                >
                  Começar simulado
                </Link>
              ) : (
                <p className="text-xs text-paper/60">
                  Ainda não há questões suficientes de {dia.areas.join(" ou ")} cadastradas.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
