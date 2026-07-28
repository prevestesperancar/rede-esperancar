export const CAMPOS_IMPORTACAO = [
  { key: "ignorar", label: "Ignorar esta coluna" },
  { key: "nome", label: "Nome completo" },
  { key: "email", label: "E-mail" },
  { key: "telefone", label: "Telefone / celular" },
  { key: "dataNascimento", label: "Data de nascimento" },
  { key: "situacaoEscolar", label: "Situação escolar" },
  { key: "escola", label: "Nome da escola" },
  { key: "escolaPublica", label: "Escola pública? (sim/não)" },
  { key: "municipio", label: "Município" },
  { key: "bairro", label: "Bairro" },
  { key: "sexoGenero", label: "Sexo/gênero" },
  { key: "racaCor", label: "Raça/cor" },
  { key: "cursoDesejado", label: "Curso desejado" },
  { key: "provasQueVaiFazer", label: "Provas que vai fazer" },
  { key: "jaFezEnem", label: "Já fez Enem/vestibular? (sim/não)" },
  { key: "rendaFamiliar", label: "Renda familiar" },
  { key: "pessoasEmCasa", label: "Pessoas em casa" },
  { key: "trabalha", label: "Trabalha? (sim/não)" },
  { key: "motivacao", label: "Motivação" },
] as const;

export type CampoImportacao = (typeof CAMPOS_IMPORTACAO)[number]["key"];
