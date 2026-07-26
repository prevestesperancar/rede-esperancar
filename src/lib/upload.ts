import { writeFile, mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";

export async function salvarArquivo(file: File | null, pasta: string) {
  if (!file || file.size === 0) return null;

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || "";
  const nomeArquivo = `${randomUUID()}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", pasta);

  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, nomeArquivo), bytes);

  return `/uploads/${pasta}/${nomeArquivo}`;
}
