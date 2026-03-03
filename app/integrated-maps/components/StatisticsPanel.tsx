'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import type { MapLevel } from '@/types/map';
import PieChartDashboard from '@/components/charts/PieChartDashboard';
import BarChartDashboard from '@/components/charts/BarChartDashboard';
import LineChartDashboard from '@/components/charts/LineChartDashboard';
import { Building, TrendingUp, Award, CheckCircle, Loader2, Scale, ChevronLeft, ChevronRight } from 'lucide-react';
import { User, Wallet, BarChart3, Target } from 'lucide-react';


interface StatisticsPanelProps {
  tahun: string;            // tahun untuk query API
  level: MapLevel;          // level untuk query API
  code: string | null;      // kode wilayah untuk query API
  regionName: string | null;
}

interface ApiResponse {
  belanja_perbidang: any[];
  belanja_persumberdana: any[];
  trend_belanja_bulanan: any[];
}

export default function StatisticsPanel({
  tahun,
  level,
  code,
  regionName,
}: StatisticsPanelProps) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<
  'profil' | 'anggaran' | 'potensi' | 'capaian'
>('profil');


  // Fetch dari API /api/map/statistics setiap kali tahun/level/kode berubah
  useEffect(() => {
    if (!tahun || !level || !code) {
      setData(null);
      return;
    }

    const fetchStatistics = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/map/statistics?tahun=${encodeURIComponent(tahun)}&level=${encodeURIComponent(
            level
          )}&kode=${encodeURIComponent(code)}`
        );
        if (!res.ok) throw new Error('Gagal memuat statistik');
        const json = await res.json();
        setData(json);
      } catch (e: any) {
        console.error('StatisticsPanel fetch error:', e);
        setError(e?.message ?? 'Gagal memuat statistik');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [tahun, level, code]);

  // Normalisasi nilai numerik aman (number | string | bigint | Decimal)
  const toNumber = (v: any): number => {
    if (v == null) return 0;
    if (typeof v === 'number') return v;
    try {
      return parseFloat(v.toString());
    } catch {
      return 0;
    }
  };

  // Transformasi data API ke struktur komponen chart
  const pieData = useMemo(() => {
    if (!data?.belanja_persumberdana) return [];
    return data.belanja_persumberdana.map((d: any) => ({
      Kategori1: d.Kategori1 ?? d.SumberDana ?? 'N/A',
      Nilai1: toNumber(d.Nilai1 ?? d.Nilai1),
      Nilai2: toNumber(d.Nilai2 ?? d.Nilai2),
    }));
  }, [data]);

  const barData = useMemo(() => {
    if (!data?.belanja_perbidang) return [];
    return data.belanja_perbidang.map((d: any) => ({
      Kategori1: d.Kategori1 ?? d.Kategori ?? 'N/A',
      Nilai1: toNumber(d.Nilai1),
      Nilai2: toNumber(d.Nilai2),
    }));
  }, [data]);

  const lineData = useMemo(() => {
    if (!data?.trend_belanja_bulanan) return [];
    return data.trend_belanja_bulanan.map((d: any) => ({
      Kategori1: d.Bulan ?? d.bulan ?? 'N/A',
      Nilai1: toNumber(d.Anggaran),
      Nilai2: toNumber(d.Realisasi),
    }));
  }, [data]);

  // Agregat ringkas untuk kartu statistik
  const summary = useMemo(() => {
    const totalAnggaran =
      barData.reduce((acc: number, cur: any) => acc + (cur.Nilai1 || 0), 0) ||
      pieData.reduce((acc: number, cur: any) => acc + (cur.Nilai1 || 0), 0);

    const totalRealisasi =
      barData.reduce((acc: number, cur: any) => acc + (cur.Nilai2 || 0), 0) ||
      pieData.reduce((acc: number, cur: any) => acc + (cur.Nilai2 || 0), 0);

    const totalDesa = 0;
    const avgPerDesa = totalDesa > 0 ? totalAnggaran / totalDesa : 0;
    const audited = 0;
    const auditPct = 0;

    return {
      totalAnggaran,
      totalRealisasi,
      totalDesa,
      avgPerDesa,
      audited,
      auditPct,
    };
  }, [barData, pieData]);

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000_000_000) {
      return `Rp ${(value / 1_000_000_000_000).toFixed(2)} T`;
    } else if (value >= 1_000_000_000) {
      return `Rp ${(value / 1_000_000_000).toFixed(2)} M`;
    } else if (value >= 1_000_000) {
      return `Rp ${(value / 1_000_000).toFixed(2)} Jt`;
    } else {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
  };

  // Carousel navigation
  const scrollToSlide = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const slideWidth = container.offsetWidth;
      container.scrollTo({
        left: slideWidth * index,
        behavior: 'smooth'
      });
      setCurrentSlide(index);
    }
  };

  const nextSlide = () => {
    const totalSlides = (pieData.length > 0 ? 1 : 0) + (barData.length > 0 ? 1 : 0) + (lineData.length > 0 ? 1 : 0);
    if (currentSlide < totalSlides - 1) {
      scrollToSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      scrollToSlide(currentSlide - 1);
    }
  };

  // Calculate total slides
  const totalSlides = (pieData.length > 0 ? 1 : 0) + (barData.length > 0 ? 1 : 0) + (lineData.length > 0 ? 1 : 0);

  // Empty state
  if (!code || !regionName) {
    return (
      <div className="h-full bg-white rounded-lg shadow-lg border border-gray-200 p-3 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <Building className="w-8 h-8 md:w-12 md:h-12 text-gray-400 mx-auto mb-2 md:mb-3" />
          <p className="text-sm md:text-base text-gray-600 font-medium">Pilih region di peta</p>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Klik pada peta untuk melihat statistik keuangan
          </p>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="h-full bg-white rounded-lg shadow-lg border border-gray-200 p-3 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-6 h-6 md:w-8 md:h-8 text-blue-600 animate-spin mx-auto mb-2 md:mb-3" />
          <p className="text-sm md:text-base text-gray-600">Memuat statistik...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="h-full bg-white rounded-lg shadow-lg border border-gray-200 p-3 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 md:w-12 md:h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
            <span className="text-red-600 text-lg md:text-xl">!</span>
          </div>
          <p className="text-sm md:text-base text-gray-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white rounded-xl shadow-xl border border-gray-100 flex flex-col overflow-hidden">
  
      {/* ===== HEADER BIRU MUDA ===== */}
      <div className="px-5 py-4 bg-blue-100 border-b border-blue-200">
        <h2 className="text-base font-semibold text-blue-900 truncate">
          {regionName}
        </h2>
        <p className="text-xs text-blue-700 mt-1">
          {level === 'provinsi' && 'Provinsi'}
          {level === 'pemda' && 'Kabupaten/Kota'}
          {level === 'kecamatan' && 'Kecamatan'}
          {level === 'desa' && 'Desa'}
        </p>
      </div>
  
      {/* ===== TOP MENU (ICON + TEXT INLINE) ===== */}
 
        <div className="px-4 py-3 bg-white border-b border-gray-200">
          <div className="flex bg-gray-100 rounded-2xl p-1 gap-1">

            {[
              { key: 'profil', label: 'Profil', icon: User },
              { key: 'anggaran', label: 'Anggaran', icon: Wallet },
              { key: 'potensi', label: 'Potensi', icon: BarChart3 },
              { key: 'capaian', label: 'Capaian', icon: Target },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}

          </div>
        </div>
  
      {/* ===== CONTENT AREA ===== */}
      <div className="flex-1 overflow-y-auto p-4 bg-white">
  
        {/* ================= PROFIL ================= */}
        {activeTab === 'profil' && (
          <div className="space-y-4 animate-fadeIn">
  
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs text-gray-500">Total Desa</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {summary.totalDesa.toLocaleString('id-ID')}
                </p>
              </div>
  
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs text-gray-500">Rata-rata/Desa</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {formatCurrency(summary.avgPerDesa)}
                </p>
              </div>
            </div>
  
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs text-gray-500">Status Audit</p>
              <p className="text-sm font-medium text-blue-600 mt-1">
                {summary.audited} Desa ({summary.auditPct.toFixed(1)}%)
              </p>
            </div>
  
          </div>
        )}
  
        {/* ================= ANGGARAN ================= */}
        {activeTab === 'anggaran' && (
          <div className="space-y-4 animate-fadeIn">
  
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-xs text-blue-700">Total APBDes</p>
              <p className="text-lg font-semibold text-blue-900 mt-1">
                {formatCurrency(summary.totalAnggaran)}
              </p>
            </div>
  
            {pieData.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <PieChartDashboard
                  mini
                  data={pieData}
                  title="Distribusi Sumber Dana"
                  dataKey="Nilai1"
                  nameKey="Kategori1"
                />
              </div>
            )}
  
            {barData.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <BarChartDashboard
                  mini
                  data={barData}
                  title="Belanja per Bidang"
                  xAxisKey="Kategori1"
                />
              </div>
            )}
  
          </div>
        )}
  
        {/* ================= POTENSI ================= */}
        {activeTab === 'potensi' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 text-center text-gray-500 text-sm">
              Data potensi wilayah akan ditampilkan di sini.
            </div>
          </div>
        )}
  
        {/* ================= CAPAIAN ================= */}
        {activeTab === 'capaian' && (
          <div className="space-y-4 animate-fadeIn">
            {lineData.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <LineChartDashboard
                  data={lineData}
                  title="Trend Realisasi"
                  xAxisKey="Kategori1"
                />
              </div>
            )}
          </div>
        )}
  
      </div>
    </div>
  );
}
