import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUsuariosDoNucleo, getNucleoNome } from "@/lib/queries/gestao";
import { NovoUsuarioNucleoForm } from "@/components/gestao/NovoUsuarioNucleoForm";
import { EditarAcessoNucleoForm } from "@/components/gestao/EditarAcessoNucleoForm";
import { EditarEmailEstudanteForm } from "@/components/gestao/EditarEmailEstudanteForm";

const ROLE_LABEL: Record<string, string> = {
  ESTUDANTE: "Aluno(a)",
  PROFESSOR: "Professor(a)",
  APOIO_PSICOSSOCIAL: "Apoio psicossocial",
  COORDENACAO: "Coordenação",
};

export default async function GestaoUsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ busca?: string; role?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.nucleoId) redirect("/login");
  if (session.user.role !== "COORDENACAO") redirect("/gestao");

  const { busca, role } = await searchParams;

  const [todosUsuarios, nucleoNome] = await Promise.all([
    getUsuariosDoNucleo(session.user.nucleoId),
    getNucleoNome(session.user.nucleoId),
  ]);

  const usuarios = todosUsuarios.filter((u) => {
    if (role && u.role !== role) return false;
    if (busca) {
      const alvo = `${u.nome} ${u.email}`.toLowerCase();
      if (!alvo.includes(busca.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div>
      <div className="font-mono text-xs font-bold text-terracotta uppercase tracking-wide mb-1.5">
        {nucleoNome}
      </div>
      <h1 className="font-display text-2xl mb-6">Usuários do núcleo</h1>

      <NovoUsuarioNucleoForm />

      <form className="flex flex-wrap gap-2.5 mb-5">
        <input
          name="busca"
          defaultValue={busca}
          placeholder="Buscar por nome ou e-mail..."
          className="flex-1 min-w-[200px] rounded-full border border-border-strong px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
        <select
          name="role"
          defaultValue={role ?? ""}
          className="rounded-full border border-border-strong px-4 py-2.5 text-sm outline-none focus:border-ink bg-surface"
        >
          <option value="">Todos os papéis</option>
          {Object.entries(ROLE_LABEL).map(([valor, label]) => (
            <option key={valor} value={valor}>
              {label}
            </option>
          ))}
        </select>
        <button type="submit" className="font-extrabold text-sm px-5 py-2.5 rounded-full bg-yellow text-yellow-ink">
          Filtrar
        </button>
      </form>

      <div className="text-xs text-ink-faint font-mono mb-3">{usuarios.length} usuário(s)</div>

      <div className="flex flex-col gap-3">
        {usuarios.map((u) => (
          <div key={u.id} className="bg-surface border border-border rounded-[18px] p-4">
            <div className="mb-2.5">
              <div className="font-bold text-sm">{u.nome}</div>
              <div className="text-xs text-ink-faint">
                {u.email} · {ROLE_LABEL[u.role] ?? u.role}
              </div>
            </div>
            {u.role === "ESTUDANTE" ? (
              u.estudante ? (
                <div className="flex items-center gap-3 flex-wrap">
                  <EditarEmailEstudanteForm estudanteId={u.estudante.id} email={u.email} />
                  {u.estudante.matriculas[0] && (
                    <Link
                      href={`/gestao/estudantes/${u.estudante.matriculas[0].id}`}
                      className="text-xs font-bold text-terracotta"
                    >
                      Ver ficha completa →
                    </Link>
                  )}
                </div>
              ) : null
            ) : u.role === "PROFESSOR" || u.role === "APOIO_PSICOSSOCIAL" ? (
              <EditarAcessoNucleoForm userId={u.id} email={u.email} role={u.role} />
            ) : (
              <p className="text-xs text-ink-faint">Papel gerenciado pelo admin da rede.</p>
            )}
          </div>
        ))}
        {usuarios.length === 0 && (
          <p className="text-sm text-ink-faint">Nenhum usuário encontrado.</p>
        )}
      </div>
    </div>
  );
}
