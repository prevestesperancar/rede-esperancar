import Image from "next/image";
import Link from "next/link";

export function Header() {
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
        <Link href="/mapa">Mapa das unidades</Link>
        <Link href="/monitoria">Monitoria</Link>
        <Link href="/cotas-e-permanencia">Cotas e permanência</Link>
        <Link href="/materiais">Materiais</Link>
        <Link href="/eventos">Eventos</Link>
        <Link href="/contato">Contato</Link>
      </nav>
      <Link
        href="/login"
        className="font-extrabold text-sm px-[22px] py-3 rounded-full border-2 bg-yellow border-yellow text-yellow-ink"
      >
        Entrar
      </Link>
    </header>
  );
}
