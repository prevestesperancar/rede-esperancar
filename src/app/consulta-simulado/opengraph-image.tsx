import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Rede Esperançar — Consulta de nota do simulado";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logoBuffer = await readFile(path.join(process.cwd(), "public", "images", "logo-icon.png"));
  const logoDataUrl = `data:image/png;base64,${logoBuffer.toString("base64")}`;

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
        {/* etiqueta decorativa */}
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
              display: "flex",
              alignItems: "center",
              gap: 24,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoDataUrl} width={80} height={69} alt="" />
            <div
              style={{
                fontSize: 64,
                fontWeight: 800,
                color: "#f6f7f2",
                lineHeight: 1.05,
                display: "flex",
              }}
            >
              Rede Esperançar
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: 24,
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
