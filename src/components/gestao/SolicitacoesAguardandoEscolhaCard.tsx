type Solicitacao = {
  id: string;
  estudante: { user: { nome: string } };
};

export function SolicitacoesAguardandoEscolhaCard({
  titulo,
  solicitacoes,
}: {
  titulo: string;
  solicitacoes: Solicitacao[];
}) {
  if (solicitacoes.length === 0) return null;

  return (
    <div className="bg-surface border border-border rounded-[18px] p-5 mb-4">
      <h3 className="font-extrabold text-[15px] mb-3">{titulo}</h3>
      <div className="flex flex-col gap-2">
        {solicitacoes.map((s) => (
          <div key={s.id} className="flex items-center justify-between bg-paper rounded-xl px-3.5 py-2.5">
            <div className="font-bold text-sm">{s.estudante.user.nome}</div>
            <span className="text-[11px] font-bold uppercase text-yellow-ink bg-yellow/20 px-2.5 py-1 rounded-full">
              Aguardando escolha do estudante
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
