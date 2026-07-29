import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getEstudanteByUserId } from "@/lib/queries/aluno";
import { getApoioDoNucleo } from "@/lib/queries/agendamento";
import { SolicitarApoioForm } from "@/components/aluno/SolicitarApoioForm";

export default async function AlunoApoioPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const estudante = await getEstudanteByUserId(session.user.id);
  if (!estudante) redirect("/login");

  const apoios = session.user.nucleoId ? await getApoioDoNucleo(session.user.nucleoId) : [];

  return (
    <div>
      <h1 className="font-display text-2xl mb-1">Apoio psicossocial</h1>
      <p className="text-sm font-semibold text-ink-soft mb-6">
        Um espaço para conversar sobre o que estiver pesando
      </p>

      <div className="bg-surface border border-border rounded-2xl p-4 mb-5">
        <div className="font-mono text-[11px] font-bold uppercase text-ink-faint mb-2">Contato</div>
        {apoios.length === 0 && (
          <p className="text-sm text-ink-faint">Nenhum contato de apoio cadastrado ainda.</p>
        )}
        {apoios.map((a) => (
          <div key={a.id} className="text-sm mb-1">
            <span className="font-bold">{a.nome}</span>
            {a.telefone && <span className="text-ink-soft"> · {a.telefone}</span>}
          </div>
        ))}
      </div>

      <SolicitarApoioForm />

      <Link
        href="/aluno/reunioes"
        className="block mt-5 text-sm font-bold text-terracotta"
      >
        Ver minhas solicitações e reuniões marcadas →
      </Link>
    </div>
  );
}
