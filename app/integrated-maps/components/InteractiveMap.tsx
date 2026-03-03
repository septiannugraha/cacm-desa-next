'use client';

import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
 
import type { RegionGeoJSON } from '@/types/map';

const gradColors: Record<number, string> = {
  1: '#fecaca', // merah muda agak gelap (darkened light red)
  2: '#f87171', // merah terang lebih gelap (darkened medium red)
  3: '#ef4444', // merah intens
  4: '#b91c1c', // merah tua
  5: '#7f1d1d', // merah pekat / maroon
};


const gradColors2: Record<number, string> = {
  1: '#bfdbfe', // biru sangat muda (light blue)
  2: '#60a5fa', // biru sedang (medium blue)
  3: '#3b82f6', // biru intens (primary blue)
  4: '#1d4ed8', // biru tua (dark blue)
  5: '#1e3a8a', // biru pekat / navy
}


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

function MapResizer({ trigger }: { trigger: any }) {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 300); // sesuai durasi animasi
  }, [trigger, map]);

  return null;
}

// Layer GeoJSON dengan pewarnaan grad_value + hover biru + double click
function GeoJSONLayer({
  geojson,
  map_data,
  tahun,
  gradation_data,
  onRegionSingleClick,
  onRegionDoubleClick,   // ✅ tambahkan prop

}: {
  geojson: RegionGeoJSON;
  map_data: any[];
  tahun?: string;
  gradation_data?: any[];
  onRegionSingleClick?: (code: string, name: string) => void;
  onRegionDoubleClick?: (code: string, name: string) => void;
 isPanelOpen?: boolean;
}) {
  const map = useMap();
  const layerRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }
 

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
      
        if (!grad) {
          // Jika belum ada nilai grad → transparan
          return {
            fillColor: 'transparent',
            weight: 1.5,
            color: '#1e3a8a',   // border biru gelap
            fillOpacity: 0.8,
          };
        }
      
        return {
          fillColor: gradColors2[grad], // pakai grad color
          weight: 1.5,
          color: '#1e3a8a',
          fillOpacity: 0.8,
        };
     
      },
      onEachFeature: (feature, layer) => {
        const kode = feature.properties.code;
        const nama = feature.properties.name;
        const anggaran = feature.properties.anggaran;
        const realisasi = feature.properties.realisasi;
        const pathLayer = layer as L.Path;

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
          pathLayer.setStyle({
            fillColor: '#3b82f6',
            weight: 2,
            color: '#1e40af',
            fillOpacity: 0.5,
          });
        });

        layer.on('mouseout', () => {
          const grad = feature?.properties?.grad_value;
        
          if (!grad) {
            // jika belum ada warna grad → kembali transparan
            pathLayer.setStyle({
              fillColor: 'transparent',
              weight: 1.5,
              color: '#1e3a8a',     // biru gelap
              fillOpacity: 0,
            });
          } else {
            // jika ada grad → kembali ke warna gradasi
            pathLayer.setStyle({
              fillColor: gradColors2[grad],
              weight: 1.5,
              color: '#1e3a8a',
              fillOpacity: 0.8,
            });
          }
        });

        let clickTimeout: any = null;

        layer.on('click', () => {
          if (clickTimeout) {
            // ada klik kedua dalam waktu singkat → anggap double click
            clearTimeout(clickTimeout);
            clickTimeout = null;
            if (onRegionDoubleClick) {
              onRegionDoubleClick(kode, nama);
            }
          } else {
            // klik pertama → tunggu sebentar, kalau tidak ada klik kedua → anggap single click
            clickTimeout = setTimeout(() => {
              if (onRegionSingleClick) {
                onRegionSingleClick(kode, nama);
              }
              clickTimeout = null;
            }, 250); // 250ms threshold
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
  }, [geojson, map_data, map, onRegionDoubleClick,   onRegionSingleClick]);

  return null;
}


 


// Legend menggunakan gradation_data
function MapLegend({ gradation_data }: { gradation_data: any[] }) {
  return (
    <div className="absolute bottom-2 left-2 bg-white p-3 rounded shadow text-sm" style={{ zIndex: 1000 }}>
      <strong>Legenda</strong>
      <ul className="mt-2 space-y-1">
        {gradation_data?.map((item, idx) => (
          <li key={idx} className="flex items-center space-x-2">
            <span
              className="inline-block w-4 h-4 rounded"
              style={{ backgroundColor: gradColors2[item.Skor] }}
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
  tahun,
  gradation_data,
  isPanelOpen,
  level,
  metric,
  onRegionDoubleClick,   // ✅ tambahkan prop di komponen utama
  onRegionSingleClick,
}: {
  geojson: RegionGeoJSON;
  map_data: any[];
  tahun : string;
  gradation_data: any[];
  level?: 'provinsi' | 'pemda' | 'kecamatan' | 'desa';
  metric?: 'budget' | 'idm' | 'audit';
  onRegionDoubleClick?: (code: string, name: string) => void;
  onRegionSingleClick?: (code: string, name: string) => void;
  isPanelOpen: boolean;
}) {

  
const [isMounted, setIsMounted] = useState(false);


useEffect(() => {
  setIsMounted(true);
}, []);

  return (
    
    <div className="relative w-full h-full">
      {isMounted && (
        <MapContainer
            center={[-2.5, 118]}
            zoom={5}
            scrollWheelZoom
            style={{ height: '100%', width: '100%', backgroundColor: '#98fb98' }} // putih
          >

            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
              attribution="&copy; OpenStreetMap &copy; CARTO"
            /> 

          <MapBoundsFitter geojson={geojson} />
          <MapResizer trigger={!!isPanelOpen} />
          <GeoJSONLayer
            geojson={geojson}
            map_data={map_data}
            tahun={tahun}
            gradation_data={gradation_data}
            onRegionDoubleClick={onRegionDoubleClick}
            onRegionSingleClick={onRegionSingleClick}
          />
        </MapContainer>
      )}
  
      <MapLegend gradation_data={gradation_data} />
    </div>
  );
}