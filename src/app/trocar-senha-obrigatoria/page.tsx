import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { TrocarSenhaObrigatoriaForm } from "@/components/common/TrocarSenhaObrigatoriaForm";

export default async function TrocarSenhaObrigatoriaPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!session.user.precisaTrocarSenha) redirect("/");

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-paper">
      <div className="max-w-sm w-full bg-surface border border-border rounded-[18px] p-6">
        <h1 className="font-display text-xl mb-1">Troque sua senha</h1>
        <p className="text-sm text-ink-soft mb-5">
          Sua conta foi criada com uma senha padrão — defina uma senha só sua antes de continuar.
        </p>
        <TrocarSenhaObrigatoriaForm />
      </div>
    </div>
  );
}
