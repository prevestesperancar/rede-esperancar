import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const senhaPadrao = await bcrypt.hash("esperancar123", 10);

  const coordenadora = await prisma.user.upsert({
    where: { email: "pamela@esperancar.org" },
    update: {},
    create: {
      email: "pamela@esperancar.org",
      passwordHash: senhaPadrao,
      role: "COORDENACAO",
      nome: "Pamela Barbosa",
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@esperancar.org" },
    update: {},
    create: {
      email: "admin@esperancar.org",
      passwordHash: senhaPadrao,
      role: "ADMIN",
      nome: "Admin Rede Esperançar",
    },
  });

  const nucleo = await prisma.nucleo.upsert({
    where: { slug: "maracana" },
    update: { bairro: "Maracanã" },
    create: {
      nome: "Pré Vestibular Social Esperançar Maracanã",
      slug: "maracana",
      cidade: "Rio de Janeiro",
      estado: "RJ",
      bairro: "Maracanã",
      endereco: "Rua São Francisco Xavier, 524 — Maracanã, RJ",
      descricao:
        "O Pré Vestibular Social Esperançar Maracanã nasceu de uma certeza urgente: a universidade pública foi construída pelo povo e precisa ser ocupada pelo povo.",
      fotoUrl: "/images/nucleo-maracana.jpg",
      coordenadorId: coordenadora.id,
    },
  });

  await prisma.user.update({
    where: { id: coordenadora.id },
    data: { nucleoId: nucleo.id },
  });

  const turma1 = await prisma.turma.upsert({
    where: { id: `${nucleo.id}-turma-1` },
    update: {},
    create: {
      id: `${nucleo.id}-turma-1`,
      nome: "Turma 1",
      periodo: "Sábado",
      capacidade: 55,
      nucleoId: nucleo.id,
    },
  });

  const professoresInfo = [
    { nome: "Luiz Octávio", email: "luiz.octavio@esperancar.org", disciplina: "Matemática 2", foto: "/images/prof-luiz-octavio.jpg" },
    { nome: "Luiz Gustavo", email: "luiz.gustavo@esperancar.org", disciplina: "Matemática 1", foto: "/images/prof-luiz-gustavo.jpg" },
    { nome: "Pablo Sena", email: "pablo.sena@esperancar.org", disciplina: "Geografia", foto: "/images/prof-pablo.jpg" },
    { nome: "Fabíola Nogueira", email: "fabiola.nogueira@esperancar.org", disciplina: "Redação", foto: "/images/prof-fabiola.jpg" },
    { nome: "Gabrielly", email: "gabrielly@esperancar.org", disciplina: "Inglês", foto: null },
    { nome: "Vitória", email: "vitoria@esperancar.org", disciplina: "Biologia", foto: null },
    { nome: "Victor", email: "victor@esperancar.org", disciplina: "Química", foto: null },
    { nome: "Patrícia", email: "patricia@esperancar.org", disciplina: "Física", foto: null },
    { nome: "Rebeca", email: "rebeca@esperancar.org", disciplina: "Sociologia/Filosofia", foto: null },
    { nome: "Bárbara", email: "barbara@esperancar.org", disciplina: "Língua Portuguesa", foto: null },
    { nome: "Flávio", email: "flavio@esperancar.org", disciplina: "História", foto: null },
  ];

  const professores: Record<string, string> = {};
  for (const p of professoresInfo) {
    const user = await prisma.user.upsert({
      where: { email: p.email },
      update: {},
      create: {
        email: p.email,
        passwordHash: senhaPadrao,
        role: "PROFESSOR",
        nome: p.nome,
        nucleoId: nucleo.id,
        fotoUrl: p.foto ?? undefined,
      },
    });
    professores[p.disciplina] = user.id;
  }

  const grade: Array<{
    disciplina: string;
    dia: "Sábado 1" | "Sábado 2";
    inicio: string;
    fim: string;
  }> = [
    { disciplina: "Inglês", dia: "Sábado 1", inicio: "09:00", fim: "09:50" },
    { disciplina: "Biologia", dia: "Sábado 1", inicio: "09:50", fim: "10:40" },
    { disciplina: "Matemática 1", dia: "Sábado 1", inicio: "10:50", fim: "11:40" },
    { disciplina: "Matemática 1", dia: "Sábado 1", inicio: "11:40", fim: "12:30" },
    { disciplina: "Física", dia: "Sábado 1", inicio: "13:30", fim: "14:20" },
    { disciplina: "Sociologia/Filosofia", dia: "Sábado 1", inicio: "14:20", fim: "15:10" },
    { disciplina: "Redação", dia: "Sábado 1", inicio: "15:30", fim: "16:20" },
    { disciplina: "Redação", dia: "Sábado 1", inicio: "16:20", fim: "17:10" },
    { disciplina: "Matemática 2", dia: "Sábado 2", inicio: "09:00", fim: "09:50" },
    { disciplina: "Matemática 2", dia: "Sábado 2", inicio: "09:50", fim: "10:40" },
    { disciplina: "Química", dia: "Sábado 2", inicio: "10:50", fim: "11:40" },
    { disciplina: "Língua Portuguesa", dia: "Sábado 2", inicio: "13:30", fim: "14:20" },
    { disciplina: "Língua Portuguesa", dia: "Sábado 2", inicio: "14:20", fim: "15:10" },
    { disciplina: "História", dia: "Sábado 2", inicio: "15:30", fim: "16:20" },
    { disciplina: "Geografia", dia: "Sábado 2", inicio: "16:20", fim: "17:10" },
  ];

  for (const item of grade) {
    const disciplina = await prisma.disciplina.upsert({
      where: { nome: item.disciplina },
      update: {},
      create: { nome: item.disciplina },
    });

    const professorId = professores[item.disciplina];
    if (!professorId) continue;

    const existing = await prisma.turmaDisciplina.findFirst({
      where: {
        turmaId: turma1.id,
        disciplinaId: disciplina.id,
        horaInicio: item.inicio,
        diaSemana: item.dia,
      },
    });

    if (!existing) {
      await prisma.turmaDisciplina.create({
        data: {
          turmaId: turma1.id,
          disciplinaId: disciplina.id,
          professorId,
          diaSemana: item.dia,
          horaInicio: item.inicio,
          horaFim: item.fim,
        },
      });
    }
  }

  const anaUser = await prisma.user.upsert({
    where: { email: "ana.silva@email.com" },
    update: {},
    create: {
      email: "ana.silva@email.com",
      passwordHash: senhaPadrao,
      role: "ESTUDANTE",
      nome: "Ana Beatriz Silva",
      nucleoId: nucleo.id,
    },
  });

  const anaEstudante = await prisma.estudante.upsert({
    where: { userId: anaUser.id },
    update: {},
    create: {
      userId: anaUser.id,
      status: "PRESENTE",
      dataNascimento: new Date("2009-03-14"),
      sexoGenero: "Feminino",
      racaCor: "Parda",
      bairro: "Maracanã",
      municipio: "Rio de Janeiro",
      situacaoEscolar: "Cursando o 3º ano do ensino médio",
      escola: "Colégio Estadual Amaro Cavalcanti",
      escolaPublica: true,
      cotista: true,
      jaFezEnem: true,
      cursoDesejado: "Medicina",
      provasQueVaiFazer: "ENEM, UERJ",
      rendaFamiliar: "De R$ 1.000 a R$ 2.000",
      pessoasEmCasa: 4,
      trabalha: false,
      motivacao:
        "Quero ser a primeira da família a entrar numa universidade pública.",
      ultimoContato: new Date("2026-07-20"),
      ultimoContatoObs: "Confirmou presença no aulão de 16/08.",
    },
  });

  await prisma.matricula.upsert({
    where: { estudanteId_turmaId: { estudanteId: anaEstudante.id, turmaId: turma1.id } },
    update: {},
    create: {
      estudanteId: anaEstudante.id,
      turmaId: turma1.id,
      status: "APROVADA",
    },
  });

  const pendentesInfo = [
    {
      nome: "Larissa Souza",
      email: "larissa.souza@email.com",
      dataNascimento: "2008-06-02",
      escola: "Colégio Pedro II",
      escolaPublica: true,
      cotista: true,
      cursoDesejado: "Direito",
      provasQueVaiFazer: "ENEM, UERJ",
    },
    {
      nome: "Gustavo Pereira",
      email: "gustavo.pereira@email.com",
      dataNascimento: "2009-01-20",
      escola: "CIEP Presidente Tancredo Neves",
      escolaPublica: true,
      cotista: false,
      cursoDesejado: "Engenharia Civil",
      provasQueVaiFazer: "ENEM",
    },
    {
      nome: "Elaine Cardoso",
      email: "elaine.cardoso@email.com",
      dataNascimento: "2007-11-08",
      escola: "Colégio Estadual Chico Anysio",
      escolaPublica: true,
      cotista: true,
      cursoDesejado: "Psicologia",
      provasQueVaiFazer: "ENEM, UERJ",
    },
    {
      nome: "Thiago Moreira",
      email: "thiago.moreira@email.com",
      dataNascimento: "2008-09-30",
      escola: "Colégio Salesiano (bolsista)",
      escolaPublica: false,
      cotista: false,
      cursoDesejado: "Ciência da Computação",
      provasQueVaiFazer: "ENEM",
    },
    {
      nome: "Vanessa Nunes",
      email: "vanessa.nunes@email.com",
      dataNascimento: "2009-04-17",
      escola: "Colégio Estadual Brizolão",
      escolaPublica: true,
      cotista: true,
      cursoDesejado: "Enfermagem",
      provasQueVaiFazer: "ENEM, UERJ",
    },
  ];

  for (const p of pendentesInfo) {
    const user = await prisma.user.upsert({
      where: { email: p.email },
      update: {},
      create: {
        email: p.email,
        passwordHash: senhaPadrao,
        role: "ESTUDANTE",
        nome: p.nome,
        nucleoId: nucleo.id,
      },
    });
    const estudante = await prisma.estudante.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        dataNascimento: new Date(p.dataNascimento),
        escola: p.escola,
        escolaPublica: p.escolaPublica,
        cotista: p.cotista,
        cursoDesejado: p.cursoDesejado,
        provasQueVaiFazer: p.provasQueVaiFazer,
        municipio: "Rio de Janeiro",
      },
    });
    await prisma.matricula.upsert({
      where: { estudanteId_turmaId: { estudanteId: estudante.id, turmaId: turma1.id } },
      update: {},
      create: { estudanteId: estudante.id, turmaId: turma1.id, status: "PENDENTE" },
    });
  }

  if ((await prisma.aviso.count({ where: { nucleoId: nucleo.id } })) === 0) {
    await prisma.aviso.create({
      data: {
        titulo: "Aulão UERJ",
        corpo: "Aulão UERJ marcado para 16/08.",
        nucleoId: nucleo.id,
        turmaId: turma1.id,
      },
    });

    await prisma.aviso.create({
      data: {
        titulo: "Redação",
        corpo: "Trazer redação escrita na próxima aula de redação.",
        nucleoId: nucleo.id,
        turmaId: turma1.id,
      },
    });
  }

  if ((await prisma.material.count({ where: { nucleoId: nucleo.id } })) === 0)
  await prisma.material.createMany({
    data: [
      {
        titulo: "Guia de redação nota 1000",
        descricao:
          "Estrutura dissertativa-argumentativa passo a passo, com exemplos comentados.",
        arquivoUrl: "/materiais/guia-redacao.pdf",
        publico: true,
        nucleoId: nucleo.id,
      },
      {
        titulo: "Matemática básica reforçada",
        descricao:
          'Apostila de fundamentos para quem sente que "ficou pra trás" na matéria.',
        arquivoUrl: "/materiais/matematica-basica.pdf",
        publico: true,
        nucleoId: nucleo.id,
      },
      {
        titulo: "Atualidades do trimestre",
        descricao:
          "Resumo dos temas que mais caem em redação e ciências humanas.",
        arquivoUrl: "/materiais/atualidades.pdf",
        publico: true,
        nucleoId: nucleo.id,
      },
    ],
  });

  if ((await prisma.evento.count({ where: { nucleoId: nucleo.id } })) === 0)
  await prisma.evento.createMany({
    data: [
      {
        titulo: "Aulão — Humanas",
        data: new Date("2026-08-16T09:00:00-03:00"),
        local: "Prés Maracanã e Zona Norte",
        nucleoId: nucleo.id,
      },
      {
        titulo: "Aulão — Exatas e Biológicas",
        data: new Date("2026-08-23T09:00:00-03:00"),
        local: "Prés Maracanã e Zona Norte",
        nucleoId: nucleo.id,
      },
      {
        titulo: "Simulado UERJ",
        data: new Date("2026-08-30T09:00:00-03:00"),
        local: "Todos os núcleos",
        nucleoId: nucleo.id,
      },
    ],
  });

  if ((await prisma.prova.count({ where: { nucleoId: nucleo.id } })) === 0)
  await prisma.prova.createMany({
    data: [
      {
        nome: "UERJ — 2º Exame de Qualificação",
        data: new Date("2026-11-08T13:00:00-03:00"),
        nucleoId: nucleo.id,
      },
      {
        nome: "ENEM — 1º dia",
        data: new Date("2026-11-15T13:00:00-03:00"),
        nucleoId: nucleo.id,
      },
    ],
  });

  if ((await prisma.depoimento.count({ where: { nucleoId: nucleo.id } })) === 0)
  await prisma.depoimento.createMany({
    data: [
      {
        nome: "Laila Alves",
        curso: "Pedagogia · UFF",
        fotoUrl: "/images/prof-laila.jpg",
        quote:
          "Obrigada por todo suporte! Vocês fazem parte do meu crescimento. ❤️🙌",
        nucleoId: nucleo.id,
      },
      {
        nome: "Caio Quaresma",
        curso: "Filosofia · UFF",
        fotoUrl: "/images/depoimento-caio.jpg",
        quote: "Muito obrigado a todos vocês por todo suporte, devo a vocês!!",
        nucleoId: nucleo.id,
      },
      {
        nome: "Clara Goulart",
        curso: "Pedagogia · UERJ",
        fotoUrl: "/images/depoimento-clara.jpg",
        quote: "Muito obrigada por todo apoio! 🩷",
        nucleoId: nucleo.id,
      },
    ],
  });

  if ((await prisma.monitoria.count({ where: { turmaId: turma1.id } })) === 0)
  await prisma.monitoria.create({
    data: {
      turmaId: turma1.id,
      nucleoId: nucleo.id,
      diaSemana: "Quarta-feira",
      horaInicio: "19:00",
      horaFim: "20:30",
      materiais: "Lista de exercícios de Matemática 1 — frações e porcentagem",
      link: "https://meet.google.com/exemplo-monitoria",
    },
  });

  console.log("Seed concluído:", { nucleo: nucleo.nome, turma: turma1.nome });
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
