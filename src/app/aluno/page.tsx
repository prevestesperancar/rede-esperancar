import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getEstudanteByUserId,
  getTurmaAtivaDoEstudante,
  getProximasProvasPorTipo,
} from "@/lib/queries/aluno";
import Link from "next/link";
import { GradeCard } from "@/components/aluno/GradeCard";

function diasAte(data: Date) {
  const hoje = new Date();
  const diff = Math.ceil(
    (data.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(diff, 0);
}

export default async function AlunoDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const estudante = await getEstudanteByUserId(session.user.id);
  if (!estudante) redirect("/login");

  const turma = await getTurmaAtivaDoEstudante(estudante.id);
  const provas = session.user.nucleoId
    ? await getProximasProvasPorTipo(session.user.nucleoId)
    : { enem: null, uerj: null, outras: [] };
  const primeiroNome = estudante.user.nome.split(" ")[0];

  const dias = turma
    ? [...new Set(turma.disciplinas.map((d) => d.diaSemana))]
    : [];
  const itensPorDia: Record<
    string,
    {
      id: string;
      horaInicio: string;
      disciplina: string;
      professor: string;
      dia: string;
    }[]
  > = {};
  turma?.disciplinas.forEach((d) => {
    if (!itensPorDia[d.diaSemana]) itensPorDia[d.diaSemana] = [];
    itensPorDia[d.diaSemana].push({
      id: d.id,
      horaInicio: d.horaInicio,
      disciplina: d.disciplina.nome,
      professor: d.professor.nome,
      dia: d.diaSemana,
    });
  });

  return (
    <div>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="font-display text-2xl">Oi, {primeiroNome} 👋</h1>
          <p className="text-sm font-semibold text-ink-soft mt-1">
            Bora esperançar?
          </p>
        </div>
        <div className="w-11 h-11 rounded-full bg-terracotta text-white flex items-center justify-center font-display text-sm flex-shrink-0">
          {primeiroNome[0]}
        </div>
      </div>

      {(provas.enem || provas.uerj || provas.outras.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-6">
          {[provas.enem, provas.uerj, ...provas.outras].filter(Boolean).map((prova) => (
            <div
              key={prova!.id}
              className="inline-flex items-center gap-2 bg-surface border border-border rounded-full pl-2 pr-3.5 py-2"
            >
              <div className="bg-terracotta text-white font-mono font-bold text-xs w-[26px] h-[26px] rounded-full flex items-center justify-center">
                {diasAte(prova!.data)}
              </div>
              <div className="text-xs font-bold text-ink-soft">
                dias até {prova!.nome}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-5">
        <Link
          href="/aluno/apoio"
          className="flex items-center justify-center gap-2 bg-terracotta/10 text-terracotta font-extrabold text-sm py-3 rounded-full"
        >
          💬 Apoio psicossocial
        </Link>
        <Link
          href="/aluno/redacao"
          className="flex items-center justify-center gap-2 bg-yellow/20 text-yellow-ink font-extrabold text-sm py-3 rounded-full"
        >
          ✍️ Redação
        </Link>
      </div>

      {turma && (
        <Link
          href="/aluno/cronograma"
          className="flex items-center justify-center gap-2 bg-teal/10 text-teal font-extrabold text-sm py-3 rounded-full mb-5"
        >
          🗓️ Ver meu cronograma de estudos
        </Link>
      )}

      {turma ? (
        <>
          <GradeCard
            turmaNome={`${turma.nome} · ${turma.nucleo.nome}`}
            dias={dias}
            itensPorDia={itensPorDia}
          />

          {turma.whatsappLink && (
            <a
              href={turma.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-teal text-white font-extrabold text-sm py-3 rounded-full mb-5"
            >
              Entrar no grupo da turma no WhatsApp →
            </a>
          )}

          <div className="mb-5">
            <div className="font-bold text-sm mb-2.5">
              Avisos da sua turma
            </div>
            {turma.avisos.length === 0 && (
              <p className="text-sm text-ink-faint">Nenhum aviso ainda.</p>
            )}
            {turma.avisos.map((aviso) => (
              <div
                key={aviso.id}
                className="flex gap-2.5 py-2.5 border-b border-border last:border-b-0"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-terracotta mt-1.5 flex-shrink-0" />
                <div>
                  <div className="text-[13px]">
                    <b>{aviso.titulo}</b> — {aviso.corpo}
                  </div>
                  <div className="text-[11px] text-ink-faint font-mono mt-0.5">
                    {aviso.createdAt.toLocaleDateString("pt-BR")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-surface border border-border rounded-[18px] p-5 text-center">
          <p className="text-sm text-ink-soft">
            Sua inscrição ainda está sendo analisada pela coordenação do
            núcleo. Assim que for aprovada, sua turma aparece aqui.
          </p>
        </div>
      )}
    </div>
  );
}
