import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getAvisosDoNucleo,
  getGestaoStats,
  getInscricoesPendentes,
  getTurmasDoNucleo,
  getProvasDoNucleo,
  getFrequenciaResumoDoNucleo,
  getNucleoNome,
  getGradeDoProfessor,
  getMonitoriasDoProfessor,
  getTurmasDoProfessor,
  getPerfilEstudantesAtivos,
  getAniversariantesProximos,
} from "@/lib/queries/gestao";
import { AprovarRecusarButtons } from "@/components/gestao/AprovarRecusarButtons";
import { NovaProvaForm } from "@/components/gestao/NovaProvaForm";
import { ApagarItemButton } from "@/components/gestao/ApagarItemButton";
import { FrequenciaDashboard } from "@/components/gestao/FrequenciaDashboard";
import { PerfilEstudantesChart } from "@/components/gestao/PerfilEstudantesChart";
import { AniversariantesCard } from "@/components/gestao/AniversariantesCard";
import { apagarProva } from "@/actions/gestao";
import { getSolicitacoesAtrasadas, getContagemAtendimentosSemana } from "@/lib/queries/agendamento";
import { SolicitacoesAtrasadasCard } from "@/components/gestao/SolicitacoesAtrasadasCard";

export default async function GestaoDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.nucleoId) redirect("/login");
  const nucleoId = session.user.nucleoId;
  const { data } = await searchParams;
  const dataSelecionada = data ?? new Date().toISOString().slice(0, 10);

  if (session.user.role === "APOIO_PSICOSSOCIAL") {
    const [nucleoNome, stats, perfil, frequencias, aniversariantes] = await Promise.all([
      getNucleoNome(nucleoId),
      getGestaoStats(nucleoId),
      getPerfilEstudantesAtivos(nucleoId),
      getFrequenciaResumoDoNucleo(nucleoId, dataSelecionada),
      getAniversariantesProximos(nucleoId),
    ]);

    return (
      <div>
        <div className="font-mono text-xs font-bold text-terracotta uppercase tracking-wide mb-1.5">
          {nucleoNome}
        </div>
        <h1 className="font-display text-2xl mb-6">Apoio psicossocial</h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mb-7">
          <div className="bg-surface border border-border rounded-2xl p-4">
            <div className="font-mono font-bold text-2xl">{stats.estudantesAtivos}</div>
            <div className="text-xs font-semibold text-ink-soft mt-0.5">Estudantes ativos</div>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-4">
            <div className="font-mono font-bold text-2xl">{stats.turmas}</div>
            <div className="text-xs font-semibold text-ink-soft mt-0.5">Turmas</div>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-4">
            <div className="font-mono font-bold text-2xl">{stats.professores}</div>
            <div className="text-xs font-semibold text-ink-soft mt-0.5">Professores</div>
          </div>
        </div>

        <AniversariantesCard aniversariantes={aniversariantes} />

        <PerfilEstudantesChart
          total={perfil.total}
          genero={perfil.genero}
          racaCor={perfil.racaCor}
          rendaFamiliar={perfil.rendaFamiliar}
          cursoDesejado={perfil.cursoDesejado}
          bairroMunicipio={perfil.bairroMunicipio}
          idadeMedia={perfil.idadeMedia}
          presencaMediaMes={perfil.presencaMediaMes}
        />

        <FrequenciaDashboard turmas={frequencias} data={dataSelecionada} />

        <div className="grid sm:grid-cols-2 gap-4 max-w-xl mt-4">
          <Link
            href="/gestao/frequencia"
            className="bg-surface border border-border rounded-[18px] p-5 hover:-translate-y-0.5 transition-transform"
          >
            <div className="font-extrabold text-base mb-1">📊 Frequência detalhada</div>
            <p className="text-sm text-ink-soft">
              Veja o histórico dia a dia de presença de cada estudante.
            </p>
          </Link>
          <Link
            href="/gestao/simulados"
            className="bg-surface border border-border rounded-[18px] p-5 hover:-translate-y-0.5 transition-transform"
          >
            <div className="font-extrabold text-base mb-1">📝 Desempenho em simulados</div>
            <p className="text-sm text-ink-soft">
              Acompanhe as notas dos estudantes nos simulados aplicados.
            </p>
          </Link>
        </div>
      </div>
    );
  }

  if (session.user.role === "PROFESSOR") {
    const [nucleoNome, grade, monitorias, turmaIds] = await Promise.all([
      getNucleoNome(nucleoId),
      getGradeDoProfessor(session.user.id),
      getMonitoriasDoProfessor(session.user.id),
      getTurmasDoProfessor(session.user.id),
    ]);
    const frequencias = await getFrequenciaResumoDoNucleo(nucleoId, dataSelecionada, turmaIds);

    return (
      <div>
        <div className="font-mono text-xs font-bold text-terracotta uppercase tracking-wide mb-1.5">
          {nucleoNome}
        </div>
        <h1 className="font-display text-2xl mb-6">Meu painel</h1>

        <div className="bg-surface border border-border rounded-[18px] p-5 mb-4">
          <h3 className="font-extrabold text-[15px] mb-3.5">Meu horário de aula</h3>
          {grade.map((g) => (
            <div key={g.id} className="flex items-center gap-3 py-2 border-b border-border last:border-b-0 text-sm">
              <span className="font-mono text-xs text-ink-faint w-[100px] flex-shrink-0">{g.diaSemana}</span>
              <span className="font-mono text-xs text-ink-faint w-[90px] flex-shrink-0">
                {g.horaInicio}–{g.horaFim}
              </span>
              <span className="font-bold flex-1">{g.disciplina.nome}</span>
              <span className="text-ink-soft text-xs">{g.turma.nome}</span>
            </div>
          ))}
          {grade.length === 0 && <p className="text-sm text-ink-faint">Nenhuma aula na grade ainda.</p>}
        </div>

        <div className="bg-surface border border-border rounded-[18px] p-5 mb-4">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="font-extrabold text-[15px]">Minhas monitorias</h3>
            <Link href="/gestao/monitorias" className="text-xs font-bold text-terracotta">
              Gerenciar →
            </Link>
          </div>
          {monitorias.map((m) => (
            <div key={m.id} className="flex items-center gap-3 py-2 border-b border-border last:border-b-0 text-sm">
              <span className="font-mono text-xs text-ink-faint w-[100px] flex-shrink-0">{m.diaSemana}</span>
              <span className="font-mono text-xs text-ink-faint w-[90px] flex-shrink-0">
                {m.horaInicio}–{m.horaFim}
              </span>
              <span className="font-bold flex-1">
                {m.disciplina?.nome ?? "Monitoria"} · {m.turma ? m.turma.nome : m.global ? "Todos os prés" : "Todo o núcleo"}
              </span>
            </div>
          ))}
          {monitorias.length === 0 && <p className="text-sm text-ink-faint">Nenhuma monitoria ainda.</p>}
        </div>

        <FrequenciaDashboard turmas={frequencias} data={dataSelecionada} />
      </div>
    );
  }

  const [
    stats,
    pendentes,
    turmas,
    avisos,
    provas,
    frequencias,
    nucleoNome,
    perfil,
    aniversariantes,
    atrasadas,
    atendimentosSemana,
  ] = await Promise.all([
    getGestaoStats(nucleoId),
    getInscricoesPendentes(nucleoId),
    getTurmasDoNucleo(nucleoId),
    getAvisosDoNucleo(nucleoId),
    getProvasDoNucleo(nucleoId),
    getFrequenciaResumoDoNucleo(nucleoId, dataSelecionada),
    getNucleoNome(nucleoId),
    getPerfilEstudantesAtivos(nucleoId),
    getAniversariantesProximos(nucleoId),
    getSolicitacoesAtrasadas(nucleoId),
    getContagemAtendimentosSemana(nucleoId),
  ]);

  const avisosRecentes = avisos.filter(
    (a) => Date.now() - a.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000
  );

  return (
    <div>
      <div className="flex items-start justify-between mb-7 gap-4 flex-wrap">
        <div>
          <div className="font-mono text-xs font-bold text-terracotta uppercase tracking-wide mb-1.5">
            {nucleoNome}
          </div>
          <h1 className="font-display text-2xl">Painel da coordenação</h1>
        </div>
        <Link
          href="/gestao/avisos"
          className="font-extrabold text-sm px-5 py-3 rounded-full bg-yellow text-yellow-ink"
        >
          + Novo aviso
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-7">
        <div className="bg-surface border border-border rounded-2xl p-4">
          <div className="font-mono font-bold text-2xl">
            {stats.estudantesAtivos}
          </div>
          <div className="text-xs font-semibold text-ink-soft mt-0.5">
            Estudantes ativos
          </div>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-4">
          <div className="font-mono font-bold text-2xl">{stats.turmas}</div>
          <div className="text-xs font-semibold text-ink-soft mt-0.5">
            Turmas
          </div>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-4">
          <div className="font-mono font-bold text-2xl">
            {stats.professores}
          </div>
          <div className="text-xs font-semibold text-ink-soft mt-0.5">
            Professores
          </div>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-4">
          <div className="font-mono font-bold text-2xl text-teal">
            {pendentes.length}
          </div>
          <div className="text-xs font-semibold text-ink-soft mt-0.5">
            Inscrições pendentes
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-[18px] p-5 mb-4">
        <h3 className="font-extrabold text-[15px] mb-3">Atendimentos individuais (últimos 7 dias)</h3>
        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <div className="font-mono font-bold text-2xl text-terracotta">{atendimentosSemana.monitorias}</div>
            <div className="text-xs font-semibold text-ink-soft mt-0.5">Monitorias individuais</div>
          </div>
          <div>
            <div className="font-mono font-bold text-2xl text-teal">{atendimentosSemana.apoios}</div>
            <div className="text-xs font-semibold text-ink-soft mt-0.5">Atendimentos psicossociais</div>
          </div>
        </div>
      </div>

      <AniversariantesCard aniversariantes={aniversariantes} />

      <SolicitacoesAtrasadasCard solicitacoes={atrasadas} />

      <PerfilEstudantesChart
        total={perfil.total}
        genero={perfil.genero}
        racaCor={perfil.racaCor}
        rendaFamiliar={perfil.rendaFamiliar}
        cursoDesejado={perfil.cursoDesejado}
        bairroMunicipio={perfil.bairroMunicipio}
        idadeMedia={perfil.idadeMedia}
        presencaMediaMes={perfil.presencaMediaMes}
      />

      <FrequenciaDashboard turmas={frequencias} data={dataSelecionada} />

      <div className="grid lg:grid-cols-[1.3fr_1fr] gap-4 items-start mb-4">
        <div className="bg-surface border border-border rounded-[18px] p-5">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="font-extrabold text-[15px]">
              Inscrições pendentes
            </h3>
            {pendentes.length > 0 && (
              <span className="text-[11px] font-bold uppercase text-terracotta bg-terracotta/10 px-2.5 py-1 rounded-full">
                {pendentes.length} aguardando
              </span>
            )}
          </div>
          {pendentes.slice(0, 3).map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-3 py-3 border-b border-border last:border-b-0"
            >
              <div className="w-9 h-9 rounded-full bg-yellow text-yellow-ink flex items-center justify-center font-display text-xs flex-shrink-0">
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
              <AprovarRecusarButtons matriculaId={m.id} />
            </div>
          ))}
          {pendentes.length === 0 && (
            <p className="text-sm text-ink-faint py-2">
              Nenhuma inscrição pendente.
            </p>
          )}
          {pendentes.length > 3 && (
            <Link
              href="/gestao/inscricoes"
              className="block text-center text-sm font-bold text-terracotta mt-3 pt-3 border-t border-border"
            >
              Ver todas as {pendentes.length} →
            </Link>
          )}
        </div>

        <div className="bg-surface border border-border rounded-[18px] p-5">
          <h3 className="font-extrabold text-[15px] mb-3.5">Turmas</h3>
          {turmas.map((t) => {
            const pct = Math.min(
              100,
              Math.round((t.matriculas.length / t.capacidade) * 100)
            );
            return (
              <div key={t.id} className="py-2.5">
                <div className="flex justify-between text-sm font-bold mb-1.5">
                  <span>
                    {t.nome} — {t.periodo}
                  </span>
                  <span className="font-mono font-normal text-ink-faint">
                    {t.matriculas.length}/{t.capacidade}
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
      </div>

      <div className="bg-surface border border-border rounded-[18px] p-5 mb-4">
        <h3 className="font-extrabold text-[15px] mb-1">
          Provas (contagem regressiva do aluno)
        </h3>
        {provas.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between py-2 border-b border-border last:border-b-0"
          >
            <span className="text-sm">
              <b>{p.nome}</b>{" "}
              <span className="text-ink-faint font-mono text-xs">
                {p.data.toLocaleDateString("pt-BR")}
              </span>
            </span>
            <ApagarItemButton id={p.id} action={apagarProva} confirmMessage="Apagar esta prova?" />
          </div>
        ))}
        {provas.length === 0 && (
          <p className="text-sm text-ink-faint py-1">Nenhuma prova cadastrada.</p>
        )}
        <NovaProvaForm />
      </div>

      <div className="bg-surface border border-border rounded-[18px] p-5">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="font-extrabold text-[15px]">Avisos recentes</h3>
          <Link
            href="/gestao/avisos"
            className="text-xs font-bold text-terracotta"
          >
            Ver todos
          </Link>
        </div>
        {avisosRecentes.slice(0, 2).map((a) => (
          <div key={a.id} className="flex gap-2.5 py-2.5 border-b border-border last:border-b-0">
            <div className="w-1.5 h-1.5 rounded-full bg-terracotta mt-1.5 flex-shrink-0" />
            <div className="text-sm">
              <b>{a.titulo}</b> — {a.corpo}
            </div>
          </div>
        ))}
        {avisosRecentes.length === 0 && (
          <p className="text-sm text-ink-faint">Nenhum aviso ainda.</p>
        )}
      </div>
    </div>
  );
}
