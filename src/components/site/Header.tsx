import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { logout } from "@/actions/auth";

function portalHref(role?: string) {
  if (role === "ESTUDANTE") return "/aluno";
  if (role === "ADMIN") return "/admin";
  return "/gestao";
}

export async function Header() {
  const session = await auth();

  return (
    <header className="flex items-center justify-between py-5 max-w-[1180px] mx-auto px-6">
      <Link href="/" className="flex items-center gap-2.5">
        <Image
          src="/images/logo-icon.png"
          alt="Rede Esperançar"
          width={32}
          height={32}
          className="w-8 h-8"
        />
        <span className="font-display text-base tracking-tight">
          Rede Esperançar
        </span>
      </Link>
      <nav className="hidden lg:flex gap-5 font-semibold text-sm text-ink-soft">
        <Link href="/quem-somos">Quem somos nós?</Link>
        <Link href="/nucleos">Prés</Link>
        <Link href="/monitoria">Monitoria</Link>
        <Link href="/cotas-e-permanencia">Cotas e permanência</Link>
        <Link href="/materiais">Materiais</Link>
        <Link href="/eventos">Eventos</Link>
        <Link href="/contato">Contato</Link>
      </nav>
      {session?.user ? (
        <div className="flex items-center gap-3">
          <Link
            href={portalHref(session.user.role)}
            className="flex items-center gap-2 font-bold text-sm text-ink"
            title={session.user.name ?? "Meu portal"}
          >
            <span className="w-9 h-9 rounded-full bg-terracotta text-white flex items-center justify-center font-display text-xs flex-shrink-0">
              {(session.user.name ?? "?")[0]?.toUpperCase()}
            </span>
            <span className="hidden sm:inline">Meu portal</span>
          </Link>
          <form action={logout}>
            <button type="submit" className="text-xs font-bold text-ink-faint hover:text-terracotta">
              Sair
            </button>
          </form>
        </div>
      ) : (
        <Link
          href="/login"
          className="font-extrabold text-sm px-[22px] py-3 rounded-full border-2 bg-yellow border-yellow text-yellow-ink"
        >
          Entrar
        </Link>
      )}
    </header>
  );
}
