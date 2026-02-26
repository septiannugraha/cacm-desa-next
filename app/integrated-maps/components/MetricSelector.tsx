'use client';

import type { MapMetric } from '@/types/map';
import { METRIC_OPTIONS } from '@/types/map';
import { BarChart3 } from 'lucide-react';

interface MetricSelectorProps {
  selectedMetric: MapMetric;
  onMetricChange: (metric: MapMetric) => void;
}

export default function MetricSelector({ selectedMetric, onMetricChange }: MetricSelectorProps) {
  return (
    <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-lg shadow-sm border border-gray-200">
      <BarChart3 className="w-5 h-5 text-gray-600" />
      <div className="flex items-center gap-2">
        <label htmlFor="metric-select" className="text-sm font-medium text-gray-700">
          Pewarnaan Peta:
        </label>
        <select
          id="metric-select"
          value={selectedMetric}
          onChange={(e) => onMetricChange(e.target.value as MapMetric)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          {METRIC_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
 
    </div>
  );
}
