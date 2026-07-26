import Image from "next/image";
import Link from "next/link";
import { Star } from "@/components/ui/Star";

export default function InscricaoRecebidaPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-paper text-center">
      <div className="max-w-sm">
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
        <div className="bg-surface border border-border rounded-[18px] p-8">
          <Star className="w-8 h-8 mx-auto mb-4" />
          <h1 className="font-display text-xl mb-2">
            Inscrição recebida!
          </h1>
          <p className="text-sm text-ink-soft">
            A coordenação do núcleo vai analisar sua inscrição. Assim que for
            aprovada, você já pode entrar no portal com o e-mail e a senha que
            você criou.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 font-extrabold text-sm px-6 py-3.5 rounded-full bg-yellow text-yellow-ink mt-6"
          >
            Ir para o login →
          </Link>
        </div>
      </div>
    </div>
  );
}
