// Agrupamento tradicional de vestibular (não é o das áreas do Enem) — usado
// só pra dar uma visão panorâmica pra coordenação, ex: "Humanas foi o pior
// desempenho da turma nesse simulado".
export const GRUPO_DE_MATERIA: Record<string, string> = {
  Matemática: "Exatas",
  Física: "Exatas",
  Biologia: "Biológicas",
  Química: "Biológicas",
  História: "Humanas",
  Geografia: "Humanas",
  Sociologia: "Humanas",
  Filosofia: "Humanas",
  Português: "Linguagens",
  Inglês: "Linguagens",
  Espanhol: "Linguagens",
  Francês: "Linguagens",
};

export function grupoDaMateria(materia: string): string {
  return GRUPO_DE_MATERIA[materia] ?? "Outras";
}
