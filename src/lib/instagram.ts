function decodificarEntidadesHtml(texto: string): string {
  return texto
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

// Tentativa "melhor esforço" de pegar a legenda de um post público do Instagram
// lendo a meta tag og:title da página. O Instagram não oferece mais um oEmbed
// público sem token de app, então isso pode falhar silenciosamente — nesse
// caso a legenda simplesmente fica vazia e o coordenador pode preencher à mão.
export async function buscarLegendaInstagram(url: string): Promise<string | null> {
  try {
    const resposta = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; RedeEsperancarBot/1.0)" },
      signal: AbortSignal.timeout(5000),
    });
    if (!resposta.ok) return null;

    const html = await resposta.text();
    const match = html.match(/<meta property="og:title" content="([^"]*)"/);
    if (!match) return null;

    const titulo = decodificarEntidadesHtml(match[1]).trim();

    return titulo ? titulo.slice(0, 200) : null;
  } catch {
    return null;
  }
}
