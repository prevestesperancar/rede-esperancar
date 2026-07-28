export const SEXO_GENERO_OPCOES = [
  "Feminino",
  "Masculino",
  "Não-binário",
  "Prefiro não informar",
];

export const RACA_COR_OPCOES = ["Branca", "Preta", "Parda", "Amarela", "Indígena"];

export const SITUACAO_ESCOLAR_OPCOES = [
  "1º ano do Ensino Médio",
  "2º ano do Ensino Médio",
  "3º ano do Ensino Médio",
  "Terminou o Ensino Médio",
  "Cursando outra universidade",
];

export const PROVAS_OPCOES = ["Somente ENEM", "Somente UERJ", "ENEM e UERJ"];

export const RENDA_FAMILIAR_OPCOES = [
  "Até R$ 218",
  "De R$ 218 a R$ 500",
  "De R$ 500 a R$ 1.000",
  "De R$ 1.000 a R$ 2.000",
  "Acima de R$ 2.000",
  "Prefiro não informar",
];

function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

export function classificarSituacaoEscolar(texto: string): string | undefined {
  const t = normalizar(texto);
  if (!t) return undefined;
  if (t.includes("conclui") || t.includes("terminei") || t.includes("terminou") || t.includes("formad"))
    return SITUACAO_ESCOLAR_OPCOES[3];
  if (t.includes("universidade") || t.includes("faculdade") || t.includes("graduacao"))
    return SITUACAO_ESCOLAR_OPCOES[4];
  // O dígito precisa estar colado em "ano"/"série" — não pode ser qualquer número no
  // texto (ex: "17 anos" não deve virar "1º ano" só porque tem um "1" e um "ano").
  const match = t.match(/([123])\s*[ºo]?\s*(ano|serie)/);
  if (match) {
    const ano = Number(match[1]);
    return SITUACAO_ESCOLAR_OPCOES[ano - 1];
  }
  return undefined;
}

export function classificarProvas(texto: string): string | undefined {
  const t = normalizar(texto);
  if (!t) return undefined;
  const temEnem = t.includes("enem");
  const temUerj = t.includes("uerj");
  if (temEnem && temUerj) return PROVAS_OPCOES[2];
  if (temEnem) return PROVAS_OPCOES[0];
  if (temUerj) return PROVAS_OPCOES[1];
  return undefined;
}

export function classificarRendaFamiliar(texto: string): string | undefined {
  const t = normalizar(texto);
  if (!t) return undefined;

  const opcaoExata = RENDA_FAMILIAR_OPCOES.find((o) => normalizar(o) === t);
  if (opcaoExata) return opcaoExata;

  if (t.includes("nao inform") || t.includes("prefiro")) return RENDA_FAMILIAR_OPCOES[5];

  const numero = Number(t.replace(/[^\d,.]/g, "").replace(",", "."));
  if (!numero || Number.isNaN(numero)) return undefined;
  if (numero <= 218) return RENDA_FAMILIAR_OPCOES[0];
  if (numero <= 500) return RENDA_FAMILIAR_OPCOES[1];
  if (numero <= 1000) return RENDA_FAMILIAR_OPCOES[2];
  if (numero <= 2000) return RENDA_FAMILIAR_OPCOES[3];
  return RENDA_FAMILIAR_OPCOES[4];
}

export function classificarSexoGenero(texto: string): string | undefined {
  const t = normalizar(texto);
  if (!t) return undefined;
  const opcaoExata = SEXO_GENERO_OPCOES.find((o) => normalizar(o) === t);
  if (opcaoExata) return opcaoExata;
  if (t.includes("nao") || t.includes("prefiro")) return SEXO_GENERO_OPCOES[3];
  if (t.includes("nao-binario") || t.includes("nao binario") || t === "nb") return SEXO_GENERO_OPCOES[2];
  if (t.startsWith("fem") || t === "f") return SEXO_GENERO_OPCOES[0];
  if (t.startsWith("masc") || t === "m") return SEXO_GENERO_OPCOES[1];
  return undefined;
}

export function classificarRacaCor(texto: string): string | undefined {
  const t = normalizar(texto);
  if (!t) return undefined;
  const opcaoExata = RACA_COR_OPCOES.find((o) => normalizar(o) === t);
  if (opcaoExata) return opcaoExata;
  if (t.startsWith("branc")) return RACA_COR_OPCOES[0];
  if (t.startsWith("pret")) return RACA_COR_OPCOES[1];
  if (t.startsWith("pard")) return RACA_COR_OPCOES[2];
  if (t.startsWith("amarel")) return RACA_COR_OPCOES[3];
  if (t.startsWith("indigena") || t.startsWith("indig")) return RACA_COR_OPCOES[4];
  return undefined;
}

export function classificarSimNao(texto: string): boolean | undefined {
  const t = normalizar(texto);
  if (!t) return undefined;
  if (t === "sim" || t === "yes" || t.startsWith("sim ")) return true;
  if (t === "nao" || t === "no" || t.startsWith("nao ")) return false;
  if (t.includes("sim")) return true;
  if (t.includes("nao")) return false;
  return undefined;
}
