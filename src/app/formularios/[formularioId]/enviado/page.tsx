import Link from "next/link";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export default function FormularioEnviadoPage() {
  return (
    <div>
      <Header />
      <section className="max-w-[480px] mx-auto px-6 py-20 text-center">
        <h1 className="font-display text-2xl mb-3">Resposta enviada!</h1>
        <p className="text-sm text-ink-soft mb-7">Obrigado por responder. 🎉</p>
        <Link href="/" className="font-extrabold text-sm text-terracotta">
          ← Voltar para a home
        </Link>
      </section>
      <Footer />
    </div>
  );
}
