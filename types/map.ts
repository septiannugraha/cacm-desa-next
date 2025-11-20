// Map-specific TypeScript types for interactive hierarchical map

export type MapLevel = 'provinsi' | 'pemda' | 'kecamatan' | 'desa';

export type MapMetric = 'budget' | 'idm' | 'audit';

export interface BreadcrumbItem {
  name: string;
  level: MapLevel;
  code: string;
}

export interface RegionStatistics {
  level: MapLevel;
  code: string;
  name: string;
  stats: {
    totalDesa: number;
    totalBudget: number;
    avgBudgetPerDesa: number;
    avgIDM: number;
    totalAudited: number;
    auditPercentage: number;
  };
  chartData: {
    budgetByType: ChartDataItem[];
    topRegions: ChartDataItem[];
  };
}

export interface ChartDataItem {
  Kategori1: string;
  Kategori2: string;
  Nilai1: number;
  Nilai2: number;
}

export interface RegionFeature {
  type: 'Feature';
  properties: {
    namobj?: string;
    Kd_Prov?: string;
    Kd_Pemda?: string;
    Kd_Kec?: string;
    Kd_Desa?: string;
    Nama_Provinsi?: string;
    Nama_Kabkot?: string;
    Nama_Kecamatan?: string;
    Nama_Desa?: string;
    // Metric values for choropleth coloring
    budget?: number;
    idm?: number;
    auditCount?: number;
  };
  geometry: GeoJSON.Geometry;
}

export interface RegionGeoJSON {
  type: 'FeatureCollection';
  features: RegionFeature[];
}

export interface MetricOption {
  value: MapMetric;
  label: string;
  description: string;
}

export const METRIC_OPTIONS: MetricOption[] = [
  {
    value: 'budget',
    label: 'Anggaran APBDes',
    description: 'Pewarnaan berdasarkan total anggaran APBDes'
  },
  {
    value: 'idm',
    label: 'Indeks Desa Membangun (IDM)',
    description: 'Pewarnaan berdasarkan nilai IDM'
  },
  {
    value: 'audit',
    label: 'Jumlah Desa Diaudit',
    description: 'Pewarnaan berdasarkan jumlah desa yang sudah diaudit'
  }
];

export const LEVEL_NAMES: Record<MapLevel, string> = {
  provinsi: 'Provinsi',
  pemda: 'Kabupaten/Kota',
  kecamatan: 'Kecamatan',
  desa: 'Desa'
};

export const NEXT_LEVEL: Record<MapLevel, MapLevel | null> = {
  provinsi: 'pemda',
  pemda: 'kecamatan',
  kecamatan: 'desa',
  desa: null
};
