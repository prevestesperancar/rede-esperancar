"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { apagarProfessor } from "@/actions/gestao";

export function ApagarProfessorButton({ professorId }: { professorId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Excluir este professor? Isso também remove suas aulas da grade.")) return;
        startTransition(async () => {
          await apagarProfessor(professorId);
          router.push("/gestao/professores");
        });
      }}
      className="font-bold text-sm px-5 py-2.5 rounded-full border border-terracotta/40 text-terracotta disabled:opacity-60"
    >
      {pending ? "Excluindo…" : "Excluir professor"}
    </button>
  );
}
