import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { BottomNav } from "@/components/aluno/BottomNav";
import { NotificationBell } from "@/components/common/NotificationBell";
import { getNotificacoesDoUsuario, getContagemNaoLidas } from "@/lib/queries/notificacoes";

export default async function AlunoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [notificacoes, naoLidas] = await Promise.all([
    getNotificacoesDoUsuario(session.user.id),
    getContagemNaoLidas(session.user.id),
  ]);

  return (
    <div className="min-h-screen bg-paper pb-24">
      <div className="max-w-md mx-auto px-5 pt-8">
        <div className="flex justify-end mb-2">
          <NotificationBell notificacoes={notificacoes} naoLidas={naoLidas} />
        </div>
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
