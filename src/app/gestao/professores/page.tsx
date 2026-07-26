import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getProfessoresDoNucleo, getNucleoNome } from "@/lib/queries/gestao";
import { NovoProfessorForm } from "@/components/gestao/NovoProfessorForm";

export default async function ProfessoresPage() {
  const session = await auth();
  if (!session?.user?.nucleoId) redirect("/login");

  const [professores, nucleoNome] = await Promise.all([
    getProfessoresDoNucleo(session.user.nucleoId),
    getNucleoNome(session.user.nucleoId),
  ]);

  const initials = (nome: string) =>
    nome.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();

  return (
    <div>
      <div className="flex items-start justify-between mb-7 gap-4 flex-wrap">
        <div>
          <div className="font-mono text-xs font-bold text-terracotta uppercase tracking-wide mb-1.5">
            {nucleoNome}
          </div>
          <h1 className="font-display text-2xl">Professores</h1>
        </div>
      </div>

      <NovoProfessorForm />

      <div className="bg-surface border border-border rounded-[18px] p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          {professores.map((p) => {
            const disciplinas = [
              ...new Set(p.disciplinasQueLeciona.map((d) => d.disciplina.nome)),
            ];
            return (
              <Link
                key={p.id}
                href={`/gestao/professores/${p.id}`}
                className="text-center hover:opacity-80 transition-opacity"
              >
                <div className="w-16 h-16 rounded-full mx-auto mb-2.5 relative overflow-hidden bg-ink text-paper flex items-center justify-center font-display text-base">
                  {p.fotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.fotoUrl}
                      alt={p.nome}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    initials(p.nome)
                  )}
                </div>
                <div className="font-extrabold text-sm">{p.nome}</div>
                <div className="text-xs text-ink-soft mt-0.5">
                  {p.materia || disciplinas.join(", ") || "Sem disciplina"}
                </div>
              </Link>
            );
          })}
        </div>
        <div className="pt-4 mt-2 text-xs text-ink-faint">
          {professores.length} professor(es) voluntário(s) · clique em um professor para editar
        </div>
      </div>
    </div>
  );
}
