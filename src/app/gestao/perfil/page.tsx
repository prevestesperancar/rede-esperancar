import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logout } from "@/actions/auth";
import { EditarPerfilForm } from "@/components/common/EditarPerfilForm";
import { AlterarSenhaForm } from "@/components/common/AlterarSenhaForm";
import { CapaNucleoForm } from "@/components/gestao/CapaNucleoForm";
import { InstagramNucleoForm } from "@/components/gestao/InstagramNucleoForm";
import { GoogleSheetsNucleoForm } from "@/components/gestao/GoogleSheetsNucleoForm";

export default async function GestaoPerfilPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  const nucleo = user.nucleoId
    ? await prisma.nucleo.findUnique({ where: { id: user.nucleoId } })
    : null;

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl mb-1">Meu perfil</h1>
      <p className="text-sm text-ink-soft mb-7">
        {user.email} · {user.role === "COORDENACAO" ? "Coordenação" : user.role}
      </p>

      <div className="bg-surface border border-border rounded-[18px] p-5 mb-4">
        <div className="font-extrabold text-sm mb-3">Editar dados</div>
        <EditarPerfilForm
          nome={user.nome}
          telefone={user.telefone}
          email={user.email}
          fotoUrl={user.fotoUrl}
        />
      </div>

      <div className="bg-surface border border-border rounded-[18px] p-5 mb-6">
        <div className="font-extrabold text-sm mb-3">Alterar senha</div>
        <AlterarSenhaForm />
      </div>

      {nucleo && (user.role === "COORDENACAO" || user.role === "ADMIN") && (
        <>
          <div className="bg-surface border border-border rounded-[18px] p-5 mb-4">
            <div className="font-extrabold text-sm mb-3">Foto de capa do núcleo</div>
            <CapaNucleoForm fotoUrl={nucleo.fotoUrl} />
          </div>

          <div className="bg-surface border border-border rounded-[18px] p-5 mb-4">
            <div className="font-extrabold text-sm mb-3">Instagram do núcleo</div>
            <InstagramNucleoForm instagram={nucleo.instagram} />
          </div>

          <div className="bg-surface border border-border rounded-[18px] p-5 mb-6">
            <div className="font-extrabold text-sm mb-3">Planilha do Google Sheets</div>
            <p className="text-xs text-ink-faint mb-3">
              Cole aqui o link da planilha com os estudantes já inscritos deste núcleo. Para
              importar os alunos automaticamente em "Estudantes", publique a planilha como CSV
              (no Google Sheets: Arquivo → Compartilhar → Publicar na Web → formato CSV) e cole
              esse link — não o link normal de compartilhamento.
            </p>
            <GoogleSheetsNucleoForm googleSheetsUrl={nucleo.googleSheetsUrl} />
          </div>
        </>
      )}

      <form action={logout}>
        <button
          type="submit"
          className="font-bold text-sm px-5 py-2.5 rounded-full border border-border-strong text-ink-soft"
        >
          Sair
        </button>
      </form>
    </div>
  );
}
