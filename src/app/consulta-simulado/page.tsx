import { ConsultaSimuladoForm } from "@/components/site/ConsultaSimuladoForm";

const URL_PAGINA = "https://rede-esperancar.vercel.app/consulta-simulado";
const DESCRICAO =
  "Digite seu nome completo e data de nascimento pra ver sua nota do simulado da Rede Esperançar.";

export const metadata = {
  title: "Consulta de nota — Simulado",
  description: DESCRICAO,
  robots: { index: false, follow: false },
  openGraph: {
    title: "Consulta de nota — Simulado | Rede Esperançar",
    description: DESCRICAO,
    url: URL_PAGINA,
    siteName: "Rede Esperançar",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Consulta de nota — Simulado | Rede Esperançar",
    description: DESCRICAO,
  },
};

export default function ConsultaSimuladoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-paper py-14">
      <div className="max-w-sm w-full">
        <h1 className="font-display text-xl mb-1">Consulta de nota do simulado</h1>
        <p className="text-sm text-ink-soft mb-6">
          Digite seu nome completo e data de nascimento pra ver sua nota.
        </p>
        <ConsultaSimuladoForm />
      </div>
    </div>
  );
}
