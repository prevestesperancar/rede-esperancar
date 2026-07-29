export function ehProfessorDeRedacao(materia: string | null | undefined) {
  if (!materia) return false;
  const normalizada = materia
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  return normalizada.includes("redac");
}
