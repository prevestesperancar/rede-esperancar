import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Rede Esperançar — Consulta de nota do simulado";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#14161f",
          position: "relative",
        }}
      >
        {/* estrela decorativa */}
        <div
          style={{
            position: "absolute",
            top: 64,
            left: 80,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              backgroundColor: "#e1512e",
              transform: "rotate(45deg)",
              borderRadius: 4,
            }}
          />
          <div
            style={{
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "#e1512e",
            }}
          >
            Simulado
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "#f6f7f2",
              lineHeight: 1.05,
              display: "flex",
            }}
          >
            Rede Esperançar
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: 18,
            }}
          >
            <div
              style={{
                fontSize: 40,
                fontWeight: 700,
                color: "#14161f",
                backgroundColor: "#f19700",
                padding: "10px 26px",
                borderRadius: 999,
                display: "flex",
              }}
            >
              Consulta de nota do simulado
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 56,
            fontSize: 26,
            color: "#abafc0",
          }}
        >
          Digite nome completo e data de nascimento pra ver sua nota
        </div>
      </div>
    ),
    { ...size }
  );
}
