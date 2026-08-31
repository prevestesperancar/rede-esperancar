export function corrigirAutomaticamente(gabarito: string, respostas: string) {
  const certas = gabarito.split(",").map((s) => s.trim().toUpperCase());
  const dadas = respostas.split(",").map((s) => s.trim().toUpperCase());
  let acertos = 0;
  certas.forEach((c, i) => {
    if (c && dadas[i] === c) acertos++;
  });
  return Math.round((acertos / certas.length) * 1000) / 100;
}
