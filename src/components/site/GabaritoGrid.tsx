import { SECOES_UERJ_60 } from "@/lib/simulado";

// Mostra as respostas do aluno lado a lado com o gabarito, agrupadas por
// seção — no mesmo formato do cartão-resposta oficial impresso.
export function GabaritoGrid({
  gabarito,
  respostas,
}: {
  gabarito: string[];
  respostas: string[];
}) {
  const totalQuestoes = gabarito.length;
  const secoes =
    totalQuestoes === 60
      ? SECOES_UERJ_60
      : [{ nome: "Questões", inicio: 1, fim: totalQuestoes }];

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[11px] text-ink-faint">
        Linha de cima: sua resposta · Linha de baixo: gabarito
      </p>
      {secoes.map((secao) => {
        const indices = Array.from(
          { length: secao.fim - secao.inicio + 1 },
          (_, i) => secao.inicio - 1 + i
        ).filter((i) => i < totalQuestoes);
        if (indices.length === 0) return null;

        return (
          <div key={secao.nome} className="overflow-x-auto">
            <div className="text-xs font-bold text-ink-faint uppercase tracking-wide mb-1">
              {secao.nome}
            </div>
            <table className="border-collapse">
              <thead>
                <tr>
                  {indices.map((i) => (
                    <th
                      key={i}
                      className="border border-border bg-paper text-[10px] font-mono font-bold text-ink-faint w-8 h-6"
                    >
                      {i + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {indices.map((i) => {
                    const certa = gabarito[i];
                    const marcada = respostas[i] ?? "?";
                    const anulada = certa === "ANULADA";
                    const semGabarito = certa === "?" || !certa;
                    const acertou = anulada || (!semGabarito && marcada === certa);
                    return (
                      <td
                        key={i}
                        className={`border border-border text-center text-xs font-bold w-8 h-8 ${
                          anulada || semGabarito
                            ? "bg-surface text-ink-faint"
                            : acertou
                            ? "bg-teal/15 text-teal"
                            : "bg-terracotta/15 text-terracotta"
                        }`}
                      >
                        {marcada === "?" ? "—" : marcada}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  {indices.map((i) => {
                    const certa = gabarito[i];
                    const anulada = certa === "ANULADA";
                    const semGabarito = certa === "?" || !certa;
                    return (
                      <td
                        key={`gabarito-${i}`}
                        className="border border-border text-center text-[10px] font-bold text-ink-faint bg-paper w-8 h-6"
                      >
                        {anulada ? "Anul." : semGabarito ? "—" : certa}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
