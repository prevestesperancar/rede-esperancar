export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

function normalizarCabecalho(cabecalho: string) {
  return cabecalho
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

export function encontrarColuna(cabecalhos: string[], termos: string[]) {
  const normalizados = cabecalhos.map(normalizarCabecalho);
  for (const termo of termos) {
    const index = normalizados.findIndex((h) => h.includes(termo));
    if (index !== -1) return index;
  }
  return -1;
}

export function parseDataBr(valor: string): Date | null {
  const texto = valor.trim();
  if (!texto) return null;

  const brasileiro = texto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (brasileiro) {
    const [, dia, mes, ano] = brasileiro;
    const data = new Date(Number(ano), Number(mes) - 1, Number(dia));
    return Number.isNaN(data.getTime()) ? null : data;
  }

  const iso = texto.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) {
    const [, ano, mes, dia] = iso;
    const data = new Date(Number(ano), Number(mes) - 1, Number(dia));
    return Number.isNaN(data.getTime()) ? null : data;
  }

  return null;
}
