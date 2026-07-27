import Image from "next/image";
import Link from "next/link";
import { logout } from "@/actions/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper">
      <header className="flex items-center justify-between px-8 py-5 border-b border-border">
        <Link href="/admin" className="flex items-center gap-2.5">
          <Image src="/images/logo-icon.png" alt="Rede Esperançar" width={28} height={28} className="w-7 h-7" />
          <span className="font-display text-base">Rede Esperançar — Admin</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm font-bold text-ink-soft">
          <Link href="/admin" className="hover:text-ink">
            Núcleos
          </Link>
          <Link href="/admin/conteudo" className="hover:text-ink">
            Conteúdo do site
          </Link>
          <Link href="/admin/usuarios" className="hover:text-ink">
            Usuários
          </Link>
          <Link href="/admin/questoes" className="hover:text-ink">
            Banco de questões
          </Link>
          <form action={logout}>
            <button type="submit" className="hover:text-ink">
              Sair
            </button>
          </form>
        </nav>
      </header>
      <main className="p-8">{children}</main>
    </div>
  );
}
