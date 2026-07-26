import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getProfessorDetalhe } from "@/lib/queries/gestao";
import { EditarProfessorForm } from "@/components/gestao/EditarProfessorForm";
import { ApagarProfessorButton } from "@/components/gestao/ApagarProfessorButton";

export default async function ProfessorDetalhePage({
  params,
}: {
  params: Promise<{ professorId: string }>;
}) {
  const { professorId } = await params;
  const session = await auth();
  if (!session?.user?.nucleoId) redirect("/login");

  const professor = await getProfessorDetalhe(professorId, session.user.nucleoId);
  if (!professor) notFound();

  const initials = professor.nome.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();

  return (
    <div className="max-w-2xl">
      <Link href="/gestao/professores" className="text-sm font-bold text-ink-soft hover:text-ink">
        ← Professores
      </Link>

      <div className="flex items-center gap-3.5 mt-3 mb-7">
        <div className="w-14 h-14 rounded-full bg-ink text-paper flex items-center justify-center font-display text-base flex-shrink-0 overflow-hidden">
          {professor.fotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={professor.fotoUrl} alt={professor.nome} className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <div>
          <h1 className="font-display text-xl">{professor.nome}</h1>
          <p className="text-sm text-ink-soft">
            {[...new Set(professor.disciplinasQueLeciona.map((d) => d.disciplina.nome))].join(", ") ||
              "Sem disciplina na grade"}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <EditarProfessorForm
          professorId={professor.id}
          nome={professor.nome}
          email={professor.email}
          telefone={professor.telefone}
          materia={professor.materia}
        />
      </div>

      <ApagarProfessorButton professorId={professor.id} />
    </div>
  );
}
