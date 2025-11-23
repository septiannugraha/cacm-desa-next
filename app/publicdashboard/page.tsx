'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Header from './components/header';
import Breadcrumb from './components/Breadcrumb';
import MetricSelector from './components/MetricSelector';
import MapLegend from './components/MapLegend';
import StatisticsPanel from './components/StatisticsPanel';
import type { MapLevel, MapMetric, BreadcrumbItem, RegionGeoJSON } from '@/types/map';
import { NEXT_LEVEL } from '@/types/map';
import { Loader2, AlertCircle } from 'lucide-react';

const InteractiveMap = dynamic(
  () => import('./components/InteractiveMap'),
  { ssr: false, loading: () => <MapLoadingState /> }
);

function MapLoadingState() {
  return (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-6 h-6 md:w-8 md:h-8 text-blue-600 animate-spin mx-auto mb-2 md:mb-3" />
        <p className="text-sm md:text-base text-gray-600">Memuat peta...</p>
      </div>
    </div>
  );
}

// Dropdown Tahun
function YearSelector({ selectedYear, onYearChange }: { selectedYear: number; onYearChange: (year: number) => void }) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="flex items-center space-x-2">
      <label className="text-xs md:text-sm text-gray-700">Tahun:</label>
      <select
        value={selectedYear}
        onChange={(e) => onYearChange(Number(e.target.value))}
        className="border rounded px-1.5 py-0.5 md:px-2 md:py-1 text-xs md:text-sm"
      >
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  );
}

export default function MapDashboardPage() {
  const [currentLevel, setCurrentLevel] = useState<MapLevel>('provinsi');
  const [currentCode, setCurrentCode] = useState<string>('');
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([
    { name: 'Indonesia', level: 'provinsi', code: '' }
  ]);

  const [selectedMetric, setSelectedMetric] = useState<MapMetric>('budget');
  const [selectedRegion, setSelectedRegion] = useState<{ code: string; name: string } | null>(null);
  const [geojson, setGeojson] = useState<RegionGeoJSON | null>(null);

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const [mapData, setMapData] = useState<any[]>([]);
  const [gradationData, setGradationData] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch GeoJSON dari file statis
  useEffect(() => {
    const fetchGeoJSON = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/data/${currentLevel}/${currentCode || 'indonesia'}.json`);
        if (!res.ok) throw new Error('File tidak ditemukan');
        const geodata = await res.json();
        setGeojson(geodata);
      } catch (err) {
        console.error('Error loading GeoJSON:', err);
        setError(`GeoJSON belum tersedia untuk ${currentLevel}/${currentCode || 'indonesia'}.json`);
        setGeojson(null);
      } finally {
        setLoading(false);
      }
    };

    fetchGeoJSON();
  }, [currentLevel, currentCode, selectedYear]);

  // Fetch data gradation dari API
  useEffect(() => {
    const fetchGradation = async () => {
      try {
        const res = await fetch(`/api/map/gradasi?tahun=${selectedYear}&level=${currentLevel}&kode=${currentCode}`);
        if (!res.ok) throw new Error('API gagal');
        const data = await res.json();
        setMapData(data.map_data || []);
        setGradationData(data.gradation_data || []);
      } catch (err) {
        console.error('Error fetching gradation:', err);
      }
    };

    fetchGradation();
  }, [currentLevel, currentCode, selectedYear]);

  const handleRegionClick = (code: string, name: string) => {
    setSelectedRegion({ code, name });
  };

  const handleRegionDoubleClick = (code: string, name: string) => {
    const nextLevel = NEXT_LEVEL[currentLevel];
    if (!nextLevel) return;
    setBreadcrumb([...breadcrumb, { name, level: nextLevel, code }]);
    setCurrentLevel(nextLevel);
    setCurrentCode(code);
    setSelectedRegion(null);
  };

  const handleBreadcrumbNavigate = (index: number) => {
    const targetItem = breadcrumb[index];
    setBreadcrumb(breadcrumb.slice(0, index + 1));
    setCurrentLevel(targetItem.level);
    setCurrentCode(targetItem.code);
    setSelectedRegion(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="p-2 md:p-4 space-y-2 md:space-y-4">
        {/* Navigation and Controls - Compact on Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          <Breadcrumb items={breadcrumb} onNavigate={handleBreadcrumbNavigate} />
          <div className="flex items-center justify-end space-x-2 md:space-x-4">
            <MetricSelector selectedMetric={selectedMetric} onMetricChange={setSelectedMetric} />
            <div className="flex items-center gap-2 md:gap-3 bg-white px-2 py-1.5 md:px-5 md:py-3 rounded-lg shadow-sm border border-gray-200">
              <YearSelector selectedYear={selectedYear} onYearChange={setSelectedYear} />
            </div>
          </div>
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
                </div>
              </div>
            )}

            {!loading && !error && geojson && (
              <>
                <InteractiveMap
                  geojson={geojson}
                  map_data={mapData}
                  gradation_data={gradationData}
                  level={currentLevel}
                  metric={selectedMetric}
                  tahun={selectedYear}
                  onRegionDoubleClick={handleRegionDoubleClick}
                  onRegionSingleClick={handleRegionClick}
                />
                <div className="flex justify-between items-center px-2 py-1 md:px-4 md:py-2">
                  <MapLegend gradation_data={gradationData} />
                  <div className="hidden md:block">
                    <YearSelector selectedYear={selectedYear} onYearChange={setSelectedYear} />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Statistics Panel - Fixed Height on Mobile */}
          <div className="lg:col-span-1 h-[50vh] md:h-[calc(100vh-250px)]">
            <StatisticsPanel
              level={currentLevel}
              code={selectedRegion?.code || null}
              regionName={selectedRegion?.name || null}
              tahun={selectedYear.toString()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
