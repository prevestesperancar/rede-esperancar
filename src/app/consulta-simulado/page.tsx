import { ConsultaSimuladoForm } from "@/components/site/ConsultaSimuladoForm";

export const metadata = {
  title: "Consulta de nota — Simulado",
  robots: { index: false, follow: false },
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
