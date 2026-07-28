function formatarDias(dias: number) {
  if (dias === 0) return "Hoje!";
  if (dias === 1) return "Amanhã";
  return `Em ${dias} dias`;
}

export function AniversariantesCard({
  aniversariantes,
}: {
  aniversariantes: { estudanteId: string; nome: string; dataNascimento: Date; diasRestantes: number }[];
}) {
  if (aniversariantes.length === 0) return null;

  return (
    <div className="bg-yellow/10 border border-yellow/40 rounded-[18px] p-5 mb-4">
      <h3 className="font-extrabold text-[15px] mb-3">🎂 Aniversariantes da semana</h3>
      <div className="flex flex-col gap-2">
        {aniversariantes.map((a) => (
          <div key={a.estudanteId} className="flex items-center justify-between text-sm">
            <span className="font-bold">{a.nome}</span>
            <span className="text-xs font-semibold text-ink-soft">
              {a.dataNascimento.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} ·{" "}
              {formatarDias(a.diasRestantes)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
