"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="w-full font-extrabold text-sm py-3.5 rounded-full border border-border-strong text-ink-soft"
    >
      Imprimir / salvar como PDF
    </button>
  );
}
