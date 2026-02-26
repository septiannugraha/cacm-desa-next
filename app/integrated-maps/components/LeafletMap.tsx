'use client';

import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type FeatureCollection = GeoJSON.FeatureCollection;

function GeoLayer({ data, highlight }: { data: FeatureCollection; highlight: string }) {
  const map = useMap();
  const layerRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }

    const layer = L.geoJSON(data, {
      style: (feature) => {
        const isMatch = feature?.properties?.namobj?.toLowerCase().includes(highlight.toLowerCase());
        const color = isMatch ? '#ff6600' : '#3388ff';
        return {
          color,
          fillColor: color,
          weight: 2,
          fillOpacity: 0.5,
        };
      },
    });

    layerRef.current = layer;
    layer.addTo(map);

    if (data.features.length > 0) {
      map.fitBounds(layer.getBounds());
    }
  }, [data, highlight, map]);

  return null;
}

export default function LeafletMap({ data, filter }: { data: FeatureCollection; filter: string }) {
  return (
    <MapContainer
      center={[-2.5, 118]}
      zoom={5}
      style={{ height: '600px', width: '100%' }}
      maxBounds={[
        [-11, 95],
        [6.5, 141],
      ]}
      maxBoundsViscosity={1.0}
      minZoom={4}
      maxZoom={18}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <GeoLayer data={data} highlight={filter} />
    </MapContainer>
  );
}