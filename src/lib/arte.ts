// Formatos das artes de redes sociais (Etapa 2).
export const MODELOS = {
  post: { width: 1080, height: 1080, rotulo: "Post (1080×1080)" },
  story: { width: 1080, height: 1920, rotulo: "Story (1080×1920)" },
} as const;

export type Modelo = keyof typeof MODELOS;

// Textos prontos pra começar — a coordenação pode alterar qualquer um.
export const TEXTOS_PRONTOS = [
  {
    rotulo: "Inscrições abertas",
    titulo: "Inscrições abertas",
    subtitulo: "Garanta sua vaga no Pré-Vestibular Social Esperançar",
  },
  {
    rotulo: "Simulado",
    titulo: "Simulado Esperançar",
    subtitulo: "Confira a data e o local com a coordenação",
  },
  {
    rotulo: "Evento",
    titulo: "Venha esperançar com a gente",
    subtitulo: "Participe do nosso próximo evento",
  },
] as const;

export const LIMITE_TITULO = 80;
export const LIMITE_SUBTITULO = 140;
export const LIMITE_DATA = 40;
