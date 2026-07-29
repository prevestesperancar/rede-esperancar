import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/gestao/Sidebar";
import { getNotificacoesDoUsuario, getContagemNaoLidas } from "@/lib/queries/notificacoes";
import { getContagemApoioPendentes } from "@/lib/queries/agendamento";

export default async function GestaoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN" && !session.user.nucleoId) redirect("/");

  const [nucleo, pendentesCount, usuario] = session.user.nucleoId
    ? await Promise.all([
        prisma.nucleo.findUnique({ where: { id: session.user.nucleoId } }),
        prisma.matricula.count({
          where: { status: "PENDENTE", turma: { nucleoId: session.user.nucleoId } },
        }),
        prisma.user.findUnique({ where: { id: session.user.id }, select: { fotoUrl: true } }),
      ])
    : [null, 0, await prisma.user.findUnique({ where: { id: session.user.id }, select: { fotoUrl: true } })];

  if (session.user.role !== "ADMIN" && !nucleo) redirect("/");

  const [notificacoes, naoLidas, solicitacoesPendentesCount] = await Promise.all([
    getNotificacoesDoUsuario(session.user.id),
    getContagemNaoLidas(session.user.id),
    session.user.role === "APOIO_PSICOSSOCIAL" && session.user.nucleoId
      ? getContagemApoioPendentes(session.user.nucleoId)
      : Promise.resolve(0),
  ]);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        userName={session.user.name ?? ""}
        nucleoNome={nucleo?.nome ?? "Admin"}
        pendentesCount={pendentesCount}
        solicitacoesPendentesCount={solicitacoesPendentesCount}
        role={session.user.role}
        fotoUrl={usuario?.fotoUrl ?? null}
        notificacoes={notificacoes}
        naoLidas={naoLidas}
      />
      <main className="flex-1 min-w-0 p-9">{children}</main>
    </div>
  );
}
