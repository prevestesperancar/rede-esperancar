async function buscarNoNominatim(endereco: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(endereco)}`;
    const resposta = await fetch(url, {
      headers: { "User-Agent": "RedeEsperancar/1.0 (contato@esperancar.org)" },
    });
    if (!resposta.ok) return null;

    const dados = await resposta.json();
    if (!Array.isArray(dados) || dados.length === 0) return null;

    const lat = Number(dados[0].lat);
    const lon = Number(dados[0].lon);
    if (Number.isNaN(lat) || Number.isNaN(lon)) return null;

    return { lat, lon };
  } catch {
    return null;
  }
}

// Tenta o endereço completo primeiro; se não encontrar, tenta versões cada vez
// mais simples (bairro/cidade/estado, depois só cidade/estado) — endereços com
// número de rua ou bairro digitado diferente do OpenStreetMap às vezes não
// batem, mas a cidade quase sempre bate, então sempre sobra pelo menos um pino
// aproximado no mapa em vez de nenhum.
export async function geocodificarEndereco(
  endereco: string,
  ...enderecosAlternativos: (string | undefined)[]
): Promise<{ lat: number; lon: number } | null> {
  if (!endereco.trim()) return null;

  const resultado = await buscarNoNominatim(endereco);
  if (resultado) return resultado;

  for (const alternativo of enderecosAlternativos) {
    if (!alternativo) continue;
    await new Promise((r) => setTimeout(r, 1100)); // respeita o limite de 1 req/s do Nominatim
    const resultadoAlternativo = await buscarNoNominatim(alternativo);
    if (resultadoAlternativo) return resultadoAlternativo;
  }
  return null;
}
