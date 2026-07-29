import { writeFile, mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { put } from "@vercel/blob";
import { TAMANHO_MAXIMO_FOTO, TAMANHO_MAXIMO_DOCUMENTO } from "@/lib/upload-limits";

export { TAMANHO_MAXIMO_FOTO, TAMANHO_MAXIMO_DOCUMENTO };

export class ArquivoInvalidoError extends Error {}

export async function salvarArquivo(
  file: File | null,
  pasta: string,
  tipo: "foto" | "documento" = "foto"
) {
  if (!file || file.size === 0) return null;

  const tamanhoMaximo = tipo === "documento" ? TAMANHO_MAXIMO_DOCUMENTO : TAMANHO_MAXIMO_FOTO;
  if (file.size > tamanhoMaximo) {
    throw new ArquivoInvalidoError(
      `O arquivo "${file.name}" tem ${(file.size / (1024 * 1024)).toFixed(1)}MB — o tamanho máximo aceito é ${
        tamanhoMaximo / (1024 * 1024)
      }MB. ${tipo === "documento" ? "Comprima o PDF" : "Reduza o tamanho da imagem"} e tente novamente.`
    );
  }

  const ext = path.extname(file.name) || "";
  const nomeArquivo = `${randomUUID()}${ext}`;

  // No Vercel (e em qualquer ambiente com armazenamento Blob configurado) o
  // servidor não permite gravar arquivos no disco — usamos o Vercel Blob.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`${pasta}/${nomeArquivo}`, file, {
      access: "public",
      addRandomSuffix: false,
    });
    return blob.url;
  }

  // Localmente, sem Blob configurado, continua salvando em public/uploads.
  const bytes = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), "public", "uploads", pasta);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, nomeArquivo), bytes);

  return `/uploads/${pasta}/${nomeArquivo}`;
}
