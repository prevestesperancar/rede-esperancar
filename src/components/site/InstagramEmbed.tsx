"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

// Widget oficial do Instagram — carrega o post de verdade (foto + legenda) no
// navegador de quem visita, sem depender de buscar nada no nosso servidor
// (o Instagram bloqueia esse tipo de busca automática vinda de servidor).
export function InstagramEmbed({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function processar() {
      window.instgrm?.Embeds.process();
    }

    const scriptExistente = document.getElementById("instagram-embed-script");
    if (scriptExistente) {
      processar();
      return;
    }

    const script = document.createElement("script");
    script.id = "instagram-embed-script";
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    script.onload = processar;
    document.body.appendChild(script);
  }, [url]);

  return (
    <div ref={containerRef}>
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={url}
        data-instgrm-version="14"
        style={{ margin: 0, width: "100%" }}
      />
    </div>
  );
}
