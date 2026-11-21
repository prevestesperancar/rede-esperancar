// Layouts das artes de redes sociais, no padrão visual do Esperançar:
// vermelho da marca, creme, amarelo e preto, com textura de pontos.
export const CORES = {
  vermelho: "#D42A0B",
  amarelo: "#F9C515",
  ink: "#0F1B21",
  creme: "#FCEBD0",
};

export type Estilo = "cartaz" | "foto";

export type DadosArte = {
  largura: number;
  altura: number;
  estilo: Estilo;
  titulo: string;
  subtitulo: string;
  data: string;
  nomeNucleo: string;
  logo: string | null;
  foto: string | null;
};

const TEXTURA_PONTOS = {
  backgroundImage: "radial-gradient(rgba(15,27,33,0.16) 2px, transparent 2.5px)",
  backgroundSize: "28px 28px",
} as const;

export function ArteCartaz(d: DadosArte) {
  const story = d.altura > d.largura;
  const pad = story ? 96 : 68;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: CORES.vermelho,
        padding: `${pad}px`,
        ...TEXTURA_PONTOS,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", height: story ? 150 : 110, flexShrink: 0 }}>
        {d.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={d.logo} style={{ height: "100%", objectFit: "contain", objectPosition: "left center" }} />
        ) : (
          <div style={{ display: "flex", fontSize: 44, fontWeight: 800, color: CORES.creme }}>{d.nomeNucleo}</div>
        )}
      </div>

      {d.data ? (
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            marginTop: story ? 56 : 36,
            background: CORES.amarelo,
            color: CORES.ink,
            border: `6px solid ${CORES.ink}`,
            borderRadius: 999,
            padding: story ? "20px 48px" : "12px 32px",
            fontSize: story ? 48 : 34,
            fontWeight: 800,
          }}
        >
          {d.data}
        </div>
      ) : null}

      <div style={{ display: "flex", flexDirection: "column", marginTop: story ? 56 : 34, flexShrink: 0 }}>
        <div
          style={{
            display: "flex",
            fontSize: story ? 130 : 96,
            fontWeight: 900,
            color: CORES.creme,
            lineHeight: 0.98,
            letterSpacing: -2,
          }}
        >
          {d.titulo}
        </div>
        {d.subtitulo ? (
          <div
            style={{
              display: "flex",
              marginTop: story ? 30 : 20,
              fontSize: story ? 52 : 36,
              fontWeight: 700,
              color: CORES.amarelo,
              lineHeight: 1.25,
            }}
          >
            {d.subtitulo}
          </div>
        ) : null}
      </div>

      <div style={{ display: "flex", flex: 1, minHeight: 0, alignItems: "center", justifyContent: "center", marginTop: story ? 60 : 36 }}>
        {d.foto ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              background: CORES.creme,
              padding: story ? 26 : 12,
              paddingBottom: story ? 26 : 12,
              borderRadius: 14,
              border: `6px solid ${CORES.ink}`,
              transform: "rotate(-2deg)",
              width: story ? 820 : 520,
              height: story ? 760 : 290,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={d.foto} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }} />
          </div>
        ) : null}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, background: CORES.amarelo, border: `6px solid ${CORES.ink}`, borderRadius: 22, padding: story ? "26px 36px" : "16px 28px" }}>
        <div style={{ display: "flex", fontSize: story ? 40 : 28, fontWeight: 800, color: CORES.ink }}>{d.nomeNucleo}</div>
        <div style={{ display: "flex", fontSize: story ? 36 : 24, fontWeight: 700, color: CORES.ink }}>Rede Esperançar</div>
      </div>
    </div>
  );
}

export function ArteFoto(d: DadosArte) {
  const story = d.altura > d.largura;
  const pad = story ? 96 : 68;
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: CORES.ink }}>
      {d.foto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={d.foto} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      ) : null}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundImage: `linear-gradient(to bottom, rgba(15,27,33,0.0) 25%, rgba(15,27,33,0.92) 75%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: `${pad}px`,
        }}
      >
        {d.logo ? (
          <div style={{ display: "flex", position: "absolute", top: pad, left: pad, height: story ? 130 : 96 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={d.logo} style={{ height: "100%", objectFit: "contain" }} />
          </div>
        ) : null}
        <div style={{ display: "flex", fontSize: story ? 110 : 80, fontWeight: 900, color: CORES.creme, lineHeight: 1, letterSpacing: -2 }}>
          {d.titulo}
        </div>
        {d.subtitulo ? (
          <div style={{ display: "flex", marginTop: 20, fontSize: story ? 48 : 34, fontWeight: 700, color: CORES.amarelo, lineHeight: 1.25 }}>
            {d.subtitulo}
          </div>
        ) : null}
        {d.data ? (
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              marginTop: story ? 48 : 32,
              background: CORES.amarelo,
              color: CORES.ink,
              borderRadius: 999,
              padding: story ? "20px 48px" : "12px 30px",
              fontSize: story ? 46 : 32,
              fontWeight: 800,
            }}
          >
            {d.data}
          </div>
        ) : null}
      </div>
    </div>
  );
}
