import { writeFile, mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { put } from "@vercel/blob";

export async function salvarArquivo(file: File | null, pasta: string) {
  if (!file || file.size === 0) return null;

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
