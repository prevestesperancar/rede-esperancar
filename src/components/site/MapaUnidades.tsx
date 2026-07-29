"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";

const icone = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
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

export function MapaUnidades({ nucleos }: { nucleos: Nucleo[] }) {
  const centro: [number, number] =
    nucleos.length > 0
      ? [nucleos[0].latitude, nucleos[0].longitude]
      : [-22.9068, -43.1729];

  return (
    <MapContainer
      center={centro}
      zoom={nucleos.length > 1 ? 10 : 13}
      scrollWheelZoom={false}
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {nucleos.map((n) => (
        <Marker key={n.id} position={[n.latitude, n.longitude]} icon={icone}>
          <Popup>
            <div className="text-sm">
              <b>{n.nome}</b>
              <br />
              {n.bairro} · {n.cidade}
              <br />
              <Link href={`/nucleos/${n.slug}`} className="text-terracotta font-bold">
                Ver este pré-vestibular →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
