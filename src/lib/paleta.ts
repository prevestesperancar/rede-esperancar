// Extrai uma paleta de cores de uma imagem (logo) no navegador.
// Ignora transparência, branco/preto puro e cinzas quase neutros, e junta
// tons parecidos pra não sugerir 5 vermelhos diferentes.

const HEX = /^#[0-9a-fA-F]{6}$/;

export function ehHexValido(valor: string) {
  return HEX.test(valor);
}

function paraHex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
}

function distancia(a: number[], b: number[]) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

export async function extrairPaleta(arquivo: File, quantidade = 5): Promise<string[]> {
  const bitmap = await createImageBitmap(arquivo);
  const tamanho = 96;
  const canvas = document.createElement("canvas");
  canvas.width = tamanho;
  canvas.height = tamanho;
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];
  ctx.drawImage(bitmap, 0, 0, tamanho, tamanho);
  const { data } = ctx.getImageData(0, 0, tamanho, tamanho);

  // Agrupa pixels em baldes de 24 níveis por canal e guarda a média de cada balde.
  const baldes = new Map<string, { n: number; r: number; g: number; b: number }>();
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
    if (a < 200) continue;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (max > 240 && min > 240) continue; // branco
    if (max < 25) continue; // preto
    if (max - min < 25) continue; // cinza/neutro demais
    const chave = [r, g, b].map((v) => Math.floor(v / 24)).join(",");
    const balde = baldes.get(chave) ?? { n: 0, r: 0, g: 0, b: 0 };
    balde.n++;
    balde.r += r;
    balde.g += g;
    balde.b += b;
    baldes.set(chave, balde);
  }

  const ordenados = Array.from(baldes.values())
    .sort((x, y) => y.n - x.n)
    .map((balde) => [balde.r / balde.n, balde.g / balde.n, balde.b / balde.n]);

  // Escolhe as cores mais frequentes que sejam bem diferentes entre si.
  const escolhidas: number[][] = [];
  for (const cor of ordenados) {
    if (escolhidas.every((c) => distancia(c, cor) > 70)) escolhidas.push(cor);
    if (escolhidas.length === quantidade) break;
  }
  return escolhidas.map(([r, g, b]) => paraHex(r, g, b));
}
