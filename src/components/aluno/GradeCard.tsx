"use client";

import { useState } from "react";

type Item = {
  id: string;
  horaInicio: string;
  disciplina: string;
  professor: string;
  dia: string;
};

const CORES = ["bg-teal", "bg-terracotta", "bg-[#8B6FD8]"];

export function GradeCard({
  turmaNome,
  dias,
  itensPorDia,
}: {
  turmaNome: string;
  dias: string[];
  itensPorDia: Record<string, Item[]>;
}) {
  const [diaAtivo, setDiaAtivo] = useState(dias[0]);
  const itens = itensPorDia[diaAtivo] ?? [];

  return (
    <div className="bg-yellow text-yellow-ink rounded-[18px] p-[18px] mb-4">
      <div className="font-mono text-[11px] font-bold uppercase tracking-wide opacity-65">
        Minha grade
      </div>
      <div className="font-extrabold text-[17px] mt-1.5">{turmaNome}</div>

      {dias.length > 1 && (
        <div className="flex gap-1.5 mt-3.5 bg-black/10 p-1 rounded-full">
          {dias.map((dia) => (
            <button
              key={dia}
              onClick={() => setDiaAtivo(dia)}
              className={`flex-1 font-mono text-[11px] font-bold uppercase tracking-wide py-2 rounded-full transition-colors ${
                dia === diaAtivo
                  ? "bg-yellow-ink text-yellow"
                  : "opacity-60"
              }`}
            >
              {dia}
            </button>
          ))}
        </div>
      )}

      <div className="mt-3.5 flex flex-col">
        {itens.map((item, i) => (
          <div
            key={item.id}
            className="flex items-start gap-3 py-2.5 border-b border-black/10 last:border-b-0"
          >
            <div className="font-mono text-[11px] font-bold opacity-55 w-11 flex-shrink-0 pt-0.5">
              {item.horaInicio}
            </div>
            <div
              className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                CORES[i % CORES.length]
              }`}
            />
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-[13.5px]">
                {item.disciplina}
              </div>
              <div className="text-xs opacity-65 mt-px">{item.professor}</div>
            </div>
          </div>
        ))}
        {itens.length === 0 && (
          <p className="text-sm opacity-70 py-2">Nenhuma aula cadastrada.</p>
        )}
      </div>
    </div>
  );
}
