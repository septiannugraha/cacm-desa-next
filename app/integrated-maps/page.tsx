'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
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
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
        <p className="text-gray-600">Memuat peta...</p>
      </div>
    </div>
  );
}

function toDotCode(kd: string) {
  const raw = (kd || '').trim();
  if (/^\d{4}$/.test(raw)) return `${raw.slice(0, 2)}.${raw.slice(2, 4)}`;
  if (/^\d{2}\.\d{2}$/.test(raw)) return raw;
  return raw;
}

function YearSelector({
  selectedYear,
  onYearChange,
}: {
  selectedYear: number;
  onYearChange: (year: number) => void;
}) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="flex items-center space-x-2">
      <label className="text-sm text-gray-700">Tahun:</label>
      <select
        value={selectedYear}
        onChange={(e) => onYearChange(Number(e.target.value))}
        className="border rounded px-2 py-1 text-sm"
      >
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  );
}

export default function MapDashboardPage() {

  const pemdaRaw = (process.env.NEXT_PUBLIC_PEMDA_CODE || '').trim();
  const pemdaNameEnv = (process.env.NEXT_PUBLIC_PEMDA_NAME || '').trim();
  const defaultLevelEnv =
    (process.env.NEXT_PUBLIC_MAP_DEFAULT_LEVEL || 'provinsi').trim() as MapLevel;

  const pemdaDot = useMemo(() => toDotCode(pemdaRaw), [pemdaRaw]);

  const [currentLevel, setCurrentLevel] = useState<MapLevel>(defaultLevelEnv);
  const [currentCode, setCurrentCode] = useState<string>(
    defaultLevelEnv === 'provinsi' ? '' : pemdaRaw
  );

  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([
    { name: 'Indonesia', level: 'provinsi', code: '' },
  ]);

  const [selectedMetric, setSelectedMetric] = useState<MapMetric>('budget');
  const [selectedRegion, setSelectedRegion] = useState<{ code: string; name: string } | null>(null);
  const [geojson, setGeojson] = useState<RegionGeoJSON | null>(null);

  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [mapData, setMapData] = useState<any[]>([]);
  const [gradationData, setGradationData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    if (defaultLevelEnv === 'provinsi') {
      setCurrentLevel('provinsi');
      setCurrentCode('');
      setBreadcrumb([{ name: 'Indonesia', level: 'provinsi', code: '' }]);
    } else {
      setCurrentLevel(defaultLevelEnv);
      setCurrentCode(pemdaRaw);
      setBreadcrumb([
        { name: 'Indonesia', level: 'provinsi', code: '' },
        {
          name: pemdaNameEnv || `Pemda ${pemdaRaw || pemdaDot}`,
          level: defaultLevelEnv,
          code: pemdaRaw,
        },
      ]);
    }
    setSelectedRegion(null);
  }, [defaultLevelEnv, pemdaDot, pemdaRaw, pemdaNameEnv]);

  useEffect(() => {
    const fetchGeoJSON = async () => {
      setLoading(true);
      setError(null);
      try {
        const filename = currentCode || 'indonesia';
        const res = await fetch(`/data/${currentLevel}/${filename}.json`);
        if (!res.ok) throw new Error('File tidak ditemukan');
        const geodata = await res.json();
        setGeojson(geodata);
      } catch (err) {
        setError(`GeoJSON belum tersedia untuk ${currentLevel}/${currentCode || 'indonesia'}.json`);
        setGeojson(null);
      } finally {
        setLoading(false);
      }
    };
    fetchGeoJSON();
  }, [currentLevel, currentCode, selectedYear]);

  useEffect(() => {
    const fetchGradation = async () => {
      try {
        const res = await fetch(
          `/api/map/gradasi?tahun=${selectedYear}&level=${currentLevel}&kode=${encodeURIComponent(currentCode)}`
        );
        if (!res.ok) throw new Error('API gagal');
        const data = await res.json();
        setMapData(data.map_data || []);
        setGradationData(data.gradation_data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchGradation();
  }, [currentLevel, currentCode, selectedYear]);

  const handleRegionClick = (code: string, name: string) => {
    setSelectedRegion({ code, name });
    setIsPanelOpen(true);
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
    <div className="relative w-screen h-screen overflow-hidden bg-gray-100">

      {/* HEADER */}
      <div className="absolute top-2 left-2 right-2 z-40 
                      h-16 backdrop-blur-md bg-blue-100/50
                      flex items-center px-6 rounded-xl shadow-lg">

        <img src="/cacm_logo.png" alt="logo" className="h-8 w-auto" />

        <div className="ml-6 flex-1">
          <Breadcrumb items={breadcrumb} onNavigate={handleBreadcrumbNavigate} />
        </div>

        <div className="mr-4">
          <MetricSelector
            selectedMetric={selectedMetric}
            onMetricChange={setSelectedMetric}
          />
        </div>

        <div className="mr-4">
          <YearSelector
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
          />
        </div>

        <button
          onClick={() => setIsPanelOpen(prev => !prev)}
          className="p-2 rounded-md hover:bg-gray-200 transition"
        >
          ☰
        </button>
      </div>

      {/* MAP */}
      <div
      className={`absolute inset-0 z-10 transition-all duration-300 ${
        isPanelOpen ? 'pr-[500px]' : 'pr-0'
      }`}
>

        {loading && <MapLoadingState />}

        {error && (
          <div className="w-full h-full flex items-center justify-center bg-white">
            <div className="text-center max-w-md">
              <AlertCircle className="w-10 h-10 text-orange-500 mx-auto mb-3" />
              <p className="font-medium">Data Peta Belum Tersedia</p>
              <p className="text-sm text-gray-600 mt-2">{error}</p>
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
              tahun={selectedYear.toString()}
              onRegionDoubleClick={handleRegionDoubleClick}
              onRegionSingleClick={handleRegionClick}
              isPanelOpen={isPanelOpen}
            />

            <div className="absolute bottom-6 right-6 bg-white shadow-lg rounded-lg p-3 z-30">
              <MapLegend metric={selectedMetric} breaks={null} />
            </div>
          </>
        )}
      </div>

      {/* RIGHT PANEL FULL HEIGHT */}
      {isPanelOpen && (
        <div className="absolute top-10 bottom-0 right-0 z-50 
                        w-140 bg-transparent   flex flex-col">

          <div className="p-4   font-semibold text-gray-700 flex justify-between items-center">
            <span>  </span>
 
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <StatisticsPanel
              level={currentLevel}
              code={selectedRegion?.code || currentCode || null}
              regionName={
                selectedRegion?.name ||
                pemdaNameEnv ||
                `Pemda ${pemdaDot}`
              }
              tahun={selectedYear.toString()}
            />
          </div>
        </div>
      )}

    </div>
  );
}