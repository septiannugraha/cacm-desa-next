// Choropleth color calculation utilities for map visualization

import type { MapMetric } from '@/types/map';

// 5-level color scale (light to dark) - from ColorBrewer YlOrRd scheme
export const COLOR_SCALE = ['#feedde', '#fdbe85', '#fd8d3c', '#e6550d', '#a63603'];

// Neutral color for regions with no data
export const NO_DATA_COLOR = '#e0e0e0';

// Highlight color for selected/hovered regions
export const HIGHLIGHT_COLOR = '#2563eb';

export interface ColorBreaks {
  min: number;
  max: number;
  breaks: number[];
}

/**
 * Calculate quantile breaks for choropleth coloring
 * Divides data into equal-sized groups (quintiles)
 */
export function calculateQuantileBreaks(values: number[]): ColorBreaks {
  if (values.length === 0) {
    return { min: 0, max: 0, breaks: [0, 0, 0, 0, 0] };
  }

  // Remove null/undefined and sort
  const sorted = values.filter(v => v != null && !isNaN(v)).sort((a, b) => a - b);

  if (sorted.length === 0) {
    return { min: 0, max: 0, breaks: [0, 0, 0, 0, 0] };
  }

  const min = sorted[0];
  const max = sorted[sorted.length - 1];

  // Calculate quintile positions (20%, 40%, 60%, 80%)
  const breaks = [0.2, 0.4, 0.6, 0.8].map(quantile => {
    const index = Math.floor(sorted.length * quantile);
    return sorted[Math.min(index, sorted.length - 1)];
  });

  return { min, max, breaks: [min, ...breaks, max] };
}

/**
 * Get color for a value based on quantile breaks
 */
export function getColorForValue(value: number | null | undefined, breaks: ColorBreaks): string {
  if (value == null || isNaN(value)) {
    return NO_DATA_COLOR;
  }

  // Find which quantile this value falls into
  for (let i = 0; i < breaks.breaks.length - 1; i++) {
    if (value <= breaks.breaks[i + 1]) {
      return COLOR_SCALE[i];
    }
  }

  // If somehow value is higher than max, return darkest color
  return COLOR_SCALE[COLOR_SCALE.length - 1];
}

/**
 * Format currency values for display
 */
export function formatCurrency(value: number): string {
  if (value >= 1_000_000_000_000) {
    return `Rp ${(value / 1_000_000_000_000).toFixed(1)}T`;
  } else if (value >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000).toFixed(1)}M`;
  } else if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(1)}Jt`;
  } else {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
}

/**
 * Format IDM values for display
 */
export function formatIDM(value: number): string {
  return value.toFixed(3);
}

/**
 * Format audit count for display
 */
export function formatAuditCount(value: number): string {
  return value.toLocaleString('id-ID');
}

/**
 * Get formatter function based on metric type
 */
export function getMetricFormatter(metric: MapMetric): (value: number) => string {
  switch (metric) {
    case 'budget':
      return formatCurrency;
    case 'idm':
      return formatIDM;
    case 'audit':
      return formatAuditCount;
    default:
      return (v) => v.toString();
  }
}

/**
 * Extract metric value from GeoJSON feature properties
 */
export function getMetricValue(properties: any, metric: MapMetric): number | null {
  switch (metric) {
    case 'budget':
      return properties.budget ?? null;
    case 'idm':
      return properties.idm ?? null;
    case 'audit':
      return properties.auditCount ?? null;
    default:
      return null;
  }
}

/**
 * Create legend labels based on breaks and metric
 */
export function createLegendLabels(breaks: ColorBreaks, metric: MapMetric): string[] {
  const formatter = getMetricFormatter(metric);
  const labels: string[] = [];

  for (let i = 0; i < breaks.breaks.length - 1; i++) {
    const min = formatter(breaks.breaks[i]);
    const max = formatter(breaks.breaks[i + 1]);
    labels.push(`${min} - ${max}`);
  }

  return labels;
}
