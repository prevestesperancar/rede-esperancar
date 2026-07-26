import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/components/site/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-paper">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2.5 justify-center mb-8">
          <Image
            src="/images/logo-icon.png"
            alt="Rede Esperançar"
            width={36}
            height={36}
            className="w-9 h-9"
          />
          <span className="font-display text-lg tracking-tight">
            Rede Esperançar
          </span>
        </Link>
        <div className="bg-surface border border-border rounded-[18px] p-7 shadow-sm">
          <h1 className="font-display text-xl mb-1">Bora esperançar?</h1>
          <p className="text-sm text-ink-soft mb-6">
            Entre com seu e-mail e senha para acessar o portal.
          </p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
