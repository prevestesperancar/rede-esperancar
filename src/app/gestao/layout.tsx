import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/gestao/Sidebar";

export default async function GestaoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN" && !session.user.nucleoId) redirect("/");

  const [nucleo, pendentesCount] = session.user.nucleoId
    ? await Promise.all([
        prisma.nucleo.findUnique({ where: { id: session.user.nucleoId } }),
        prisma.matricula.count({
          where: { status: "PENDENTE", turma: { nucleoId: session.user.nucleoId } },
        }),
      ])
    : [null, 0];

  if (session.user.role !== "ADMIN" && !nucleo) redirect("/");

  return (
    <div className="flex min-h-screen">
      <Sidebar
        userName={session.user.name ?? ""}
        nucleoNome={nucleo?.nome ?? "Admin"}
        pendentesCount={pendentesCount}
        role={session.user.role}
      />
      <main className="flex-1 min-w-0 p-9">{children}</main>
    </div>
  );
}
