import { prisma } from "@/lib/prisma";

export async function getMateriasDisponiveis(prova: string) {
  const rows = await prisma.questaoBanco.findMany({
    where: { prova },
    select: { materia: true },
    distinct: ["materia"],
    orderBy: { materia: "asc" },
  });
  return rows.map((r) => r.materia);
}

export async function getQuestoesAleatorias(
  prova: string,
  materias: string[],
  quantidade: number
) {
  const questoes = await prisma.questaoBanco.findMany({
    where: { prova, materia: { in: materias } },
  });
  const embaralhadas = questoes.sort(() => Math.random() - 0.5);
  return embaralhadas.slice(0, quantidade);
}

export async function getTodasQuestoes() {
  return prisma.questaoBanco.findMany({ orderBy: [{ prova: "asc" }, { materia: "asc" }] });
}

export async function getTodasDisciplinas() {
  return prisma.disciplina.findMany({ orderBy: { nome: "asc" } });
}

function inicioDoDia(data: Date) {
  const d = new Date(data);
  d.setHours(0, 0, 0, 0);
  return d;
}

// "Dias ativos" = dias distintos em que o aluno respondeu ao menos uma questão.
// Usado pra calcular streak (dias consecutivos até hoje) e a meta semanal.
export async function getResumoAtividadeBanco(estudanteId: string) {
  const tentativas = await prisma.tentativaQuestaoBanco.findMany({
    where: { estudanteId },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true, correta: true },
  });

  const diasComAtividade = new Set(
    tentativas.map((t) => inicioDoDia(t.createdAt).getTime())
  );

  let streak = 0;
  const cursor = inicioDoDia(new Date());
  while (diasComAtividade.has(cursor.getTime())) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  // Se ainda não estudou hoje, o streak "vale" até ontem — mas só conta como
  // quebrado se também não estudou ontem.
  if (streak === 0) {
    cursor.setDate(inicioDoDia(new Date()).getDate() - 1);
    const ontem = new Date(inicioDoDia(new Date()));
    ontem.setDate(ontem.getDate() - 1);
    let c = new Date(ontem);
    while (diasComAtividade.has(c.getTime())) {
      streak++;
      c.setDate(c.getDate() - 1);
    }
  }

  const hoje = inicioDoDia(new Date()).getTime();
  const respondidasHoje = tentativas.filter(
    (t) => inicioDoDia(t.createdAt).getTime() === hoje
  ).length;

  const totalRespondidas = tentativas.length;
  const totalCorretas = tentativas.filter((t) => t.correta).length;
  const acertoGeral = totalRespondidas > 0 ? Math.round((totalCorretas / totalRespondidas) * 100) : 0;

  return { streak, respondidasHoje, totalRespondidas, acertoGeral };
}

export async function getDesempenhoPorMateria(estudanteId: string) {
  const tentativas = await prisma.tentativaQuestaoBanco.findMany({
    where: { estudanteId },
    include: { questao: { select: { materia: true } } },
  });

  const porMateria = new Map<string, { total: number; corretas: number }>();
  for (const t of tentativas) {
    const materia = t.questao.materia;
    const atual = porMateria.get(materia) ?? { total: 0, corretas: 0 };
    atual.total++;
    if (t.correta) atual.corretas++;
    porMateria.set(materia, atual);
  }

  return Array.from(porMateria.entries())
    .map(([materia, r]) => ({
      materia,
      total: r.total,
      acerto: Math.round((r.corretas / r.total) * 100),
    }))
    .sort((a, b) => a.acerto - b.acerto);
}

export async function getMateriaMaisFraca(estudanteId: string) {
  const porMateria = await getDesempenhoPorMateria(estudanteId);
  return porMateria[0] ?? null;
}

export async function getQuestoesErradas(estudanteId: string) {
  const tentativas = await prisma.tentativaQuestaoBanco.findMany({
    where: { estudanteId, correta: false },
    include: { questao: true },
    orderBy: { createdAt: "desc" },
  });

  // Mantém só a tentativa mais recente de cada questão errada — se o aluno
  // acertou depois, não faz sentido continuar mostrando pra revisão.
  const idsRespondidasDepoisCorretamente = new Set(
    (
      await prisma.tentativaQuestaoBanco.findMany({
        where: { estudanteId, correta: true },
        select: { questaoId: true },
      })
    ).map((t) => t.questaoId)
  );

  const vistas = new Set<string>();
  const resultado = [];
  for (const t of tentativas) {
    if (vistas.has(t.questaoId)) continue;
    vistas.add(t.questaoId);
    if (idsRespondidasDepoisCorretamente.has(t.questaoId)) continue;
    resultado.push(t);
  }
  return resultado;
}
