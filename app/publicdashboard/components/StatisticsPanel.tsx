'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import type { MapLevel } from '@/types/map';
import PieChartDashboard from '@/components/charts/PieChartDashboard';
import BarChartDashboard from '@/components/charts/BarChartDashboard';
import LineChartDashboard from '@/components/charts/LineChartDashboard';
import { Building, TrendingUp, Award, CheckCircle, Loader2, Scale, ChevronLeft, ChevronRight } from 'lucide-react';

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
    <div className="h-full bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col overflow-hidden">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 md:px-6 md:py-4">
        <h2 className="text-sm md:text-xl font-bold truncate">{regionName}</h2>
        <p className="text-xs md:text-sm text-blue-100 mt-0.5 md:mt-1">
          {level === 'provinsi' && 'Provinsi'}
          {level === 'pemda' && 'Kabupaten/Kota'}
          {level === 'kecamatan' && 'Kecamatan'}
          {level === 'desa' && 'Desa'}
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 md:p-6 space-y-3 md:space-y-6">
          {/* Summary cards - Compact on Mobile */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="bg-blue-50 rounded-lg p-2 md:p-4 border border-blue-200">
              <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                <Building className="w-3 h-3 md:w-5 md:h-5 text-blue-600 flex-shrink-0" />
                <span className="text-[10px] md:text-sm font-medium text-blue-900 line-clamp-1">Total Desa</span>
              </div>
              <p className="text-sm md:text-2xl font-bold text-blue-900">
                {summary.totalDesa.toLocaleString('id-ID')}
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-2 md:p-4 border border-green-200">
              <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                <TrendingUp className="w-3 h-3 md:w-5 md:h-5 text-green-600 flex-shrink-0" />
                <span className="text-[10px] md:text-sm font-medium text-green-900 line-clamp-1">Total APBDes</span>
              </div>
              <p className="text-xs md:text-lg font-bold text-green-900 truncate">
                {formatCurrency(summary.totalAnggaran)}
              </p>
            </div>

            <div className="bg-orange-50 rounded-lg p-2 md:p-4 border border-orange-200">
              <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                <Award className="w-3 h-3 md:w-5 md:h-5 text-orange-600 flex-shrink-0" />
                <span className="text-[10px] md:text-sm font-medium text-orange-900 line-clamp-1">Rata-rata/Desa</span>
              </div>
              <p className="text-xs md:text-lg font-bold text-orange-900 truncate">
                {formatCurrency(summary.avgPerDesa)}
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-2 md:p-4 border border-purple-200">
              <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                <CheckCircle className="w-3 h-3 md:w-5 md:h-5 text-purple-600 flex-shrink-0" />
                <span className="text-[10px] md:text-sm font-medium text-purple-900 line-clamp-1">Diaudit</span>
              </div>
              <p className="text-sm md:text-2xl font-bold text-purple-900">
                {summary.audited}
                <span className="text-[10px] md:text-sm font-normal text-purple-700 ml-0.5 md:ml-1">
                  ({summary.auditPct.toFixed(1)}%)
                </span>
              </p>
            </div>
          </div>

          {/* Charts Carousel - Mobile Optimized */}
          {totalSlides > 0 && (
            <div className="relative">
              {/* Carousel Container */}
              <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-3 md:gap-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                onScroll={(e) => {
                  const container = e.currentTarget;
                  const slideWidth = container.offsetWidth;
                  const newSlide = Math.round(container.scrollLeft / slideWidth);
                  setCurrentSlide(newSlide);
                }}
              >
                {/* Pie Chart Slide */}
                {pieData.length > 0 && (
                  <div className="flex-shrink-0 w-full snap-start">
                    <div className="bg-gray-50 rounded-lg p-2 md:p-4">
                      <PieChartDashboard
                        mini={true}
                        data={pieData}
                        title="Distribusi Anggaran per Sumber Dana"
                        dataKey="Nilai1"
                        nameKey="Kategori1"
                        label="Anggaran"
                        columnLabels={{
                          Kategori1: 'Sumber Dana',
                          Nilai1: 'Anggaran',
                          Nilai2: 'Realisasi',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Bar Chart Slide */}
                {barData.length > 0 && (
                  <div className="flex-shrink-0 w-full snap-start">
                    <div className="bg-gray-50 rounded-lg p-2 md:p-4">
                      <BarChartDashboard
                        data={barData}
                        mini={true}
                        title="Belanja per Bidang"
                        xAxisKey="Kategori1"
                        nilai1Label="Anggaran"
                        nilai2Label="Realisasi"
                      />
                    </div>
                  </div>
                )}

                {/* Line Chart Slide */}
                {lineData.length > 0 && (
                  <div className="flex-shrink-0 w-full snap-start">
                    <div className="bg-gray-50 rounded-lg p-2 md:p-4">
                      <LineChartDashboard
                        data={lineData}
                        title="Trend Belanja Bulanan"
                        xAxisKey="Kategori1"
                        nilai1Label="Anggaran"
                        nilai2Label="Realisasi"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Buttons - Mobile Only */}
              {totalSlides > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                    className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed rounded-full p-1 md:p-2 shadow-lg transition-all z-10 md:hidden"
                    aria-label="Previous chart"
                  >
                    <ChevronLeft className="w-4 h-4 md:w-6 md:h-6 text-gray-700" />
                  </button>
                  <button
                    onClick={nextSlide}
                    disabled={currentSlide === totalSlides - 1}
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed rounded-full p-1 md:p-2 shadow-lg transition-all z-10 md:hidden"
                    aria-label="Next chart"
                  >
                    <ChevronRight className="w-4 h-4 md:w-6 md:h-6 text-gray-700" />
                  </button>

                  {/* Slide Indicators */}
                  <div className="flex justify-center gap-1.5 mt-3 md:hidden">
                    {Array.from({ length: totalSlides }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => scrollToSlide(index)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          currentSlide === index
                            ? 'bg-blue-600 w-4'
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
