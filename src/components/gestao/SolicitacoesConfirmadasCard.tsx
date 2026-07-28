type Solicitacao = {
  id: string;
  escolhaData: Date | null;
  estudante: { user: { nome: string } };
};

export function SolicitacoesConfirmadasCard({
  titulo,
  solicitacoes,
  link,
}: {
  titulo: string;
  solicitacoes: Solicitacao[];
  link: string | null;
}) {
  if (solicitacoes.length === 0) return null;

  return (
    <div className="bg-surface border border-border rounded-[18px] p-5 mb-4">
      <h3 className="font-extrabold text-[15px] mb-3">{titulo}</h3>
      <div className="flex flex-col gap-2">
        {solicitacoes.map((s) => (
          <div key={s.id} className="flex items-center justify-between bg-paper rounded-xl px-3.5 py-2.5">
            <div>
              <div className="font-bold text-sm">{s.estudante.user.nome}</div>
              {s.escolhaData && (
                <div className="text-xs text-ink-faint font-mono">
                  {s.escolhaData.toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              )}
            </div>
            {link && (
              <a href={link} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-teal">
                Link →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
