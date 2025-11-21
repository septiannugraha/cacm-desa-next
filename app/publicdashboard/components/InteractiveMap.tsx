'use client';

import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { RegionGeoJSON } from '@/types/map';

// Warna gradasi untuk grad_value 1–5
const gradColors: Record<number, string> = {
  1: '#ffffcc',
  2: '#a1dab4',
  3: '#41b6c4',
  4: '#2c7fb8',
  5: '#253494',
};

// Komponen untuk auto-fit bounds
function MapBoundsFitter({ geojson }: { geojson: RegionGeoJSON }) {
  const map = useMap();
  useEffect(() => {
    if (geojson && geojson.features.length > 0) {
      const geoJsonLayer = L.geoJSON(geojson);
      const bounds = geoJsonLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [geojson, map]);
  return null;
}

// Layer GeoJSON dengan pewarnaan grad_value + hover biru + double click
function GeoJSONLayer({
  geojson,
  map_data,
  onRegionDoubleClick,   // ✅ tambahkan prop
}: {
  geojson: RegionGeoJSON;
  map_data: any[];
  onRegionDoubleClick?: (code: string, name: string) => void;
}) {
  const map = useMap();
  const layerRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }
   // if (!geojson || !map_data) return;

    // gabungkan data map_data ke geojson
// Buat map dari data statistik: key = kode wilayah, value = objek data

//console.log(Object.keys(map_data[0]));

//console.log(map_data.map(s => s.Kode));
//console.log(geojson.features.map(f => f.properties.code));

const statsMap = new Map(map_data.map((s) => [s.Kode, s]));
 
// Loop setiap feature di geojson
geojson.features.forEach((f) => {
  const kode = f.properties.code; 
  const data = statsMap.get(kode);       // cari data berdasarkan kode
 
  

  if (!data) {
    // Kalau tidak ada match, log warning
  //  console.log(`⚠️ Tidak ada data untuk kode: ${kode}`);
  } else {
    // Kalau ada match, log detail
    console.log(`✅ Match ditemukan untuk kode: ${kode}`, data);


    // Tambahkan properti baru ke feature
    f.properties.kode = data.Kode;
    f.properties.grad_value = data.Skor;
    f.properties.nama = data.Nama;
    f.properties.anggaran = data.Anggaran != null ? parseFloat(data.Anggaran.toString()) : 0;
    f.properties.realisasi = data.Realisasi != null ? parseFloat(data.Realisasi.toString()) : 0;
  //  console.log('cek anggaran:', kode, data.anggaran, typeof data.anggaran);
  }
});


    const layer = L.geoJSON(geojson, {
      style: (feature) => {
        const grad = feature?.properties?.grad_value;
        const color = grad ? gradColors[grad] : '#ccc';
        return {
          fillColor: color,
          weight: 1,
          color: '#666',
          fillOpacity: 0.7,
        };
      },
      onEachFeature: (feature, layer) => {
        const kode = feature.properties.code;
        const nama = feature.properties.name;
        const anggaran = feature.properties.anggaran;
        const realisasi = feature.properties.realisasi;

        // Tooltip saat hover
        layer.bindTooltip(
          `<strong>${nama}</strong><br/>
           Kode: ${kode}<br/>
           Anggaran: Rp ${anggaran?.toLocaleString('id-ID') ?? '-'}<br/>
           Realisasi: Rp ${realisasi?.toLocaleString('id-ID') ?? '-'}`,
          { sticky: true }
        );

        // Hover → biru
        layer.on('mouseover', () => {
          layer.setStyle({
            fillColor: 'blue',
            weight: 2,
            color: '#000',
            fillOpacity: 0.9,
          });
        });
        layer.on('mouseout', () => {
          const grad = feature?.properties?.grad_value;
          const color = grad ? gradColors[grad] : '#ccc';
          layer.setStyle({
            fillColor: color,
            weight: 1,
            color: '#666',
            fillOpacity: 0.7,
          });
        });

        // Double click → panggil handler dari props
        layer.on('dblclick', () => {
          if (onRegionDoubleClick) {
            onRegionDoubleClick(kode, nama);
          }
        });
      },
    });

    layerRef.current = layer;
    layer.addTo(map);

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }
    };
  }, [geojson, map_data, map, onRegionDoubleClick]);

  return null;
}

// Legend menggunakan gradation_data
function MapLegend({ gradation_data }: { gradation_data: any[] }) {
  return (
    <div className="absolute bottom-2 left-2 bg-white p-3 rounded shadow text-sm">
      <strong>Legenda</strong>
      <ul className="mt-2 space-y-1">
        {gradation_data.map((item, idx) => (
          <li key={idx} className="flex items-center space-x-2">
            <span
              className="inline-block w-4 h-4 rounded"
              style={{ backgroundColor: gradColors[item.Skor] }}
            ></span>
            <span>{item.Range_Anggaran}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function InteractiveMap({
  geojson,
  map_data,
  gradation_data,
  onRegionDoubleClick,   // ✅ tambahkan prop di komponen utama
}: {
  geojson: RegionGeoJSON;
  map_data: any[];
  gradation_data: any[];
  onRegionDoubleClick?: (code: string, name: string) => void;
}) {
  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[-2.5, 118]}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <MapBoundsFitter geojson={geojson} />
        <GeoJSONLayer
          geojson={geojson}
          map_data={map_data}
          onRegionDoubleClick={onRegionDoubleClick}   // ✅ pass prop ke layer
        />
      </MapContainer>

      {/* Legend */}
      <MapLegend gradation_data={gradation_data} />
    </div>
  );
}