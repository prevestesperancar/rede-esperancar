// Política de senha usada em todo cadastro/redefinição do sistema — mínimo
// 8 caracteres com letra e número, pra reduzir senhas fracas como "123456".
export function validarSenhaForte(senha: string): string | null {
  if (senha.length < 8) return "A senha precisa ter pelo menos 8 caracteres.";
  if (!/[a-zA-Z]/.test(senha)) return "A senha precisa ter pelo menos uma letra.";
  if (!/[0-9]/.test(senha)) return "A senha precisa ter pelo menos um número.";
  return null;
}
