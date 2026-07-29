"use client";

import dynamic from "next/dynamic";

const MapaUnidades = dynamic(() => import("@/components/site/MapaUnidades").then((m) => m.MapaUnidades), {
  ssr: false,
});

type Nucleo = {
  id: string;
  nome: string;
  slug: string;
  bairro: string;
  cidade: string;
  latitude: number;
  longitude: number;
};

export function MapaUnidadesClient({ nucleos }: { nucleos: Nucleo[] }) {
  return <MapaUnidades nucleos={nucleos} />;
}
