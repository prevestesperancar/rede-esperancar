import { prisma } from "@/lib/prisma";
import { ordenarPorDiaSemana } from "@/lib/dias";
import { montarGabaritoEfetivo, IDIOMAS_BLOCO_LINGUA } from "@/lib/simulado";
import { grupoDaMateria } from "@/lib/grupo-materia";

export async function getUsuariosDoNucleo(nucleoId: string, role?: string) {
  return prisma.user.findMany({
    where: {
      nucleoId,
      ...(role ? { role: role as "ESTUDANTE" | "PROFESSOR" | "COORDENACAO" | "APOIO_PSICOSSOCIAL" } : {}),
    },
    include: {
      estudante: { include: { matriculas: { orderBy: { createdAt: "desc" }, take: 1 } } },
    },
    orderBy: [{ role: "asc" }, { nome: "asc" }],
  });
}

export async function getNucleoNome(nucleoId: string) {
  const nucleo = await prisma.nucleo.findUnique({
    where: { id: nucleoId },
    select: { nome: true },
  });
  return nucleo?.nome ?? "";
}

export async function getNucleoInfo(nucleoId: string) {
  return prisma.nucleo.findUnique({
    where: { id: nucleoId },
    select: { nome: true, googleSheetsUrl: true },
  });
}

export async function getGestaoStats(nucleoId: string) {
  const [estudantesAtivos, turmas, professores, matriculas] = await Promise.all([
    prisma.matricula.count({
      where: {
        status: "APROVADA",
        turma: { nucleoId },
        estudante: { status: { notIn: ["DESISTENTE", "TRANSFERIDO"] } },
      },
    }),
    prisma.turma.count({ where: { nucleoId, ativo: true } }),
    prisma.user.count({ where: { nucleoId, role: "PROFESSOR" } }),
    prisma.matricula.findMany({
      where: { turma: { nucleoId } },
      select: { status: true },
    }),
  ]);

  return { estudantesAtivos, turmas, professores };
}

export async function getPerfilEstudantesAtivos(nucleoId: string) {
  const matriculas = await prisma.matricula.findMany({
    where: {
      status: "APROVADA",
      turma: { nucleoId },
      estudante: { status: { notIn: ["DESISTENTE", "TRANSFERIDO"] } },
    },
    select: {
      estudanteId: true,
      estudante: {
        select: {
          sexoGenero: true,
          racaCor: true,
          rendaFamiliar: true,
          cursoDesejado: true,
          bairro: true,
          municipio: true,
          dataNascimento: true,
        },
      },
    },
    distinct: ["estudanteId"],
  });

  const contar = (valores: (string | null)[]) => {
    const contagem = new Map<string, number>();
    for (const v of valores) {
      const chave = v || "Não informado";
      contagem.set(chave, (contagem.get(chave) ?? 0) + 1);
    }
    return [...contagem.entries()]
      .map(([label, total]) => ({ label, total }))
      .sort((a, b) => b.total - a.total);
  };

  // Respostas de curso são texto livre e costumam combinar mais de uma opção
  // (ex: "Direito ou Pedagogia"), então cada curso mencionado conta separadamente.
  const CURSOS_PALAVRAS_CHAVE = [
    "Direito", "Medicina", "Enfermagem", "Psicologia", "Pedagogia",
    "Administração", "Engenharia", "Fisioterapia", "Nutrição", "Farmácia",
    "Odontologia", "Arquitetura", "Fonoaudiologia", "Biologia", "Biomedicina",
    "Veterinária", "Educação Física", "Serviço Social", "Contabilidade",
    "Jornalismo", "Publicidade", "Sistemas de Informação", "Ciência da Computação",
    "Letras", "História", "Geografia", "Matemática", "Química", "Física",
  ];
  const contarCursos = (valores: (string | null)[]) => {
    const contagem = new Map<string, number>();
    let semCorrespondencia = 0;
    for (const v of valores) {
      if (!v) continue;
      const encontrados = CURSOS_PALAVRAS_CHAVE.filter((palavra) =>
        v.toLowerCase().includes(palavra.toLowerCase())
      );
      if (encontrados.length === 0) {
        semCorrespondencia++;
        continue;
      }
      for (const palavra of encontrados) {
        contagem.set(palavra, (contagem.get(palavra) ?? 0) + 1);
      }
    }
    const resultado = [...contagem.entries()]
      .map(([label, total]) => ({ label, total }))
      .sort((a, b) => b.total - a.total);
    if (semCorrespondencia > 0) resultado.push({ label: "Outros/não identificado", total: semCorrespondencia });
    return resultado;
  };

  const idades = matriculas
    .map((m) => m.estudante.dataNascimento)
    .filter((d): d is Date => d !== null)
    .map((d) => {
      const hoje = new Date();
      let anos = hoje.getFullYear() - d.getFullYear();
      const mes = hoje.getMonth() - d.getMonth();
      if (mes < 0 || (mes === 0 && hoje.getDate() < d.getDate())) anos--;
      return anos;
    });
  const idadeMedia = idades.length
    ? Math.round((idades.reduce((a, b) => a + b, 0) / idades.length) * 10) / 10
    : null;

  const bairroMunicipio = contar(
    matriculas.map((m) =>
      m.estudante.bairro && m.estudante.municipio
        ? `${m.estudante.bairro} — ${m.estudante.municipio}`
        : m.estudante.bairro || m.estudante.municipio
    )
  );

  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  const estudanteIds = matriculas.map((m) => m.estudanteId);
  const frequenciasMes = estudanteIds.length
    ? await prisma.frequencia.findMany({
        where: { estudanteId: { in: estudanteIds }, data: { gte: inicioMes } },
        select: { presente: true },
      })
    : [];
  const presencaMediaMes = frequenciasMes.length
    ? Math.round((frequenciasMes.filter((f) => f.presente).length / frequenciasMes.length) * 100)
    : null;

  return {
    total: matriculas.length,
    genero: contar(matriculas.map((m) => m.estudante.sexoGenero)),
    racaCor: contar(matriculas.map((m) => m.estudante.racaCor)),
    rendaFamiliar: contar(matriculas.map((m) => m.estudante.rendaFamiliar)),
    cursoDesejado: contarCursos(matriculas.map((m) => m.estudante.cursoDesejado)).slice(0, 6),
    bairroMunicipio: bairroMunicipio.slice(0, 6),
    idadeMedia,
    presencaMediaMes,
  };
}

export async function getAniversariantesProximos(nucleoId: string, dias = 7) {
  const matriculas = await prisma.matricula.findMany({
    where: {
      status: "APROVADA",
      turma: { nucleoId },
      estudante: {
        status: { notIn: ["DESISTENTE", "TRANSFERIDO"] },
        dataNascimento: { not: null },
      },
    },
    select: {
      estudante: { select: { id: true, dataNascimento: true, user: { select: { nome: true } } } },
    },
    distinct: ["estudanteId"],
  });

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return matriculas
    .map((m) => {
      const nascimento = m.estudante.dataNascimento!;
      const aniversarioEsteAno = new Date(hoje.getFullYear(), nascimento.getMonth(), nascimento.getDate());
      let diff = Math.round((aniversarioEsteAno.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      if (diff < 0) {
        const aniversarioProximoAno = new Date(hoje.getFullYear() + 1, nascimento.getMonth(), nascimento.getDate());
        diff = Math.round((aniversarioProximoAno.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      }
      return { estudanteId: m.estudante.id, nome: m.estudante.user.nome, dataNascimento: nascimento, diasRestantes: diff };
    })
    .filter((a) => a.diasRestantes <= dias)
    .sort((a, b) => a.diasRestantes - b.diasRestantes);
}

export async function getInscricoesPendentes(nucleoId: string) {
  return prisma.matricula.findMany({
    where: { status: "PENDENTE", turma: { nucleoId } },
    include: { estudante: { include: { user: true } }, turma: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getTurmasDoNucleo(nucleoId: string) {
  return prisma.turma.findMany({
    where: { nucleoId },
    include: {
      matriculas: {
        where: { status: "APROVADA" },
        include: { estudante: { include: { user: true } } },
      },
      disciplinas: { include: { disciplina: true, professor: true } },
    },
    orderBy: { nome: "asc" },
  });
}

export async function getEstudantesDoNucleo(
  nucleoId: string,
  statusFiltro?: string,
  bolsistaFiltro?: string
) {
  return prisma.matricula.findMany({
    where: {
      status: "APROVADA",
      turma: { nucleoId },
      estudante: {
        ...(statusFiltro
          ? { status: statusFiltro as "EM_AVALIACAO" | "PRESENTE" | "FALTANTE" | "DESISTENTE" | "TRANSFERIDO" }
          : { status: { notIn: ["DESISTENTE", "TRANSFERIDO"] } }),
        ...(bolsistaFiltro ? { bolsista: bolsistaFiltro === "sim" } : {}),
      },
    },
    include: { estudante: { include: { user: true } }, turma: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getEstudantesAtivosParaPresenca(nucleoId: string, turmaId?: string) {
  return prisma.matricula.findMany({
    where: {
      status: "APROVADA",
      turma: { nucleoId, ...(turmaId ? { id: turmaId } : {}) },
      estudante: { status: "PRESENTE" },
    },
    include: { estudante: { include: { user: true } }, turma: true },
    orderBy: { estudante: { user: { nome: "asc" } } },
  });
}

export async function getProfessoresDoNucleo(nucleoId: string) {
  return prisma.user.findMany({
    where: { nucleoId, role: "PROFESSOR" },
    include: {
      disciplinasQueLeciona: { include: { disciplina: true } },
    },
    orderBy: { nome: "asc" },
  });
}

export async function getMateriaisDoNucleoGestao(nucleoId: string) {
  return prisma.material.findMany({
    where: { nucleoId },
    include: { disciplina: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAvisosDoNucleo(nucleoId: string) {
  return prisma.aviso.findMany({
    where: { nucleoId },
    include: { turma: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getEventosDoNucleo(nucleoId: string) {
  return prisma.evento.findMany({
    where: { nucleoId },
    orderBy: { data: "asc" },
  });
}

export async function getProvasDoNucleo(nucleoId: string) {
  return prisma.prova.findMany({
    where: { nucleoId },
    orderBy: { data: "asc" },
  });
}

export async function getMonitoriasDoNucleo(nucleoId: string) {
  const monitorias = await prisma.monitoria.findMany({
    where: { OR: [{ nucleoId }, { global: true }] },
    include: { turma: true, disciplina: true, professor: true },
    orderBy: { horaInicio: "asc" },
  });
  return ordenarPorDiaSemana(monitorias);
}

export async function getDisciplinasDoNucleo(nucleoId: string) {
  const registros = await prisma.turmaDisciplina.findMany({
    where: { turma: { nucleoId } },
    select: { disciplina: true },
    distinct: ["disciplinaId"],
  });
  return registros.map((r) => r.disciplina);
}

export async function getDisciplinasDoProfessor(professorId: string) {
  const registros = await prisma.turmaDisciplina.findMany({
    where: { professorId },
    select: { disciplina: true },
    distinct: ["disciplinaId"],
  });
  return registros.map((r) => r.disciplina);
}

export async function getDepoimentosDoNucleo(nucleoId: string) {
  return prisma.depoimento.findMany({
    where: { nucleoId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getGaleriaEventosDoNucleo(nucleoId: string) {
  return prisma.galeriaEvento.findMany({
    where: { nucleoId },
    orderBy: { data: "desc" },
  });
}

export async function getFrequenciaGeralTurma(turmaId: string) {
  const registros = await prisma.frequencia.findMany({ where: { turmaId } });
  const total = registros.length;
  const presentes = registros.filter((r) => r.presente).length;
  return {
    total,
    presentes,
    percentual: total > 0 ? Math.round((presentes / total) * 100) : null,
  };
}

export async function getGradeDoProfessor(professorId: string) {
  const grade = await prisma.turmaDisciplina.findMany({
    where: { professorId },
    include: { disciplina: true, turma: true },
    orderBy: { horaInicio: "asc" },
  });
  return ordenarPorDiaSemana(grade);
}

export async function getMonitoriasDoProfessor(professorId: string) {
  const turmaIds = await getTurmasDoProfessor(professorId);
  const monitorias = await prisma.monitoria.findMany({
    where: {
      OR: [{ turmaId: { in: turmaIds } }, { professorId }],
    },
    include: { turma: true, disciplina: true },
    orderBy: { horaInicio: "asc" },
  });
  return ordenarPorDiaSemana(monitorias);
}

export async function getTurmasDoProfessor(professorId: string) {
  const disciplinas = await prisma.turmaDisciplina.findMany({
    where: { professorId },
    select: { turmaId: true },
    distinct: ["turmaId"],
  });
  return disciplinas.map((d) => d.turmaId);
}

export async function getFrequenciaResumoDoNucleo(
  nucleoId: string,
  dataSelecionada?: string,
  turmaIds?: string[]
) {
  const turmas = await prisma.turma.findMany({
    where: { nucleoId, ...(turmaIds ? { id: { in: turmaIds } } : {}) },
    include: {
      matriculas: {
        where: { status: "APROVADA" },
        include: {
          estudante: {
            include: {
              user: true,
              frequencias: true,
            },
          },
        },
      },
    },
    orderBy: { nome: "asc" },
  });

  const dataISO = dataSelecionada ?? new Date().toISOString().slice(0, 10);

  return turmas.map((turma) => {
    const estudantes = turma.matriculas.map((m) => {
      const registros = m.estudante.frequencias.filter(
        (f) => f.turmaId === turma.id
      );
      const total = registros.length;
      const presentes = registros.filter((r) => r.presente).length;
      const registroDia = registros.find(
        (r) => r.data.toISOString().slice(0, 10) === dataISO
      );
      return {
        estudanteId: m.estudante.id,
        nome: m.estudante.user.nome,
        total,
        percentual: total > 0 ? Math.round((presentes / total) * 100) : null,
        statusHoje: (registroDia ? (registroDia.presente ? "presente" : "falta") : null) as
          | "presente"
          | "falta"
          | null,
      };
    });

    const totalGeral = estudantes.reduce((acc, e) => acc + e.total, 0);
    const presentesGeral = turma.matriculas.reduce(
      (acc, m) =>
        acc +
        m.estudante.frequencias.filter((f) => f.turmaId === turma.id && f.presente).length,
      0
    );

    return {
      turmaId: turma.id,
      turmaNome: `${turma.nome} — ${turma.periodo}`,
      percentualGeral: totalGeral > 0 ? Math.round((presentesGeral / totalGeral) * 100) : null,
      estudantes,
    };
  });
}

export async function getProfessorDetalhe(professorId: string, nucleoId: string) {
  return prisma.user.findFirst({
    where: { id: professorId, nucleoId, role: "PROFESSOR" },
    include: {
      disciplinasQueLeciona: { include: { disciplina: true, turma: true } },
    },
  });
}

export async function getSimuladosDoNucleo(nucleoId: string) {
  return prisma.simulado.findMany({
    where: { nucleoId },
    include: {
      respostas: { include: { estudante: { include: { user: true } } } },
    },
    orderBy: { data: "desc" },
  });
}

export async function getFrequenciaDetalhadaDoNucleo(nucleoId: string) {
  const matriculas = await prisma.matricula.findMany({
    where: { status: "APROVADA", turma: { nucleoId } },
    include: {
      estudante: {
        include: {
          user: true,
          frequencias: { orderBy: { data: "desc" } },
        },
      },
      turma: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const hoje = new Date();

  return matriculas.map((m) => {
    const registros = m.estudante.frequencias.filter((f) => f.turmaId === m.turmaId);
    const total = registros.length;
    const presentes = registros.filter((r) => r.presente).length;

    const registrosDoMes = registros.filter(
      (r) => r.data.getMonth() === hoje.getMonth() && r.data.getFullYear() === hoje.getFullYear()
    );
    const totalMes = registrosDoMes.length;
    const presentesMes = registrosDoMes.filter((r) => r.presente).length;

    return {
      estudanteId: m.estudante.id,
      nome: m.estudante.user.nome,
      turmaNome: `${m.turma.nome} — ${m.turma.periodo}`,
      percentual: total > 0 ? Math.round((presentes / total) * 100) : null,
      percentualMes: totalMes > 0 ? Math.round((presentesMes / totalMes) * 100) : null,
      registros: registros.map((r) => ({ data: r.data, presente: r.presente })),
    };
  });
}

export async function getEstudanteDetalhe(matriculaId: string, nucleoId?: string) {
  return prisma.matricula.findFirst({
    where: { id: matriculaId, ...(nucleoId ? { turma: { nucleoId } } : {}) },
    include: {
      estudante: { include: { user: true } },
      turma: { include: { nucleo: true } },
    },
  });
}

// Estatísticas de um simulado restritas às seções (blocos) informadas —
// usado pra dar ao professor uma visão só da sua matéria dentro da prova.
// Recebe as matérias reais do professor (ex: ["Geografia"], não a seção ampla
// "Ciências Humanas") — casa cada questão do simulado com sua matéria de
// verdade via QuestaoBanco.numeroSimulado, então só entram as questões que
// são realmente da matéria do professor (inclusive do Texto Base, que mistura
// disciplinas).
export async function getEstatisticasSimuladoPorSecoes(
  simuladoId: string,
  materias: string[],
  limiteRanking = 5
) {
  const simulado = await prisma.simulado.findUnique({
    where: { id: simuladoId },
    include: { respostas: true },
  });
  if (!simulado) return null;

  const questoesBanco =
    materias.length > 0
      ? await prisma.questaoBanco.findMany({
          where: { simuladoId, materia: { in: materias }, numeroSimulado: { not: null } },
          orderBy: { numeroSimulado: "asc" },
        })
      : [];

  const indicesOrdenados = Array.from(
    new Set(questoesBanco.map((q) => q.numeroSimulado! - 1))
  ).sort((a, b) => a - b);
  const questaoBancoPorNumero = new Map(questoesBanco.map((q) => [q.numeroSimulado!, q]));

  const porQuestao = indicesOrdenados.map((i) => ({ numero: i + 1, acertos: 0, respondidas: 0 }));
  const porQuestaoMap = new Map(porQuestao.map((q) => [q.numero, q]));

  const desempenhoAlunos = simulado.respostas.map((r) => {
    const gabaritoEfetivo = montarGabaritoEfetivo(simulado, r.linguaEscolhida)
      .split(",")
      .map((s) => s.trim().toUpperCase());
    const marcadas = r.respostas.split(",").map((s) => s.trim().toUpperCase());

    let acertos = 0;
    let questoesValidas = 0;
    for (const i of indicesOrdenados) {
      // Questões 23-27 (língua estrangeira) têm uma versão de QuestaoBanco
      // por idioma com o MESMO número — se essa questão é de um idioma e o
      // aluno escolheu outro na prova, ela não conta pra ele (senão as
      // estatísticas de Inglês/Espanhol/Francês ficam misturadas).
      const materiaDaQuestao = questaoBancoPorNumero.get(i + 1)?.materia;
      if (
        materiaDaQuestao &&
        (IDIOMAS_BLOCO_LINGUA as readonly string[]).includes(materiaDaQuestao) &&
        materiaDaQuestao !== r.linguaEscolhida
      ) {
        continue;
      }

      const certa = gabaritoEfetivo[i];
      if (!certa || certa === "?") continue;
      questoesValidas++;
      const marcada = marcadas[i] ?? "?";
      const acertou = certa === "ANULADA" || marcada === certa;
      const q = porQuestaoMap.get(i + 1)!;
      q.respondidas++;
      if (acertou) {
        q.acertos++;
        acertos++;
      }
    }

    return {
      nomeCompleto: r.nomeCompleto,
      acertos,
      totalSecao: questoesValidas,
      percentual: questoesValidas > 0 ? Math.round((acertos / questoesValidas) * 100) : null,
    };
  });

  const questoesComEstatistica = porQuestao.map((q) => {
    const questao = questaoBancoPorNumero.get(q.numero) ?? null;
    return {
      numero: q.numero,
      acertos: q.acertos,
      erros: q.respondidas - q.acertos,
      respondidas: q.respondidas,
      percentualErro: q.respondidas > 0 ? Math.round(((q.respondidas - q.acertos) / q.respondidas) * 100) : 0,
      questao: questao
        ? {
            id: questao.id,
            enunciado: questao.enunciado,
            imagemUrl: questao.imagemUrl,
            opcaoA: questao.opcaoA,
            opcaoB: questao.opcaoB,
            opcaoC: questao.opcaoC,
            opcaoD: questao.opcaoD,
            opcaoE: questao.opcaoE,
            respostaCorreta: questao.respostaCorreta,
            subtema: questao.subtema,
          }
        : null,
    };
  });

  const rankeados = desempenhoAlunos
    .filter((a) => a.totalSecao > 0)
    .sort((a, b) => b.acertos - a.acertos);

  return {
    simuladoNome: simulado.nome,
    simuladoData: simulado.data,
    arquivoProva: simulado.arquivoProva,
    totalQuestoesSecao: indicesOrdenados.length,
    questoes: questoesComEstatistica,
    melhoresAlunos: rankeados.slice(0, limiteRanking),
    pioresAlunos: rankeados.slice(-limiteRanking).reverse(),
    totalAlunosRankeados: rankeados.length,
  };
}

// Lista as matérias reais (QuestaoBanco.materia) que esse simulado tem
// cadastradas — usada pro filtro de resultados da coordenação.
export async function getMateriasDoSimulado(simuladoId: string) {
  const rows = await prisma.questaoBanco.findMany({
    where: { simuladoId, numeroSimulado: { not: null } },
    select: { materia: true },
    distinct: ["materia"],
    orderBy: { materia: "asc" },
  });
  return rows.map((r) => r.materia);
}

// Panorama geral do simulado: % de erro por matéria, por subtema e por
// grupo amplo (Humanas/Exatas/Biológicas/Linguagens) — visão de "onde a
// turma inteira está errando mais", sem precisar escolher nada antes.
export async function getPercentualErroDetalhado(simuladoId: string) {
  const simulado = await prisma.simulado.findUnique({
    where: { id: simuladoId },
    include: { respostas: true },
  });
  if (!simulado) return null;

  const questoesBanco = await prisma.questaoBanco.findMany({
    where: { simuladoId, numeroSimulado: { not: null } },
  });
  if (questoesBanco.length === 0) return null;

  const porMateria = new Map<string, { acertos: number; respondidas: number }>();
  const porSubtema = new Map<
    string,
    { materia: string; numero: number; acertos: number; respondidas: number }
  >();
  const porGrupo = new Map<string, { acertos: number; respondidas: number }>();

  for (const questao of questoesBanco) {
    const numero = questao.numeroSimulado!;
    const indice = numero - 1;
    const ehIdioma = (IDIOMAS_BLOCO_LINGUA as readonly string[]).includes(questao.materia);

    let acertos = 0;
    let respondidas = 0;
    for (const r of simulado.respostas) {
      if (ehIdioma && questao.materia !== r.linguaEscolhida) continue;

      const gabaritoEfetivo = montarGabaritoEfetivo(simulado, r.linguaEscolhida)
        .split(",")
        .map((s) => s.trim().toUpperCase());
      const marcadas = r.respostas.split(",").map((s) => s.trim().toUpperCase());

      const certa = gabaritoEfetivo[indice];
      if (!certa || certa === "?") continue;
      respondidas++;
      const marcada = marcadas[indice] ?? "?";
      if (certa === "ANULADA" || marcada === certa) acertos++;
    }

    const materiaAtual = porMateria.get(questao.materia) ?? { acertos: 0, respondidas: 0 };
    materiaAtual.acertos += acertos;
    materiaAtual.respondidas += respondidas;
    porMateria.set(questao.materia, materiaAtual);

    const grupo = grupoDaMateria(questao.materia);
    const grupoAtual = porGrupo.get(grupo) ?? { acertos: 0, respondidas: 0 };
    grupoAtual.acertos += acertos;
    grupoAtual.respondidas += respondidas;
    porGrupo.set(grupo, grupoAtual);

    const chaveSubtema = `${questao.materia}::${questao.subtema ?? `Questão ${numero}`}`;
    porSubtema.set(chaveSubtema, {
      materia: questao.materia,
      numero,
      acertos,
      respondidas,
    });
  }

  function paraLista<T extends { acertos: number; respondidas: number }>(
    mapa: Map<string, T>
  ) {
    return Array.from(mapa.entries())
      .map(([chave, v]) => ({
        chave,
        ...v,
        percentualErro: v.respondidas > 0 ? Math.round(((v.respondidas - v.acertos) / v.respondidas) * 100) : 0,
      }))
      .filter((v) => v.respondidas > 0)
      .sort((a, b) => b.percentualErro - a.percentualErro);
  }

  return {
    porMateria: paraLista(porMateria),
    porGrupo: paraLista(porGrupo),
    porSubtema: paraLista(porSubtema).map((v) => {
      const [materia, subtema] = v.chave.split("::");
      return { ...v, materia, subtema };
    }),
  };
}
