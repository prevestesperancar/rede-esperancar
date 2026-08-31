// A prova da Uerj só separa questões em 6 blocos amplos (não por matéria
// individual) — então cada professor vê o(s) bloco(s) mais próximo(s) da
// matéria dele. Física/Química/Biologia caem juntas em "Ciências da
// Natureza"; História/Geografia/Sociologia-Filosofia em "Ciências Humanas".
const MAPA_MATERIA_SECOES: Record<string, string[]> = {
  "matemática": ["Matemática"],
  "matemática 1": ["Matemática"],
  "matemática 2": ["Matemática"],
  física: ["Ciências da Natureza"],
  química: ["Ciências da Natureza"],
  biologia: ["Ciências da Natureza"],
  "ciências da natureza": ["Ciências da Natureza"],
  história: ["Ciências Humanas"],
  geografia: ["Ciências Humanas"],
  sociologia: ["Ciências Humanas"],
  filosofia: ["Ciências Humanas"],
  "sociologia/filosofia": ["Ciências Humanas"],
  "ciências humanas": ["Ciências Humanas"],
  "língua portuguesa": ["Texto Base", "Linguagens"],
  português: ["Texto Base", "Linguagens"],
  redação: ["Texto Base", "Linguagens"],
  inglês: ["Língua Estrangeira"],
  espanhol: ["Língua Estrangeira"],
  francês: ["Língua Estrangeira"],
  "língua estrangeira": ["Língua Estrangeira"],
  "língua estrangeira (inglês)": ["Língua Estrangeira"],
  "língua estrangeira (espanhol)": ["Língua Estrangeira"],
  "língua estrangeira (francês)": ["Língua Estrangeira"],
};

// Casa a matéria do professor (campo livre, ex: "Matemática 1", "Sociologia,
// Filosofia") com as matérias exatas usadas no Banco de Questões (QuestaoBanco.materia)
// — diferente de secoesDaMateria, que devolve a seção ampla da prova (usada só
// pro texto legado). Isso permite mostrar só as questões que são de verdade da
// disciplina do professor, inclusive dentro do Texto Base, que mistura matérias.
const MAPA_MATERIA_REAL: Record<string, string[]> = {
  "matemática": ["Matemática"],
  "matemática 1": ["Matemática"],
  "matemática 2": ["Matemática"],
  física: ["Física"],
  química: ["Química"],
  biologia: ["Biologia"],
  "ciências da natureza": ["Física", "Química", "Biologia"],
  história: ["História"],
  geografia: ["Geografia"],
  sociologia: ["Sociologia"],
  filosofia: ["Filosofia"],
  "sociologia/filosofia": ["Sociologia", "Filosofia"],
  "ciências humanas": ["História", "Geografia", "Sociologia", "Filosofia"],
  "língua portuguesa": ["Português"],
  português: ["Português"],
  redação: ["Português"],
  inglês: ["Inglês"],
  espanhol: ["Espanhol"],
  francês: ["Francês"],
};

export function materiasIndividuaisDaMateria(materia: string | null | undefined): string[] {
  if (!materia) return [];
  const partes = materia.split(/[,/]/).map((p) => normalizar(p));
  const materiasReais = new Set<string>();
  for (const parte of partes) {
    for (const [chave, valores] of Object.entries(MAPA_MATERIA_REAL)) {
      if (normalizar(chave) === parte || parte.includes(normalizar(chave))) {
        valores.forEach((v) => materiasReais.add(v));
      }
    }
  }
  return Array.from(materiasReais);
}

function normalizar(texto: string) {
  return texto.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// A matéria de um professor pode ter mais de uma (ex: "Sociologia, Filosofia")
// — junta as seções de todas.
export function secoesDaMateria(materia: string | null | undefined): string[] {
  if (!materia) return [];
  const partes = materia.split(/[,/]/).map((p) => normalizar(p));
  const secoes = new Set<string>();
  for (const parte of partes) {
    for (const [chave, valores] of Object.entries(MAPA_MATERIA_SECOES)) {
      if (normalizar(chave) === parte || parte.includes(normalizar(chave))) {
        valores.forEach((v) => secoes.add(v));
      }
    }
  }
  return Array.from(secoes);
}
