import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border mt-10 py-10">
      <div className="max-w-[1180px] mx-auto px-6 flex flex-wrap items-center justify-between gap-4">
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
        <div className="flex gap-5 text-sm font-semibold text-ink-soft">
          <Link href="/quem-somos">Quem somos nós?</Link>
          <Link href="/nucleos">Prés</Link>
          <Link href="/materiais">Materiais</Link>
          <Link href="/contato">Contato</Link>
          <a
            href="https://www.instagram.com/redeesperancar/?hl=pt"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>
        </div>
        <div className="text-xs text-ink-faint font-mono">
          © {new Date().getFullYear()} REDE ESPERANÇAR
        </div>
      </div>
    </footer>
  );
}
