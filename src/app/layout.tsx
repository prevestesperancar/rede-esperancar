import type { Metadata } from "next";
import { Archivo_Black, Public_Sans, Space_Mono } from "next/font/google";
import "./globals.css";

const archivoBlack = Archivo_Black({
  weight: "400",
  variable: "--font-display",
  subsets: ["latin"],
});

const publicSans = Public_Sans({
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rede Esperançar",
  description: "Uma rede de pré-vestibulares sociais e gratuitos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${archivoBlack.variable} ${publicSans.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-body bg-paper text-ink">
        {children}
      </body>
    </html>
  );
}
