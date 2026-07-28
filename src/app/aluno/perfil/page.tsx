import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getEstudanteByUserId, getTurmaAtivaDoEstudante } from "@/lib/queries/aluno";
import { logout } from "@/actions/auth";
import { EditarPerfilForm } from "@/components/common/EditarPerfilForm";
import { AlterarSenhaForm } from "@/components/common/AlterarSenhaForm";

export default async function AlunoPerfilPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const estudante = await getEstudanteByUserId(session.user.id);
  if (!estudante) redirect("/login");

  const turma = await getTurmaAtivaDoEstudante(estudante.id);
  const primeiroNome = estudante.user.nome.split(" ")[0];

  return (
    <div>
      <div className="flex items-center gap-3.5 mb-7">
        <div className="w-14 h-14 rounded-full bg-terracotta text-white flex items-center justify-center font-display text-lg flex-shrink-0 overflow-hidden">
          {estudante.user.fotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={estudante.user.fotoUrl}
              alt={estudante.user.nome}
              className="w-full h-full object-cover"
            />
          ) : (
            primeiroNome[0]
          )}
        </div>
        <div>
          <h1 className="font-display text-xl">Meu perfil</h1>
          <p className="text-sm text-ink-soft">{estudante.user.nome}</p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-4 mb-3.5">
        <div className="font-mono text-[11px] font-bold uppercase tracking-wide text-ink-faint mb-1">
          Núcleo
        </div>
        <div className="font-extrabold text-sm">
          {turma?.nucleo.nome ?? "Inscrição em análise"}
        </div>
        {turma && (
          <div className="text-xs text-ink-soft mt-1.5">
            {turma.nome} · {turma.periodo}
          </div>
        )}
      </div>

      <div className="bg-surface border border-border rounded-2xl p-4 mb-6">
        <div className="font-mono text-[11px] font-bold uppercase tracking-wide text-ink-faint mb-1">
          Contato
        </div>
        <div className="text-sm">{estudante.user.email}</div>
        {estudante.user.telefone && (
          <div className="text-sm mt-1">{estudante.user.telefone}</div>
        )}
      </div>

      <div className="bg-surface border border-border rounded-2xl p-4 mb-3.5">
        <div className="font-mono text-[11px] font-bold uppercase tracking-wide text-ink-faint mb-2.5">
          Editar dados
        </div>
        <EditarPerfilForm
          nome={estudante.user.nome}
          telefone={estudante.user.telefone}
          email={estudante.user.email}
          fotoUrl={estudante.user.fotoUrl}
        />
      </div>

      <Link
        href="/aluno/carteirinha"
        className="block bg-yellow text-yellow-ink font-extrabold text-sm text-center py-3.5 rounded-full mb-3.5"
      >
        Ver minha carteirinha de estudante →
      </Link>

      <Link
        href="/aluno/apoio"
        className="block bg-teal text-white font-extrabold text-sm text-center py-3.5 rounded-full mb-6"
      >
        Falar com o apoio psicossocial →
      </Link>

      <div className="bg-surface border border-border rounded-2xl p-4 mb-6">
        <div className="font-mono text-[11px] font-bold uppercase tracking-wide text-ink-faint mb-2.5">
          Alterar senha
        </div>
        <AlterarSenhaForm />
      </div>

      <form action={logout}>
        <button
          type="submit"
          className="w-full font-bold text-sm py-3 rounded-full border border-border-strong text-ink-soft"
        >
          Sair
        </button>
      </form>
    </div>
  );
}
