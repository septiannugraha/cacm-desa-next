'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Header from './components/header';
import Breadcrumb from './components/Breadcrumb';
import MetricSelector from './components/MetricSelector';
import MapLegend from './components/MapLegend';
import StatisticsPanel from './components/StatisticsPanel';
import type { MapLevel, MapMetric, BreadcrumbItem, RegionGeoJSON } from '@/types/map';
import type { ColorBreaks } from '@/lib/map/choropleth';
import { NEXT_LEVEL } from '@/types/map';
import { loadGeoJSON, validateGeoJSON } from '@/lib/map/geojson-loader';
import { Loader2, AlertCircle } from 'lucide-react';

// Dynamically import InteractiveMap to avoid SSR issues with Leaflet
const InteractiveMap = dynamic(
  () => import('./components/InteractiveMap'),
  { ssr: false, loading: () => <MapLoadingState /> }
);

function MapLoadingState() {
  return (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
        <p className="text-gray-600">Memuat peta...</p>
      </div>
    </div>
  );
}

export default function MapDashboardPage() {
  // Navigation state
  const [currentLevel, setCurrentLevel] = useState<MapLevel>('provinsi');
  const [currentCode, setCurrentCode] = useState<string>('');
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([
    { name: 'Indonesia', level: 'provinsi', code: '' }
  ]);

  // Map state
  const [selectedMetric, setSelectedMetric] = useState<MapMetric>('budget');
  const [selectedRegion, setSelectedRegion] = useState<{ code: string; name: string } | null>(null);
  const [geojson, setGeojson] = useState<RegionGeoJSON | null>(null);
  const [colorBreaks, setColorBreaks] = useState<ColorBreaks | null>(null);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load GeoJSON when level or code changes
  useEffect(() => {
    const fetchGeoJSON = async () => {
      setLoading(true);
      setError(null);
      setColorBreaks(null); // Reset color breaks when loading new data

      try {
        const data = await loadGeoJSON(currentLevel, currentCode);

        if (!validateGeoJSON(data)) {
          throw new Error('Invalid GeoJSON data');
        }

        setGeojson(data);
      } catch (err) {
        console.error('Error loading GeoJSON:', err);
        setError(`Gagal memuat data peta. File GeoJSON mungkin belum tersedia untuk ${currentLevel}/${currentCode || 'indonesia'}.geojson`);
        setGeojson(null);
      } finally {
        setLoading(false);
      }
    };

    fetchGeoJSON();
  }, [currentLevel, currentCode]);

  // Reset color breaks when metric changes
  useEffect(() => {
    setColorBreaks(null);
  }, [selectedMetric]);

  // Handle region click (show statistics)
  const handleRegionClick = (code: string, name: string) => {
    setSelectedRegion({ code, name });
  };

  // Handle region double-click (drill down to next level)
  const handleRegionDoubleClick = (code: string, name: string) => {
    const nextLevel = NEXT_LEVEL[currentLevel];

    if (!nextLevel) {
      // Already at the lowest level (desa)
      return;
    }

    // Update breadcrumb
    setBreadcrumb([...breadcrumb, { name, level: nextLevel, code }]);

    // Update current level and code
    setCurrentLevel(nextLevel);
    setCurrentCode(code);

    // Clear selected region
    setSelectedRegion(null);
  };

  // Handle breadcrumb navigation
  const handleBreadcrumbNavigate = (index: number) => {
    const targetItem = breadcrumb[index];

    // Update breadcrumb (remove items after clicked one)
    setBreadcrumb(breadcrumb.slice(0, index + 1));

    // Update current level and code
    setCurrentLevel(targetItem.level);
    setCurrentCode(targetItem.code);

    // Clear selected region
    setSelectedRegion(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="p-2 md:p-4 space-y-2 md:space-y-4">
        {/* Navigation and Controls - Compact on Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-4">
          <Breadcrumb items={breadcrumb} onNavigate={handleBreadcrumbNavigate} />
          <MetricSelector
            selectedMetric={selectedMetric}
            onMetricChange={setSelectedMetric}
          />
        </div>

        {/* Map and Statistics Panel - Stack on Mobile, Side-by-Side on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 md:gap-4">
          {/* Map Container - Fixed Height on Mobile */}
          <div className="lg:col-span-2 relative bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden h-[40vh] md:h-[calc(100vh-250px)]">
            {loading && <MapLoadingState />}

            {error && (
              <div className="w-full h-full flex items-center justify-center p-3 md:p-6">
                <div className="text-center max-w-md">
                  <AlertCircle className="w-8 h-8 md:w-12 md:h-12 text-orange-500 mx-auto mb-2 md:mb-3" />
                  <p className="text-sm md:text-base text-gray-900 font-medium mb-1 md:mb-2">Data Peta Belum Tersedia</p>
                  <p className="text-xs md:text-sm text-gray-600">{error}</p>
                  <p className="text-[10px] md:text-xs text-gray-500 mt-2 md:mt-4">
                    Pastikan file GeoJSON sudah ditempatkan di folder <code className="bg-gray-100 px-1 rounded text-[10px] md:text-xs">public/data/{currentLevel}/</code>
                  </p>
                </div>
              </div>
            )}

            {!loading && !error && geojson && (
              <>
                <InteractiveMap
                  geojson={geojson}
                  level={currentLevel}
                  metric={selectedMetric}
                  onRegionClick={handleRegionClick}
                  onRegionDoubleClick={handleRegionDoubleClick}
                  colorBreaks={colorBreaks}
                  onColorBreaksCalculated={setColorBreaks}
                />
                <MapLegend metric={selectedMetric} breaks={colorBreaks} />
              </>
            )}
          </div>

          {/* Statistics Panel - Fixed Height on Mobile */}
          <div className="lg:col-span-1 h-[50vh] md:h-[calc(100vh-250px)]">
            <StatisticsPanel
              level={currentLevel}
              code={selectedRegion?.code || null}
              regionName={selectedRegion?.name || null}
            />
          </div>
        </div>

        {/* Instructions - Compact on Mobile */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 md:p-4">
          <h3 className="text-xs md:text-sm font-semibold text-blue-900 mb-1 md:mb-2">Cara Menggunakan Peta:</h3>
          <ul className="text-[10px] md:text-sm text-blue-800 space-y-0.5 md:space-y-1 list-disc list-inside">
            <li><strong>Klik</strong> pada region untuk melihat statistik keuangan<span className="hidden md:inline"> di panel kanan</span></li>
            <li><strong>Double-klik</strong> pada region untuk drill down<span className="hidden md:inline"> ke level yang lebih rendah</span></li>
            <li className="hidden md:list-item"><strong>Gunakan breadcrumb</strong> di atas untuk kembali ke level sebelumnya</li>
            <li className="hidden md:list-item"><strong>Pilih metrik pewarnaan</strong> untuk mengubah visualisasi choropleth (Anggaran, IDM, atau Jumlah Audit)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
