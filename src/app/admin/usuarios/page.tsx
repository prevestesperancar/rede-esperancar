import Link from "next/link";
import { getUsuariosAdmin, getNucleosAdmin } from "@/lib/queries/admin";
import { EditarAcessoForm } from "@/components/admin/EditarAcessoForm";
import { NovoUsuarioForm } from "@/components/admin/NovoUsuarioForm";

const ROLE_LABEL: Record<string, string> = {
  ESTUDANTE: "Aluno(a)",
  PROFESSOR: "Professor(a)",
  COORDENACAO: "Coordenação",
  APOIO_PSICOSSOCIAL: "Apoio psicossocial",
  ADMIN: "Admin",
};

const ROLE_OPTIONS = [
  { value: "", label: "Todos os papéis" },
  { value: "ESTUDANTE", label: "Aluno(a)" },
  { value: "PROFESSOR", label: "Professor(a)" },
  { value: "COORDENACAO", label: "Coordenação" },
  { value: "APOIO_PSICOSSOCIAL", label: "Apoio psicossocial" },
  { value: "ADMIN", label: "Admin" },
];

export default async function AdminUsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; nucleoId?: string }>;
}) {
  const { role, nucleoId } = await searchParams;

  const [usuarios, nucleos] = await Promise.all([
    getUsuariosAdmin({ role, nucleoId }),
    getNucleosAdmin(),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl mb-1">Usuários</h1>
      <p className="text-sm text-ink-soft mb-7">
        Gerencie o papel, o núcleo e a senha de professores, coordenadores, apoio psicossocial, admins e alunos.
      </p>

      <NovoUsuarioForm nucleos={nucleos.map((n) => ({ id: n.id, nome: n.nome }))} />

      <form
        method="get"
        className="bg-surface border border-border rounded-2xl p-4 mb-4 flex flex-wrap gap-3 items-center"
      >
        <select
          name="role"
          defaultValue={role ?? ""}
          className="rounded-lg border border-border-strong px-3 py-2 text-sm outline-none focus:border-ink bg-surface"
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        <select
          name="nucleoId"
          defaultValue={nucleoId ?? ""}
          className="rounded-lg border border-border-strong px-3 py-2 text-sm outline-none focus:border-ink bg-surface"
        >
          <option value="">Todos os núcleos</option>
          {nucleos.map((n) => (
            <option key={n.id} value={n.id}>
              {n.nome}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="text-sm font-bold px-4 py-2 rounded-full bg-yellow text-yellow-ink"
        >
          Filtrar
        </button>
        {(role || nucleoId) && (
          <a href="/admin/usuarios" className="text-xs font-bold text-ink-faint">
            Limpar filtros
          </a>
        )}
      </form>

      <div className="flex flex-col gap-3">
        {usuarios.map((u) => (
          <div key={u.id} className="bg-surface border border-border rounded-[18px] p-4">
            <div className="flex items-center justify-between mb-2.5 gap-3 flex-wrap">
              <div>
                <div className="font-bold text-sm">{u.nome}</div>
                <div className="text-xs text-ink-faint">
                  {u.email} · {ROLE_LABEL[u.role] ?? u.role}
                  {u.nucleo ? ` · ${u.nucleo.nome}` : ""}
                </div>
              </div>
            </div>
            {u.role === "ESTUDANTE" ? (
              u.estudante?.matriculas[0] ? (
                <Link
                  href={`/gestao/estudantes/${u.estudante.matriculas[0].id}`}
                  className="text-xs font-bold text-terracotta"
                >
                  Ver e editar dados do aluno →
                </Link>
              ) : (
                <p className="text-xs text-ink-faint">Esse aluno ainda não tem matrícula em nenhuma turma.</p>
              )
            ) : (
              <EditarAcessoForm
                userId={u.id}
                email={u.email}
                role={u.role}
                nucleoId={u.nucleoId}
                nucleos={nucleos.map((n) => ({ id: n.id, nome: n.nome }))}
              />
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
