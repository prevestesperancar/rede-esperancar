import { prisma } from "@/lib/prisma";

export async function getNucleos(busca?: string) {
  return prisma.nucleo.findMany({
    where: {
      ativo: true,
      ...(busca
        ? {
            OR: [
              { cidade: { contains: busca, mode: "insensitive" } },
              { bairro: { contains: busca, mode: "insensitive" } },
              { estado: { contains: busca, mode: "insensitive" } },
              { nome: { contains: busca, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      turmas: { where: { ativo: true } },
    },
    orderBy: { nome: "asc" },
  });
}

export async function getNucleoBySlug(slug: string) {
  return prisma.nucleo.findUnique({
    where: { slug },
    include: {
      turmas: {
        where: { ativo: true },
        include: {
          matriculas: { where: { status: "APROVADA" } },
          disciplinas: {
            include: { disciplina: true, professor: true },
            orderBy: [{ diaSemana: "asc" }, { horaInicio: "asc" }],
          },
        },
      },
      coordenador: true,
    },
  });
}

export async function getMateriaisPublicos(limit?: number) {
  return prisma.material.findMany({
    where: { publico: true },
    include: { disciplina: true },
    orderBy: { createdAt: "desc" },
    ...(limit ? { take: limit } : {}),
  });
}

export async function getEventosPublicos() {
  return prisma.evento.findMany({
    where: { publico: true, data: { gte: new Date() } },
    orderBy: { data: "asc" },
    take: 4,
  });
}

export async function getGaleriaEventosPublica(limit = 24) {
  return prisma.galeriaEvento.findMany({
    orderBy: { data: "desc" },
    take: limit,
    include: { nucleo: { select: { nome: true } } },
  });
}

export async function getNucleosComCoordenadas() {
  return prisma.nucleo.findMany({
    where: { ativo: true, latitude: { not: null }, longitude: { not: null } },
    select: { id: true, nome: true, slug: true, bairro: true, cidade: true, latitude: true, longitude: true },
  });
}

export async function getDepoimentosPublicos() {
  return prisma.depoimento.findMany({
    orderBy: { createdAt: "desc" },
    take: 3,
  });
}

export async function getSiteStats() {
  const [nucleos, cidades, estudantesAprovados] = await Promise.all([
    prisma.nucleo.count({ where: { ativo: true } }),
    prisma.nucleo.findMany({
      where: { ativo: true },
      distinct: ["cidade"],
      select: { cidade: true },
    }),
    prisma.matricula.count({ where: { status: "APROVADA" } }),
  ]);

  return {
    nucleos,
    cidades: cidades.length,
    estudantes: estudantesAprovados,
  };
}
