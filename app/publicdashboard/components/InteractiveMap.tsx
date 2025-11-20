'use client';

import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapLevel, MapMetric, RegionGeoJSON } from '@/types/map';
import type { ColorBreaks } from '@/lib/map/choropleth';
import {
  calculateQuantileBreaks,
  getColorForValue,
  getMetricValue,
  HIGHLIGHT_COLOR,
  NO_DATA_COLOR,
} from '@/lib/map/choropleth';
import { getRegionCode, getRegionName } from '@/lib/map/geojson-loader';

interface InteractiveMapProps {
  geojson: RegionGeoJSON;
  level: MapLevel;
  metric: MapMetric;
  onRegionClick: (code: string, name: string) => void;
  onRegionDoubleClick: (code: string, name: string) => void;
  colorBreaks: ColorBreaks | null;
  onColorBreaksCalculated: (breaks: ColorBreaks) => void;
}

// Component to handle map bounds fitting
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

// Main GeoJSON layer component
function GeoJSONLayer({
  geojson,
  level,
  metric,
  colorBreaks,
  onRegionClick,
  onRegionDoubleClick,
  onColorBreaksCalculated,
}: Omit<InteractiveMapProps, 'colorBreaks'> & { colorBreaks: ColorBreaks | null; onColorBreaksCalculated: (breaks: ColorBreaks) => void }) {
  const map = useMap();
  const layerRef = useRef<L.GeoJSON | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // Calculate color breaks if not provided
  useEffect(() => {
    if (!colorBreaks && geojson) {
      const values = geojson.features
        .map(f => getMetricValue(f.properties, metric))
        .filter((v): v is number => v !== null);

      const breaks = calculateQuantileBreaks(values);
      onColorBreaksCalculated(breaks);
    }
  }, [geojson, metric, colorBreaks, onColorBreaksCalculated]);

  useEffect(() => {
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }

    if (!geojson || !colorBreaks) {
      return;
    }

    const layer = L.geoJSON(geojson, {
      style: (feature) => {
        if (!feature) return {};

        const code = getRegionCode(feature.properties, level);
        const isSelected = code === selectedRegion;
        const metricValue = getMetricValue(feature.properties, metric);
        const color = isSelected ? HIGHLIGHT_COLOR : getColorForValue(metricValue, colorBreaks);

        return {
          fillColor: color,
          weight: isSelected ? 3 : 1,
          opacity: 1,
          color: isSelected ? HIGHLIGHT_COLOR : '#666',
          fillOpacity: 0.7,
        };
      },
      onEachFeature: (feature, layer) => {
        const code = getRegionCode(feature.properties, level);
        const name = getRegionName(feature.properties, level);

        if (!code) return;

        // Hover effect
        layer.on({
          mouseover: (e) => {
            const targetLayer = e.target;
            targetLayer.setStyle({
              weight: 3,
              color: HIGHLIGHT_COLOR,
              fillOpacity: 0.8,
            });
            targetLayer.bringToFront();
          },
          mouseout: (e) => {
            const targetLayer = e.target;
            const isSelected = code === selectedRegion;
            targetLayer.setStyle({
              weight: isSelected ? 3 : 1,
              color: isSelected ? HIGHLIGHT_COLOR : '#666',
              fillOpacity: 0.7,
            });
          },
          click: (e) => {
            L.DomEvent.stopPropagation(e);
            setSelectedRegion(code);
            onRegionClick(code, name);
          },
          dblclick: (e) => {
            L.DomEvent.stopPropagation(e);
            onRegionDoubleClick(code, name);
          },
        });

        // Tooltip
        const metricValue = getMetricValue(feature.properties, metric);
        const metricText = metricValue !== null ? metricValue.toLocaleString('id-ID') : 'Tidak ada data';
        layer.bindTooltip(`<strong>${name}</strong><br/>${metricText}`, {
          sticky: true,
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
  }, [geojson, level, metric, colorBreaks, selectedRegion, onRegionClick, onRegionDoubleClick, map]);

  return null;
}

export default function InteractiveMap({
  geojson,
  level,
  metric,
  onRegionClick,
  onRegionDoubleClick,
  colorBreaks,
  onColorBreaksCalculated,
}: InteractiveMapProps) {
  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[-2.5, 118]}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        maxBounds={[
          [-11, 95],
          [6.5, 141],
        ]}
        maxBoundsViscosity={1.0}
        minZoom={4}
        maxZoom={18}
        scrollWheelZoom={true}
        doubleClickZoom={false} // Disable default double-click zoom
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapBoundsFitter geojson={geojson} />
        <GeoJSONLayer
          geojson={geojson}
          level={level}
          metric={metric}
          colorBreaks={colorBreaks}
          onColorBreaksCalculated={onColorBreaksCalculated}
          onRegionClick={onRegionClick}
          onRegionDoubleClick={onRegionDoubleClick}
        />
      </MapContainer>
    </div>
  );
}
