'use client';

import type { MapMetric } from '@/types/map';
import type { ColorBreaks } from '@/lib/map/choropleth';
import { COLOR_SCALE, createLegendLabels, NO_DATA_COLOR } from '@/lib/map/choropleth';

interface MapLegendProps {
  metric: MapMetric;
  breaks: ColorBreaks | null;
}

export default function MapLegend({ metric, breaks }: MapLegendProps) {
  if (!breaks) {
    return null;
  }

  const labels = createLegendLabels(breaks, metric);

  return (
    <div className="absolute bottom-6 left-6 bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200 z-[1000]">
      <h3 className="text-sm font-semibold text-gray-900 mb-2">
        Legenda
      </h3>
      <div className="space-y-1.5">
        {COLOR_SCALE.map((color, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-6 h-4 rounded border border-gray-300"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-gray-700">{labels[index]}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 pt-1 border-t border-gray-200 mt-2">
          <div
            className="w-6 h-4 rounded border border-gray-300"
            style={{ backgroundColor: NO_DATA_COLOR }}
          />
          <span className="text-xs text-gray-700">Tidak ada data</span>
        </div>
      </div>
    </div>
  );
}
