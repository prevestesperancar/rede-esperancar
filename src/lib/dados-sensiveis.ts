import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

/**
 * Grava CPF/RG fora do banco de dados e fora de qualquer rota servida pelo Next
 * (não fica em public/, não é lido por nenhuma página). Serve como retenção
 * temporária até a integração real com a planilha (Google Sheets API) estar
 * configurada — a coordenação exporta esse arquivo manualmente por enquanto.
 */
export async function registrarDadoSensivel(campos: {
  nome: string;
  email: string;
  cpf: string;
  rg: string;
  nucleo: string;
}) {
  const dir = path.join(process.cwd(), "private-data");
  await mkdir(dir, { recursive: true });

  const linha = [
    new Date().toISOString(),
    campos.nome,
    campos.email,
    campos.cpf,
    campos.rg,
    campos.nucleo,
  ]
    .map((v) => `"${v.replace(/"/g, '""')}"`)
    .join(",");

  await appendFile(path.join(dir, "inscricoes-sensiveis.csv"), `${linha}\n`, "utf-8");
}
