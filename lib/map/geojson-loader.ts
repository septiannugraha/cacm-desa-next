// GeoJSON file loading utilities

import type { MapLevel, RegionGeoJSON } from '@/types/map';

/**
 * Get GeoJSON file path based on level and code
 * @param level - Map level (provinsi, pemda, kecamatan, desa)
 * @param code - Region code (empty string for all Indonesia at provinsi level)
 * @returns Path to GeoJSON file
 */
export function getGeoJSONPath(level: MapLevel, code: string): string {
  if (level === 'provinsi' && !code) {
    // All provinces of Indonesia
    return '/data/provinsi/indonesia.geojson';
  }

  // Individual region files
  return `/data/${level}/${code}.geojson`;
}

/**
 * Load GeoJSON data from public folder
 * @param level - Map level
 * @param code - Region code
 * @returns Promise resolving to GeoJSON FeatureCollection
 */
export async function loadGeoJSON(
  level: MapLevel,
  code: string
): Promise<RegionGeoJSON> {
  const path = getGeoJSONPath(level, code);

  try {
    const response = await fetch(path);

    if (!response.ok) {
      throw new Error(`Failed to load GeoJSON: ${response.status} ${response.statusText}`);
    }

    const geojson = await response.json();
    return geojson as RegionGeoJSON;
  } catch (error) {
    console.error(`Error loading GeoJSON from ${path}:`, error);
    throw error;
  }
}

/**
 * Extract region code from feature properties based on level
 */
export function getRegionCode(properties: any, level: MapLevel): string | null {
  switch (level) {
    case 'provinsi':
      return properties.Kd_Prov ?? properties.kode_prov ?? null;
    case 'pemda':
      return properties.Kd_Pemda ?? properties.kode_kab ?? properties.kode_pemda ?? null;
    case 'kecamatan':
      return properties.Kd_Kec ?? properties.kode_kec ?? null;
    case 'desa':
      return properties.Kd_Desa ?? properties.kode_desa ?? null;
    default:
      return null;
  }
}

/**
 * Extract region name from feature properties
 */
export function getRegionName(properties: any, level: MapLevel): string {
  let name: string | undefined;

  switch (level) {
    case 'provinsi':
      name = properties.Nama_Provinsi ?? properties.nama_prov ?? properties.namobj;
      break;
    case 'pemda':
      name = properties.Nama_Kabkot ?? properties.nama_kab ?? properties.nama_pemda ?? properties.namobj;
      break;
    case 'kecamatan':
      name = properties.Nama_Kecamatan ?? properties.nama_kec ?? properties.namobj;
      break;
    case 'desa':
      name = properties.Nama_Desa ?? properties.nama_desa ?? properties.namobj;
      break;
    default:
      name = properties.namobj;
  }

  return name ?? 'Unknown';
}

/**
 * Validate GeoJSON structure
 */
export function validateGeoJSON(data: any): data is RegionGeoJSON {
  return (
    data &&
    data.type === 'FeatureCollection' &&
    Array.isArray(data.features) &&
    data.features.length > 0
  );
}

/**
 * Get center point of GeoJSON features for initial map centering
 */
export function getGeoJSONCenter(geojson: RegionGeoJSON): [number, number] | null {
  if (!geojson.features || geojson.features.length === 0) {
    return null;
  }

  // Simple approach: average of all coordinates
  let totalLat = 0;
  let totalLng = 0;
  let count = 0;

  geojson.features.forEach(feature => {
    if (feature.geometry.type === 'Polygon') {
      const coords = feature.geometry.coordinates[0];
      coords.forEach(([lng, lat]) => {
        totalLng += lng;
        totalLat += lat;
        count++;
      });
    } else if (feature.geometry.type === 'MultiPolygon') {
      feature.geometry.coordinates.forEach(polygon => {
        polygon[0].forEach(([lng, lat]) => {
          totalLng += lng;
          totalLat += lat;
          count++;
        });
      });
    }
  });

  if (count === 0) return null;

  return [totalLat / count, totalLng / count];
}
