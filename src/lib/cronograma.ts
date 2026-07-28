export const DIAS_ESTUDO = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

export function gerarCronogramaSemanal<T extends { id: string }>(disciplinas: T[]) {
  if (disciplinas.length === 0) return DIAS_ESTUDO.map((dia) => ({ dia, disciplina: null as T | null }));
  return DIAS_ESTUDO.map((dia, i) => ({ dia, disciplina: disciplinas[i % disciplinas.length] }));
}

export function semanaAtualChave(data = new Date()) {
  const inicioAno = new Date(data.getFullYear(), 0, 1);
  const dias = Math.floor((data.getTime() - inicioAno.getTime()) / 86400000);
  const semana = Math.floor(dias / 7) + 1;
  return `${data.getFullYear()}-W${String(semana).padStart(2, "0")}`;
}
