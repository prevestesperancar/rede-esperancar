export function normalizarNome(texto: string) {
  return texto
    .trim()
    .replace(/\s+/g, " ") // espaço duplo/múltiplo não pode quebrar o casamento de nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}
