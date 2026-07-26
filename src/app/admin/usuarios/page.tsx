import { getUsuariosAdmin, getNucleosAdmin } from "@/lib/queries/admin";
import { EditarAcessoForm } from "@/components/admin/EditarAcessoForm";

const ROLE_LABEL: Record<string, string> = {
  PROFESSOR: "Professor(a)",
  COORDENACAO: "Coordenação",
  APOIO_PSICOSSOCIAL: "Apoio psicossocial",
  ADMIN: "Admin",
};

export default async function AdminUsuariosPage() {
  const [usuarios, nucleos] = await Promise.all([getUsuariosAdmin(), getNucleosAdmin()]);

  return (
    <div>
      <h1 className="font-display text-2xl mb-1">Usuários</h1>
      <p className="text-sm text-ink-soft mb-7">
        Gerencie o papel, o núcleo e a senha de professores, coordenadores, apoio psicossocial e admins.
      </p>

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
            <EditarAcessoForm
              userId={u.id}
              email={u.email}
              role={u.role}
              nucleoId={u.nucleoId}
              nucleos={nucleos.map((n) => ({ id: n.id, nome: n.nome }))}
            />
          </div>
        ))}
        {usuarios.length === 0 && (
          <p className="text-sm text-ink-faint">Nenhum usuário encontrado.</p>
        )}
      </div>
    </div>
  );
}
