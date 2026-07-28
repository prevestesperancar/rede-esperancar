import { prisma } from "@/lib/prisma";

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
  return prisma.monitoria.findMany({
    where: { OR: [{ nucleoId }, { global: true }] },
    include: { turma: true, disciplina: true, professor: true },
    orderBy: { diaSemana: "asc" },
  });
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
  return prisma.turmaDisciplina.findMany({
    where: { professorId },
    include: { disciplina: true, turma: true },
    orderBy: [{ diaSemana: "asc" }, { horaInicio: "asc" }],
  });
}

export async function getMonitoriasDoProfessor(professorId: string) {
  const turmaIds = await getTurmasDoProfessor(professorId);
  return prisma.monitoria.findMany({
    where: {
      OR: [{ turmaId: { in: turmaIds } }, { professorId }],
    },
    include: { turma: true, disciplina: true },
    orderBy: { diaSemana: "asc" },
  });
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

export async function getEstudantesParaSimulado(nucleoId: string) {
  const matriculas = await prisma.matricula.findMany({
    where: { status: "APROVADA", turma: { nucleoId } },
    include: { estudante: { include: { user: true } } },
    orderBy: { createdAt: "asc" },
  });
  return matriculas.map((m) => ({ id: m.estudante.id, nome: m.estudante.user.nome }));
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
